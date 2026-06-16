// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post('/', verifyToken, checkRole(['admin']), categoryController.createCategory);
router.put('/:id', verifyToken, checkRole(['admin']), categoryController.updateCategory);
router.delete('/:id', verifyToken, checkRole(['admin']), categoryController.deleteCategory);

module.exports = router;
