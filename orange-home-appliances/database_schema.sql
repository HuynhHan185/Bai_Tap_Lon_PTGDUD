-- Database initialization script for Orange Home Appliances
CREATE DATABASE IF NOT EXISTS `orange_home_appliances` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `orange_home_appliances`;

-- 1. Users Table (Admin & Customers)
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(50) PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255),
    `email` VARCHAR(255) UNIQUE,
    `phone` VARCHAR(20),
    `role` ENUM('admin', 'customer') DEFAULT 'customer',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Brands Table
CREATE TABLE IF NOT EXISTS `brands` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `logo_url` VARCHAR(255)
) ENGINE=InnoDB;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 4. Price Ranges Table (For Filtering)
CREATE TABLE IF NOT EXISTS `price_ranges` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `label` VARCHAR(100) NOT NULL,
    `min_price` DECIMAL(15, 2) DEFAULT 0,
    `max_price` DECIMAL(15, 2) DEFAULT NULL,
    `display_order` INT DEFAULT 0
) ENGINE=InnoDB;

-- 5. Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` VARCHAR(50) PRIMARY KEY,
    `category_id` VARCHAR(50),
    `brand_id` VARCHAR(50),
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `sku` VARCHAR(100) NOT NULL UNIQUE,
    `price` DECIMAL(15, 2) NOT NULL,
    `compare_at_price` DECIMAL(15, 2),
    `stock` INT DEFAULT 0,
    `featured` BOOLEAN DEFAULT FALSE,
    `rating` DECIMAL(3, 2) DEFAULT 0.0,
    `review_count` INT DEFAULT 0,
    `short_description` TEXT,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Product Images Table (1 to Many)
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` VARCHAR(50) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Product Specs Table (1 to Many)
CREATE TABLE IF NOT EXISTS `product_specs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` VARCHAR(50) NOT NULL,
    `spec_name` VARCHAR(100) NOT NULL,
    `spec_value` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Banners Table
CREATE TABLE IF NOT EXISTS `banners` (
    `id` VARCHAR(50) PRIMARY KEY,
    `title` VARCHAR(255),
    `image` VARCHAR(255) NOT NULL,
    `href` VARCHAR(255)
) ENGINE=InnoDB;

-- 9. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50),
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` TEXT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. Order Items Table (1 to Many)
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50),
    `product_name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `quantity` INT NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Contact Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ==========================================
-- SEED DATA 
-- ==========================================

-- Insert Users (Admin & Sample Customer)
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role`) VALUES
('usr-admin', 'admin', 'admin123', 'Administrator', 'admin@camvang.com', 'admin'),
('usr-001', 'customer1', '123456', 'Đặng Trần Dương', 'duong@example.com', 'customer');

-- Insert Brands
INSERT INTO `brands` (`id`, `name`, `slug`) VALUES
('br-sharp', 'Sharp', 'sharp'),
('br-philips', 'Philips', 'philips'),
('br-panasonic', 'Panasonic', 'panasonic'),
('br-sunhouse', 'Sunhouse', 'sunhouse'),
('br-asia', 'Asia', 'asia'),
('br-xiaomi', 'Xiaomi', 'xiaomi'),
('br-deerma', 'Deerma', 'deerma'),
('br-kangaroo', 'Kangaroo', 'kangaroo');

-- Insert Categories
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
('cat-001', 'Nồi cơm điện', 'noi-com-dien'),
('cat-002', 'Nồi chiên không dầu', 'noi-chien-khong-dau'),
('cat-003', 'Quạt điện', 'quat-dien');

-- Insert Price Ranges (For Filtering)
INSERT INTO `price_ranges` (`label`, `min_price`, `max_price`, `display_order`) VALUES
('Dưới 500.000đ', 0, 500000, 1),
('500.000đ - 1 triệu', 500000, 1000000, 2),
('1 - 2 triệu', 1000000, 2000000, 3),
('Trên 2 triệu', 2000000, NULL, 4);

-- Insert Products
INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `slug`, `sku`, `price`, `compare_at_price`, `stock`, `featured`, `rating`, `review_count`, `short_description`, `description`) VALUES
('prod-001', 'cat-001', 'br-sharp', 'Nồi cơm điện Sharp KS-NR191STV 1.8L', 'noi-com-dien-sharp-ks-nr191stv', 'GD-RC-SHARP-001', 1610000, 1690000, 24, TRUE, 4.8, 125, 'Nồi cơm điện 1.8L cho gia đình 4-6 người.', 'Thiết kế nắp gài, dễ sử dụng, phù hợp gian bếp gia đình Việt.'),
('prod-002', 'cat-002', 'br-philips', 'Nồi chiên không dầu Philips NA130/00 6.2L', 'noi-chien-khong-dau-philips-na130', 'GD-AF-PHI-001', 1490000, 1890000, 16, TRUE, 4.7, 98, 'Nồi chiên không dầu 6.2L, phù hợp gia đình hiện đại.', 'Dung tích lớn, nấu nướng tiện lợi, giảm dầu mỡ.'),
('prod-003', 'cat-003', 'br-asia', 'Quạt đứng Asia VY639990 80W', 'quat-dung-asia-vy639990', 'GD-FN-ASIA-001', 789000, 890000, 22, TRUE, 4.6, 76, 'Quạt đứng 6 cánh, công suất 80W.', 'Quạt đứng phù hợp phòng khách, phòng ngủ và văn phòng.');

-- Insert Product Images
INSERT INTO `product_images` (`product_id`, `image_url`, `display_order`) VALUES
('prod-001', 'https://via.placeholder.com/800x800?text=GD-RC-SHARP-001', 1),
('prod-001', 'https://via.placeholder.com/800x800?text=GD-RC-SHARP-001-2', 2),
('prod-002', 'https://via.placeholder.com/800x800?text=GD-AF-PHI-001', 1),
('prod-003', 'https://via.placeholder.com/800x800?text=GD-FN-ASIA-001', 1);

-- Insert Product Specs
INSERT INTO `product_specs` (`product_id`, `spec_name`, `spec_value`) VALUES
('prod-001', 'Dung tích', '1.8 lít'),
('prod-001', 'Công suất', '700W'),
('prod-001', 'Loại nồi', 'Nắp gài'),
('prod-002', 'Dung tích', '6.2 lít'),
('prod-002', 'Công suất', '1700W'),
('prod-002', 'Nhiệt độ', '80-200 độ C'),
('prod-003', 'Công suất', '80W'),
('prod-003', 'Loại quạt', 'Quạt đứng'),
('prod-003', 'Số cánh', '6 cánh');

-- Insert Banners
INSERT INTO `banners` (`id`, `title`, `image`, `href`) VALUES
('bn-001', 'Mùa nóng sale quạt điện', 'https://via.placeholder.com/1440x520?text=Banner+Quat', '/danh-muc/quat-dien');
