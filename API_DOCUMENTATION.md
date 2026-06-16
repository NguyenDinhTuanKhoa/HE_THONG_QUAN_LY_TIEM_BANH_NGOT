# 📚 API Documentation - Quản Lý Tiệm Bánh

## 🌐 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication
Sử dụng JWT Token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 **1. AUTH ENDPOINTS**

### 🔑 Login Admin/Staff
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1000,
      "username": "admin",
      "email": "admin@tiembanh.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 🔑 Login Customer
```http
POST /api/auth/customer/login
Content-Type: application/json

{
  "email": "customer1@gmail.com",
  "password": "customer123"
}
```

---

## 👥 **2. ACCOUNTS ENDPOINTS**

### 📋 Get All Accounts (Admin Only)
```http
GET /api/accounts
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách tài khoản thành công",
  "data": [
    {
      "id": 1000,
      "username": "admin",
      "email": "admin@tiembanh.com",
      "role": "admin",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### ➕ Create Account (Admin Only)
```http
POST /api/accounts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "nhanvien_new",
  "email": "nhanvien_new@tiembanh.com",
  "password": "password123",
  "role": "staff",
  "full_name": "Nhân Viên Mới"
}
```

### ✏️ Update Account (Admin Only)
```http
PUT /api/accounts/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "nhanvien_updated",
  "email": "updated@tiembanh.com",
  "role": "manager",
  "status": "active"
}
```

### 🗑️ Delete Account (Admin Only)
```http
DELETE /api/accounts/:id
Authorization: Bearer <admin_token>
```

---

## 🛍️ **3. PRODUCTS ENDPOINTS**

### 📋 Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số sản phẩm mỗi trang (default: 10)
- `category_id`: Lọc theo danh mục
- `search`: Tìm kiếm theo tên
- `status`: Lọc theo trạng thái (active, inactive)

```http
GET /api/products?page=1&limit=10&category_id=1&search=bánh&status=active
```

### 🔍 Get Product by ID
```http
GET /api/products/:id
```

### ➕ Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Bánh Chocolate",
  "description": "Bánh chocolate thơm ngon",
  "short_description": "Bánh chocolate",
  "price": 150000,
  "sale_price": 120000,
  "stock_quantity": 50,
  "category_id": 1,
  "sku": "CHOCO001",
  "status": "active"
}
```

### ✏️ Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Bánh Chocolate Updated",
  "price": 160000,
  "stock_quantity": 45
}
```

### 🗑️ Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

---

## 📂 **4. CATEGORIES ENDPOINTS**

### 📋 Get All Categories
```http
GET /api/categories
```

### ➕ Create Category (Admin Only)
```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Bánh Mới",
  "description": "Danh mục bánh mới",
  "status": "active"
}
```

### ✏️ Update Category (Admin Only)
```http
PUT /api/categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Bánh Cập Nhật",
  "description": "Mô tả cập nhật"
}
```

### 🗑️ Delete Category (Admin Only)
```http
DELETE /api/categories/:id
Authorization: Bearer <admin_token>
```

---

## 🛒 **5. ORDERS ENDPOINTS**

### 📋 Get All Orders (Admin/Staff)
```http
GET /api/orders
Authorization: Bearer <admin_or_staff_token>
```

**Query Parameters:**
- `page`: Số trang
- `limit`: Số đơn hàng mỗi trang
- `status`: Lọc theo trạng thái
- `customer_id`: Lọc theo khách hàng
- `date_from`: Từ ngày (YYYY-MM-DD)
- `date_to`: Đến ngày (YYYY-MM-DD)

### 🔍 Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### ➕ Create Order (Customer)
```http
POST /api/orders
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "customer_name": "Nguyễn Văn A",
  "customer_email": "customer@gmail.com",
  "customer_phone": "0987654321",
  "customer_address": "123 ABC Street",
  "delivery_method": "delivery",
  "payment_method": "cash",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 150000
    }
  ],
  "subtotal": 300000,
  "total_amount": 320000,
  "notes": "Ghi chú đơn hàng"
}
```

### ✏️ Update Order Status (Admin/Staff)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_or_staff_token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Order Status Values:**
- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận
- `preparing`: Đang chuẩn bị
- `ready`: Sẵn sàng
- `delivering`: Đang giao
- `delivered`: Đã giao
- `cancelled`: Đã hủy

---

## 👥 **6. CUSTOMERS ENDPOINTS**

### 📋 Get All Customers (Admin Only)
```http
GET /api/customers
Authorization: Bearer <admin_token>
```

### 🔍 Get Customer by ID (Admin Only)
```http
GET /api/customers/:id
Authorization: Bearer <admin_token>
```

### ➕ Register Customer
```http
POST /api/customers/register
Content-Type: application/json

