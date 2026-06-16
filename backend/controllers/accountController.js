const db = require('../config/db');
const bcrypt = require('bcryptjs');
const Account = require('../models/accountModel');

// Xóa hàm register

// Thêm hàm lấy tất cả tài khoản
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.getAll();
    res.status(200).json({ accounts });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài khoản:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
// het