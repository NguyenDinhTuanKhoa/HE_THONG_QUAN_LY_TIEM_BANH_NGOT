const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyCustomerToken } = require('../middleware/auth');

// Đăng ký / đăng nhập khách hàng (public)
router.post('/register', customerController.register);
router.post('/login', customerController.login);

// Thông tin + cập nhật hồ sơ (cần token Bearer)
router.get('/me', verifyCustomerToken, customerController.getMe);
router.patch('/me', verifyCustomerToken, customerController.updateMe);

// Đơn hàng của khách đăng nhập
router.get('/me/orders', verifyCustomerToken, require('../controllers/orderController').getCustomerOrders);
router.get('/me/orders/:id', verifyCustomerToken, require('../controllers/orderController').getCustomerOrderById);

module.exports = router;
