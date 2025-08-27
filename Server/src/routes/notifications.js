const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticateToken);

// Get user's notifications with pagination
router.get('/', notificationController.getUserNotifications);

// Get unread notifications count
router.get('/unread/count', notificationController.getUnreadCount);

// Get unread notifications
router.get('/unread', notificationController.getUnreadNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
