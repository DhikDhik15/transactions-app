const jwt = require('jsonwebtoken');
const { queryOne } = require('../database/raw');
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
    ? await queryOne(
        `SELECT
          id,
          email,
          first_name,
          last_name,
          profile_image,
          balance,
          status
        FROM users
        WHERE email = ?
        LIMIT 1`,
        [payload.email]
      )
    : await queryOne(
        `SELECT
          id,
          email,
          first_name,
          last_name,
          profile_image,
          balance,
          status
        FROM users
        WHERE id = ?
        LIMIT 1`,
        [payload.sub]
      );

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
