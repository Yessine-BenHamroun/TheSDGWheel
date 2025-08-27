const Notification = require('../models/Notification');

// Get user's notifications with pagination
const getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const notifications = await Notification.getUserNotifications(userId, parseInt(page), parseInt(limit));
    const unreadCount = await Notification.getUnreadCount(userId);
    const totalCount = await Notification.countDocuments({ user: userId });

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasMore: totalCount > parseInt(page) * parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);
    
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsRead();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    await Notification.markAllAsRead(userId);
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// Get unread notifications (for real-time updates)
const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.getUnreadNotifications(userId);
    
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadNotifications
};
