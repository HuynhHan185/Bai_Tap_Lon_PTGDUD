-- =====================================================
-- SEED DATA: CamVang
-- Dữ liệu mẫu ban đầu
-- =====================================================

USE CamVang;

-- =====================================================
-- 1. ROLES - PHÂN QUYỀN
-- =====================================================
INSERT INTO roles (ten_role, mo_ta) VALUES
('QuanLy', 'Quản lý - Toàn quyền quản trị hệ thống'),
('KhachHang', 'Khách hàng - Mua hàng và xem thông tin cá nhân');

-- =====================================================
-- 2. USERS - NGƯỜI DÙNG
-- =====================================================
-- Password: admin123 (plain text)
INSERT INTO users (ho, ten, email, mat_khau, so_dien_thoai, dia_chi, ma_role, trang_thai) VALUES
('Admin', 'CamVang', 'admin@camvang.com', 'admin123', NULL, NULL, 1, 1),
('Nguyễn', 'Văn Minh', 'minh.nv@camvang.com', 'admin123', '0862349489', '68 Nguyễn Tư giản, Quận Tân Phú, TP.HCM', 2, 1),
('Trần', 'Thị Hương', 'huong.tt@camvang.com', 'admin123', '0912345678', '123 Lê Lợi, Quận 1, TP.HCM', 2, 1),
('Lê', 'Hoàng Nam', 'nam.lh@camvang.com', 'admin123', '0934567890', '456 Nguyễn Trãi, Quận 5, TP.HCM', 2, 1),
('Phạm', 'Thị Lan', 'lan.pt@camvang.com', 'admin123', '0945678901', '789 Điện Biên Phủ, Quận 3, TP.HCM', 2, 1),
('Hoàng', 'Văn Đức', 'duc.hv@camvang.com', 'admin123', '0956789012', '321 Nguyễn Oanh, Quận Gò Vấp, TP.HCM', 2, 1);

-- =====================================================
-- 3. CATEGORIES - DANH MỤC SẢN PHẨM (5 LOẠI)
-- =====================================================
INSERT INTO categories (ten_loai, slug, mo_ta, hinh_anh) VALUES
('Nồi cơm điện', 'noi-com-dien', 'Các loại nồi cơm điện tử, nồi cơm cao tần', 'https://via.placeholder.com/400x300?text=Noi+Com+Dien'),
('Nồi chiên không dầu', 'noi-chien-khong-dau', 'Nồi chiên không dầu điện tử, nồi chiên hun khói', 'https://via.placeholder.com/400x300?text=Noi+Chien'),
('Quạt điện', 'quat-dien', 'Quạt đứng, quạt treo tường, quạt hướng trục', 'https://via.placeholder.com/400x300?text=Quat+Dien'),
('Máy lọc nước', 'may-loc-nuoc', 'Máy lọc nước RO, máy lọc nước nano', 'https://via.placeholder.com/400x300?text=May+Loc+Nuoc'),
('Bếp điện', 'bep-dien', 'Bếp từ, bếp hồng ngoại, bếp gas', 'https://via.placeholder.com/400x300?text=Bep+Dien');

-- =====================================================
-- 4. SUPPLIERS - NHÀ CUNG CẤP (12 nhà cung cấp)
-- =====================================================
INSERT INTO suppliers (ten_ncc, dia_chi, so_dien_thoai, email, nguoi_lien_he, mo_ta) VALUES
('Sharp Việt Nam', 'Quận 9, TP.HCM', '02812345678', 'contact@sharp.vn', 'Nguyễn Văn A', 'Nhà phân phối chính thức sản phẩm Sharp'),
('Philips Việt Nam', 'Hà Nội', '02412345678', 'vn@philips.com', 'Trần Văn B', 'Nhà phân phối sản phẩm Philips'),
('Panasonic Việt Nam', 'TP.HCM', '02898765432', 'info@panasonic.vn', 'Lê Văn C', 'Nhà phân phối Panasonic'),
('Electrolux Việt Nam', 'Bình Dương', '02711234567', 'contact@electrolux.vn', 'Phạm Thị D', 'Nhà phân phối Electrolux'),
('Toshiba Việt Nam', 'Quận 7, TP.HCM', '02876543210', 'toshiba@vn.com', 'Võ Thị E', 'Nhà phân phối sản phẩm Toshiba'),
('Cuckoo Việt Nam', 'Hà Nội', '02498765432', 'cuckoo@vn.com', 'Đặng Văn F', 'Nhà phân phối Cuckoo cao cấp'),
('Zojirushi Việt Nam', 'TP.HCM', '02812348765', 'zojirushi@vn.com', 'Bùi Thị G', 'Nhà phân phối Zojirushi cao cấp'),
('Kangaroo Việt Nam', 'Hà Nội', '02412349876', 'kangaroo@vn.com', 'Ngô Thị I', 'Nhà phân phối Kangaroo thương hiệu Việt'),
('Sunhouse Việt Nam', 'TP.HCM', '02876549812', 'sunhouse@vn.com', 'Lý Văn J', 'Nhà phân phối Sunhouse thương hiệu Việt'),
('Tefal Việt Nam', 'Quận 1, TP.HCM', '02812345687', 'tefal@vn.com', 'Đinh Thị K', 'Nhà phân phối Tefal'),
('Cosori Việt Nam', 'Hà Nội', '02476543210', 'cosori@vn.com', 'Hồ Văn L', 'Nhà phân phối Cosori'),
('Ninja Việt Nam', 'TP.HCM', '02898761234', 'ninja@vn.com', 'Vũ Thị M', 'Nhà phân phối Ninja');

