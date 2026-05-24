const { ValidationError, UniqueConstraintError } = require('sequelize');
const ApiError = require('../utils/ApiError');

function contractStatus(statusCode, internalStatus) {
  if (internalStatus) {
    return internalStatus;
  }

  if (statusCode === 401 || statusCode === 403) {
    return 108;
  }

  if (statusCode === 400 || statusCode === 404 || statusCode === 409) {
    return 102;
  }

  return statusCode;
}

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(error, req, res, next) {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      status: 102,
      message: 'Data sudah terdaftar',
      data: null,
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: 102,
      message: 'Validation failed',
      data: null,
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    status: contractStatus(statusCode, error.internalStatus),
    message: statusCode === 500 ? 'Internal server error' : error.message,
    data: error.details || null,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
