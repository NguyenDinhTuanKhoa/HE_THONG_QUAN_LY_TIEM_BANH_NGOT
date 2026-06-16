// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', verifyToken, checkRole(['admin']), productController.createProduct);
router.put('/:id', verifyToken, checkRole(['admin']), productController.updateProduct);
router.delete('/:id', verifyToken, checkRole(['admin']), productController.deleteProduct);

// Update stock (Admin/Staff)
router.patch('/:id/stock', verifyToken, checkRole(['admin', 'staff']), productController.updateStock);

module.exports = router;