-- =====================================================
-- 5. PRODUCTS - SẢN PHẨM (50 sản phẩm, 10/category)
-- =====================================================
INSERT INTO products (slug, ten_sp, sku, brand, ma_loai, mo_ta_ngan, mo_ta, don_gia, gia_goc, hinh_anh, so_luong_ton, so_luong_toi_thieu, featured, rating, review_count, trang_thai) VALUES
-- Nồi cơm điện (ma_loai=1, ma_sp: 1-10)
('noi-com-dien-sharp-ks-nr191stv', 'Nồi cơm điện Sharp KS-NR191STV 1.8L', 'GD-RC-SHARP-001', 'Sharp', 1, 'Nồi cơm điện 1.8L cho gia đình 4-6 người', 'Thiết kế nắp gài, dễ sử dụng, phù hợp gian bếp gia đình Việt. Công nghệ nấu đa chức năng, giữ ấm tự động.', 1610000, 1690000, 'https://via.placeholder.com/800x800?text=GD-RC-SHARP-001', 24, 10, 1, 4.8, 125, 1),
('noi-com-dien-panasonic-sr-de18', 'Nồi cơm điện Panasonic SR-DE18 1.8L', 'GD-RC-PAN-001', 'Panasonic', 1, 'Nồi cơm điện 1.8L cao cấp', 'Nồi cơm điện tử cao cấp với nhiều chế độ nấu. Mặt trong phủ men chống dính.', 2190000, 2490000, 'https://via.placeholder.com/800x800?text=GD-RC-PAN-001', 18, 8, 1, 4.9, 89, 1),
('noi-com-dien-electrolux-erc1800s', 'Nồi cơm điện Electrolux ECR1800S 1.8L', 'GD-RC-ELC-001', 'Electrolux', 1, 'Nồi cơm điện thông minh 1.8L', 'Nồi cơm điện thông minh với màn hình LCD, nhiều chế độ nấu tự động.', 1850000, 1990000, 'https://via.placeholder.com/800x800?text=GD-RC-ELC-001', 15, 6, 0, 4.6, 56, 1),
('noi-com-dien-toshiba-rc-10-1', 'Nồi cơm điện Toshiba RC-10-1 1.0L', 'GD-RC-TOS-001', 'Toshiba', 1, 'Nồi cơm điện 1.0L cho gia đình nhỏ', 'Nồi cơm điện mini 1.0L, phù hợp gia đình 2-3 người. Thiết kế nhỏ gọn, dễ mang theo.', 890000, 990000, 'https://via.placeholder.com/800x800?text=GD-RC-TOS-001', 30, 10, 0, 4.5, 78, 1),
('noi-com-dien-cuckoo-icf-mc1001s', 'Nồi cơm điện Cuckoo ICF-MC1001S 1.05L', 'GD-RC-CUK-001', 'Cuckoo', 1, 'Nồi cơm điện cao tần 1.05L', 'Nồi cơm cao tần Cuckoo cao cấp, nấu cơm ngon hơn. Phủ chống dính cao cấp.', 4500000, 5200000, 'https://via.placeholder.com/800x800?text=GD-RC-CUK-001', 8, 3, 1, 4.9, 45, 1),
('noi-com-dien-zojirushi-ns-lac05', 'Nồi cơm điện Zojirushi NS-LAC05 0.54L', 'GD-RC-ZOJ-001', 'Zojirushi', 1, 'Nồi cơm điện 0.54L cao cấp', 'Nồi cơm điện Nhật Bản cao cấp, nấu cơm dẻo hoàn hảo. Dung tích nhỏ cho 1-2 người.', 3200000, 3800000, 'https://via.placeholder.com/800x800?text=GD-RC-ZOJ-001', 6, 2, 1, 4.8, 34, 1),
('noi-com-dien-kangaroo-kg5588', 'Nồi cơm điện Kangaroo KG5588 1.8L', 'GD-RC-KAN-001', 'Kangaroo', 1, 'Nồi cơm điện Kangaroo 1.8L', 'Nồi cơm điện thương hiệu Việt, chất lượng tốt, giá hợp lý.', 950000, 1100000, 'https://via.placeholder.com/800x800?text=GD-RC-KAN-001', 35, 12, 0, 4.3, 156, 1),
('noi-com-dien-sunhouse-shd9027', 'Nồi cơm điện Sunhouse SHD9027 1.8L', 'GD-RC-SUN-001', 'Sunhouse', 1, 'Nồi cơm điện Sunhouse 1.8L', 'Nồi cơm điện Sunhouse với nhiều chế độ nấu, mặt trong phủ men chống dính.', 1100000, 1290000, 'https://via.placeholder.com/800x800?text=GD-RC-SUN-001', 28, 10, 0, 4.5, 134, 1),
('noi-com-dien-supor-cfs40d', 'Nồi cơm điện Supor CFS40D 4.0L', 'GD-RC-SUP-001', 'Supor', 1, 'Nồi cơm điện 4.0L cho gia đình lớn', 'Nồi cơm điện 4.0L, phù hợp gia đình 8-10 người. Công suất lớn, nấu nhanh.', 1250000, 1450000, 'https://via.placeholder.com/800x800?text=GD-RC-SUP-001', 20, 8, 0, 4.4, 92, 1),
('noi-com-dien-natura-ncr18', 'Nồi cơm điện Natura NCR18 1.8L', 'GD-RC-NAT-001', 'Natura', 1, 'Nồi cơm điện Natura 1.8L', 'Nồi cơm điện thiết kế hiện đại, nhiều tính năng thông minh, giá cả phải chăng.', 1050000, 1200000, 'https://via.placeholder.com/800x800?text=GD-RC-NAT-001', 25, 8, 0, 4.4, 98, 1),

