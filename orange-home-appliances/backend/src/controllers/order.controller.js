const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateOrderCode } = require('../utils/helpers');

// POST /api/orders
const create = asyncHandler(async (req, res) => {
  const {
    ho_ten, so_dien_thoai, email, dia_chi, ghi_chu,
    items, phuong_thuc_thanh_toan, ma_code,
  } = req.body;

  if (!ho_ten || !so_dien_thoai || !dia_chi || !items || items.length === 0) {
    throw new ApiError(400, 'Vui lòng điền đầy đủ thông tin bắt buộc');
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const ma_don_hang = await generateOrderCode(pool);
    let tong_tien = 0;
    let giam_gia = 0;

    // Calculate totals from items
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT ma_sp, don_gia, so_luong_ton FROM products WHERE ma_sp = ? AND is_deleted = 0',
        [item.ma_sp]
      );

      if (!products.length) {
        throw new ApiError(400, `Sản phẩm #${item.ma_sp} không tồn tại`);
      }

      const product = products[0];
      if (product.so_luong_ton < item.so_luong) {
        throw new ApiError(400, `Sản phẩm "${product.ten_sp}" không đủ số lượng (còn ${product.so_luong_ton})`);
      }

      const thanh_tien = product.don_gia * item.so_luong;
      item.don_gia = product.don_gia;
      item.thanh_tien = thanh_tien;
      tong_tien += thanh_tien;
    }

    // Validate and apply coupon
    let ma_code_id = null;
    if (ma_code) {
      const [codes] = await connection.query(
        `SELECT pc.*, km.gia_tri_giam as km_gia_tri, km.loai_giam_gia
         FROM promotion_codes pc
         JOIN promotions km ON pc.ma_km = km.ma_km
         WHERE pc.code = ? AND pc.trang_thai = 1
           AND (pc.ngay_het_han IS NULL OR pc.ngay_het_han >= CURDATE())
           AND pc.so_lan_da_su_dung < pc.so_lan_su_dung
           AND km.trang_thai = 1`,
        [ma_code]
      );

      if (codes.length === 0) {
        throw new ApiError(400, 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
      }

      const code = codes[0];
      if (code.gia_tri_don_toi_thieu && tong_tien < code.gia_tri_don_toi_thieu) {
        throw new ApiError(400, `Đơn hàng tối thiểu ${Number(code.gia_tri_don_toi_thieu).toLocaleString('vi-VN')}đ để sử dụng mã này`);
      }

      ma_code_id = code.ma_code;
      if (code.loai_giam_gia === 'percent') {
        giam_gia = Math.min((tong_tien * code.gia_tri_giam) / 100, code.km_gia_tri || Infinity);
      } else {
        giam_gia = Number(code.gia_tri_giam);
      }
    }

    const phi_van_chuyen = tong_tien >= 500000 ? 0 : 30000;
    const thanh_tien = Math.max(tong_tien - giam_gia + phi_van_chuyen, 0);

    // Insert order
    await connection.query(
      `INSERT INTO orders (ma_don_hang, ma_user, ho_ten, so_dien_thoai, email, dia_chi, ghi_chu,
        tong_tien, phi_van_chuyen, giam_gia, ma_code, thanh_tien, phuong_thuc_thanh_toan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_don_hang, req.user?.ma_user || null, ho_ten, so_dien_thoai, email || null,
        dia_chi, ghi_chu || null, tong_tien, phi_van_chuyen, giam_gia, ma_code_id,
        thanh_tien, phuong_thuc_thanh_toan || 'cod',
      ]
    );

    // Insert order items and update stock
    for (const item of items) {
      const [product] = await connection.query('SELECT * FROM products WHERE ma_sp = ?', [item.ma_sp]);

      await connection.query(
        `INSERT INTO order_items (ma_don_hang, ma_sp, ten_sp, sku, brand, hinh_anh, don_gia, gia_goc, so_luong, giam_gia, thanh_tien)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ma_don_hang, item.ma_sp, product[0].ten_sp, product[0].sku, product[0].brand,
          product[0].hinh_anh, item.don_gia, product[0].gia_goc,
          item.so_luong, 0, item.thanh_tien,
        ]
      );

      // Deduct stock
      await connection.query(
        'UPDATE products SET so_luong_ton = so_luong_ton - ? WHERE ma_sp = ?',
        [item.so_luong, item.ma_sp]
      );
    }

    // Update coupon usage
    if (ma_code_id) {
      await connection.query(
        'UPDATE promotion_codes SET so_lan_da_su_dung = so_lan_da_su_dung + 1 WHERE ma_code = ?',
        [ma_code_id]
      );
    }

    // Award loyalty points (1 point per 10,000 VND)
    if (req.user?.ma_user) {
      const diem_cong = Math.floor(thanh_tien / 10000);
      if (diem_cong > 0) {
        const [userData] = await connection.query('SELECT diem_tich_luy FROM users WHERE ma_user = ?', [req.user.ma_user]);
        const diem_hien_tai = userData[0]?.diem_tich_luy || 0;

        await connection.query(
          `INSERT INTO point_history (ma_user, ma_don_hang, loai_giao_dich, so_diem, diem_truoc, diem_sau, mo_ta)
           VALUES (?, ?, 'CongDiem', ?, ?, ?, ?)`,
          [req.user.ma_user, ma_don_hang, diem_cong, diem_hien_tai, diem_hien_tai + diem_cong, `Tích điểm từ đơn hàng ${ma_don_hang}`]
        );

        await connection.query(
          'UPDATE users SET diem_tich_luy = diem_tich_luy + ? WHERE ma_user = ?',
          [diem_cong, req.user.ma_user]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      order: { ma_don_hang, tong_tien, phi_van_chuyen, giam_gia, thanh_tien },
      message: 'Đặt hàng thành công!',
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
});

// GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(
    `SELECT dh.*, COUNT(dhct.ma_sp) as so_san_pham
     FROM orders dh
     LEFT JOIN order_items dhct ON dh.ma_don_hang = dhct.ma_don_hang
     WHERE dh.ma_user = ?
     GROUP BY dh.ma_don_hang
     ORDER BY dh.ngay_tao DESC`,
    [req.user.ma_user]
  );
  res.json({ success: true, orders });
});

