const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateLogin = require('../middleware/validateLogin');
const { auth: authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, validateLogin, authController.login);

// Forgot / reset password (stub — tích hợp email service sau)
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email là bắt buộc.' });
  // TODO: tạo token, lưu DB, gọi emailService.sendPasswordReset(email, token)
  res.json({ success: true, message: 'Nếu email tồn tại, hướng dẫn đặt lại đã được gửi.' });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token và mật khẩu mới là bắt buộc.' });
  // TODO: xác thực token, cập nhật mật khẩu
  res.json({ success: true, message: 'Mật khẩu đã được cập nhật.' });
});

module.exports = router;