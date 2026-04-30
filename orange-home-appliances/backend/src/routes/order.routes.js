const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const {
  create, getMyOrders, getAllOrders,
  getById, updateStatus, cancelOrder, remove,
} = require('../controllers/order.controller');

const createRules = [
  body('ho_ten').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
  body('so_dien_thoai').trim().notEmpty().withMessage('Số điện thoại là bắt buộc'),
  body('dia_chi').trim().notEmpty().withMessage('Địa chỉ là bắt buộc'),
  body('items').isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
];

router.post('/', createRules, validate, create);
router.get('/my-orders', auth, getMyOrders);
router.get('/admin', auth, adminOnly, getAllOrders);
router.get('/:id', auth, getById);
router.patch('/:id/status', auth, adminOnly, updateStatus);
router.patch('/:id/cancel', auth, cancelOrder);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
