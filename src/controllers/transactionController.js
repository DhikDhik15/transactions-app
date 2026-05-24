const {
  PaymentTransaction,
  Service,
  User,
  WalletTransaction,
  sequelize,
} = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../utils/invoice');
const { toMoney, toNumber } = require('../utils/money');
const { parseOffset } = require('../utils/query');
const { sendSuccess } = require('../utils/response');

function serializePayment(transaction) {
  const service =
    transaction.service ||
    (typeof transaction.getDataValue === 'function'
      ? transaction.getDataValue('service')
      : null);

  return {
    invoice_number: transaction.invoiceNumber,
    service_code: service ? service.code : undefined,
    service_name: service ? service.name : undefined,
    transaction_type: 'PAYMENT',
    total_amount: toMoney(transaction.totalAmount),
    created_on: transaction.createdAt,
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

  const result = await sequelize.transaction(async (transaction) => {
    const service = await Service.findOne({
      where: {
        code: serviceCode,
        isActive: true,
      },
      transaction,
      lock: transaction.LOCK.SHARE,
    });

    if (!service) {
      throw new ApiError(400, 'Service ataus Layanan tidak ditemukan', null, 102);
    }

    const user = await User.findByPk(req.user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const totalAmount = toMoney(service.price);
    const balanceBefore = toNumber(user.balance);

    if (balanceBefore < totalAmount) {
      throw new ApiError(400, 'Saldo tidak mencukupi', null, 102);
    }

    const balanceAfter = toMoney(balanceBefore - totalAmount);
    await user.update({ balance: balanceAfter }, { transaction });

    const invoiceNumber = generateInvoiceNumber();
    const paymentTransaction = await PaymentTransaction.create(
      {
        userId: user.id,
        serviceId: service.id,
        invoiceNumber,
        customerNumber: null,
        amount: totalAmount,
        adminFee: 0,
        totalAmount,
        status: 'SUCCESS',
        providerReference: invoiceNumber,
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        userId: user.id,
        type: 'PAYMENT',
        invoiceNumber,
        amount: totalAmount,
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
        description: service.name,
        referenceType: 'PAYMENT_TRANSACTION',
        referenceId: paymentTransaction.id,
        metadata: {
          service_code: service.code,
          service_name: service.name,
        },
      },
      { transaction }
    );

    paymentTransaction.setDataValue('service', service);
    return serializePayment(paymentTransaction);
  });

  return sendSuccess(res, 'Transaksi berhasil', result);
});

const listTransactions = asyncHandler(async (req, res) => {
  const offset = parseOffset(req.query.offset);
  const hasLimit = req.query.limit !== undefined;
  const limit = hasLimit ? Number.parseInt(req.query.limit, 10) : null;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : null;

  const walletTransactions = await WalletTransaction.findAll({
    where: {
      userId: req.user.id,
      status: 'SUCCESS',
    },
    order: [['createdAt', 'DESC']],
  });

  const records = walletTransactions.map((item) =>
    serializeHistoryRecord({
      invoice_number: item.invoiceNumber,
      transaction_type: item.type,
      description: item.description,
      total_amount: item.amount,
      created_on: item.createdAt,
    })
  );

  const pagedRecords = safeLimit
    ? records.slice(offset, offset + safeLimit)
    : records.slice(offset);

  return sendSuccess(res, 'Get History Berhasil', {
    offset,
    limit: safeLimit || records.length,
    records: pagedRecords,
  });
});

module.exports = {
  createTransaction,
  listTransactions,
};