{
  "email": "newcustomer@gmail.com",
  "password": "password123",
  "full_name": "Khách Hàng Mới",
  "phone": "0987654321",
  "address": "123 XYZ Street"
}
```

---

## 🎫 **7. COUPONS ENDPOINTS**

### 📋 Get All Coupons (Admin Only)
```http
GET /api/coupons
Authorization: Bearer <admin_token>
```

### ➕ Create Coupon (Admin Only)
```http
POST /api/coupons
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "DISCOUNT20",
  "name": "Giảm giá 20%",
  "description": "Giảm 20% cho đơn hàng từ 200k",
  "type": "percentage",
  "value": 20,
  "minimum_amount": 200000,
  "usage_limit": 100,
  "valid_from": "2024-01-01T00:00:00.000Z",
  "valid_until": "2024-12-31T23:59:59.000Z"
}
```

---

## 💬 **8. MESSAGES ENDPOINTS**

### 📋 Get All Messages (Admin/Staff)
```http
GET /api/messages
Authorization: Bearer <admin_or_staff_token>
```

### ➕ Create Message (Customer)
```http
POST /api/messages
Content-Type: application/json

{
  "customer_name": "Nguyễn Văn A",
  "customer_email": "customer@gmail.com",
  "customer_phone": "0987654321",
  "subject": "Góp ý về sản phẩm",
  "message": "Tôi muốn góp ý về chất lượng bánh...",
  "type": "suggestion"
}
```

---

## 📊 **9. REPORTS ENDPOINTS**

### 📈 Get Sales Report (Admin Only)
```http
GET /api/reports/sales
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `date_from`: Từ ngày (YYYY-MM-DD)
- `date_to`: Đến ngày (YYYY-MM-DD)
- `group_by`: Nhóm theo (day, month, year)

```http
GET /api/reports/sales?date_from=2024-01-01&date_to=2024-01-31&group_by=day
```

---

## ⚙️ **10. SETTINGS ENDPOINTS**

### 📋 Get Website Settings
```http
GET /api/settings
```

### ✏️ Update Settings (Admin Only)
```http
PUT /api/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "site_name": "Tiệm Bánh Ngọt ABC",
  "contact_email": "contact@tiembanh.com",
  "contact_phone": "0123456789"
}
```

---

## 🔍 **11. HEALTH CHECK**

### ❤️ Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## 🧪 **POSTMAN TESTING GUIDE**

### 1. **Setup Environment**
Tạo Environment trong Postman với variables:
- `base_url`: `http://localhost:5000/api`
- `admin_token`: (sẽ set sau khi login)
- `customer_token`: (sẽ set sau khi login)

### 2. **Test Flow**
1. **Login Admin**: POST `/auth/login` → Lưu token vào `admin_token`
2. **Get Accounts**: GET `/accounts` với `admin_token`
3. **Create Product**: POST `/products` với `admin_token`
4. **Login Customer**: POST `/auth/customer/login` → Lưu token vào `customer_token`
5. **Create Order**: POST `/orders` với `customer_token`

### 3. **Common Headers**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### 4. **Error Responses**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // Optional validation errors
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
