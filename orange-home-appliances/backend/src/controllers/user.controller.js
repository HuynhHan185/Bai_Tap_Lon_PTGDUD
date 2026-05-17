const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    fullName: [user.ho, user.ten].filter(Boolean).join(' ').trim(),
    role: user.ten_role || (user.ma_role === 1 ? 'admin' : user.ma_role === 2 ? 'customer' : 'user'),
  };
}

// GET /api/users/me/profile
const getMyProfile = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.ma_user, u.ho, u.ten, u.email, u.so_dien_thoai, u.dia_chi, u.gioi_tinh,
            u.ngay_sinh, u.hinh_anh, u.diem_tich_luy, u.trang_thai, u.lan_dang_nhap_cuoi,
            u.ngay_tao, r.ten_role
     FROM users u JOIN roles r ON u.ma_role = r.ma_role
     WHERE u.ma_user = ?`,
    [req.user.ma_user]
  );

  if (users.length === 0) throw new ApiError(404, 'Không tìm thấy người dùng');

  res.json({ success: true, user: normalizeUser(users[0]) });
});

// PUT /api/users/me/profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const { ho, ten, so_dien_thoai, dia_chi, gioi_tinh, ngay_sinh, hinh_anh } = req.body;

  await pool.query(
    `UPDATE users SET ho = ?, ten = ?, so_dien_thoai = ?, dia_chi = ?, gioi_tinh = ?, ngay_sinh = ?, hinh_anh = ?
     WHERE ma_user = ?`,
    [ho, ten, so_dien_thoai, dia_chi, gioi_tinh, ngay_sinh, hinh_anh, req.user.ma_user]
  );

  const [users] = await pool.query('SELECT * FROM users WHERE ma_user = ?', [req.user.ma_user]);
  const user = normalizeUser(users[0]);
  delete user.mat_khau;

  res.json({ success: true, message: 'Cập nhật thông tin thành công', user });
});

// PUT /api/users/me/password
const changeMyPassword = asyncHandler(async (req, res) => {
  const { mat_khau_cu, mat_khau_moi } = req.body;

  const [users] = await pool.query('SELECT mat_khau FROM users WHERE ma_user = ?', [req.user.ma_user]);
  const isMatch = mat_khau_cu === users[0].mat_khau;

  if (!isMatch) throw new ApiError(400, 'Mật khẩu cũ không đúng');

  await pool.query('UPDATE users SET mat_khau = ? WHERE ma_user = ?', [mat_khau_moi, req.user.ma_user]);

  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

module.exports = { getMyProfile, updateMyProfile, changeMyPassword };
