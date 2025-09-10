const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public route - Submit contact message
router.post('/submit', messageController.submitMessage);

// Admin routes - require authentication and admin privileges
router.get('/', authenticateToken, requireAdmin, messageController.getAllMessages);
router.get('/:id', authenticateToken, requireAdmin, messageController.getMessageById);
router.post('/:id/reply', authenticateToken, requireAdmin, messageController.replyToMessage);
router.patch('/:id/status', authenticateToken, requireAdmin, messageController.updateMessageStatus);
router.patch('/:id/read', authenticateToken, requireAdmin, messageController.toggleReadStatus);
router.delete('/:id', authenticateToken, requireAdmin, messageController.deleteMessage);

module.exports = router;
