---
name: Backend NodeJS Plan
overview: Xây dựng backend Node.js/Express + MySQL cho website CamVang Home từ đầu, chi tiết từng bước cho người mới tiếp xúc NodeJS
todos:
  - id: backend-plan
    content: Tạo plan chi tiết backend NodeJS cho CamVang Home
    status: pending
isProject: false
---

# Kế hoạch Xây dựng Backend Node.js cho CamVang Home

---

## Tổng quan

Dự án hiện tại dùng **json-server mock** (chỉ là file JSON giả lập). Backend thật sẽ dùng:

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MySQL 8 (đã có schema 17 bảng trong `database/schema.sql`)
- **ORM**: mysql2 (raw queries, không dùng ORM để bạn hiểu SQL)
- **Auth**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors, express-validator
- **Validation**: express-validator (thay vì zod phía frontend)
- **File upload**: multer (cho ảnh sản phẩm)
- **Dev**: nodemon (tự restart khi code thay đổi)

---

## Cấu trúc thư mục Backend

```
backend/
├── package.json              # Dependencies
├── .env                      # Biến môi trường ( không commit )
├── .gitignore
├── src/
│   ├── index.js              # Entry point - chạy server ở đây
│   ├── app.js                # Cấu hình Express app
│   ├── config/
│   │   └── db.js             # Kết nối MySQL pool
│   ├── middleware/
│   │   ├── auth.js           # JWT verify - kiểm tra đăng nhập
│   │   ├── adminOnly.js      # Chỉ cho Quản lý
│   │   ├── validate.js       # Validate request body
│   │   └── errorHandler.js   # Xử lý lỗi tập trung
│   ├── routes/
│   │   ├── index.js          # Gộp tất cả routes
│   │   ├── auth.routes.js    # /api/auth
│   │   ├── user.routes.js    # /api/users
│   │   ├── category.routes.js # /api/categories
│   │   ├── product.routes.js  # /api/products
│   │   ├── order.routes.js    # /api/orders
│   │   ├── contact.routes.js  # /api/contacts
│   │   ├── banner.routes.js   # /api/banners
│   │   ├── promotion.routes.js # /api/promotions
│   │   └── review.routes.js   # /api/reviews
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
│   │   ├── mail.service.js    # Gửi email (nodemailer)
│   │   └── storage.service.js # Upload ảnh (local/cloud)
│   └── utils/
│       ├──ApiError.js        # Class lỗi tùy chỉnh
│       ├──asyncHandler.js    # Wrapper bắt lỗi async
│       └──generateCode.js    # Tạo mã đơn hàng, mã KM
└── uploads/                  # Lưu ảnh upload
    └── products/
```

---

## Bước 1: Chuẩn bị môi trường

### 1.1 Cài đặt Node.js

- Tải Node.js v20+ từ nodejs.org
- Kiểm tra: `node -v` và `npm -v`

### 1.2 Tạo thư mục và khởi tạo project

```bash
cd orange-home-appliances
mkdir backend && cd backend
npm init -y
```

### 1.3 Cài đặt dependencies

```bash
npm install express mysql2 bcryptjs jsonwebtoken cors helmet express-rate-limit express-validator multer nodemailer dotenv
npm install -D nodemon
```

### 1.4 Cấu hình `.env`

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=camvang
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Bước 2: Cấu hình Database (MySQL)

### 2.1 Cài đặt MySQL

- Tải MySQL Installer từ mysql.com
- Tạo database `camvang`

```sql
CREATE DATABASE camvang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Chạy schema đã có

Các file SQL đã tồn tại trong `database/`:

- `database/schema.sql` - 17 bảng + indexes → chạy trước
- `database/procedures.sql` - stored procedures + triggers → chạy sau
- `database/seed.sql` - dữ liệu mẫu → chạy cuối cùng

```bash
mysql -u root -p camvang < ../database/schema.sql
mysql -u root -p camvang < ../database/procedures.sql
mysql -u root -p camvang < ../database/seed.sql
```

### 2.3 Tạo file kết nối `src/config/db.js`

```javascript
const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

module.exports = pool;
```

---

## Bước 3: Xây dựng lớp Foundation (Utility)

### 3.1 Tạo `src/utils/asyncHandler.js`

Wrapper giúp bắt lỗi async mà không cần try-catch mỗi hàm:

```javascript
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```

### 3.2 Tạo `src/utils/ApiError.js`

Class lỗi tùy chỉnh với HTTP status code:

```javascript
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
```

### 3.3 Tạo `src/utils/generateCode.js`

Tạo mã đơn hàng tự động (DH00000001):

```javascript
const generateCode = (prefix, num) =>
  `${prefix}${String(num).padStart(8, "0")}`;
