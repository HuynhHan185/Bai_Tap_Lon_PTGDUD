const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/banners
const getAll = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM banners
     WHERE trang_thai = 1
       AND (ngay_bat_dau IS NULL OR ngay_bat_dau <= CURDATE())
       AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc >= CURDATE())
     ORDER BY thu_tu ASC`
  );
  res.json({ success: true, banners: rows });
});

// GET /api/banners/admin
const getAllAdmin = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM banners ORDER BY thu_tu ASC');
  res.json({ success: true, banners: rows });
});

// POST /api/banners
const create = asyncHandler(async (req, res) => {
  const { tieu_de, hinh_anh, href, vi_tri_hien_thi, thu_tu, ngay_bat_dau, ngay_ket_thuc } = req.body;

  if (!tieu_de || !hinh_anh) {
    throw new ApiError(400, 'Tiêu đề và hình ảnh là bắt buộc');
  }

  const [result] = await pool.query(
    `INSERT INTO banners (tieu_de, hinh_anh, href, vi_tri_hien_thi, thu_tu, ngay_bat_dau, ngay_ket_thuc)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tieu_de, hinh_anh, href || null, vi_tri_hien_thi || null, thu_tu || 0, ngay_bat_dau || null, ngay_ket_thuc || null]
  );

  const [rows] = await pool.query('SELECT * FROM banners WHERE ma_banner = ?', [result.insertId]);
  res.status(201).json({ success: true, banner: rows[0] });
});

// PUT /api/banners/:id
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const [existing] = await pool.query('SELECT * FROM banners WHERE ma_banner = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy banner');

  const allowed = ['tieu_de', 'hinh_anh', 'href', 'vi_tri_hien_thi', 'thu_tu', 'ngay_bat_dau', 'ngay_ket_thuc', 'trang_thai'];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) throw new ApiError(400, 'Không có trường nào được cập nhật');

  values.push(id);
  await pool.query(`UPDATE banners SET ${updates.join(', ')} WHERE ma_banner = ?`, values);

  const [rows] = await pool.query('SELECT * FROM banners WHERE ma_banner = ?', [id]);
  res.json({ success: true, banner: rows[0] });
});

// DELETE /api/banners/:id
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT * FROM banners WHERE ma_banner = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy banner');

  await pool.query('DELETE FROM banners WHERE ma_banner = ?', [id]);
  res.json({ success: true, message: 'Xóa banner thành công' });
});

module.exports = { getAll, getAllAdmin, create, update, remove };
