# 🧁 Quản Lý Tiệm Bánh Ngọt

Hệ thống quản lý tiệm bánh ngọt — full-stack:

- **Frontend**: React 19 + Vite + React Router
- **Backend**: Node.js + Express + MySQL (mysql2)
- **Database**: MySQL (chạy qua **XAMPP**)

## 📁 Cấu trúc dự án

```
.
├── frontend/        # React + Vite (cổng 5173)
├── backend/         # Node.js + Express API (cổng 5000)
├── database/        # qlchbn.sql (schema + dữ liệu mẫu)
├── thesis/          # Tài liệu báo cáo
└── progress-report/
```

---

## 🚀 Cách chạy dự án

### Yêu cầu
- [Node.js](https://nodejs.org/) (>= 18)
- [XAMPP](https://www.apachefriends.org/) (dùng MySQL)

### Bước 1 — Database (XAMPP)
1. Mở **XAMPP Control Panel** → **Start** module **MySQL**.
2. Vào phpMyAdmin: http://localhost/phpmyadmin
3. Tab **Import** → chọn file `database/qlchbn.sql` → **Go**.
   File sẽ tự tạo database `qlchbn` cùng toàn bộ bảng và dữ liệu mẫu.

> Mặc định backend kết nối MySQL bằng user `root`, mật khẩu rỗng, cổng `3306`
> (cấu hình XAMPP mặc định). Nếu bạn đặt khác, sửa trong `backend/.env`.

### Bước 2 — Backend (terminal 1)
```bash
cd backend
npm install
npm run dev
```
→ API chạy tại http://localhost:5000

### Bước 3 — Frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev
```
→ Web chạy tại http://localhost:5173

---

## 🔑 Tài khoản đăng nhập mẫu

### Admin / Nhân viên — http://localhost:5173/admin/login
| Vai trò | Username | Mật khẩu |
|---------|----------|----------|
| Admin | `admin` | `admin123` |
| Quản lý | `quanly` | `quanly123` |
| Nhân viên | `nhanvien1` | `nhanvien123` |

### Khách hàng — http://localhost:5173/customer/login
| Email | Mật khẩu |
|-------|----------|
| `customer1@gmail.com` | `customer123` |
| `customer2@gmail.com` | `customer123` |

---

## ⚙️ Cấu hình

- **Backend** (`backend/.env`): cổng, thông tin MySQL, JWT, CORS. Tham khảo `backend/.env.example`.
- **Frontend** (`frontend/.env.development`): `VITE_API_URL` trỏ tới backend (mặc định `http://localhost:5000/api`).

## 🔧 Lỗi thường gặp

1. **Backend không kết nối được MySQL** — kiểm tra MySQL trong XAMPP đã Start chưa, và `backend/.env` khớp cấu hình (user `root`, mật khẩu rỗng, cổng `3306`).
2. **Cổng bị chiếm** — đổi `PORT` trong `backend/.env` hoặc cổng Vite trong `frontend/vite.config.js`.
3. **Frontend gọi API lỗi CORS** — đảm bảo backend đang chạy và `CORS_ORIGIN` trong `backend/.env` là `http://localhost:5173`.
