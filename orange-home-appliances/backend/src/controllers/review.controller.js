const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/reviews/product/:productId
const getByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const [countRows] = await pool.query(
    'SELECT COUNT(*) as total FROM reviews WHERE ma_sp = ? AND trang_thai = 1',
    [productId]
  );
  const total = countRows[0].total;

  const [reviews] = await pool.query(
    `SELECT r.*, u.ho, u.ten, u.hinh_anh as user_avatar
     FROM reviews r
     LEFT JOIN users u ON r.ma_user = u.ma_user
     WHERE r.ma_sp = ? AND r.trang_thai = 1
     ORDER BY r.ngay_tao DESC
     LIMIT ? OFFSET ?`,
    [productId, Number(limit), offset]
  );

  res.json({
    success: true,
    reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// POST /api/reviews
const create = asyncHandler(async (req, res) => {
  const { ma_sp, diem_so, tieu_de, noi_dung, hinh_anh } = req.body;

  if (!ma_sp || !diem_so) {
    throw new ApiError(400, 'Mã sản phẩm và điểm số là bắt buộc');
  }

  if (diem_so < 1 || diem_so > 5) {
    throw new ApiError(400, 'Điểm số phải từ 1 đến 5');
  }

  // Check if already reviewed
  const [existing] = await pool.query(
    'SELECT ma_danh_gia FROM reviews WHERE ma_user = ? AND ma_sp = ?',
    [req.user.ma_user, ma_sp]
  );
  if (existing.length > 0) {
    throw new ApiError(400, 'Bạn đã đánh giá sản phẩm này');
  }

  const [result] = await pool.query(
    `INSERT INTO reviews (ma_sp, ma_user, diem_so, tieu_de, noi_dung, hinh_anh)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ma_sp, req.user.ma_user, diem_so, tieu_de || null, noi_dung || null, hinh_anh || null]
  );

  // Update product rating (trigger will do this, but we also do it here for immediate feedback)
  const [avgRows] = await pool.query(
    'SELECT AVG(diem_so) as avg_rating, COUNT(*) as cnt FROM reviews WHERE ma_sp = ? AND trang_thai = 1',
    [ma_sp]
  );
  await pool.query(
    'UPDATE products SET rating = ?, review_count = ? WHERE ma_sp = ?',
    [Number(avgRows[0].avg_rating).toFixed(1) || 0, avgRows[0].cnt, ma_sp]
  );

  const [rows] = await pool.query('SELECT * FROM reviews WHERE ma_danh_gia = ?', [result.insertId]);
  res.status(201).json({ success: true, review: rows[0] });
});

// DELETE /api/reviews/:id
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT * FROM reviews WHERE ma_danh_gia = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy đánh giá');

  const review = existing[0];

  // Only owner or admin can delete
  if (review.ma_user !== req.user.ma_user && req.user.ma_role !== 1) {
    throw new ApiError(403, 'Bạn không có quyền xóa đánh giá này');
  }

  await pool.query('DELETE FROM reviews WHERE ma_danh_gia = ?', [id]);

  // Update product rating
  const [avgRows] = await pool.query(
    'SELECT AVG(diem_so) as avg_rating, COUNT(*) as cnt FROM reviews WHERE ma_sp = ? AND trang_thai = 1',
    [review.ma_sp]
  );
  await pool.query(
    'UPDATE products SET rating = ?, review_count = ? WHERE ma_sp = ?',
    [Number(avgRows[0].avg_rating).toFixed(1) || 0, avgRows[0].cnt, review.ma_sp]
  );

  res.json({ success: true, message: 'Xóa đánh giá thành công' });
});

module.exports = { getByProduct, create, remove };
