const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { body } = require('express-validator');
const {
  getAll, getFeatured, getRelated, getBySlug, getBrands,
  getAllAdmin, create, update, remove, uploadImage,
} = require('../controllers/product.controller');

const createRules = [
  body('ten_sp').trim().notEmpty().withMessage('Tên sản phẩm là bắt buộc'),
  body('don_gia').isNumeric().withMessage('Giá phải là số'),
];

const updateRules = [
  body('don_gia').optional().isNumeric().withMessage('Giá phải là số'),
];

// Public
router.get('/', getAll);
router.get('/featured', getFeatured);
router.get('/related/:id', getRelated);
router.get('/slug/:slug', getBySlug);
router.get('/brands', getBrands);

// Admin
router.get('/admin/all', auth, adminOnly, getAllAdmin);
router.post('/', auth, adminOnly, createRules, validate, create);
router.put('/:id', auth, adminOnly, updateRules, validate, update);
router.delete('/:id', auth, adminOnly, remove);
router.post('/upload-image', auth, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
