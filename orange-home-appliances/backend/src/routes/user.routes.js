const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getMyProfile, updateMyProfile, changeMyPassword } = require('../controllers/user.controller');
const { getAllUsers } = require('../controllers/auth.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// User profile routes
router.get('/me/profile', auth, getMyProfile);
router.put('/me/profile', auth, updateMyProfile);
router.put(
  '/me/password',
  auth,
  [
    body('mat_khau_cu').notEmpty().withMessage('Mật khẩu cũ là bắt buộc'),
    body('mat_khau_moi').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  validate,
  changeMyPassword
);

// Admin: manage users
router.get('/admin', auth, adminOnly, getAllUsers);

module.exports = router;
