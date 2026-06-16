const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, adminOnly, adminOrManager } = require('../middleware/auth');

// Settings
router.get('/settings', settingsController.getPublicSettings);
router.get('/settings/all', verifyToken, adminOrManager, settingsController.getAllSettings);
router.put('/settings', verifyToken, adminOnly, settingsController.updateSettings);

// Dashboard & Reports (admin)
router.get('/dashboard/stats', verifyToken, adminOrManager, dashboardController.getStats);
router.get('/reports', verifyToken, adminOrManager, dashboardController.getReports);

module.exports = router;
