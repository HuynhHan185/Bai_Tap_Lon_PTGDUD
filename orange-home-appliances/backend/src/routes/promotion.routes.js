const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getActive, getAllAdmin, getById, create, generateCodes, validateCoupon, remove } = require('../controllers/promotion.controller');

const createRules = [
  body('ten_km').trim().notEmpty().withMessage('Tên khuyến mãi là bắt buộc'),
  body('loai_giam_gia').isIn(['percent', 'fixed']).withMessage('Loại giảm giá phải là percent hoặc fixed'),
  body('gia_tri_giam').isNumeric().withMessage('Giá trị giảm phải là số'),
  body('ngay_bat_dau').notEmpty().withMessage('Ngày bắt đầu là bắt buộc'),
  body('ngay_ket_thuc').notEmpty().withMessage('Ngày kết thúc là bắt buộc'),
];

router.get('/', getActive);
router.get('/admin', auth, adminOnly, getAllAdmin);
router.get('/:id', getById);
router.post('/', auth, adminOnly, createRules, validate, create);
router.post('/:id/codes', auth, adminOnly, generateCodes);
router.post('/validate', validateCoupon);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
