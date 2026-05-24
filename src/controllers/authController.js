const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { executePrepared, queryOne } = require('../database/raw');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function serializeProfile(user) {
  return {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    profile_image: user.profile_image || null,
  };
}

const register = asyncHandler(async (req, res) => {
  const { email, first_name: firstName, last_name: lastName, password } = req.body;

  if (!isEmail(email)) {
    throw new ApiError(400, 'Paramter email tidak sesuai format', null, 102);
  }

  if (!firstName || !lastName || !password) {
    throw new ApiError(400, 'Parameter request tidak lengkap', null, 102);
  }

  if (String(password).length < 8) {
    throw new ApiError(400, 'Password minimal 8 karakter', null, 102);
  }

  const existingUser = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [
    email,
  ]);
  if (existingUser) {
    throw new ApiError(409, 'Email sudah terdaftar', null, 102);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await executePrepared(
    `INSERT INTO users (
      id,
      first_name,
      last_name,
      email,
      password_hash,
      balance,
      status,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [crypto.randomUUID(), firstName, lastName, email, passwordHash]
  );

  return sendSuccess(res, 'Registrasi berhasil silahkan login');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isEmail(email)) {
    throw new ApiError(400, 'Paramter email tidak sesuai format', null, 102);
  }

  if (!password || String(password).length < 8) {
    throw new ApiError(400, 'Password minimal 8 karakter', null, 102);
  }

  const user = await queryOne(
    `SELECT
      id,
      email,
      first_name,
      last_name,
      password_hash,
      profile_image,
      balance,
      status
    FROM users
    WHERE email = ?
    LIMIT 1`,
    [email]
  );
  if (!user) {
    throw new ApiError(401, 'Username atau password salah', null, 103);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Username atau password salah', null, 103);
  }

  return sendSuccess(res, 'Login Sukses', {
    token: signToken(user),
  });
});

const profile = asyncHandler(async (req, res) => {
  return sendSuccess(res, 'Sukses', serializeProfile(req.user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { first_name: firstName, last_name: lastName } = req.body;

  if (!firstName || !lastName) {
    throw new ApiError(400, 'Parameter first_name dan last_name wajib diisi', null, 102);
  }

  await executePrepared(
    `UPDATE users
    SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [firstName, lastName, req.user.id]
  );

  req.user.first_name = firstName;
  req.user.last_name = lastName;

  return sendSuccess(res, 'Update Pofile berhasil', serializeProfile(req.user));
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const contentType = req.headers['content-type'] || '';
  const bodyText = Buffer.isBuffer(req.body) ? req.body.toString('latin1') : '';
  const isMultipart = contentType.includes('multipart/form-data');
  const hasAllowedMime =
    bodyText.includes('Content-Type: image/jpeg') ||
    bodyText.includes('Content-Type: image/png') ||
    /\.(jpe?g|png)"/i.test(bodyText);

  if (!isMultipart || !hasAllowedMime) {
    throw new ApiError(400, 'Format Image tidak sesuai', null, 102);
  }

  const extension = bodyText.includes('image/png') || /\.png"/i.test(bodyText) ? 'png' : 'jpeg';
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const profileImage = `${baseUrl}/uploads/profile-${req.user.id}.${extension}`;

  await executePrepared(
    `UPDATE users
    SET profile_image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [profileImage, req.user.id]
  );

  req.user.profile_image = profileImage;

  return sendSuccess(res, 'Update Profile Image berhasil', serializeProfile(req.user));
});

module.exports = {
  login,
  profile,
  register,
  updateProfile,
  updateProfileImage,
};
