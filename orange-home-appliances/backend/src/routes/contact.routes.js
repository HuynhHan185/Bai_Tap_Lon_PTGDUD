const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const { create, getAll, reply } = require('../controllers/contact.controller');

router.post(
  '/',
  [
    body('ho_ten').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('noi_dung').trim().notEmpty().withMessage('Nội dung là bắt buộc'),
  ],
  validate,
  create
);
router.get('/admin', auth, adminOnly, getAll);
router.patch('/:id/reply', auth, adminOnly, reply);

module.exports = router;
