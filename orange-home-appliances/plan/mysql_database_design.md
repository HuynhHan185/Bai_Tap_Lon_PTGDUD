# MySQL Database Design cho CamVang E-commerce

## 1. Tổng quan cấu trúc

Dựa trên `mock/db.json` và file tham khảo, hệ thống gồm **17 bảng** chính:

| # | Tên bảng | Mô tả |
|---|----------|--------|
| 1 | `roles` | Phân quyền (QuanLy, KhachHang) |
| 2 | `users` | Người dùng (gộp Nhân viên + Khách hàng) |
| 3 | `categories` | Danh mục sản phẩm |
| 4 | `suppliers` | Nhà cung cấp |
| 5 | `products` | Sản phẩm |
| 6 | `supplier_products` | Liên kết NCC - Sản phẩm |
| 7 | `promotions` | Khuyến mãi |
| 8 | `promotion_details` | Chi tiết KM theo sản phẩm/loại |
| 9 | `promotion_codes` | Mã coupon |
| 10 | `orders` | Đơn hàng |
| 11 | `order_items` | Chi tiết đơn hàng |
| 12 | `contacts` | Liên hệ |
| 13 | `banners` | Banner quảng cáo |
| 14 | `reviews` | Đánh giá sản phẩm |
| 15 | `point_history` | Lịch sử điểm tích lũy |
| 16 | `favorites` | Sản phẩm yêu thích |
| 17 | `system_logs` | Nhật ký hệ thống |

---

## 2. Chi tiết từng bảng

### 2.1 Bảng `roles` - Phân quyền

```sql
CREATE TABLE roles (
    ma_role INT PRIMARY KEY AUTO_INCREMENT,
    ten_role VARCHAR(50) NOT NULL UNIQUE,
    mo_ta VARCHAR(255),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO roles (ten_role, mo_ta) VALUES
('QuanLy', 'Quản lý - Toàn quyền quản trị hệ thống'),
('KhachHang', 'Khách hàng - Mua hàng và xem thông tin cá nhân');
```

### 2.2 Bảng `users` - Người dùng

```sql
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
    FOREIGN KEY (ma_role) REFERENCES roles(ma_role) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role (ma_role)
) ENGINE=InnoDB;
```

### 2.3 Bảng `categories` - Danh mục

```sql
CREATE TABLE categories (
    ma_loai INT PRIMARY KEY AUTO_INCREMENT,
    ten_loai VARCHAR(200) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    mo_ta VARCHAR(500),
    hinh_anh VARCHAR(500),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    INDEX idx_slug (slug)
) ENGINE=InnoDB;
```

### 2.4 Bảng `suppliers` - Nhà cung cấp

```sql
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
```

### 2.5 Bảng `products` - Sản phẩm

```sql
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
    FOREIGN KEY (ma_loai) REFERENCES categories(ma_loai) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_ma_loai (ma_loai),
    INDEX idx_featured (featured),
    INDEX idx_don_gia (don_gia)
) ENGINE=InnoDB;
```

### 2.6 Bảng `supplier_products` - NCC - Sản phẩm

```sql
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
```

### 2.7 Bảng `promotions` - Khuyến mãi

```sql
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
    is_deleted TINYINT(1) DEFAULT 0,
    INDEX idx_ngay_bat_dau (ngay_bat_dau),
    INDEX idx_ngay_ket_thuc (ngay_ket_thuc)
) ENGINE=InnoDB;
```

### 2.8 Bảng `promotion_details` - Chi tiết KM

```sql
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
```

### 2.9 Bảng `promotion_codes` - Mã Coupon

```sql
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
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE SET NULL,
    INDEX idx_code (code)
) ENGINE=InnoDB;
```

### 2.10 Bảng `orders` - Đơn hàng

```sql
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
    FOREIGN KEY (ma_code) REFERENCES promotion_codes(ma_code) ON DELETE SET NULL,
    INDEX idx_ma_user (ma_user),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB;
```

### 2.11 Bảng `order_items` - Chi tiết đơn hàng

```sql
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
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE RESTRICT,
    INDEX idx_ma_don_hang (ma_don_hang),
    INDEX idx_ma_sp (ma_sp)
) ENGINE=InnoDB;
```

### 2.12 Bảng `contacts` - Liên hệ

```sql
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
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB;
```

### 2.13 Bảng `banners` - Banner

```sql
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
    ngay_cap_nhat DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_vi_tri (vi_tri_hien_thi)
) ENGINE=InnoDB;
```

### 2.14 Bảng `reviews` - Đánh giá

```sql
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
```

### 2.15 Bảng `point_history` - Điểm tích lũy

```sql
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
    FOREIGN KEY (ma_don_hang) REFERENCES orders(ma_don_hang) ON DELETE SET NULL,
    INDEX idx_ma_user (ma_user)
) ENGINE=InnoDB;
```

### 2.16 Bảng `favorites` - Yêu thích

