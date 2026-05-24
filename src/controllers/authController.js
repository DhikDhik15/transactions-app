const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
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
    first_name: user.firstName,
    last_name: user.lastName,
    profile_image: user.profileImage || null,
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

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'Email sudah terdaftar', null, 102);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email,
    firstName,
    lastName,
    passwordHash,
  });

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

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Username atau password salah', null, 103);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
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

  await req.user.update({
    firstName,
    lastName,
  });

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

  await req.user.update({ profileImage });

  return sendSuccess(res, 'Update Profile Image berhasil', serializeProfile(req.user));
});

module.exports = {
  login,
  profile,
  register,
  updateProfile,
  updateProfileImage,
};
