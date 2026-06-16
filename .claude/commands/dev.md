Start cả backend lẫn frontend của dự án Sweet Bakery.

1. Kiểm tra xem port 5000 (backend) và 5173 (frontend) có đang bị chiếm không bằng `netstat -ano`.
2. Hướng dẫn user chạy **backend**: `cd backend && node server.js`
3. Hướng dẫn user chạy **frontend**: `cd frontend && npm run dev`
4. Nhắc user mở trình duyệt tại `http://localhost:5173` khi cả hai server đã sẵn sàng.

Nếu port đang bị chiếm, báo rõ PID nào đang giữ port và cách kill nó trên Windows.
