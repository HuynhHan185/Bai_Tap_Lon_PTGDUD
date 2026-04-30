-- =====================================================
-- STORED PROCEDURES: CamVang
-- =====================================================

USE CamVang;

-- =====================================================
-- STORED PROCEDURE: Tạo mã đơn hàng tự động
-- =====================================================
DELIMITER //

DROP PROCEDURE IF EXISTS sp_TaoMaDonHang//
CREATE PROCEDURE sp_TaoMaDonHang(OUT ma_don_new VARCHAR(50))
BEGIN
    DECLARE maxNum INT;
    DECLARE newNum VARCHAR(10);
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(ma_don_hang, 3) AS UNSIGNED)), 0) INTO maxNum
    FROM orders;
    
    SET newNum = LPAD(maxNum + 1, 8, '0');
    SET ma_don_new = CONCAT('DH', newNum);
END//

-- =====================================================
-- STORED PROCEDURE: Cập nhật tồn kho khi đặt hàng
-- =====================================================
DROP PROCEDURE IF EXISTS sp_CapNhatTonKho_DatHang//
CREATE PROCEDURE sp_CapNhatTonKho_DatHang(
    IN p_ma_sp INT,
    IN p_so_luong INT
)
BEGIN
    UPDATE products 
    SET so_luong_ton = so_luong_ton - p_so_luong
    WHERE ma_sp = p_ma_sp 
    AND so_luong_ton >= p_so_luong;
END//

-- =====================================================
-- STORED PROCEDURE: Cập nhật tồn kho khi nhập hàng
-- =====================================================
DROP PROCEDURE IF EXISTS sp_CapNhatTonKho_NhapHang//
CREATE PROCEDURE sp_CapNhatTonKho_NhapHang(
    IN p_ma_sp INT,
    IN p_so_luong_nhap INT
)
BEGIN
    UPDATE products 
    SET so_luong_ton = so_luong_ton + p_so_luong_nhap
    WHERE ma_sp = p_ma_sp;
END//

-- =====================================================
-- STORED PROCEDURE: Tích điểm khách hàng (1 điểm = 10,000đ)
-- =====================================================
DROP PROCEDURE IF EXISTS sp_TichDiem//
CREATE PROCEDURE sp_TichDiem(
    IN p_ma_user INT,
    IN p_ma_don_hang VARCHAR(50),
    IN p_tong_tien DECIMAL(12,0)
)
BEGIN
    DECLARE diem_cong INT;
    DECLARE diem_hien_tai INT;
    
    SET diem_cong = FLOOR(p_tong_tien / 10000);
    
    SELECT diem_tich_luy INTO diem_hien_tai FROM users WHERE ma_user = p_ma_user;
    
    INSERT INTO point_history (ma_user, ma_don_hang, loai_giao_dich, so_diem, diem_truoc, diem_sau, mo_ta)
    VALUES (p_ma_user, p_ma_don_hang, 'CongDiem', diem_cong, diem_hien_tai, diem_hien_tai + diem_cong, 
            CONCAT('Tích điểm từ đơn hàng ', p_ma_don_hang));
    
    UPDATE users SET diem_tich_luy = diem_tich_luy + diem_cong WHERE ma_user = p_ma_user;
END//