```

---

## Bước 4: Xây dựng Middleware

### 4.1 `src/middleware/auth.js`

- Đọc header `Authorization: Bearer <token>`
- Verify JWT bằng `jsonwebtoken`
- Gắn `req.user = decoded` để các route dùng

### 4.2 `src/middleware/adminOnly.js`

- Kiểm tra `req.user.ma_role === 1` (QuanLy)
- Trả 403 nếu không phải admin

### 4.3 `src/middleware/errorHandler.js`

- Bắt tất cả lỗi, trả JSON `{ message, stack }`
- Log lỗi ra console

### 4.4 `src/middleware/validate.js`

- Dùng `express-validator` schema
- Trả 400 nếu validation fail

---

## Bước 5: Xây dựng Routes và Controllers

### 5.1 Auth Routes (`/api/auth`)

| Method | Endpoint           | Mô tả                       | Auth  |
| ------ | ------------------ | --------------------------- | ----- |
| POST   | `/register`        | Đăng ký tài khoản           | Không |
| POST   | `/login`           | Đăng nhập → trả JWT         | Không |
| POST   | `/forgot-password` | Gửi email reset             | Không |
| POST   | `/reset-password`  | Đặt lại mật khẩu            | Token |
| GET    | `/me`              | Lấy thông tin user hiện tại | JWT   |

**Controller chính - `login`**:

1. Validate email/password không rỗng
2. Query MySQL: `SELECT * FROM users WHERE email = ?`
3. So sánh password bằng `bcrypt.compare()`
4. Tạo JWT token với `{ ma_user, email, ma_role }`
5. Trả `{ accessToken, user }`

**Controller chính - `register`**:

1. Validate các trường (email đúng format, password >= 6 ký tự)
2. Check email đã tồn tại chưa
3. Hash password bằng `bcrypt.hash()`
4. Insert vào bảng `users` với `ma_role = 2` (KhachHang)
5. Tạo JWT và trả kết quả

### 5.2 Category Routes (`/api/categories`)

| Method | Endpoint | Mô tả                      | Auth  |
| ------ | -------- | -------------------------- | ----- |
| GET    | `/`      | Lấy tất cả danh mục        | Không |
| GET    | `/:slug` | Lấy 1 danh mục theo slug   | Không |
| POST   | `/`      | Tạo danh mục mới           | Admin |
| PUT    | `/:id`   | Cập nhật danh mục          | Admin |
| DELETE | `/:id`   | Xóa danh mục (soft delete) | Admin |

### 5.3 Product Routes (`/api/products`)

| Method | Endpoint | Mô tả                                      | Auth  |
| ------ | -------- | ------------------------------------------ | ----- |
| GET    | `/`      | Lấy ds sản phẩm (filter, sort, phân trang) | Không |
| GET    | `/:slug` | Chi tiết sản phẩm                          | Không |
| POST   | `/`      | Thêm sản phẩm (upload ảnh)                 | Admin |
| PUT    | `/:id`   | Cập nhật sản phẩm                          | Admin |
| DELETE | `/:id`   | Xóa sản phẩm (soft delete)                 | Admin |

**GET `/` query params**: `?page=1&limit=10&category=noi-com-dien&minPrice=500000&maxPrice=2000000&search=nồi cơm&sort=price_asc&featured=1`

### 5.4 Order Routes (`/api/orders`)

| Method | Endpoint      | Mô tả                   | Auth  |
| ------ | ------------- | ----------------------- | ----- |
| POST   | `/`           | Tạo đơn hàng mới        | Không |
| GET    | `/my-orders`  | Đơn hàng của tôi        | JWT   |
| GET    | `/admin`      | Tất cả đơn hàng         | Admin |
| GET    | `/:id`        | Chi tiết 1 đơn hàng     | JWT   |
| PATCH  | `/:id/status` | Cập nhật trạng thái đơn | Admin |
| PATCH  | `/:id/cancel` | Hủy đơn hàng            | JWT   |
| DELETE | `/:id`        | Xóa đơn hàng            | Admin |

**POST `/` (tạo đơn)**:

1. Validate các trường bắt buộc
2. Tạo mã đơn hàng (gọi stored procedure `sp_TaoMaDonHang`)
3. Tính tổng tiền, kiểm tra mã coupon (gọi `sp_KiemTraMaKhuyenMai`)
4. Insert vào `orders`, insert từng item vào `order_items`
5. Trừ tồn kho (gọi `sp_CapNhatTonKho_DatHang`)
6. Tích điểm (gọi `sp_TichDiem`)
7. Trả `{ ma_don_hang, thanh_tien }`

### 5.5 Contact Routes (`/api/contacts`)

| Method | Endpoint     | Mô tả           | Auth  |
| ------ | ------------ | --------------- | ----- |
| POST   | `/`          | Gửi liên hệ     | Không |
| GET    | `/admin`     | Tất cả liên hệ  | Admin |
| PATCH  | `/:id/reply` | Trả lời liên hệ | Admin |

### 5.6 Banner Routes (`/api/banners`)

| Method | Endpoint | Mô tả                      | Auth  |
| ------ | -------- | -------------------------- | ----- |
| GET    | `/`      | Lấy banners đang hoạt động | Không |
| POST   | `/`      | Thêm banner                | Admin |
| PUT    | `/:id`   | Cập nhật banner            | Admin |
| DELETE | `/:id`   | Xóa banner                 | Admin |

### 5.7 Promotion Routes (`/api/promotions`)

| Method | Endpoint    | Mô tả                      | Auth  |
| ------ | ----------- | -------------------------- | ----- |
| GET    | `/`         | Lấy khuyến mãi đang active | Không |
| GET    | `/admin`    | Tất cả khuyến mãi          | Admin |
| POST   | `/`         | Tạo khuyến mãi             | Admin |
| POST   | `/codes`    | Tạo mã coupon              | Admin |
| POST   | `/validate` | Validate coupon            | JWT   |

### 5.8 Review Routes (`/api/reviews`)

| Method | Endpoint              | Mô tả                      | Auth  |
| ------ | --------------------- | -------------------------- | ----- |
| GET    | `/product/:productId` | Lấy đánh giá theo sản phẩm | Không |
| POST   | `/`                   | Thêm đánh giá              | JWT   |
| DELETE | `/:id`                | Xóa đánh giá               | JWT   |

---

## Bước 6: Entry Point và Cấu hình Server

### 6.1 `src/app.js` - Cấu hình Express

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded images)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Không tìm thấy" }));

// Error handler
app.use(require("./middleware/errorHandler"));

module.exports = app;
```

