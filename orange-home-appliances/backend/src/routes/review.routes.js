const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getByProduct, create, remove } = require('../controllers/review.controller');

const createRules = [
  body('ma_sp').isInt().withMessage('Mã sản phẩm không hợp lệ'),
  body('diem_so').isInt({ min: 1, max: 5 }).withMessage('Điểm số phải từ 1 đến 5'),
];

router.get('/product/:productId', getByProduct);
router.post('/', auth, createRules, validate, create);
router.delete('/:id', auth, remove);

module.exports = router;
