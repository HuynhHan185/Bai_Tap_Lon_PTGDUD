const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateSlug, generateSKU } = require('../utils/helpers');

// GET /api/products
const getAll = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort = 'created_desc',
    featured,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let where = 'WHERE p.is_deleted = 0 AND p.trang_thai = 1';
  const params = [];

  if (category) {
    where += ' AND c.slug = ?';
    params.push(category);
  }

  if (brand) {
    where += ' AND p.brand = ?';
    params.push(brand);
  }

  if (minPrice) {
    where += ' AND p.don_gia >= ?';
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    where += ' AND p.don_gia <= ?';
    params.push(Number(maxPrice));
  }

  if (search) {
    where += ' AND (p.ten_sp LIKE ? OR p.mo_ta_ngan LIKE ? OR p.sku LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  if (featured === '1' || featured === 'true') {
    where += ' AND p.featured = 1';
  }

  // Sorting
  const sortMap = {
    price_asc: 'p.don_gia ASC',
    price_desc: 'p.don_gia DESC',
    name_asc: 'p.ten_sp ASC',
    name_desc: 'p.ten_sp DESC',
    rating_desc: 'p.rating DESC',
    created_desc: 'p.ngay_tao DESC',
    created_asc: 'p.ngay_tao ASC',
  };
  const orderBy = sortMap[sort] || 'p.ngay_tao DESC';

  // Count total
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN categories c ON p.ma_loai = c.ma_loai
    ${where}
  `;
  const [countRows] = await pool.query(countQuery, params);
  const total = countRows[0].total;

  // Fetch data
  const dataQuery = `
    SELECT p.*, c.ten_loai, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.ma_loai = c.ma_loai
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [products] = await pool.query(dataQuery, [...params, Number(limit), offset]);

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/products/featured
const getFeatured = asyncHandler(async (req, res) => {
  const [products] = await pool.query(
    `SELECT p.*, c.ten_loai
     FROM products p
     LEFT JOIN categories c ON p.ma_loai = c.ma_loai
     WHERE p.is_deleted = 0 AND p.trang_thai = 1 AND p.featured = 1
     ORDER BY p.ngay_tao DESC LIMIT 8`
  );
  res.json({ success: true, products });
});

// GET /api/products/related/:id
const getRelated = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [product] = await pool.query('SELECT ma_loai FROM products WHERE ma_sp = ?', [id]);
  if (!product.length) throw new ApiError(404, 'Không tìm thấy sản phẩm');

  const [products] = await pool.query(
    `SELECT p.*, c.ten_loai
     FROM products p
     LEFT JOIN categories c ON p.ma_loai = c.ma_loai
     WHERE p.ma_loai = ? AND p.ma_sp != ? AND p.is_deleted = 0 AND p.trang_thai = 1
     ORDER BY p.ngay_tao DESC LIMIT 6`,
    [product[0].ma_loai, id]
  );

  res.json({ success: true, products });
});

