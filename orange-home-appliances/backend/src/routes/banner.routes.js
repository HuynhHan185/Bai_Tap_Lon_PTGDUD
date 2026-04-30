const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getAll, getAllAdmin, create, update, remove } = require('../controllers/banner.controller');

const createRules = [
  body('tieu_de').trim().notEmpty().withMessage('Tiêu đề là bắt buộc'),
  body('hinh_anh').trim().notEmpty().withMessage('Hình ảnh là bắt buộc'),
];

router.get('/', getAll);
router.get('/admin', auth, adminOnly, getAllAdmin);
router.post('/', auth, adminOnly, createRules, validate, create);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
