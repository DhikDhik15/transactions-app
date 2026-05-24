function parseLimit(value, defaultLimit = 50, maxLimit = 100) {
  const limit = Number.parseInt(value, 10);

  if (!Number.isInteger(limit) || limit <= 0) {
    return defaultLimit;
  }

  return Math.min(limit, maxLimit);
}

function parseOffset(value) {
  const offset = Number.parseInt(value, 10);

  if (!Number.isInteger(offset) || offset < 0) {
    return 0;
  }

  return offset;
}

module.exports = {
  parseOffset,
  parseLimit,
};
