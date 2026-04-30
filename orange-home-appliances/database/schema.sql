-- =====================================================
-- DATABASE: CamVang
-- Mô tả: Hệ thống E-commerce CamVang Home Appliances
-- Phiên bản: 1.0
-- =====================================================

-- Xóa database nếu tồn tại
DROP DATABASE IF EXISTS CamVang;

-- Tạo database
CREATE DATABASE CamVang
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE CamVang;

-- =====================================================
-- BẢNG 1: PHÂN QUYỀN
-- =====================================================
CREATE TABLE roles (
    ma_role INT PRIMARY KEY AUTO_INCREMENT,
    ten_role VARCHAR(50) NOT NULL UNIQUE,
    mo_ta VARCHAR(255),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG 2: NGƯỜI DÙNG
-- =====================================================
CREATE TABLE users (
    ma_user INT PRIMARY KEY AUTO_INCREMENT,
    ho VARCHAR(100) NOT NULL,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20),
    dia_chi VARCHAR(500),
    gioi_tinh TINYINT(1),
    ngay_sinh DATE,
    hinh_anh VARCHAR(500),
    ma_role INT NOT NULL DEFAULT 2,
    diem_tich_luy INT DEFAULT 0,
    trang_thai TINYINT(1) DEFAULT 1,
    lan_dang_nhap_cuoi DATETIME,
    so_lan_dang_nhap_sai INT DEFAULT 0,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (ma_role) REFERENCES roles(ma_role) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(ma_role);

-- =====================================================
-- BẢNG 3: DANH MỤC SẢN PHẨM
-- =====================================================
CREATE TABLE categories (
    ma_loai INT PRIMARY KEY AUTO_INCREMENT,
    ten_loai VARCHAR(200) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    mo_ta VARCHAR(500),
    hinh_anh VARCHAR(500),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================================================
-- BẢNG 4: NHÀ CUNG CẤP
-- =====================================================
CREATE TABLE suppliers (
    ma_ncc INT PRIMARY KEY AUTO_INCREMENT,
    ten_ncc VARCHAR(300) NOT NULL,
    dia_chi VARCHAR(500),
    so_dien_thoai VARCHAR(20),
    email VARCHAR(255),
    nguoi_lien_he VARCHAR(200),
    mo_ta VARCHAR(500),
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG 5: SẢN PHẨM
-- =====================================================
CREATE TABLE products (
    ma_sp INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    ten_sp VARCHAR(500) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    brand VARCHAR(100),
    ma_loai INT,
    mo_ta_ngan VARCHAR(500),
    mo_ta TEXT,
    don_gia DECIMAL(12,0) NOT NULL,
    gia_goc DECIMAL(12,0),
    hinh_anh VARCHAR(500),
    hinh_anh_list JSON,
    thong_so JSON,
    so_luong_ton INT DEFAULT 0,
    so_luong_toi_thieu INT DEFAULT 10,
    han_su_dung DATE,
    ma_vach VARCHAR(50),
    featured TINYINT(1) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    nguoi_tao VARCHAR(100),
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (ma_loai) REFERENCES categories(ma_loai) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_ma_loai ON products(ma_loai);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_don_gia ON products(don_gia);

-- =====================================================
-- BẢNG 6: NHÀ CUNG CẤP - SẢN PHẨM
-- =====================================================
CREATE TABLE supplier_products (
    ma_ncsp INT PRIMARY KEY AUTO_INCREMENT,
    ma_ncc INT NOT NULL,
    ma_sp INT NOT NULL,
    gia_nhap DECIMAL(12,0),
    thoi_gian_giao_hang INT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ncc_sp (ma_ncc, ma_sp),
    FOREIGN KEY (ma_ncc) REFERENCES suppliers(ma_ncc) ON DELETE CASCADE,
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG 7: KHUYẾN MÃI
-- =====================================================
CREATE TABLE promotions (
    ma_km INT PRIMARY KEY AUTO_INCREMENT,
    ten_km VARCHAR(300) NOT NULL,
    mo_ta VARCHAR(1000),
    loai_giam_gia VARCHAR(20),
    gia_tri_giam DECIMAL(12,0),
    gia_tri_giam_toi_da DECIMAL(12,0),
    so_luong_ma INT,
    so_luong_da_su_dung INT DEFAULT 0,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

CREATE INDEX idx_promotions_ngay_bat_dau ON promotions(ngay_bat_dau);
CREATE INDEX idx_promotions_ngay_ket_thuc ON promotions(ngay_ket_thuc);

-- =====================================================
-- BẢNG 8: CHI TIẾT KHUYẾN MÃI
-- =====================================================
CREATE TABLE promotion_details (
    ma_ctkm INT PRIMARY KEY AUTO_INCREMENT,
    ma_km INT NOT NULL,
    ma_sp INT,
    ma_loai INT,
    gia_tri_giam_ap_dung DECIMAL(12,0),
    UNIQUE KEY uq_km_sp (ma_km, ma_sp),
    UNIQUE KEY uq_km_loai (ma_km, ma_loai),
    FOREIGN KEY (ma_km) REFERENCES promotions(ma_km) ON DELETE CASCADE,
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE CASCADE,
    FOREIGN KEY (ma_loai) REFERENCES categories(ma_loai) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG 9: MÃ KHUYẾN MÃI (COUPON)
-- =====================================================
CREATE TABLE promotion_codes (
    ma_code INT PRIMARY KEY AUTO_INCREMENT,
    ma_km INT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    ma_user INT,
    gia_tri_giam DECIMAL(12,0),
    gia_tri_don_toi_thieu DECIMAL(12,0),
    so_lan_su_dung INT DEFAULT 1,
    so_lan_da_su_dung INT DEFAULT 0,
    ngay_het_han DATE,
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_km) REFERENCES promotions(ma_km) ON DELETE CASCADE,
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_promotion_codes_code ON promotion_codes(code);

-- =====================================================
-- BẢNG 10: ĐƠN HÀNG
-- =====================================================
CREATE TABLE orders (
    ma_don_hang VARCHAR(50) PRIMARY KEY,
    ma_user INT,
    ho_ten VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    dia_chi VARCHAR(500) NOT NULL,
    ghi_chu VARCHAR(500),
    tong_tien DECIMAL(12,0) DEFAULT 0,
    phi_van_chuyen DECIMAL(12,0) DEFAULT 0,
    giam_gia DECIMAL(12,0) DEFAULT 0,
    ma_code INT,
    thanh_tien DECIMAL(12,0) DEFAULT 0,
    phuong_thuc_thanh_toan ENUM('cod', 'bank', 'momo') DEFAULT 'cod',
    trang_thai_thanh_toan TINYINT(1) DEFAULT 0,
    trang_thai ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    ly_do_huy VARCHAR(500),
    ngay_xac_nhan DATETIME,
    ngay_giao_hang DATE,
    ngay_nhan_hang DATE,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE SET NULL,
    FOREIGN KEY (ma_code) REFERENCES promotion_codes(ma_code) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_orders_ma_user ON orders(ma_user);
CREATE INDEX idx_orders_trang_thai ON orders(trang_thai);
CREATE INDEX idx_orders_ngay_tao ON orders(ngay_tao);

-- =====================================================
-- BẢNG 11: CHI TIẾT ĐƠN HÀNG
-- =====================================================
CREATE TABLE order_items (
    ma_ctdh INT PRIMARY KEY AUTO_INCREMENT,
    ma_don_hang VARCHAR(50) NOT NULL,
    ma_sp INT NOT NULL,
    ten_sp VARCHAR(500) NOT NULL,
    sku VARCHAR(100),
    brand VARCHAR(100),
    hinh_anh VARCHAR(500),
    don_gia DECIMAL(12,0) NOT NULL,
    gia_goc DECIMAL(12,0),
    so_luong INT NOT NULL DEFAULT 1,
    giam_gia DECIMAL(12,0) DEFAULT 0,
    thanh_tien DECIMAL(12,0) NOT NULL,
    FOREIGN KEY (ma_don_hang) REFERENCES orders(ma_don_hang) ON DELETE CASCADE,
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_ma_don_hang ON order_items(ma_don_hang);
CREATE INDEX idx_order_items_ma_sp ON order_items(ma_sp);

-- =====================================================
-- BẢNG 12: LIÊN HỆ
-- =====================================================
CREATE TABLE contacts (
    ma_lh INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20),
    chu_de VARCHAR(255),
    noi_dung TEXT NOT NULL,
    trang_thai TINYINT(1) DEFAULT 0,
    tra_loi TEXT,
    ngay_tra_loi DATETIME,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_contacts_trang_thai ON contacts(trang_thai);
CREATE INDEX idx_contacts_ngay_tao ON contacts(ngay_tao);

-- =====================================================
-- BẢNG 13: BANNER QUẢNG CÁO
-- =====================================================
CREATE TABLE banners (
    ma_banner INT PRIMARY KEY AUTO_INCREMENT,
    tieu_de VARCHAR(255) NOT NULL,
    hinh_anh VARCHAR(500) NOT NULL,
    href VARCHAR(500),
    vi_tri_hien_thi VARCHAR(50),
    thu_tu INT DEFAULT 0,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_banners_trang_thai ON banners(trang_thai);
CREATE INDEX idx_banners_vi_tri ON banners(vi_tri_hien_thi);

-- =====================================================
-- BẢNG 14: ĐÁNH GIÁ SẢN PHẨM
-- =====================================================
CREATE TABLE reviews (
    ma_danh_gia INT PRIMARY KEY AUTO_INCREMENT,
    ma_sp INT NOT NULL,
    ma_user INT NOT NULL,
    diem_so INT NOT NULL,
    tieu_de VARCHAR(255),
    noi_dung TEXT,
    hinh_anh JSON,
    trang_thai TINYINT(1) DEFAULT 1,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE CASCADE,
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE CASCADE,
    UNIQUE KEY uq_user_sp (ma_user, ma_sp)
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG 15: LỊCH SỬ ĐIỂM TÍCH LŨY
-- =====================================================
CREATE TABLE point_history (
    ma_lich_su INT PRIMARY KEY AUTO_INCREMENT,
    ma_user INT NOT NULL,
    ma_don_hang VARCHAR(50),
    loai_giao_dich ENUM('CongDiem', 'TruDiem') NOT NULL,
    so_diem INT NOT NULL,
    diem_truoc INT,
    diem_sau INT,
    mo_ta VARCHAR(500),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE CASCADE,
    FOREIGN KEY (ma_don_hang) REFERENCES orders(ma_don_hang) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_point_history_ma_user ON point_history(ma_user);

-- =====================================================
-- BẢNG 16: SẢN PHẨM YÊU THÍCH
-- =====================================================
CREATE TABLE favorites (
    ma_yeu_thich INT PRIMARY KEY AUTO_INCREMENT,
    ma_user INT NOT NULL,
    ma_sp INT NOT NULL,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_sp (ma_user, ma_sp),
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE CASCADE,
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG 17: NHẬT KÝ HỆ THỐNG
-- =====================================================
CREATE TABLE system_logs (
    ma_log INT PRIMARY KEY AUTO_INCREMENT,
    bang_tac_dong VARCHAR(100),
    hanh_dong VARCHAR(50),
    ma_ban_ghi INT,
    du_lieu_cu TEXT,
    du_lieu_moi TEXT,
    nguoi_thuc_hien VARCHAR(100),
    dia_chi_ip VARCHAR(50),
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- VIEWS TIỆN ÍCH
-- =====================================================

-- View: Sản phẩm với khuyến mãi
CREATE OR REPLACE VIEW v_products_promotion AS
SELECT sp.*, c.ten_loai, km.ten_km, km.gia_tri_giam, km.loai_giam_gia,
    CASE 
        WHEN km.loai_giam_gia = 'PhanTram' THEN sp.don_gia * (1 - km.gia_tri_giam/100)
        WHEN km.loai_giam_gia = 'SoTien' THEN sp.don_gia - km.gia_tri_giam
        ELSE sp.don_gia
    END AS gia_sau_giam
FROM products sp
LEFT JOIN categories c ON sp.ma_loai = c.ma_loai
LEFT JOIN promotion_details pd ON sp.ma_sp = pd.ma_sp
LEFT JOIN promotions km ON pd.ma_km = km.ma_km 
    AND km.trang_thai = 1 
    AND km.ngay_bat_dau <= CURDATE() 
    AND km.ngay_ket_thuc >= CURDATE()
WHERE sp.is_deleted = 0;

-- View: Đơn hàng chi tiết
CREATE OR REPLACE VIEW v_orders_detail AS
SELECT dh.*, u.ho, u.ten, u.email AS user_email,
    COUNT(dhct.ma_sp) AS so_san_pham,
    SUM(dhct.so_luong) AS tong_so_luong
FROM orders dh
LEFT JOIN users u ON dh.ma_user = u.ma_user
LEFT JOIN order_items dhct ON dh.ma_don_hang = dhct.ma_don_hang
GROUP BY dh.ma_don_hang;

-- View: Top sản phẩm bán chạy
CREATE OR REPLACE VIEW v_products_ban_chay AS
SELECT sp.ma_sp, sp.ten_sp, sp.don_gia, sp.hinh_anh, c.ten_loai,
    COALESCE(SUM(ctdh.so_luong), 0) AS tong_ban,
    COALESCE(SUM(ctdh.thanh_tien), 0) AS doanh_thu
FROM products sp
LEFT JOIN order_items ctdh ON sp.ma_sp = ctdh.ma_sp
LEFT JOIN orders dh ON ctdh.ma_don_hang = dh.ma_don_hang AND dh.trang_thai != 'cancelled'
LEFT JOIN categories c ON sp.ma_loai = c.ma_loai
WHERE sp.is_deleted = 0
GROUP BY sp.ma_sp
ORDER BY tong_ban DESC
LIMIT 20;

-- =====================================================
-- THÔNG BÁO HOÀN THÀNH
-- =====================================================
SELECT 'Database CamVang - Schema đã được tạo thành công!' AS ThongBao;