-- Nồi chiên không dầu (ma_loai=2, ma_sp: 11-20)
('noi-chien-khong-dau-philips-na130', 'Nồi chiên không dầu Philips NA130/00 6.2L', 'GD-AF-PHI-001', 'Philips', 2, 'Nồi chiên không dầu 6.2L cho gia đình', 'Công nghệ Rapid Air giảm 90% dầu mỡ. Dung tích lớn 6.2L phù hợp gia đình 4-6 người.', 1490000, 1890000, 'https://via.placeholder.com/800x800?text=GD-AF-PHI-001', 16, 5, 1, 4.7, 98, 1),
('noi-chien-khong-dau-sharp-ead20', 'Nồi chiên không dầu Sharp EAD20 5.5L', 'GD-AF-SHARP-001', 'Sharp', 2, 'Nồi chiên không dầu 5.5L', 'Thiết kế hiện đại, dễ vệ sinh. Công nghệ Rapid Air tiết kiệm điện.', 1290000, 1590000, 'https://via.placeholder.com/800x800?text=GD-AF-SHARP-001', 12, 5, 1, 4.5, 67, 1),
('noi-chien-khong-dau-electrolux-eaf2400s', 'Nồi chiên không dầu Electrolux EAF2400S 5.3L', 'GD-AF-ELC-001', 'Electrolux', 2, 'Nồi chiên không dầu 5.3L cao cấp', 'Màn hình cảm ứng, 8 chương trình nấu sẵn. Dễ dàng điều chỉnh nhiệt độ.', 1790000, 2190000, 'https://via.placeholder.com/800x800?text=GD-AF-ELC-001', 10, 4, 0, 4.8, 43, 1),
('noi-chien-khong-dau-tefal-fz5100', 'Nồi chiên không dầu Tefal FZ5100 4.2L', 'GD-AF-TEF-001', 'Tefal', 2, 'Nồi chiên không dầu 4.2L', 'Thiết kế compact, dễ sử dụng. Công nghệ Air Fryer của Tefal.', 1190000, 1490000, 'https://via.placeholder.com/800x800?text=GD-AF-TEF-001', 18, 6, 0, 4.6, 89, 1),
('noi-chien-khong-dau-cosori-cf058ag', 'Nồi chiên không dầu Cosori CF058AG 5.5L', 'GD-AF-COS-001', 'Cosori', 2, 'Nồi chiên không dầu 5.5L thông minh', 'Màn hình LED, 13 chương trình nấu. Thiết kế sang trọng, dễ vệ sinh.', 1890000, 2290000, 'https://via.placeholder.com/800x800?text=GD-AF-COS-001', 12, 4, 1, 4.8, 67, 1),
('noi-chien-khong-dau-ninja-af100', 'Nồi chiên không dầu Ninja AF100 4L', 'GD-AF-NIN-001', 'Ninja', 2, 'Nồi chiên không dầu 4L cao cấp', 'Thương hiệu Ninja nổi tiếng, chất lượng cao, nhiều tính năng thông minh.', 2150000, 2590000, 'https://via.placeholder.com/800x800?text=GD-AF-NIN-001', 8, 3, 1, 4.9, 52, 1),
('noi-chien-khong-dau-kangaroo-af5008', 'Nồi chiên không dầu Kangaroo AF5008 5L', 'GD-AF-KAN-001', 'Kangaroo', 2, 'Nồi chiên không dầu 5L', 'Nồi chiên không dầu Kangaroo, thương hiệu Việt được tin dùng.', 980000, 1190000, 'https://via.placeholder.com/800x800?text=GD-AF-KAN-001', 22, 8, 0, 4.4, 98, 1),
('noi-chien-khong-dau-sunhouse-sha8947', 'Nồi chiên không dầu Sunhouse SHA8947 3.5L', 'GD-AF-SUN-001', 'Sunhouse', 2, 'Nồi chiên không dầu 3.5L', 'Nồi chiên không dầu Sunhouse thương hiệu Việt, giá hợp lý, chất lượng tốt.', 750000, 890000, 'https://via.placeholder.com/800x800?text=GD-AF-SUN-001', 20, 8, 0, 4.4, 112, 1),
('noi-chien-khong-dau-panasonic-nwsc6', 'Nồi chiên không dầu Panasonic NW-SC6', 'GD-AF-PAN-001', 'Panasonic', 2, 'Nồi chiên không dầu Panasonic 5L', 'Thiết kế hiện đại, công nghệ Rapid Air, dễ vệ sinh.', 1650000, 1950000, 'https://via.placeholder.com/800x800?text=GD-AF-PAN-001', 14, 5, 0, 4.6, 76, 1),
('noi-chien-khong-dau-midea-mcaf50', 'Nồi chiên không dầu Midea MCAF50 5L', 'GD-AF-MID-001', 'Midea', 2, 'Nồi chiên không dầu 5L', 'Thiết kế hiện đại, công suất 1500W, nấu nhanh và tiết kiệm điện.', 1150000, 1390000, 'https://via.placeholder.com/800x800?text=GD-AF-MID-001', 15, 5, 0, 4.5, 78, 1),