// GET /api/orders/admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE dh.trang_thai = ?';
    params.push(status);
  }

  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM orders dh ${where}`, params);
  const total = countRows[0].total;

  const [orders] = await pool.query(
    `SELECT dh.*, u.ho, u.ten, u.email,
            COUNT(dhct.ma_sp) as so_san_pham,
            SUM(dhct.so_luong) as tong_so_luong
     FROM orders dh
     LEFT JOIN users u ON dh.ma_user = u.ma_user
     LEFT JOIN order_items dhct ON dh.ma_don_hang = dhct.ma_don_hang
     ${where}
     GROUP BY dh.ma_don_hang
     ORDER BY dh.ngay_tao DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  res.json({
    success: true,
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/orders/:id
const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [orders] = await pool.query('SELECT * FROM orders WHERE ma_don_hang = ?', [id]);
  if (orders.length === 0) throw new ApiError(404, 'Không tìm thấy đơn hàng');

  const order = orders[0];

  // Check ownership
  if (req.user?.ma_role !== 1 && order.ma_user !== req.user?.ma_user) {
    throw new ApiError(403, 'Bạn không có quyền xem đơn hàng này');
  }

  const [items] = await pool.query('SELECT * FROM order_items WHERE ma_don_hang = ?', [id]);

  res.json({ success: true, order: { ...order, items } });
});

// PATCH /api/orders/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { trang_thai, ly_do_huy } = req.body;

  const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(trang_thai)) {
    throw new ApiError(400, 'Trạng thái không hợp lệ');
  }

  const [existing] = await pool.query('SELECT * FROM orders WHERE ma_don_hang = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy đơn hàng');

  const updates = ['trang_thai = ?'];
  const values = [trang_thai];

  if (trang_thai === 'confirmed') {
    updates.push('ngay_xac_nhan = NOW()');
  } else if (trang_thai === 'shipping') {
    updates.push('ngay_giao_hang = CURDATE()');
  } else if (trang_thai === 'completed') {
    updates.push('ngay_nhan_hang = NOW()');
  } else if (trang_thai === 'cancelled') {
    if (!ly_do_huy) throw new ApiError(400, 'Vui lòng nhập lý do hủy');

    updates.push('ly_do_huy = ?');
    values.push(ly_do_huy);

    // Restore stock
    const [items] = await pool.query('SELECT ma_sp, so_luong FROM order_items WHERE ma_don_hang = ?', [id]);
    for (const item of items) {
      await pool.query(
        'UPDATE products SET so_luong_ton = so_luong_ton + ? WHERE ma_sp = ?',
        [item.so_luong, item.ma_sp]
      );
    }
  }

  values.push(id);
  await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE ma_don_hang = ?`, values);

  const [orders] = await pool.query('SELECT * FROM orders WHERE ma_don_hang = ?', [id]);
  res.json({ success: true, order: orders[0] });
});

// PATCH /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ly_do_huy } = req.body;

  const [existing] = await pool.query(
    'SELECT * FROM orders WHERE ma_don_hang = ? AND ma_user = ?',
    [id, req.user.ma_user]
  );
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy đơn hàng');

  const order = existing[0];
  if (!['pending', 'confirmed'].includes(order.trang_thai)) {
    throw new ApiError(400, 'Không thể hủy đơn hàng ở trạng thái này');
  }

  // Restore stock
  const [items] = await pool.query('SELECT ma_sp, so_luong FROM order_items WHERE ma_don_hang = ?', [id]);
  for (const item of items) {
    await pool.query(
      'UPDATE products SET so_luong_ton = so_luong_ton + ? WHERE ma_sp = ?',
      [item.so_luong, item.ma_sp]
    );
  }

  await pool.query(
    'UPDATE orders SET trang_thai = ?, ly_do_huy = ? WHERE ma_don_hang = ?',
    ['cancelled', ly_do_huy || 'Khách hàng tự hủy', id]
  );

  res.json({ success: true, message: 'Hủy đơn hàng thành công' });
});

// DELETE /api/orders/:id
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT * FROM orders WHERE ma_don_hang = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy đơn hàng');

  await pool.query('DELETE FROM order_items WHERE ma_don_hang = ?', [id]);
  await pool.query('DELETE FROM orders WHERE ma_don_hang = ?', [id]);

  res.json({ success: true, message: 'Xóa đơn hàng thành công' });
});

module.exports = {
  create,
  getMyOrders,
  getAllOrders,
  getById,
  updateStatus,
  cancelOrder,
  remove,
};
