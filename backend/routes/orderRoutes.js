// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyCustomerToken, checkRole } = require('../middleware/auth');

// Admin/Staff routes
router.get('/', verifyToken, checkRole(['admin', 'staff']), orderController.getAllOrders);
router.get('/:id', verifyToken, checkRole(['admin', 'staff']), orderController.getOrderById);
router.put('/:id/status', verifyToken, checkRole(['admin', 'staff']), orderController.updateOrderStatus);

// Customer routes
router.post('/', verifyCustomerToken, orderController.createOrder);
router.get('/customer/my-orders', verifyCustomerToken, orderController.getCustomerOrders);
router.get('/customer/:id', verifyCustomerToken, orderController.getCustomerOrderById);

// Admin only routes
router.delete('/:id', verifyToken, checkRole(['admin']), orderController.deleteOrder);

module.exports = router;