-- Quạt điện (ma_loai=3, ma_sp: 21-30)
('quat-dung-asia-vy639990', 'Quạt đứng Asia VY639990 80W', 'GD-FN-ASIA-001', 'Asia', 3, 'Quạt đứng 80W cho phòng 20-30m²', 'Quạt đứng công suất 80W, 3 tốc độ. Động cơ bền bỉ, tiết kiệm điện.', 789000, 890000, 'https://via.placeholder.com/800x800?text=GD-FN-ASIA-001', 22, 8, 1, 4.6, 76, 1),
('quat-treo-tuong-panasonic-f408m', 'Quạt treo tường Panasonic F408M 55W', 'GD-FN-PAN-001', 'Panasonic', 3, 'Quạt treo tường 55W', 'Quạt treo tường nhỏ gọn, 3 cánh. Phù hợp phòng khách, phòng ngủ.', 650000, 750000, 'https://via.placeholder.com/800x800?text=GD-FN-PAN-001', 30, 10, 0, 4.4, 52, 1),
('quat-huong-truc-sharp-fj3100bk', 'Quạt hướng trục Sharp FJ3100BK 120W', 'GD-FN-SHARP-001', 'Sharp', 3, 'Quạt hướng trục công nghiệp 120W', 'Quạt hướng trục công suất lớn, gió mạnh. Phù hợp phòng rộng, nhà xưởng.', 1250000, 1390000, 'https://via.placeholder.com/800x800?text=GD-FN-SHARP-001', 8, 3, 0, 4.3, 28, 1),
('quat-dung-kangaroo-kt1601', 'Quạt đứng Kangaroo KT1601 70W', 'GD-FN-KAN-001', 'Kangaroo', 3, 'Quạt đứng Kangaroo 70W', 'Quạt đứng Kangaroo thương hiệu Việt, 3 tốc độ, tiết kiệm điện.', 520000, 620000, 'https://via.placeholder.com/800x800?text=GD-FN-KAN-001', 25, 10, 0, 4.4, 98, 1),
('quat-treo-tuong-kangaroo-kt1603', 'Quạt treo tường Kangaroo KT1603 60W', 'GD-FN-KAN-002', 'Kangaroo', 3, 'Quạt treo tường 60W', 'Quạt treo tường Kangaroo 60W, 3 cánh, thiết kế nhỏ gọn.', 420000, 520000, 'https://via.placeholder.com/800x800?text=GD-FN-KAN-002', 35, 12, 0, 4.3, 145, 1),
('quat-dung-sunhouse-sfs888', 'Quạt đứng Sunhouse SFS888 90W', 'GD-FN-SUN-001', 'Sunhouse', 3, 'Quạt đứng 90W cao cấp', 'Quạt đứng Sunhouse 90W, 5 cánh, gió mạnh và mát hơn.', 890000, 1050000, 'https://via.placeholder.com/800x800?text=GD-FN-SUN-001', 18, 6, 1, 4.6, 78, 1),
('quat-hop-kangaroo-hf18', 'Quạt hộp Kangaroo HF18 45W', 'GD-FN-KAN-003', 'Kangaroo', 3, 'Quạt hộp 45W', 'Quạt hộp nhỏ gọn, dễ di chuyển, phù hợp phòng nhỏ.', 380000, 450000, 'https://via.placeholder.com/800x800?text=GD-FN-KAN-003', 40, 15, 0, 4.4, 167, 1),
('quat-lan-can-sunhouse-sfl1201', 'Quạt lan can Sunhouse SFL1201 65W', 'GD-FN-SUN-002', 'Sunhouse', 3, 'Quạt lan can 65W', 'Quạt lan can phù hợp đặt ban công, gió mạnh, chịu nước nhẹ.', 620000, 750000, 'https://via.placeholder.com/800x800?text=GD-FN-SUN-002', 20, 8, 0, 4.3, 56, 1),
('quat-phun-suong-electrolux-efs308', 'Quạt phun sương Electrolux EFS308', 'GD-FN-ELC-001', 'Electrolux', 3, 'Quạt phun sương làm mát', 'Quạt kết hợp phun sương làm mát không khí, phù hợp mùa hè nóng bức.', 1450000, 1750000, 'https://via.placeholder.com/800x800?text=GD-FN-ELC-001', 10, 4, 1, 4.7, 45, 1),
('quat-sac-du-philips-df620', 'Quạt sạc điện Philips DF620', 'GD-FN-PHI-001', 'Philips', 3, 'Quạt sạc điện không dây', 'Quạt mini sạc điện, dùng pin tích hợp, di chuyển dễ dàng.', 350000, 420000, 'https://via.placeholder.com/800x800?text=GD-FN-PHI-001', 50, 15, 0, 4.5, 234, 1),

-- Máy lọc nước (ma_loai=4, ma_sp: 31-40)
('may-loc-nuoc-karofi-kar60', 'Máy lọc nước Karofi Kar60 10 lõi', 'GD-WF-KAR-001', 'Karofi', 4, 'Máy lọc nước RO 10 lõi lọc', 'Hệ thống 10 lõi lọc RO, lọc sạch đến 99.9%. Bình chứa 10L.', 4500000, 5200000, 'https://via.placeholder.com/800x800?text=GD-WF-KAR-001', 12, 5, 1, 4.7, 89, 1),
('may-loc-nuoc-aquasana-aq-3500', 'Máy lọc nước Aqua Sana AQ-3500', 'GD-WF-AQS-001', 'Aqua Sana', 4, 'Máy lọc nước nano cao cấp', 'Công nghệ nano, giữ lại khoáng chất. Thiết kế sang trọng.', 3800000, 4500000, 'https://via.placeholder.com/800x800?text=GD-WF-AQS-001', 8, 3, 0, 4.5, 45, 1),
('may-loc-nuoc-kangaroo-kg100g', 'Máy lọc nước Kangaroo KG100G 9 lõi', 'GD-WF-KAN-001', 'Kangaroo', 4, 'Máy lọc nước RO 9 lõi', 'Máy lọc nước Kangaroo 9 lõi, lọc sạch, giá hợp lý.', 3200000, 3800000, 'https://via.placeholder.com/800x800?text=GD-WF-KAN-001', 15, 5, 1, 4.6, 112, 1),
('may-loc-nuoc-karovina-rk50', 'Máy lọc nước Karovina RK50', 'GD-WF-KAROV-001', 'Karovina', 4, 'Máy lọc nước RO cao cấp', 'Máy lọc nước Karovina cao cấp, nhiều tính năng thông minh.', 5500000, 6500000, 'https://via.placeholder.com/800x800?text=GD-WF-KAROV-001', 6, 2, 1, 4.8, 38, 1),
('may-loc-nuoc-sunhouse-shd-wp10', 'Máy lọc nước Sunhouse SHD-WP10', 'GD-WF-SUN-001', 'Sunhouse', 4, 'Máy lọc nước Sunhouse 10 lõi', 'Máy lọc nước Sunhouse thương hiệu Việt, chất lượng tốt.', 2800000, 3400000, 'https://via.placeholder.com/800x800?text=GD-WF-SUN-001', 10, 4, 0, 4.5, 78, 1),
('may-loc-nuoc-gree-grw0501', 'Máy lọc nước Gree GRW0501', 'GD-WF-GRE-001', 'Gree', 4, 'Máy lọc nước Gree RO', 'Máy lọc nước Gree thương hiệu Trung Quốc chất lượng cao.', 3500000, 4200000, 'https://via.placeholder.com/800x800?text=GD-WF-GRE-001', 8, 3, 0, 4.4, 56, 1),
('may-loc-nuoc-fujie-fj-ro50', 'Máy lọc nước Fujie FJ-RO50', 'GD-WF-FUJ-001', 'Fujie', 4, 'Máy lọc nước Fujie RO 50G', 'Máy lọc nước Fujie công suất 50G, lọc nhanh, tiết kiệm điện.', 2900000, 3500000, 'https://via.placeholder.com/800x800?text=GD-WF-FUJ-001', 12, 4, 0, 4.5, 89, 1),
('may-loc-nuoc-coway-chp-08', 'Máy lọc nước Coway CHP-08', 'GD-WF-COW-001', 'Coway', 4, 'Máy lọc nước Coway cao cấp', 'Máy lọc nước Coway Hàn Quốc cao cấp, nhiều tính năng vượt trội.', 6800000, 8000000, 'https://via.placeholder.com/800x800?text=GD-WF-COW-001', 5, 2, 1, 4.9, 35, 1),
('may-loc-nuoc-rinnai-rn-10', 'Máy lọc nước Rinnai RN-10', 'GD-WF-RIN-001', 'Rinnai', 4, 'Máy lọc nước Rinnai 10 lõi', 'Máy lọc nước Rinnai thương hiệu Nhật Bản, chất lượng cao.', 4800000, 5700000, 'https://via.placeholder.com/800x800?text=GD-WF-RIN-001', 6, 2, 0, 4.7, 48, 1),
('may-loc-nuoc-perfelli-pure-10', 'Máy lọc nước Perfelli Pure 10', 'GD-WF-PER-001', 'Perfelli', 4, 'Máy lọc nước Perfelli 10 lõi', 'Máy lọc nước Perfelli thiết kế hiện đại, nhiều tính năng.', 4200000, 5000000, 'https://via.placeholder.com/800x800?text=GD-WF-PER-001', 7, 2, 0, 4.6, 42, 1),

