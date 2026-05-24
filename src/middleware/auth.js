const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const auth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
  }

  const user = payload.email
    ? await User.findOne({ where: { email: payload.email } })
    : await User.findByPk(payload.sub);

  if (!user) {
    throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(401, 'Token tidak tidak valid atau kadaluwarsa', null, 108);
  }

  req.user = user;
  next();
});

module.exports = auth;