### 6.2 `src/index.js` - Chạy server

```javascript
require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3001;

// Test DB connection trước khi start
pool
  .getConnection()
  .then(() => {
    console.log("✅ MySQL connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  });
```

### 6.3 Cập nhật `package.json` scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

---

## Bước 7: Upload Ảnh (Multer)

Tạo `src/middleware/upload.js` dùng multer:

- Lưu ảnh vào `uploads/products/`
- Giới hạn 5MB, chỉ cho phép `jpg/jpeg/png/webp`
- Tạo thumbnail (tùy chọn, dùng `sharp` library)
- Trả về đường dẫn ảnh để lưu vào MySQL

---

## Bước 8: Gửi Email (Nodemailer)

Tạo `src/services/mail.service.js`:

- Gửi email xác nhận đơn hàng
- Gửi email reset mật khẩu
- Gửi email trả lời liên hệ

---

## Bước 9: Cập nhật Frontend (`src/services/api.js`)

Thay json-server bằng backend thật:

```javascript
// Đổi base URL
const API_URL = "http://localhost:3001/api";

// Thêm Authorization header cho protected routes
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "API request failed");
  }
  return res.json();
}
```

Thêm các hàm API mới:

- `getMyOrders()` - đơn hàng của user đang login
- `cancelOrder(id)` - hủy đơn
- `validateCoupon(code, total)` - kiểm tra coupon
- `getBanners()` - lấy banners
- `getReviews(productId)` - đánh giá sản phẩm
- `forgotPassword(email)` - quên mật khẩu

---

## Bước 10: Chạy thử và kiểm thử

### 10.1 Khởi động MySQL

```bash
mysql -u root -p
```

### 10.2 Chạy migration

```bash
mysql -u root -p camvang < ../database/schema.sql
mysql -u root -p camvang < ../database/procedures.sql
mysql -u root -p camvang < ../database/seed.sql
```

### 10.3 Start backend

```bash
npm run dev
# Server chạy tại http://localhost:3001
```

### 10.4 Test API (dùng Postman hoặc Thunder Client)

1. POST `/api/auth/login` - đăng nhập admin
2. GET `/api/products` - lấy danh sách sản phẩm
3. POST `/api/orders` - tạo đơn hàng
4. GET `/api/orders/admin` - xem tất cả đơn (admin)

---

## Thứ tự triển khai (Đề xuất)

```
Tuần 1:  Bước 1-4  → Setup project + Foundation (config, middleware, utils)
Tuần 2:  Bước 5.1  → Auth routes (login, register, forgot password)
Tuần 3:  Bước 5.2  → Category + Product routes
Tuần 4:  Bước 5.3  → Order routes (tạo đơn, cập nhật trạng thái, tích điểm)
Tuần 5:  Bước 5.4  → Banner, Promotion, Contact, Review
Tuần 6:  Bước 6-7  → Server entry point + Upload ảnh + Email
Tuần 7:  Bước 8-9  → Kết nối frontend với backend thật
Tuần 8:  Bước 10   → Test toàn bộ hệ thống
```