-- Bếp điện (ma_loai=5, ma_sp: 41-50)
('bep-tu-panasonic-kx-tt3300', 'Bếp từ Panasonic KX-TT3300 2200W', 'GD-ST-PAN-001', 'Panasonic', 5, 'Bếp từ đơn 2200W', 'Bếp từ đơn công suất 2200W, nhiều mức nhiệt. An toàn khi sử dụng.', 890000, 1090000, 'https://via.placeholder.com/800x800?text=GD-ST-PAN-001', 20, 8, 1, 4.6, 112, 1),
('bep-hong-ngoai-sharp-hi-43', 'Bếp hồng ngoại Sharp HI-43 2000W', 'GD-ST-SHARP-001', 'Sharp', 5, 'Bếp hồng ngoại 2000W', 'Bếp hồng ngoại đa năng, dùng được với mọi loại nồi.', 750000, 890000, 'https://via.placeholder.com/800x800?text=GD-ST-SHARP-001', 15, 6, 0, 4.4, 67, 1),
('bep-tu-electrolux-eit600', 'Bếp từ Electrolux EIT600 2800W', 'GD-ST-ELC-001', 'Electrolux', 5, 'Bếp từ Electrolux 2800W', 'Bếp từ cao cấp Electrolux, công suất 2800W, nhiều tính năng.', 1650000, 1950000, 'https://via.placeholder.com/800x800?text=GD-ST-ELC-001', 12, 4, 1, 4.7, 78, 1),
('bep-tu-kangaroo-kti2105', 'Bếp từ Kangaroo KTI2105 2000W', 'GD-ST-KAN-001', 'Kangaroo', 5, 'Bếp từ đơn 2000W', 'Bếp từ Kangaroo thương hiệu Việt, chất lượng tốt, giá rẻ.', 620000, 780000, 'https://via.placeholder.com/800x800?text=GD-ST-KAN-001', 25, 10, 0, 4.4, 145, 1),
('bep-don-philips-hd4929', 'Bếp đơn Philips HD4929 2100W', 'GD-ST-PHI-001', 'Philips', 5, 'Bếp đơn Philips 2100W', 'Bếp đơn Philips cao cấp, thiết kế sang trọng, an toàn.', 950000, 1150000, 'https://via.placeholder.com/800x800?text=GD-ST-PHI-001', 16, 6, 1, 4.7, 92, 1),
('bep-tu-sunhouse-sic601', 'Bếp từ Sunhouse SIC601 2200W', 'GD-ST-SUN-001', 'Sunhouse', 5, 'Bếp từ Sunhouse 2200W', 'Bếp từ Sunhouse thương hiệu Việt, giá hợp lý, dễ sử dụng.', 680000, 850000, 'https://via.placeholder.com/800x800?text=GD-ST-SUN-001', 22, 8, 0, 4.5, 123, 1),
('bep-doi-electrolux-ecd506', 'Bếp đôi Electrolux ECD506', 'GD-ST-ELC-002', 'Electrolux', 5, 'Bếp đôi Electrolux 3400W', 'Bếp đôi Electrolux công suất 3400W, nấu 2 món cùng lúc.', 2100000, 2500000, 'https://via.placeholder.com/800x800?text=GD-ST-ELC-002', 10, 4, 1, 4.8, 56, 1),
('bep-hong-ngoai-nardi-nhp3500', 'Bếp hồng ngoại Nardi NHP3500 3500W', 'GD-ST-NAR-001', 'Nardi', 5, 'Bếp hồng ngoại công nghiệp 3500W', 'Bếp hồng ngoại công suất lớn 3500W, phù hợp kinh doanh, nhà hàng.', 1850000, 2200000, 'https://via.placeholder.com/800x800?text=GD-ST-NAR-001', 8, 3, 0, 4.3, 34, 1),
('bep-dien-tu-tefal-ko3998', 'Bếp điện từ Tefal KO3998 2800W', 'GD-ST-TEF-001', 'Tefal', 5, 'Bếp điện từ 2800W', 'Bếp điện từ cao cấp Tefal, công suất 2800W, nhiều tính năng.', 1350000, 1650000, 'https://via.placeholder.com/800x800?text=GD-ST-TEF-001', 12, 4, 1, 4.7, 78, 1),
('bep-tu-cosori-cs15800', 'Bếp từ Cosori CS15800 3000W', 'GD-ST-COS-001', 'Cosori', 5, 'Bếp từ Cosori 3000W', 'Bếp từ Cosori cao cấp, công suất 3000W, thiết kế hiện đại.', 1950000, 2350000, 'https://via.placeholder.com/800x800?text=GD-ST-COS-001', 10, 4, 0, 4.8, 65, 1);

