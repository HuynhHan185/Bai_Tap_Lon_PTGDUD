const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateSlug } = require('../utils/helpers');

// GET /api/categories
const getAll = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE is_deleted = 0 ORDER BY ngay_tao DESC'
  );
  res.json({ success: true, categories: rows });
});

// GET /api/categories/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE slug = ? AND is_deleted = 0',
    [req.params.slug]
  );
  if (rows.length === 0) throw new ApiError(404, 'Không tìm thấy danh mục');
  res.json({ success: true, category: rows[0] });
});

// POST /api/categories
const create = asyncHandler(async (req, res) => {
  const { ten_loai, mo_ta, hinh_anh } = req.body;

  if (!ten_loai) throw new ApiError(400, 'Tên danh mục là bắt buộc');

  const slug = generateSlug(ten_loai);

  const [existing] = await pool.query('SELECT ma_loai FROM categories WHERE slug = ?', [slug]);
  if (existing.length > 0) throw new ApiError(400, 'Danh mục đã tồn tại');

  const [result] = await pool.query(
    'INSERT INTO categories (ten_loai, slug, mo_ta, hinh_anh) VALUES (?, ?, ?, ?)',
    [ten_loai, slug, mo_ta || null, hinh_anh || null]
  );

  const [rows] = await pool.query('SELECT * FROM categories WHERE ma_loai = ?', [result.insertId]);
  res.status(201).json({ success: true, category: rows[0] });
});

// PUT /api/categories/:id
const update = asyncHandler(async (req, res) => {
  const { ten_loai, mo_ta, hinh_anh } = req.body;
  const { id } = req.params;

  const [existing] = await pool.query('SELECT * FROM categories WHERE ma_loai = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy danh mục');

  let slug = existing[0].slug;
  if (ten_loai && ten_loai !== existing[0].ten_loai) {
    slug = generateSlug(ten_loai);
    const [check] = await pool.query('SELECT ma_loai FROM categories WHERE slug = ? AND ma_loai != ?', [slug, id]);
    if (check.length > 0) throw new ApiError(400, 'Slug đã tồn tại');
  }

  await pool.query(
    'UPDATE categories SET ten_loai = COALESCE(?, ten_loai), slug = ?, mo_ta = COALESCE(?, mo_ta), hinh_anh = COALESCE(?, hinh_anh) WHERE ma_loai = ?',
    [ten_loai, slug, mo_ta, hinh_anh, id]
  );

  const [rows] = await pool.query('SELECT * FROM categories WHERE ma_loai = ?', [id]);
  res.json({ success: true, category: rows[0] });
});

// DELETE /api/categories/:id
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT * FROM categories WHERE ma_loai = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy danh mục');

  // Soft delete
  await pool.query('UPDATE categories SET is_deleted = 1 WHERE ma_loai = ?', [id]);

  res.json({ success: true, message: 'Xóa danh mục thành công' });
});

module.exports = { getAll, getBySlug, create, update, remove };
