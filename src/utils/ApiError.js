class ApiError extends Error {
  constructor(statusCode, message, details = null, internalStatus = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.internalStatus = internalStatus;
  }
}

module.exports = ApiError;
