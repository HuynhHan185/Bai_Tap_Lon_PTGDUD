const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const { getAll, getBySlug, create, update, remove } = require('../controllers/category.controller');

const createRules = [
  body('ten_loai').trim().notEmpty().withMessage('Tên danh mục là bắt buộc'),
];

const updateRules = [
  body('ten_loai').optional().trim().notEmpty().withMessage('Tên danh mục không được để trống'),
];

router.get('/', getAll);
router.get('/:slug', getBySlug);

router.post('/', auth, adminOnly, createRules, validate, create);
router.put('/:id', auth, adminOnly, updateRules, validate, update);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
