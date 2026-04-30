const generateOrderCode = async (pool) => {
  const [rows] = await pool.query(
    'SELECT COALESCE(MAX(CAST(SUBSTRING(ma_don_hang, 3) AS UNSIGNED)), 0) as maxNum FROM orders'
  );
  const nextNum = Number(rows[0].maxNum) + 1;
  return `DH${String(nextNum).padStart(8, '0')}`;
};

const generateCouponCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const generateSKU = (brand, categoryId) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `CV-${brand?.substring(0, 3).toUpperCase() || 'GEN'}-${String(categoryId).padStart(3, '0')}-${timestamp}`;
};

module.exports = { generateOrderCode, generateCouponCode, generateSlug, generateSKU };