-- =====================================================
-- 6. SUPPLIER_PRODUCTS - LIÊN KẾT NCC-SP (50 sản phẩm)
-- =====================================================
INSERT INTO supplier_products (ma_ncc, ma_sp, gia_nhap, thoi_gian_giao_hang) VALUES
-- Nồi cơm điện (ma_sp 1-10)
(1, 1, 1400000, 7),
(3, 2, 1900000, 7),
(4, 3, 1600000, 7),
(5, 4, 750000, 5),
(6, 5, 3800000, 14),
(7, 6, 2800000, 14),
(8, 7, 800000, 5),
(9, 8, 900000, 5),
(1, 9, 650000, 5),
(9, 10, 850000, 5),

-- Nồi chiên không dầu (ma_sp 11-20)
(2, 11, 1250000, 10),
(1, 12, 1050000, 5),
(4, 13, 1500000, 14),
(10, 14, 950000, 7),
(11, 15, 1550000, 10),
(12, 16, 1750000, 14),
(8, 17, 800000, 5),
(9, 18, 600000, 5),
(3, 19, 1350000, 7),
(1, 20, 950000, 5),

-- Quạt điện (ma_sp 21-30)
(2, 21, 650000, 5),
(3, 22, 520000, 5),
(1, 23, 1050000, 7),
(8, 24, 420000, 5),
(8, 25, 350000, 5),
(9, 26, 700000, 5),
(8, 27, 300000, 5),
(9, 28, 500000, 5),
(4, 29, 1200000, 10),
(2, 30, 280000, 5),

-- Máy lọc nước (ma_sp 31-40)
(8, 31, 3800000, 10),
(8, 32, 2700000, 7),
(8, 33, 3200000, 10),
(8, 34, 3500000, 14),
(9, 35, 2400000, 7),
(9, 36, 3000000, 10),
(9, 37, 2500000, 7),
(8, 38, 5500000, 14),
(8, 39, 4000000, 10),
(8, 40, 3500000, 10),

-- Bếp điện (ma_sp 41-50)
(3, 41, 720000, 7),
(1, 42, 600000, 5),
(4, 43, 1650000, 10),
(8, 44, 500000, 5),
(2, 45, 780000, 7),
(9, 46, 550000, 5),
(4, 47, 1700000, 14),
(9, 48, 1500000, 10),
(10, 49, 1100000, 7),
(11, 50, 1600000, 10);