```sql
CREATE TABLE favorites (
    ma_yeu_thich INT PRIMARY KEY AUTO_INCREMENT,
    ma_user INT NOT NULL,
    ma_sp INT NOT NULL,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_sp (ma_user, ma_sp),
    FOREIGN KEY (ma_user) REFERENCES users(ma_user) ON DELETE CASCADE,
    FOREIGN KEY (ma_sp) REFERENCES products(ma_sp) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### 2.17 Bảng `system_logs` - Nhật ký

```sql
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
```

---

## 3. Views tiện ích

```sql
-- Sản phẩm với khuyến mãi
CREATE VIEW v_products_promotion AS
SELECT sp.*, c.ten_loai, km.ten_km, km.gia_tri_giam, km.loai_giam_gia
FROM products sp
LEFT JOIN categories c ON sp.ma_loai = c.ma_loai
LEFT JOIN promotion_details pd ON sp.ma_sp = pd.ma_sp
LEFT JOIN promotions km ON pd.ma_km = km.ma_km 
    AND km.trang_thai = 1 
    AND km.ngay_bat_dau <= CURDATE() 
    AND km.ngay_ket_thuc >= CURDATE()
WHERE sp.is_deleted = 0;

-- Đơn hàng chi tiết
CREATE VIEW v_orders_detail AS
SELECT dh.*, u.ho, u.ten, u.email,
    COUNT(dhct.ma_sp) AS so_san_pham,
    SUM(dhct.so_luong) AS tong_so_luong
FROM orders dh
LEFT JOIN users u ON dh.ma_user = u.ma_user
LEFT JOIN order_items dhct ON dh.ma_don_hang = dhct.ma_don_hang
GROUP BY dh.ma_don_hang;

-- Top sản phẩm bán chạy
CREATE VIEW v_products_ban_chay AS
SELECT sp.ma_sp, sp.ten_sp, sp.don_gia, c.ten_loai,
    SUM(ctdh.so_luong) AS tong_ban,
    SUM(ctdh.thanh_tien) AS doanh_thu
FROM products sp
INNER JOIN order_items ctdh ON sp.ma_sp = ctdh.ma_sp
INNER JOIN orders dh ON ctdh.ma_don_hang = dh.ma_don_hang
LEFT JOIN categories c ON sp.ma_loai = c.ma_loai
WHERE dh.trang_thai != 'cancelled'
GROUP BY sp.ma_sp
ORDER BY tong_ban DESC
LIMIT 20;
```

---

## 4. Stored Procedures

```sql
DELIMITER //

-- Tạo mã đơn hàng tự động (DH00000001)
CREATE PROCEDURE sp_TaoMaDonHang(OUT ma_don_new VARCHAR(50))
BEGIN
    DECLARE maxNum INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(ma_don_hang, 3) AS UNSIGNED)), 0) INTO maxNum FROM orders;
    SET ma_don_new = CONCAT('DH', LPAD(maxNum + 1, 8, '0'));
END //

-- Cập nhật tồn kho khi đặt hàng
CREATE PROCEDURE sp_CapNhatTonKho_DatHang(IN p_ma_sp INT, IN p_so_luong INT)
BEGIN
    UPDATE products SET so_luong_ton = so_luong_ton - p_so_luong
    WHERE ma_sp = p_ma_sp AND so_luong_ton >= p_so_luong;
END //

-- Tích điểm (1 điểm = 10,000đ)
CREATE PROCEDURE sp_TichDiem(IN p_ma_user INT, IN p_ma_don_hang VARCHAR(50), IN p_tong_tien DECIMAL(12,0))
BEGIN
    DECLARE diem_cong INT;
    DECLARE diem_hien_tai INT;
    SET diem_cong = FLOOR(p_tong_tien / 10000);
    SELECT diem_tich_luy INTO diem_hien_tai FROM users WHERE ma_user = p_ma_user;
    INSERT INTO point_history (ma_user, ma_don_hang, loai_giao_dich, so_diem, diem_truoc, diem_sau, mo_ta)
    VALUES (p_ma_user, p_ma_don_hang, 'CongDiem', diem_cong, diem_hien_tai, diem_hien_tai + diem_cong, CONCAT('Tích điểm từ đơn hàng ', p_ma_don_hang));
    UPDATE users SET diem_tich_luy = diem_tich_luy + diem_cong WHERE ma_user = p_ma_user;
END //

