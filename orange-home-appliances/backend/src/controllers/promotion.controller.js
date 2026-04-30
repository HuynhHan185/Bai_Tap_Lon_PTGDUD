const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateCouponCode } = require('../utils/helpers');

// GET /api/promotions - active promotions
const getActive = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM promotions
     WHERE trang_thai = 1
       AND ngay_bat_dau <= CURDATE()
       AND ngay_ket_thuc >= CURDATE()
     ORDER BY ngay_tao DESC`
  );
  res.json({ success: true, promotions: rows });
});

// GET /api/promotions/admin
const getAllAdmin = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT km.*,
            (SELECT COUNT(*) FROM promotion_codes pc WHERE pc.ma_km = km.ma_km) as so_ma
     FROM promotions km
     ORDER BY km.ngay_tao DESC`
  );
  res.json({ success: true, promotions: rows });
});

// GET /api/promotions/:id
const getById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM promotions WHERE ma_km = ?', [req.params.id]);
  if (rows.length === 0) throw new ApiError(404, 'Không tìm thấy khuyến mãi');

  const [details] = await pool.query('SELECT * FROM promotion_details WHERE ma_km = ?', [req.params.id]);
  const [codes] = await pool.query('SELECT * FROM promotion_codes WHERE ma_km = ?', [req.params.id]);

  res.json({ success: true, promotion: { ...rows[0], details, codes } });
});

// POST /api/promotions
const create = asyncHandler(async (req, res) => {
  const { ten_km, mo_ta, loai_giam_gia, gia_tri_giam, gia_tri_giam_toi_da, ngay_bat_dau, ngay_ket_thuc } = req.body;

  if (!ten_km || !loai_giam_gia || !gia_tri_giam || !ngay_bat_dau || !ngay_ket_thuc) {
    throw new ApiError(400, 'Vui lòng điền đầy đủ thông tin bắt buộc');
  }

  const [result] = await pool.query(
    `INSERT INTO promotions (ten_km, mo_ta, loai_giam_gia, gia_tri_giam, gia_tri_giam_toi_da, ngay_bat_dau, ngay_ket_thuc)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ten_km, mo_ta || null, loai_giam_gia, gia_tri_giam, gia_tri_giam_toi_da || null, ngay_bat_dau, ngay_ket_thuc]
  );

  const [rows] = await pool.query('SELECT * FROM promotions WHERE ma_km = ?', [result.insertId]);
  res.status(201).json({ success: true, promotion: rows[0] });
});

// POST /api/promotions/:id/codes - generate coupon codes
const generateCodes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { so_luong = 10, gia_tri_giam, gia_tri_don_toi_thieu = 0, ngay_het_han, so_lan_su_dung = 1 } = req.body;

  const [existing] = await pool.query('SELECT * FROM promotions WHERE ma_km = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy khuyến mãi');

  const codes = [];
  for (let i = 0; i < Number(so_luong); i++) {
    const code = generateCouponCode(8);
    await pool.query(
      `INSERT INTO promotion_codes (ma_km, code, gia_tri_giam, gia_tri_don_toi_thieu, ngay_het_han, so_lan_su_dung)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, code, gia_tri_giam, gia_tri_don_toi_thieu, ngay_het_han || existing[0].ngay_ket_thuc, so_lan_su_dung]
    );
    codes.push(code);
  }

  res.status(201).json({ success: true, codes, message: `Tạo thành công ${codes.length} mã coupon` });
});

// POST /api/promotions/validate
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, tong_tien } = req.body;

  const [codes] = await pool.query(
    `SELECT pc.*, km.ten_km, km.gia_tri_giam as km_gia_tri, km.loai_giam_gia, km.ngay_ket_thuc as km_het_han
     FROM promotion_codes pc
     JOIN promotions km ON pc.ma_km = km.ma_km
     WHERE pc.code = ? AND pc.trang_thai = 1 AND km.trang_thai = 1`,
    [code]
  );

  if (codes.length === 0) {
    throw new ApiError(400, 'Mã khuyến mãi không tồn tại');
  }

  const c = codes[0];

  if (c.so_lan_da_su_dung >= c.so_lan_su_dung) {
    throw new ApiError(400, 'Mã khuyến mãi đã hết lượt sử dụng');
  }

  if (c.ngay_het_han && new Date(c.ngay_het_han) < new Date()) {
    throw new ApiError(400, 'Mã khuyến mãi đã hết hạn');
  }

  if (tong_tien && c.gia_tri_don_toi_thieu && tong_tien < c.gia_tri_don_toi_thieu) {
    throw new ApiError(400, `Đơn hàng tối thiểu ${Number(c.gia_tri_don_toi_thieu).toLocaleString('vi-VN')}đ để sử dụng mã này`);
  }

  let giam_gia = Number(c.gia_tri_giam);
  if (c.loai_giam_gia === 'percent') {
    giam_gia = Math.round((tong_tien * Number(c.gia_tri_giam)) / 100);
    if (c.km_gia_tri) {
      giam_gia = Math.min(giam_gia, Number(c.km_gia_tri));
    }
  }

  res.json({
    success: true,
    coupon: {
      code: c.code,
      ten_km: c.ten_km,
      giam_gia,
      gia_tri_don_toi_thieu: c.gia_tri_don_toi_thieu,
    },
  });
});

// DELETE /api/promotions/:id
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT * FROM promotions WHERE ma_km = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy khuyến mãi');

  await pool.query('UPDATE promotions SET trang_thai = 0 WHERE ma_km = ?', [id]);
  res.json({ success: true, message: 'Vô hiệu hóa khuyến mãi thành công' });
});

module.exports = { getActive, getAllAdmin, getById, create, generateCodes, validateCoupon, remove };
