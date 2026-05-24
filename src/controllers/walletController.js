const crypto = require('crypto');
const {
  executePrepared,
  queryAll,
  queryOne,
  withTransaction,
} = require('../database/raw');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePositiveAmount, toMoney, toNumber } = require('../utils/money');
const { parseLimit } = require('../utils/query');
const { sendSuccess } = require('../utils/response');
const { generateInvoiceNumber } = require('../utils/invoice');

function serializeWalletTransaction(transaction) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: toMoney(transaction.amount),
    balanceBefore: toMoney(transaction.balance_before),
    balanceAfter: toMoney(transaction.balance_after),
    status: transaction.status,
    description: transaction.description,
    referenceType: transaction.reference_type,
    referenceId: transaction.reference_id,
    externalReference: transaction.external_reference,
    metadata: transaction.metadata,
    createdAt: transaction.created_at,
  };
}

const getBalance = asyncHandler(async (req, res) => {
  const user = await queryOne('SELECT balance FROM users WHERE id = ? LIMIT 1', [
    req.user.id,
  ]);

  if (!user) {
    throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
  }

  return sendSuccess(res, 'Get Balance Berhasil', {
    balance: toMoney(user.balance),
  });
});

const topUp = asyncHandler(async (req, res) => {
  let amount;
  try {
    amount = parsePositiveAmount(req.body.top_up_amount, 'amount');
  } catch (error) {
    throw new ApiError(
      400,
      'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
      null,
      102
    );
  }

  const result = await withTransaction(async (connection) => {
    const user = await queryOne(
      'SELECT id, balance FROM users WHERE id = ? FOR UPDATE',
      [req.user.id],
      { connection }
    );

    if (!user) {
      throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
    }

    const balanceBefore = toNumber(user.balance);
    const balanceAfter = toMoney(balanceBefore + amount);

    await executePrepared(
      `UPDATE users
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [balanceAfter, user.id],
      { connection }
    );

    const walletTransaction = {
      id: crypto.randomUUID(),
      user_id: user.id,
      type: 'TOPUP',
      invoice_number: generateInvoiceNumber(),
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: 'SUCCESS',
      description: 'Top Up balance',
    };

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
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        walletTransaction.id,
        walletTransaction.user_id,
        walletTransaction.type,
        walletTransaction.invoice_number,
        walletTransaction.amount,
        walletTransaction.balance_before,
        walletTransaction.balance_after,
        walletTransaction.status,
        walletTransaction.description,
      ],
      { connection }
    );

    return {
      balance: balanceAfter,
      transaction: serializeWalletTransaction(walletTransaction),
    };
  });

  return sendSuccess(res, 'Top Up Balance berhasil', {
    balance: result.balance,
  });
});

const listTopUps = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit);

  const topUps = await queryAll(
    `SELECT
      id,
      type,
      amount,
      balance_before,
      balance_after,
      status,
      description,
      reference_type,
      reference_id,
      external_reference,
      metadata,
      created_at
    FROM wallet_transactions
    WHERE user_id = ? AND type = ?
    ORDER BY created_at DESC
    LIMIT ?`,
    [req.user.id, 'TOPUP', limit]
  );

  return sendSuccess(res, 'Sukses', topUps.map(serializeWalletTransaction));
});

module.exports = {
  getBalance,
  listTopUps,
  topUp,
};
