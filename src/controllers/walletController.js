const { sequelize, User, WalletTransaction } = require('../models');
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
    balanceBefore: toMoney(transaction.balanceBefore),
    balanceAfter: toMoney(transaction.balanceAfter),
    status: transaction.status,
    description: transaction.description,
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    externalReference: transaction.externalReference,
    metadata: transaction.metadata,
    createdAt: transaction.createdAt,
  };
}

const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

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

  const result = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(req.user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const balanceBefore = toNumber(user.balance);
    const balanceAfter = toMoney(balanceBefore + amount);

    await user.update(
      {
        balance: balanceAfter,
      },
      { transaction }
    );

    const walletTransaction = await WalletTransaction.create(
      {
        userId: user.id,
        type: 'TOPUP',
        invoiceNumber: generateInvoiceNumber(),
        amount,
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
        description: 'Top Up balance',
      },
      { transaction }
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

  const topUps = await WalletTransaction.findAll({
    where: {
      userId: req.user.id,
      type: 'TOPUP',
    },
    order: [['createdAt', 'DESC']],
    limit,
  });

  return sendSuccess(res, 'Sukses', topUps.map(serializeWalletTransaction));
});

module.exports = {
  getBalance,
  listTopUps,
  topUp,
};
