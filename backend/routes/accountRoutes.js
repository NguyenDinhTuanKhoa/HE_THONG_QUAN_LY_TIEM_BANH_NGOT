const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Xóa route đăng ký và thay thế bằng route lấy danh sách tài khoản cho admin
router.get('/', verifyToken, checkRole(['admin']), accountController.getAllAccounts);

module.exports = router;
