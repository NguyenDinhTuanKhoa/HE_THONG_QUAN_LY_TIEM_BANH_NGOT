Build frontend của dự án Sweet Bakery cho production.

1. Kiểm tra file `frontend/.env` hoặc `frontend/.env.production` có tồn tại không — nếu thiếu `VITE_API_URL`, cảnh báo user.
2. Chạy: `cd frontend && npm run build`
3. Sau khi build xong, kiểm tra thư mục `frontend/dist/` có tồn tại và có file không.
4. Báo cáo kích thước bundle (dùng `du -sh frontend/dist/`).
5. Nhắc user: để serve production build locally có thể dùng `npm run preview`.