-- =====================================================
-- STORED PROCEDURE: Kiểm tra và áp dụng mã khuyến mãi
-- =====================================================
DROP PROCEDURE IF EXISTS sp_KiemTraMaKhuyenMai//
CREATE PROCEDURE sp_KiemTraMaKhuyenMai(
    IN p_code VARCHAR(50),
    IN p_ma_user INT,
    IN p_tong_tien DECIMAL(12,0),
    OUT p_gia_tri_giam DECIMAL(12,0),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_ma_code INT;
    DECLARE v_ma_km INT;
    DECLARE v_gia_tri DECIMAL(12,0);
    DECLARE v_don_toi_thieu DECIMAL(12,0);
    DECLARE v_da_su_dung INT;
    DECLARE v_con_su_dung INT;
    DECLARE v_het_han DATE;
    DECLARE v_ma_user_kh INT;
    
    SELECT ma_code, ma_km, gia_tri_giam, gia_tri_don_toi_thieu, so_lan_su_dung, so_lan_da_su_dung, ngay_het_han, ma_user
    INTO v_ma_code, v_ma_km, v_gia_tri, v_don_toi_thieu, v_con_su_dung, v_da_su_dung, v_het_han, v_ma_user_kh
    FROM promotion_codes
    WHERE code = p_code AND trang_thai = 1;
    
    IF v_ma_code IS NULL THEN
        SET p_message = 'Mã khuyến mãi không hợp lệ';
        SET p_gia_tri_giam = 0;
    ELSEIF v_het_han < CURDATE() THEN
        SET p_message = 'Mã khuyến mãi đã hết hạn';
        SET p_gia_tri_giam = 0;
    ELSEIF v_da_su_dung >= v_con_su_dung THEN
        SET p_message = 'Mã khuyến mãi đã hết lượt sử dụng';
        SET p_gia_tri_giam = 0;
    ELSEIF v_ma_user_kh IS NOT NULL AND v_ma_user_kh != p_ma_user THEN
        SET p_message = 'Mã khuyến mãi không dành cho bạn';
        SET p_gia_tri_giam = 0;
    ELSEIF p_tong_tien < v_don_toi_thieu THEN
        SET p_message = CONCAT('Đơn hàng tối thiểu ', FORMAT(v_don_toi_thieu, 0), 'đ');
        SET p_gia_tri_giam = 0;
    ELSE
        SET p_gia_tri_giam = v_gia_tri;
        SET p_message = 'Áp dụng thành công';
    END IF;
END//

-- =====================================================
-- STORED PROCEDURE: Báo cáo tồn kho
-- =====================================================
DROP PROCEDURE IF EXISTS sp_BaoCaoTonKho//
CREATE PROCEDURE sp_BaoCaoTonKho()
BEGIN
    SELECT 
        sp.ma_sp,
        sp.ten_sp,
        sp.sku,
        c.ten_loai,
        sp.so_luong_ton,
        sp.so_luong_toi_thieu,
        CASE 
            WHEN sp.so_luong_ton = 0 THEN 'HẾT HÀNG'
            WHEN sp.so_luong_ton <= sp.so_luong_toi_thieu THEN 'SẮP HẾT'
            WHEN sp.so_luong_ton <= sp.so_luong_toi_thieu * 2 THEN 'THẤP'
            ELSE 'BÌNH THƯỜNG'
        END AS TinhTrang
    FROM products sp
    LEFT JOIN categories c ON sp.ma_loai = c.ma_loai
    WHERE sp.is_deleted = 0
    ORDER BY sp.so_luong_ton ASC;
END//

-- =====================================================
-- STORED PROCEDURE: Thống kê doanh thu theo ngày
-- =====================================================
DROP PROCEDURE IF EXISTS sp_ThongKeDoanhThu_Ngay//
CREATE PROCEDURE sp_ThongKeDoanhThu_Ngay(IN p_ngay_bat_dau DATE, IN p_ngay_ket_thuc DATE)
BEGIN
    SELECT 
        DATE(ngay_tao) AS Ngay,
        COUNT(*) AS SoDonHang,
        SUM(tong_tien) AS TongTien,
        SUM(thanh_tien) AS TongThanhTien,
        SUM(giam_gia) AS TongGiamGia
    FROM orders
    WHERE DATE(ngay_tao) BETWEEN p_ngay_bat_dau AND p_ngay_ket_thuc
    AND trang_thai != 'cancelled'
    GROUP BY DATE(ngay_tao)
    ORDER BY Ngay DESC;
END//

DELIMITER ;

-- =====================================================
-- TRIGGERS: CamVang
-- =====================================================

-- =====================================================
-- TRIGGER: Tự động tạo mã đơn hàng trước khi insert
-- =====================================================
DELIMITER //

DROP TRIGGER IF EXISTS trg_orders_before_insert//
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
END//

-- =====================================================
-- TRIGGER: Cập nhật rating sản phẩm khi có đánh giá mới
-- =====================================================
DROP TRIGGER IF EXISTS trg_reviews_after_insert//
CREATE TRIGGER trg_reviews_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(2,1);
    DECLARE review_cnt INT;
    
    SELECT AVG(diem_so), COUNT(*)
    INTO avg_rating, review_cnt
    FROM reviews
    WHERE ma_sp = NEW.ma_sp AND trang_thai = 1;
    
    UPDATE products 
    SET rating = COALESCE(avg_rating, 0),
        review_count = review_cnt
    WHERE ma_sp = NEW.ma_sp;
END//

-- =====================================================
-- TRIGGER: Ghi log khi có thay đổi sản phẩm
-- =====================================================
DROP TRIGGER IF EXISTS trg_products_after_update//
CREATE TRIGGER trg_products_after_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.so_luong_ton != NEW.so_luong_ton THEN
        INSERT INTO system_logs (bang_tac_dong, hanh_dong, ma_ban_ghi, du_lieu_cu, du_lieu_moi, thoi_gian)
        VALUES ('products', 'UPDATE', NEW.ma_sp, 
                CONCAT('so_luong_ton:', OLD.so_luong_ton),
                CONCAT('so_luong_ton:', NEW.so_luong_ton),
                NOW());
    END IF;
END//

-- =====================================================
-- TRIGGER: Cập nhật số lần sử dụng mã khuyến mãi
-- =====================================================
DROP TRIGGER IF EXISTS trg_promotion_codes_after_update//
CREATE TRIGGER trg_promotion_codes_after_update
AFTER UPDATE ON promotion_codes
FOR EACH ROW
BEGIN
    IF OLD.so_lan_da_su_dung != NEW.so_lan_da_su_dung THEN
        UPDATE promotions 
        SET so_luong_da_su_dung = so_luong_da_su_dung + 1
        WHERE ma_km = NEW.ma_km;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- THÔNG BÁO HOÀN THÀNH
-- =====================================================
SELECT 'Stored Procedures & Triggers đã được tạo thành công!' AS ThongBao;
