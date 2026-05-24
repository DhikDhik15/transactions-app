const ApiError = require('./ApiError');

function toNumber(value) {
  return Number.parseFloat(value || 0);
}

function toMoney(value) {
  return Number(toNumber(value).toFixed(2));
}

function parsePositiveAmount(value, fieldName = 'amount') {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, `${fieldName} must be greater than 0`);
  }

  return toMoney(amount);
}

module.exports = {
  parsePositiveAmount,
  toMoney,
  toNumber,
};
