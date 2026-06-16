const db = require('../config/db');

exports.findByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM accounts WHERE email = ?', [email]);
  return rows[0]; // trả về 1 account nếu tìm thấy
};

exports.findByUsername = async (username) => {
  const [rows] = await db.execute('SELECT * FROM accounts WHERE username = ?', [username]);
  return rows[0]; // trả về 1 account nếu tìm thấy
};

exports.getAll = async () => {
  const [rows] = await db.execute('SELECT id, username, email, role, status, created_at FROM accounts');
  return rows;
};