// GET /api/products/slug/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.ten_loai, c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON p.ma_loai = c.ma_loai
     WHERE p.slug = ? AND p.is_deleted = 0`,
    [req.params.slug]
  );

  if (rows.length === 0) throw new ApiError(404, 'Không tìm thấy sản phẩm');

  const product = rows[0];

  // Get promotion info
  const [promotions] = await pool.query(
    `SELECT km.* FROM promotions km
     JOIN promotion_details pd ON km.ma_km = pd.ma_km
     WHERE (pd.ma_sp = ? OR pd.ma_loai = ?) AND km.trang_thai = 1
       AND km.ngay_bat_dau <= CURDATE() AND km.ngay_ket_thuc >= CURDATE()
     LIMIT 1`,
    [product.ma_sp, product.ma_loai]
  );

  product.promotion = promotions[0] || null;

  // Get active promotion price
  if (product.promotion) {
    if (product.promotion.loai_giam_gia === 'percent') {
      const discount = (product.don_gia * product.promotion.gia_tri_giam) / 100;
      product.gia_khuyen_mai = Math.max(product.don_gia - discount, 0);
    } else {
      product.gia_khuyen_mai = Math.max(product.don_gia - product.promotion.gia_tri_giam, 0);
    }
  }

  res.json({ success: true, product });
});

// GET /api/products/admin/all
const getAllAdmin = asyncHandler(async (req, res) => {
  const [products] = await pool.query(
    `SELECT p.*, c.ten_loai
     FROM products p
     LEFT JOIN categories c ON p.ma_loai = c.ma_loai
     WHERE p.is_deleted = 0
     ORDER BY p.ngay_tao DESC`
  );
  res.json({ success: true, products });
});

// POST /api/products
const create = asyncHandler(async (req, res) => {
  const {
    ten_sp, brand, ma_loai, mo_ta_ngan, mo_ta, don_gia, gia_goc,
    so_luong_ton, so_luong_toi_thieu, han_su_dung, hinh_anh,
    hinh_anh_list, thong_so, featured,
  } = req.body;

  if (!ten_sp || !don_gia) {
    throw new ApiError(400, 'Tên sản phẩm và giá là bắt buộc');
  }

  const slug = generateSlug(ten_sp);
  const sku = generateSKU(brand, ma_loai || 1);

  // Check slug unique
  const [existing] = await pool.query('SELECT ma_sp FROM products WHERE slug = ?', [slug]);
  if (existing.length > 0) throw new ApiError(400, 'Sản phẩm đã tồn tại');

  const [result] = await pool.query(
    `INSERT INTO products (slug, sku, ten_sp, brand, ma_loai, mo_ta_ngan, mo_ta, don_gia, gia_goc,
      hinh_anh, hinh_anh_list, thong_so, so_luong_ton, so_luong_toi_thieu, han_su_dung, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug, sku, ten_sp, brand || null, ma_loai || null, mo_ta_ngan || null, mo_ta || null,
      don_gia, gia_goc || null, hinh_anh || null,
      hinh_anh_list ? JSON.stringify(hinh_anh_list) : null,
      thong_so ? JSON.stringify(thong_so) : null,
      so_luong_ton || 0, so_luong_toi_thieu || 10,
      han_su_dung || null, featured ? 1 : 0,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM products WHERE ma_sp = ?', [result.insertId]);
  res.status(201).json({ success: true, product: rows[0] });
});

// PUT /api/products/:id
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const [existing] = await pool.query('SELECT * FROM products WHERE ma_sp = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy sản phẩm');

  const allowed = [
    'ten_sp', 'brand', 'ma_loai', 'mo_ta_ngan', 'mo_ta', 'don_gia', 'gia_goc',
    'hinh_anh', 'hinh_anh_list', 'thong_so', 'so_luong_ton', 'so_luong_toi_thieu',
    'han_su_dung', 'featured', 'trang_thai',
  ];

  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      if (key === 'hinh_anh_list' || key === 'thong_so') {
        values.push(typeof fields[key] === 'string' ? fields[key] : JSON.stringify(fields[key]));
      } else if (key === 'featured' || key === 'trang_thai') {
        values.push(fields[key] ? 1 : 0);
      } else {
        values.push(fields[key]);
      }
    }
  }

  if (updates.length === 0) throw new ApiError(400, 'Không có trường nào được cập nhật');

  values.push(id);
  await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE ma_sp = ?`, values);

  const [rows] = await pool.query('SELECT * FROM products WHERE ma_sp = ?', [id]);
  res.json({ success: true, product: rows[0] });
});

// DELETE /api/products/:id
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT * FROM products WHERE ma_sp = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Không tìm thấy sản phẩm');

  await pool.query('UPDATE products SET is_deleted = 1 WHERE ma_sp = ?', [id]);

  res.json({ success: true, message: 'Xóa sản phẩm thành công' });
});

// POST /api/products/upload-image
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Vui lòng chọn file ảnh');

  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

module.exports = {
  getAll,
  getFeatured,
  getRelated,
  getBySlug,
  getAllAdmin,
  create,
  update,
  remove,
  uploadImage,
};