-- =====================================================
-- 7. PROMOTIONS - KHUYẾN MÃI
-- =====================================================
INSERT INTO promotions (ten_km, mo_ta, loai_giam_gia, gia_tri_giam, gia_tri_giam_toi_da, so_luong_ma, so_luong_da_su_dung, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES
('Summer Sale 2026', 'Giảm giá mùa hè cho các sản phẩm quạt điện', 'PhanTram', 15, 100000, 100, 0, '2026-04-01', '2026-06-30', 1),
('Giảm 10% Nồi cơm điện', 'Khuyến mãi đặc biệt cho dòng nồi cơm điện', 'PhanTram', 10, 200000, 50, 0, '2026-04-15', '2026-05-15', 1),
('Free Ship cho đơn từ 500K', 'Miễn phí vận chuyển cho đơn hàng từ 500,000đ', 'SoTien', 30000, NULL, NULL, 0, '2026-04-01', '2026-12-31', 1),
('Bếp điện giá sốc', 'Giảm đến 20% cho các sản phẩm bếp điện', 'PhanTram', 20, 300000, 40, 0, '2026-05-01', '2026-05-31', 1);

-- =====================================================
-- 8. PROMOTION_DETAILS - CHI TIẾT KHUYẾN MÃI
-- =====================================================
INSERT INTO promotion_details (ma_km, ma_loai, gia_tri_giam_ap_dung) VALUES
(1, 3, NULL),  -- Summer Sale cho Quạt điện (ma_loai=3)
(2, 1, NULL),  -- Giảm 10% cho Nồi cơm điện (ma_loai=1)
(4, 5, NULL);  -- Giảm 20% cho Bếp điện (ma_loai=5)

-- =====================================================
-- 9. PROMOTION_CODES - MÃ KHUYẾN MÃI
-- =====================================================
INSERT INTO promotion_codes (ma_km, code, gia_tri_giam, gia_tri_don_toi_thieu, so_lan_su_dung, ngay_het_han, trang_thai) VALUES
(3, 'FREESHIP', 30000, 500000, 1000, '2026-12-31', 1),
(1, 'SUMMER15', 0, 300000, 100, '2026-06-30', 1),
(2, 'NOICOM10', 0, 200000, 50, '2026-05-15', 1),
(4, 'BEPGIASOC', 0, 500000, 40, '2026-05-31', 1);

-- =====================================================
-- 10. ORDERS - ĐƠN HÀNG
-- =====================================================
INSERT INTO orders (ma_don_hang, ma_user, ho_ten, so_dien_thoai, email, dia_chi, ghi_chu, tong_tien, phi_van_chuyen, giam_gia, thanh_tien, phuong_thuc_thanh_toan, trang_thai, ngay_tao) VALUES
('DH00000001', 2, 'Nguyễn Văn Minh', '0862349489', 'minh.nv@camvang.com', '68 Nguyễn Tư giản, Quận Tân Phú, TP.HCM', 'Giao giờ hành chính', 1610000, 0, 0, 1610000, 'cod', 'completed', '2026-04-10 14:30:00'),
('DH00000002', 3, 'Trần Thị Hương', '0912345678', 'huong.tt@camvang.com', '123 Lê Lợi, Quận 1, TP.HCM', NULL, 2980000, 30000, 0, 3010000, 'bank', 'completed', '2026-04-12 09:15:00'),
('DH00000003', 2, 'Nguyễn Văn Minh', '0862349489', 'minh.nv@camvang.com', '68 Nguyễn Tư giản, Quận Tân Phú, TP.HCM', 'Gọi trước khi giao', 1490000, 0, 0, 1490000, 'cod', 'completed', '2026-04-15 16:45:00'),
('DH00000004', 4, 'Lê Hoàng Nam', '0934567890', 'nam.lh@camvang.com', '456 Nguyễn Trãi, Quận 5, TP.HCM', NULL, 789000, 0, 0, 789000, 'momo', 'shipping', '2026-04-18 11:20:00'),
('DH00000005', 3, 'Trần Thị Hương', '0912345678', 'huong.tt@camvang.com', '123 Lê Lợi, Quận 1, TP.HCM', NULL, 929000, 30000, 30000, 929000, 'cod', 'pending', '2026-04-20 08:00:00'),
('DH00000006', 5, 'Phạm Thị Lan', '0945678901', 'lan.pt@camvang.com', '789 Điện Biên Phủ, Quận 3, TP.HCM', 'Nhà có thang máy', 2990000, 0, 0, 2990000, 'bank', 'confirmed', '2026-04-22 10:30:00'),
('DH00000007', 6, 'Hoàng Văn Đức', '0956789012', 'duc.hv@camvang.com', '321 Nguyễn Oanh, Quận Gò Vấp, TP.HCM', NULL, 1590000, 0, 0, 1590000, 'cod', 'completed', '2026-04-23 15:00:00'),
('DH00000008', 5, 'Phạm Thị Lan', '0945678901', 'lan.pt@camvang.com', '789 Điện Biên Phủ, Quận 3, TP.HCM', 'Liên hệ trước khi giao', 890000, 0, 0, 890000, 'momo', 'shipping', '2026-04-25 09:45:00');

-- =====================================================
-- 11. ORDER_ITEMS - CHI TIẾT ĐƠN HÀNG
-- =====================================================
INSERT INTO order_items (ma_don_hang, ma_sp, ten_sp, sku, brand, hinh_anh, don_gia, so_luong, giam_gia, thanh_tien) VALUES
('DH00000001', 1, 'Nồi cơm điện Sharp KS-NR191STV 1.8L', 'GD-RC-SHARP-001', 'Sharp', 'https://via.placeholder.com/800x800?text=GD-RC-SHARP-001', 1610000, 1, 0, 1610000),
('DH00000002', 11, 'Nồi chiên không dầu Philips NA130/00 6.2L', 'GD-AF-PHI-001', 'Philips', 'https://via.placeholder.com/800x800?text=GD-AF-PHI-001', 1490000, 2, 0, 2980000),
('DH00000003', 11, 'Nồi chiên không dầu Philips NA130/00 6.2L', 'GD-AF-PHI-001', 'Philips', 'https://via.placeholder.com/800x800?text=GD-AF-PHI-001', 1490000, 1, 0, 1490000),
('DH00000004', 21, 'Quạt đứng Asia VY639990 80W', 'GD-FN-ASIA-001', 'Asia', 'https://via.placeholder.com/800x800?text=GD-FN-ASIA-001', 789000, 1, 0, 789000),
('DH00000005', 21, 'Quạt đứng Asia VY639990 80W', 'GD-FN-ASIA-001', 'Asia', 'https://via.placeholder.com/800x800?text=GD-FN-ASIA-001', 789000, 1, 0, 789000),
('DH00000006', 41, 'Bếp từ Panasonic KX-TT3300 2200W', 'GD-ST-PAN-001', 'Panasonic', 'https://via.placeholder.com/800x800?text=GD-ST-PAN-001', 890000, 1, 0, 890000),
('DH00000006', 31, 'Máy lọc nước Karofi Kar60 10 lõi', 'GD-WF-KAR-001', 'Karofi', 'https://via.placeholder.com/800x800?text=GD-WF-KAR-001', 4500000, 1, 0, 4500000),
('DH00000007', 31, 'Máy lọc nước Karofi Kar60 10 lõi', 'GD-WF-KAR-001', 'Karofi', 'https://via.placeholder.com/800x800?text=GD-WF-KAR-001', 4500000, 1, 0, 4500000),
('DH00000007', 41, 'Bếp từ Panasonic KX-TT3300 2200W', 'GD-ST-PAN-001', 'Panasonic', 'https://via.placeholder.com/800x800?text=GD-ST-PAN-001', 890000, 1, 0, 890000),
('DH00000008', 5, 'Nồi cơm điện Cuckoo ICF-MC1001S 1.05L', 'GD-RC-CUK-001', 'Cuckoo', 'https://via.placeholder.com/800x800?text=GD-RC-CUK-001', 4500000, 1, 0, 4500000);

-- =====================================================
-- 12. CONTACTS - LIÊN HỆ
-- =====================================================
INSERT INTO contacts (ho_ten, email, so_dien_thoai, chu_de, noi_dung, trang_thai, tra_loi, ngay_tra_loi) VALUES
('Nguyễn Văn A', 'nva@email.com', '0909123456', 'Tư vấn sản phẩm', 'Tôi muốn biết về chế độ bảo hành của nồi cơm điện Sharp?', 1, 'Cảm ơn bạn đã liên hệ. Sản phẩm Sharp được bảo hành 24 tháng tại các trung tâm bảo hành ủy quyền.', '2026-04-08 10:30:00'),
('Trần Thị B', 'ttb@email.com', '0912345678', 'Khiếu nại', 'Đơn hàng giao chậm hơn dự kiến 3 ngày', 1, 'Xin lỗi quý khách vì sự bất tiện này. Chúng tôi sẽ kiểm tra và rút kinh nghiệm.', '2026-04-12 14:00:00'),
('Lê Văn C', 'lvc@email.com', '0923456789', 'Hợp tác kinh doanh', 'Tôi muốn trở thành đại lý phân phối sản phẩm CamVang', 0, NULL, NULL),
('Phạm Thị D', 'ptd@email.com', '0934567890', 'Yêu cầu đổi trả', 'Sản phẩm bếp từ Panasonic có lỗi kỹ thuật, tôi muốn đổi trả', 0, NULL, NULL),
('Võ Thị E', 'vte@email.com', '0945678901', 'Tư vấn mua hàng', 'Tôi cần tư vấn mua nồi chiên không dầu cho gia đình 4 người', 1, 'Với gia đình 4 người, tôi khuyên bạn nên chọn nồi chiên từ 5L trở lên. Philips NA130 6.2L là lựa chọn tốt.', '2026-04-18 09:00:00');

-- =====================================================
-- 13. BANNERS - BANNER QUẢNG CÁO
-- =====================================================
INSERT INTO banners (tieu_de, hinh_anh, href, vi_tri_hien_thi, thu_tu, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES
('Summer Sale - Giảm đến 30%', 'https://via.placeholder.com/1440x520?text=Summer+Sale+2026', '/danh-muc/noi-com-dien', 'home', 1, '2026-04-01', '2026-06-30', 1),
('Nồi chiên không dầu - Mùa hè sảng khoái', 'https://via.placeholder.com/1440x520?text=Noi+Chien+Khong+Dau', '/danh-muc/noi-chien-khong-dau', 'home', 2, '2026-04-01', '2026-12-31', 1),
('Quạt điện chính hãng - Giá tốt', 'https://via.placeholder.com/1440x520?text=Quat+Dien+Chinh+Hang', '/danh-muc/quat-dien', 'home', 3, '2026-04-01', '2026-08-31', 1),
('Free Ship cho đơn từ 500K', 'https://via.placeholder.com/1440x200?text=Free+Ship+500K', NULL, 'all', 4, '2026-04-01', '2026-12-31', 1),
('Bếp điện giá sốc tháng 5', 'https://via.placeholder.com/1440x400?text=Bep+Dien+Gia+Soc', '/danh-muc/bep-dien', 'home', 5, '2026-05-01', '2026-05-31', 1);

-- =====================================================
-- 14. REVIEWS - ĐÁNH GIÁ SẢN PHẨM
-- =====================================================
INSERT INTO reviews (ma_sp, ma_user, diem_so, tieu_de, noi_dung, trang_thai) VALUES
(1, 2, 5, 'Sản phẩm tuyệt vời', 'Nồi cơm nấu rất ngon, cơm dẻo. Thiết kế đẹp, dễ sử dụng. Giao hàng nhanh, đóng gói cẩn thận.', 1),
(1, 3, 4, 'Tốt nhưng hơi đắt', 'Chất lượng tốt, nấu cơm ngon. Giá hơi cao so với mặt bằng chung nhưng xứng đáng.', 1),
(11, 2, 5, 'Rất hài lòng', 'Nồi chiên không dầu Philips chất lượng tuyệt vời. Chiên giòn đều, ít dầu mỡ. Dễ vệ sinh.', 1),
(11, 4, 4, 'Tốt, nên mua', 'Sản phẩm tốt, đáng giá tiền. Đã dùng được 2 tháng, rất hài lòng.', 1),
(21, 3, 5, 'Quạt mát, yên tĩnh', 'Quạt Asia chạy mát, ít tiếng ồn. 3 tốc độ phù hợp mọi nhu cầu. Đáng mua.', 1),
(31, 2, 4, 'Nước lọc sạch', 'Máy lọc nước hoạt động tốt, nước uống ngọt hơn. Lắp đặt dễ dàng.', 1),
(41, 3, 5, 'Bếp từ tuyệt vời', 'Bếp Panasonic nấu rất nhanh, an toàn. Đã dùng được 3 tháng, rất hài lòng.', 1),
(31, 5, 5, 'Máy lọc nước tốt', 'Sản phẩm chất lượng, nước lọc sạch và ngon. Giao hàng nhanh, lắp đặt miễn phí.', 1),
(11, 6, 4, 'Nồi chiên không dầu tốt', 'Dùng được vài tháng, chiên đồ ăn rất ngon. Giá hợp lý.', 1),
(41, 4, 5, 'Bếp từ cao cấp', 'Bếp Panasonic thiết kế đẹp, nấu nhanh, dễ vệ sinh. Rất hài lòng!', 1);

-- =====================================================
-- 15. POINT_HISTORY - LỊCH SỬ ĐIỂM TÍCH LŨY
-- =====================================================
INSERT INTO point_history (ma_user, ma_don_hang, loai_giao_dich, so_diem, diem_truoc, diem_sau, mo_ta) VALUES
(2, 'DH00000001', 'CongDiem', 161, 0, 161, 'Tích điểm từ đơn hàng DH00000001'),
(3, 'DH00000002', 'CongDiem', 301, 0, 301, 'Tích điểm từ đơn hàng DH00000002'),
(2, 'DH00000003', 'CongDiem', 149, 161, 310, 'Tích điểm từ đơn hàng DH00000003'),
(4, 'DH00000004', 'CongDiem', 78, 0, 78, 'Tích điểm từ đơn hàng DH00000004'),
(3, 'DH00000005', 'CongDiem', 92, 301, 393, 'Tích điểm từ đơn hàng DH00000005'),
(5, 'DH00000006', 'CongDiem', 299, 0, 299, 'Tích điểm từ đơn hàng DH00000006'),
(6, 'DH00000007', 'CongDiem', 159, 0, 159, 'Tích điểm từ đơn hàng DH00000007'),
(5, 'DH00000008', 'CongDiem', 89, 299, 388, 'Tích điểm từ đơn hàng DH00000008');

-- =====================================================
-- 16. FAVORITES - SẢN PHẨM YÊU THÍCH
-- =====================================================
INSERT INTO favorites (ma_user, ma_sp) VALUES
(2, 1),
(2, 11),
(2, 31),
(3, 41),
(3, 31),
(4, 11),
(4, 41),
(5, 5),
(5, 16),
(6, 31),
(6, 41);

-- =====================================================
-- THÔNG BÁO HOÀN THÀNH
-- =====================================================
SELECT 'Seed Data CamVang đã được thêm thành công!' AS ThongBao;