-- Kiểm tra mã khuyến mãi
CREATE PROCEDURE sp_KiemTraMaKhuyenMai(IN p_code VARCHAR(50), IN p_ma_user INT, IN p_tong_tien DECIMAL(12,0), OUT p_gia_tri_giam DECIMAL(12,0), OUT p_message VARCHAR(255))
BEGIN
    DECLARE v_code, v_ma_km, v_gia_tri, v_don_toi_thieu, v_da_su_dung, v_con_su_dung INT;
    DECLARE v_het_han DATE;
    SELECT ma_code, ma_km, gia_tri_giam, gia_tri_don_toi_thieu, so_lan_su_dung, so_lan_da_su_dung, ngay_het_han
    INTO v_code, v_ma_km, v_gia_tri, v_don_toi_thieu, v_con_su_dung, v_da_su_dung, v_het_han
    FROM promotion_codes WHERE code = p_code AND trang_thai = 1;
    IF v_code IS NULL THEN SET p_message = 'Mã khuyến mãi không hợp lệ'; SET p_gia_tri_giam = 0;
    ELSEIF v_het_han < CURDATE() THEN SET p_message = 'Mã khuyến mãi đã hết hạn'; SET p_gia_tri_giam = 0;
    ELSEIF v_da_su_dung >= v_con_su_dung THEN SET p_message = 'Mã khuyến mãi đã hết lượt sử dụng'; SET p_gia_tri_giam = 0;
    ELSEIF p_tong_tien < v_don_toi_thieu THEN SET p_message = CONCAT('Đơn hàng tối thiểu ', FORMAT(v_don_toi_thieu, 0), 'đ'); SET p_gia_tri_giam = 0;
    ELSE SET p_gia_tri_giam = v_gia_tri; SET p_message = 'Áp dụng thành công';
    END IF;
END //

DELIMITER ;
```

---

## 5. Triggers

```sql
DELIMITER //

-- Tự động tạo mã đơn hàng
CREATE TRIGGER trg_orders_before_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE newMaDH VARCHAR(50);
    IF NEW.ma_don_hang IS NULL OR NEW.ma_don_hang = '' THEN
        CALL sp_TaoMaDonHang(newMaDH);
        SET NEW.ma_don_hang = newMaDH;
    END IF;
    SET NEW.ngay_tao = COALESCE(NEW.ngay_tao, NOW());
END //

-- Cập nhật rating khi có đánh giá mới
CREATE TRIGGER trg_reviews_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(2,1);
    DECLARE review_cnt INT;
    SELECT AVG(diem_so), COUNT(*) INTO avg_rating, review_cnt
    FROM reviews WHERE ma_sp = NEW.ma_sp AND trang_thai = 1;
    UPDATE products SET rating = COALESCE(avg_rating, 0), review_count = review_cnt WHERE ma_sp = NEW.ma_sp;
END //

DELIMITER ;
```

---

## 6. Seed Data mẫu

```sql
-- Roles
INSERT INTO roles (ten_role, mo_ta) VALUES
('QuanLy', 'Quản lý - Toàn quyền quản trị'),
('KhachHang', 'Khách hàng - Mua hàng');

-- Users (Password hash: bcrypt('admin123'))
INSERT INTO users (ho, ten, email, mat_khau, so_dien_thoai, dia_chi, ma_role) VALUES
('Admin', 'CamVang', 'admin@camvang.com', '$2a$10$...', NULL, NULL, 1),
('Đặng Trần', 'Dương', 'duong@example.com', '$2a$10$...', '0862349489', '68 Nguyễn Tư giản', 2);

-- Categories
INSERT INTO categories (ten_loai, slug, mo_ta) VALUES
('Nồi cơm điện', 'noi-com-dien', 'Các loại nồi cơm điện'),
('Nồi chiên không dầu', 'noi-chien-khong-dau', 'Nồi chiên không dầu'),
('Quạt điện', 'quat-dien', 'Quạt điện các loại');

-- Products
INSERT INTO products (slug, ten_sp, sku, brand, ma_loai, don_gia, gia_goc, so_luong_ton, featured, rating, review_count) VALUES
('noi-com-dien-sharp-ks-nr191stv', 'Nồi cơm điện Sharp KS-NR191STV 1.8L', 'GD-RC-SHARP-001', 'Sharp', 1, 1610000, 1690000, 24, 1, 4.8, 125),
('noi-chien-khong-dau-philips-na130', 'Nồi chiên không dầu Philips NA130/00 6.2L', 'GD-AF-PHI-001', 'Philips', 2, 1490000, 1890000, 16, 1, 4.7, 98),
('quat-dung-asia-vy639990', 'Quạt đứng Asia VY639990 80W', 'GD-FN-ASIA-001', 'Asia', 3, 789000, 890000, 22, 1, 4.6, 76);

-- Banners
INSERT INTO banners (tieu_de, hinh_anh, href, thu_tu) VALUES
('Mùa nóng sale quạt điện', 'https://via.placeholder.com/1440x520?text=Banner+Quat', '/danh-muc/quat-dien', 1);
```

---

## 7. Files cần tạo

| File | Mô tả |
|------|--------|
| `database/schema.sql` | Tạo database + 17 bảng + indexes |
| `database/procedures.sql` | Stored procedures + triggers |
| `database/seed.sql` | Dữ liệu mẫu |
| `backend/package.json` | Dependencies (express, mysql2, bcrypt, jsonwebtoken) |
| `backend/src/config/db.js` | MySQL connection pool |
| `backend/src/index.js` | Express server entry point |
| `backend/src/routes/*.js` | API routes |
| `backend/src/middleware/auth.js` | JWT authentication |

---

## 8. Phân quyền

| Vai trò | Ma_role | Quyền hạn |
|---------|---------|------------|
| QuanLy | 1 | Truy cập /admin, CRUD toàn bộ |
| KhachHang | 2 | Mua hàng, xem đơn, tích điểm |
