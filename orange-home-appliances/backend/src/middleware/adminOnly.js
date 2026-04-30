const ApiError = require('../utils/ApiError');

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.ma_role !== 1) {
    throw new ApiError(403, 'Bạn không có quyền thực hiện thao tác này');
  }
  next();
};

module.exports = adminOnly;
