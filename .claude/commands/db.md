Kiểm tra trạng thái database MySQL của dự án Sweet Bakery (DB: `qlchbn`).

Dùng lệnh: `"/c/xampp/mysql/bin/mysql.exe" -u root qlchbn`

Thực hiện lần lượt:
1. `SHOW TABLES;` — liệt kê tất cả bảng
2. Với mỗi bảng quan trọng (accounts, customers, products, categories, orders), chạy `SELECT COUNT(*) FROM <table>;` để đếm số bản ghi
3. Hiển thị kết quả dạng bảng markdown gọn gàng

Nếu mysql.exe không tìm thấy ở `/c/xampp/`, thử `/d/xampp/` hoặc hỏi user đường dẫn XAMPP.
