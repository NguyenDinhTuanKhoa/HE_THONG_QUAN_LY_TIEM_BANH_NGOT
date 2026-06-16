const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken, adminOrManager } = require('../middleware/auth');

// Public — gửi liên hệ từ form
router.post('/', messageController.createMessage);

// Admin
router.get('/', verifyToken, adminOrManager, messageController.getAllMessages);
router.get('/:id', verifyToken, adminOrManager, messageController.getMessageById);
router.patch('/:id/status', verifyToken, adminOrManager, messageController.updateStatus);
router.post('/:id/reply', verifyToken, adminOrManager, messageController.replyMessage);
router.delete('/:id', verifyToken, adminOrManager, messageController.deleteMessage);

module.exports = router;
