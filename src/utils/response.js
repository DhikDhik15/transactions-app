function sendSuccess(res, message, data = null, httpStatus = 200) {
  return res.status(httpStatus).json({
    status: 0,
    message,
    data,
  });
}

module.exports = {
  sendSuccess,
};
