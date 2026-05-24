const crypto = require('crypto');
const {
  executePrepared,
  queryAll,
  queryOne,
  withTransaction,
} = require('../database/raw');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../utils/invoice');
const { toMoney, toNumber } = require('../utils/money');
const { parseOffset } = require('../utils/query');
const { sendSuccess } = require('../utils/response');

function serializePayment(record) {
  return {
    invoice_number: record.invoice_number,
    service_code: record.service_code,
    service_name: record.service_name,
    transaction_type: 'PAYMENT',
    total_amount: toMoney(record.total_amount),
    created_on: record.created_at,
  };
}

function serializeHistoryRecord(record) {
  return {
    invoice_number: record.invoice_number,
    transaction_type: record.transaction_type,
    description: record.description,
    total_amount: toMoney(record.total_amount),
    created_on: record.created_on,
  };
}

const createTransaction = asyncHandler(async (req, res) => {
  const { service_code: serviceCode } = req.body;

  if (!serviceCode) {
    throw new ApiError(400, 'Service ataus Layanan tidak ditemukan', null, 102);
  }

  const result = await withTransaction(async (connection) => {
    const service = await queryOne(
      `SELECT id, code, name, service_tariff, admin_fee
      FROM services
      WHERE code = ? AND is_active = ?
      LIMIT 1`,
      [serviceCode, 1],
      { connection }
    );

    if (!service) {
      throw new ApiError(400, 'Service ataus Layanan tidak ditemukan', null, 102);
    }

    const user = await queryOne(
      'SELECT id, balance FROM users WHERE id = ? FOR UPDATE',
      [req.user.id],
      { connection }
    );

    if (!user) {
      throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
    }

    const amount = toMoney(service.service_tariff);
    const adminFee = toMoney(service.admin_fee);
    const totalAmount = toMoney(amount + adminFee);
    const balanceBefore = toNumber(user.balance);

    if (balanceBefore < totalAmount) {
      throw new ApiError(400, 'Saldo tidak mencukupi', null, 102);
    }

    const balanceAfter = toMoney(balanceBefore - totalAmount);
    await executePrepared(
      `UPDATE users
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [balanceAfter, user.id],
      { connection }
    );

    const paymentId = crypto.randomUUID();
    const walletTransactionId = crypto.randomUUID();
    const invoiceNumber = generateInvoiceNumber();

    await executePrepared(
      `INSERT INTO payment_transactions (
        id,
        user_id,
        service_id,
        invoice_number,
        customer_number,
        amount,
        admin_fee,
        total_amount,
        status,
        provider_reference,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        paymentId,
        user.id,
        service.id,
        invoiceNumber,
        null,
        amount,
        adminFee,
        totalAmount,
        'SUCCESS',
        invoiceNumber,
      ],
      { connection }
    );

    await executePrepared(
      `INSERT INTO wallet_transactions (
        id,
        user_id,
        type,
        invoice_number,
        amount,
        balance_before,
        balance_after,
        status,
        description,
        reference_type,
        reference_id,
        metadata,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        walletTransactionId,
        user.id,
        'PAYMENT',
        invoiceNumber,
        totalAmount,
        balanceBefore,
        balanceAfter,
        'SUCCESS',
        service.name,
        'PAYMENT_TRANSACTION',
        paymentId,
        JSON.stringify({
          service_code: service.code,
          service_name: service.name,
        }),
      ],
      { connection }
    );

    const payment = await queryOne(
      `SELECT
        p.invoice_number,
        s.code AS service_code,
        s.name AS service_name,
        p.total_amount,
        p.created_at
      FROM payment_transactions p
      INNER JOIN services s ON s.id = p.service_id
      WHERE p.id = ?
      LIMIT 1`,
      [paymentId],
      { connection }
    );

    return serializePayment(payment);
  });

  return sendSuccess(res, 'Transaksi berhasil', result);
});

const listTransactions = asyncHandler(async (req, res) => {
  const offset = parseOffset(req.query.offset);
  const hasLimit = req.query.limit !== undefined;
  const limit = hasLimit ? Number.parseInt(req.query.limit, 10) : null;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : null;

  const baseSql = `SELECT
    invoice_number,
    type AS transaction_type,
    description,
    amount AS total_amount,
    created_at AS created_on
  FROM wallet_transactions
  WHERE user_id = ? AND status = ?
  ORDER BY created_at DESC`;

  const records = safeLimit
    ? await queryAll(`${baseSql} LIMIT ? OFFSET ?`, [
        req.user.id,
        'SUCCESS',
        safeLimit,
        offset,
      ])
    : await queryAll(baseSql, [req.user.id, 'SUCCESS']);

  const serializedRecords = records.map((item) =>
    serializeHistoryRecord(item)
  );

  const pagedRecords = safeLimit
    ? serializedRecords
    : serializedRecords.slice(offset);

  return sendSuccess(res, 'Get History Berhasil', {
    offset,
    limit: safeLimit || serializedRecords.length,
    records: pagedRecords,
  });
});

module.exports = {
  createTransaction,
  listTransactions,
};
