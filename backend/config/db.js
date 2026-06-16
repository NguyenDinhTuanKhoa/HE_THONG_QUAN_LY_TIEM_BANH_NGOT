// config/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  // XAMPP mặc định user 'root' có mật khẩu rỗng -> dùng ?? để không nuốt chuỗi rỗng
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'qlchbn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise(); // ✅ Rất quan trọng