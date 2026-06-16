const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken, adminOnly, adminOrManager } = require('../middleware/auth');

// Public
router.post('/validate', couponController.validateCoupon);

// Admin/Manager
router.get('/', verifyToken, adminOrManager, couponController.getAllCoupons);
router.get('/:id', verifyToken, adminOrManager, couponController.getCouponById);
router.post('/', verifyToken, adminOnly, couponController.createCoupon);
router.put('/:id', verifyToken, adminOnly, couponController.updateCoupon);
router.delete('/:id', verifyToken, adminOnly, couponController.deleteCoupon);

module.exports = router;
