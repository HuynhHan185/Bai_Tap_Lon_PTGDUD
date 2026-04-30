const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// POST /api/contacts
const create = asyncHandler(async (req, res) => {
  const { ho_ten, email, so_dien_thoai, chu_de, noi_dung } = req.body;

  if (!ho_ten || !email || !noi_dung) {
    throw new ApiError(400, 'Họ tên, email và nội dung là bắt buộc');
  }

  const [result] = await pool.query(
    `INSERT INTO contacts (ho_ten, email, so_dien_thoai, chu_de, noi_dung)
     VALUES (?, ?, ?, ?, ?)`,
    [ho_ten, email, so_dien_thoai || null, chu_de || null, noi_dung]
  );

  res.status(201).json({
    success: true,
    message: 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.',
  });
});

// GET /api/contacts/admin
const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = '';
  const params = [];
  if (status !== undefined) {
    where = 'WHERE c.trang_thai = ?';
    params.push(Number(status));
  }

  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM contacts c ${where}`, params);
  const total = countRows[0].total;

  const [contacts] = await pool.query(
    `SELECT * FROM contacts c ${where} ORDER BY c.ngay_tao DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  res.json({
    success: true,
    contacts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// PATCH /api/contacts/:id/reply
const reply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tra_loi } = req.body;

  if (!tra_loi) throw new ApiError(400, 'Nội dung trả lời là bắt buộc');

  const [existing] = await pool.query('SELECT * FROM contacts WHERE ma_lh = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy liên hệ');

  await pool.query(
    'UPDATE contacts SET tra_loi = ?, ngay_tra_loi = NOW(), trang_thai = 1 WHERE ma_lh = ?',
    [tra_loi, id]
  );

  res.json({ success: true, message: 'Trả lời liên hệ thành công' });
});

module.exports = { create, getAll, reply };
