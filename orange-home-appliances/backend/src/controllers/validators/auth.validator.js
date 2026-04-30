const { body } = require('express-validator');

const registerRules = [
  body('ho').trim().notEmpty().withMessage('Họ là bắt buộc'),
  body('ten').trim().notEmpty().withMessage('Tên là bắt buộc'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('mat_khau')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

const loginRules = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('mat_khau').notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Token là bắt buộc'),
  body('mat_khau_moi')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules };
