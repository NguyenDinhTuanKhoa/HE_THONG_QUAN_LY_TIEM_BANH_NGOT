// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { uploadSingle, cleanupOnError } = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', verifyToken, checkRole(['admin']), productController.createProduct);
router.put('/:id', verifyToken, checkRole(['admin']), productController.updateProduct);
router.delete('/:id', verifyToken, checkRole(['admin']), productController.deleteProduct);

// Update stock (Admin/Staff)
router.patch('/:id/stock', verifyToken, checkRole(['admin', 'staff']), productController.updateStock);

// Image upload (Admin)
router.post(
  '/upload-image',
  verifyToken,
  checkRole(['admin']),
  uploadSingle('featured_image'),
  cleanupOnError,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên.' });
    }
    res.json({ success: true, url: req.file.url, filename: req.file.filename });
  }
);

module.exports = router;
