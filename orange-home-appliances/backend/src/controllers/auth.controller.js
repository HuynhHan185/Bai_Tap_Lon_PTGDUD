const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateOrderCode } = require('../utils/helpers');

// Helper: thêm fullName và role vào user object
function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    fullName: [user.ho, user.ten].filter(Boolean).join(' ').trim(),
    role: user.ten_role || (user.ma_role === 1 ? 'admin' : user.ma_role === 2 ? 'customer' : 'user'),
  };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { ho, ten, email, mat_khau, so_dien_thoai, dia_chi, gioi_tinh, ngay_sinh } = req.body;

  const [existing] = await pool.query('SELECT ma_user FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(400, 'Email đã được sử dụng');
  }

  const [result] = await pool.query(
    `INSERT INTO users (ho, ten, email, mat_khau, so_dien_thoai, dia_chi, gioi_tinh, ngay_sinh, ma_role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2)`,
    [ho, ten, email, mat_khau, so_dien_thoai || null, dia_chi || null, gioi_tinh || null, ngay_sinh || null]
  );

  const [users] = await pool.query('SELECT * FROM users WHERE ma_user = ?', [result.insertId]);
  const user = normalizeUser(users[0]);
  delete user.mat_khau;

  const token = jwt.sign(
    { ma_user: user.ma_user, email: user.email, ma_role: user.ma_role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({ success: true, accessToken: token, user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, mat_khau } = req.body;

  const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_deleted = 0', [email]);
  const user = users[0];

  if (!user) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
  }

  const isMatch = mat_khau === user.mat_khau;
  if (!isMatch) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
  }

  if (user.trang_thai === 0) {
    throw new ApiError(403, 'Tài khoản đã bị vô hiệu hóa');
  }

  // Update last login
  await pool.query('UPDATE users SET lan_dang_nhap_cuoi = NOW() WHERE ma_user = ?', [user.ma_user]);

  const token = jwt.sign(
    { ma_user: user.ma_user, email: user.email, ma_role: user.ma_role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const normalized = normalizeUser(user);
  delete normalized.mat_khau;

  res.json({ success: true, accessToken: token, user: normalized });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.*, r.ten_role FROM users u JOIN roles r ON u.ma_role = r.ma_role WHERE u.ma_user = ?`,
    [req.user.ma_user]
  );

  if (users.length === 0) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  const user = normalizeUser(users[0]);
  delete user.mat_khau;

  res.json({ success: true, user });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_deleted = 0', [email]);

  if (users.length === 0) {
    // Không tiết lộ email có tồn tại hay không để bảo mật
    return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu' });
  }

  // Tạo reset token (trong thực tế, gửi email thật qua nodemailer)
  const resetToken = jwt.sign(
    { ma_user: users[0].ma_user, purpose: 'reset-password' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Log token ra console (thay bằng gửi email thật trong production)
  console.log(`\n🔑 Reset Password Token cho ${email}:`);
  console.log(resetToken);
  console.log(`\nHoặc truy cập: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/tai-khoan/reset-mat-khau?token=${resetToken}\n`);

  res.json({
    success: true,
    message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu',
    // REMOVE this in production - only for development
    resetToken,
  });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, mat_khau_moi } = req.body;

  if (!token || !mat_khau_moi) {
    throw new ApiError(400, 'Token và mật khẩu mới là bắt buộc');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn');
  }

  if (decoded.purpose !== 'reset-password') {
    throw new ApiError(400, 'Token không hợp lệ');
  }

  await pool.query('UPDATE users SET mat_khau = ? WHERE ma_user = ?', [mat_khau_moi, decoded.ma_user]);

  res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
});

// GET /api/auth/admin/users - List all users (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.ma_user, u.ho, u.ten, u.email, u.so_dien_thoai, u.dia_chi, u.gioi_tinh,
            u.ngay_sinh, u.hinh_anh, u.diem_tich_luy, u.trang_thai, u.lan_dang_nhap_cuoi,
            u.ngay_tao, u.is_deleted, r.ten_role
     FROM users u JOIN roles r ON u.ma_role = r.ma_role
     ORDER BY u.ngay_tao DESC`
  );

  const sanitized = users.map(u => {
    const normalized = normalizeUser(u);
    delete normalized.mat_khau;
    return normalized;
  });

  res.json({ success: true, users: sanitized });
});

// PATCH /api/users/:id - Admin update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ho, ten, so_dien_thoai, dia_chi, gioi_tinh, ngay_sinh, trang_thai, ma_role, mat_khau_moi } = req.body;

  const [existing] = await pool.query('SELECT * FROM users WHERE ma_user = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy người dùng');

  const updates = [];
  const values = [];

  if (ho !== undefined) { updates.push('ho = ?'); values.push(ho); }
  if (ten !== undefined) { updates.push('ten = ?'); values.push(ten); }
  if (so_dien_thoai !== undefined) { updates.push('so_dien_thoai = ?'); values.push(so_dien_thoai); }
  if (dia_chi !== undefined) { updates.push('dia_chi = ?'); values.push(dia_chi); }
  if (gioi_tinh !== undefined) { updates.push('gioi_tinh = ?'); values.push(gioi_tinh); }
  if (ngay_sinh !== undefined) { updates.push('ngay_sinh = ?'); values.push(ngay_sinh); }
  if (trang_thai !== undefined) { updates.push('trang_thai = ?'); values.push(trang_thai); }
  if (ma_role !== undefined) { updates.push('ma_role = ?'); values.push(ma_role); }
  if (mat_khau_moi) { updates.push('mat_khau = ?'); values.push(mat_khau_moi); }

  if (updates.length === 0) {
    throw new ApiError(400, 'Không có trường nào để cập nhật');
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE ma_user = ?`, values);

  const [updated] = await pool.query(
    `SELECT u.*, r.ten_role FROM users u JOIN roles r ON u.ma_role = r.ma_role WHERE u.ma_user = ?`,
    [id]
  );
  const user = normalizeUser(updated[0]);
  delete user.mat_khau;

  res.json({ success: true, message: 'Cập nhật thành công', user });
});

// DELETE /api/users/:id - Admin soft delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT * FROM users WHERE ma_user = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy người dùng');

  if (existing[0].ma_role === 1) {
    throw new ApiError(400, 'Không thể xóa tài khoản quản trị viên');
  }

  await pool.query('UPDATE users SET is_deleted = 1 WHERE ma_user = ?', [id]);
  res.json({ success: true, message: 'Xóa người dùng thành công' });
});

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUser,
  deleteUser,
};
