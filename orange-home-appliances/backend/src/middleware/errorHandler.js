const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('SERVER ERROR:', err);

  return res.status(500).json({
    success: false,
    message: 'Lỗi server, vui lòng thử lại sau',
  });
};

module.exports = errorHandler;
