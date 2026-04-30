# CamVang Backend - Node.js / Express API

Backend API cho website thương mại điện tử CamVang Home (đồ gia dụng).

## Tech Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: MySQL 8
- **Auth**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **Validation**: express-validator
- **File Upload**: multer
- **Email**: nodemailer

## Cài đặt

### 1. Cài đặt Node.js

Tải Node.js v20+ từ [nodejs.org](https://nodejs.org)

```bash
node -v   # Kiểm tra phiên bản
npm -v    # Kiểm tra npm
```

### 2. Cài đặt MySQL

1. Tải MySQL Installer từ [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Cài đặt MySQL Server 8.0+
3. Tạo database `camvang`:

```sql
CREATE DATABASE camvang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Chạy Schema Database

Chạy 3 file SQL theo thứ tự từ thư mục `database/` của project:

```bash
# Di chuyển vào thư mục backend (nơi chứa thư mục database/ cùng cấp)
mysql -u root -p camvang < ../database/schema.sql
mysql -u root -p camvang < ../database/procedures.sql
mysql -u root -p camvang < ../database/seed.sql
```

Hoặc chạy trong MySQL:

```sql
SOURCE duong-dan/toi/database/schema.sql;
SOURCE duong-dan/toi/database/procedures.sql;
SOURCE duong-dan/toi/database/seed.sql;
```

### 4. Cài đặt Dependencies

```bash
cd backend
npm install
```

### 5. Cấu hình `.env`

```bash
cp .env.example .env
```

Sửa `.env`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=camvang
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_google_app_password
FRONTEND_URL=http://localhost:5173
```

> **Lưu ý**: Để lấy `SMTP_PASS`, cần tạo App Password trong tài khoản Google:
> 1. Google Account > Security > 2-Step Verification bật
> 2. App Passwords > Tạo mới > Copy password

### 6. Chạy Backend

```bash
# Development (tự restart khi code thay đổi)
npm run dev

# Production
npm start
```

Server chạy tại: `http://localhost:3001`

API Health: `http://localhost:3001/api/health`

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── index.js           # Entry point
│   ├── app.js             # Express app config
│   ├── config/
│   │   └── db.js          # MySQL pool connection
│   ├── middleware/
│   │   ├── auth.js        # JWT verify
│   │   ├── adminOnly.js   # Admin only access
│   │   ├── validate.js     # Request validation
│   │   ├── errorHandler.js # Global error handler
│   │   └── upload.js      # Multer file upload
│   ├── routes/
│   │   ├── index.js       # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── contact.routes.js
│   │   ├── banner.routes.js
│   │   ├── promotion.routes.js
│   │   └── review.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── category.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── contact.controller.js
│   │   ├── banner.controller.js
│   │   ├── promotion.controller.js
│   │   └── review.controller.js
│   ├── services/
│   │   └── mail.service.js # Email sending
│   └── utils/
│       ├── ApiError.js
│       ├── asyncHandler.js
│       └── helpers.js
├── uploads/
│   └── products/          # Uploaded product images
├── .env                   # Environment variables
├── .env.example
├── .gitignore
└── package.json
```

## API Endpoints

### Auth `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| POST | `/register` | Đăng ký | Không |
| POST | `/login` | Đăng nhập | Không |
| GET | `/me` | Thông tin user hiện tại | JWT |
| POST | `/forgot-password` | Quên mật khẩu | Không |
| POST | `/reset-password` | Đặt lại mật khẩu | Token |

### Products `/api/products`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| GET | `/` | Danh sách sản phẩm (filter, sort, phân trang) | Không |
| GET | `/featured` | Sản phẩm nổi bật | Không |
| GET | `/related/:id` | Sản phẩm liên quan | Không |
| GET | `/slug/:slug` | Chi tiết sản phẩm | Không |
| GET | `/admin/all` | Tất cả sản phẩm (kể cả đã xóa) | Admin |
| POST | `/` | Thêm sản phẩm | Admin |
| PUT | `/:id` | Cập nhật sản phẩm | Admin |
| DELETE | `/:id` | Xóa sản phẩm | Admin |
| POST | `/upload-image` | Upload ảnh | Admin |

### Orders `/api/orders`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| POST | `/` | Tạo đơn hàng | Không |
| GET | `/my-orders` | Đơn hàng của tôi | JWT |
| GET | `/:id` | Chi tiết đơn hàng | JWT |
| GET | `/admin` | Tất cả đơn hàng | Admin |
| PATCH | `/:id/status` | Cập nhật trạng thái | Admin |
| PATCH | `/:id/cancel` | Hủy đơn hàng | JWT |
| DELETE | `/:id` | Xóa đơn hàng | Admin |

### Categories `/api/categories`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| GET | `/` | Danh sách danh mục | Không |
| GET | `/:slug` | Chi tiết danh mục | Không |
| POST | `/` | Thêm danh mục | Admin |
| PUT | `/:id` | Cập nhật danh mục | Admin |
| DELETE | `/:id` | Xóa danh mục | Admin |

### Promotions `/api/promotions`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| GET | `/` | Khuyến mãi đang hoạt động | Không |
| POST | `/validate` | Kiểm tra coupon | Không |
| GET | `/admin` | Tất cả khuyến mãi | Admin |
| POST | `/` | Tạo khuyến mãi | Admin |
| POST | `/:id/codes` | Tạo mã coupon | Admin |
| DELETE | `/:id` | Vô hiệu hóa khuyến mãi | Admin |

### Reviews `/api/reviews`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| GET | `/product/:productId` | Đánh giá theo sản phẩm | Không |
| POST | `/` | Thêm đánh giá | JWT |
| DELETE | `/:id` | Xóa đánh giá | JWT |

### Contacts `/api/contacts`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| POST | `/` | Gửi liên hệ | Không |
| GET | `/admin` | Tất cả liên hệ | Admin |
| PATCH | `/:id/reply` | Trả lời liên hệ | Admin |

### Banners `/api/banners`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|--------|------|
| GET | `/` | Danh sách banner hoạt động | Không |
| GET | `/admin` | Tất cả banner | Admin |
| POST | `/` | Thêm banner | Admin |
| PUT | `/:id` | Cập nhật banner | Admin |
| DELETE | `/:id` | Xóa banner | Admin |

## Test API

Sau khi backend chạy, có thể test bằng Postman hoặc cURL:

```bash
# Health check
curl http://localhost:3001/api/health

# Login (tài khoản mặc định từ seed.sql)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@camvang.com","mat_khau":"admin123"}'

# Lấy danh sách sản phẩm
curl http://localhost:3001/api/products

# Tạo đơn hàng
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "ho_ten":"Nguyen Van A",
    "so_dien_thoai":"0123456789",
    "dia_chi":"123 Tran Hung Dao, Q1, HCM",
    "items":[{"ma_sp":1,"so_luong":2}]
  }'
```

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Quản lý | admin@camvang.com | admin123 |
| Khách hàng | duong@example.com | (xem seed.sql) |

## Troubleshooting

### Lỗi kết nối MySQL

1. Kiểm tra MySQL đang chạy: `mysql -u root -p`
2. Kiểm tra database tồn tại: `SHOW DATABASES;`
3. Kiểm tra `.env` đúng password

### Lỗi PORT đã sử dụng

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
PORT=3002
```

### Lỗi CORS

Đảm bảo `FRONTEND_URL` trong `.env` khớp chính xác với frontend URL (bao gồm cổng).

## Scripts hữu ích

```bash
# Chạy backend với nodemon
npm run dev

# Start production
npm start
```
