const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId to socket.id
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        const User = require('../models/User');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`🔌 User ${socket.user.username} connected (${socket.id})`);
      
      // Store user socket mapping
      this.userSockets.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Handle user requesting unread notifications count
      socket.on('get_unread_count', async () => {
        try {
          const Notification = require('../models/Notification');
          const count = await Notification.getUnreadCount(socket.userId);
          socket.emit('unread_count', { count });
        } catch (error) {
          console.error('Error getting unread count:', error);
        }
      });

      // Handle user requesting unread notifications
      socket.on('get_unread_notifications', async () => {
        try {
          const Notification = require('../models/Notification');
          const notifications = await Notification.getUnreadNotifications(socket.userId);
          socket.emit('unread_notifications', { notifications });
        } catch (error) {
          console.error('Error getting unread notifications:', error);
        }
      });

      // Handle marking notification as read
      socket.on('mark_notification_read', async (data) => {
        try {
          const { notificationId } = data;
          const Notification = require('../models/Notification');
          
          const notification = await Notification.findOne({
            _id: notificationId,
            user: socket.userId
          });

          if (notification) {
            await notification.markAsRead();
            
            // Send updated unread count
            const count = await Notification.getUnreadCount(socket.userId);
            socket.emit('unread_count', { count });
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      });

      // Handle marking all notifications as read
      socket.on('mark_all_notifications_read', async () => {
        try {
          const Notification = require('../models/Notification');
          await Notification.markAllAsRead(socket.userId);
          
          socket.emit('unread_count', { count: 0 });
          socket.emit('all_notifications_read');
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.user.username} disconnected (${socket.id})`);
        this.userSockets.delete(socket.userId);
      });
    });

    console.log('🔌 Socket.IO server initialized');
  }

  // Send notification to specific user
  async sendNotificationToUser(userId, notification) {
    try {
      const userRoom = `user_${userId}`;
      
      // Send the notification
      this.io.to(userRoom).emit('new_notification', {
        notification,
        timestamp: new Date()
      });

      // Send updated unread count
      const Notification = require('../models/Notification');
      const count = await Notification.getUnreadCount(userId);
      this.io.to(userRoom).emit('unread_count', { count });

      console.log(`📢 Notification sent to user ${userId}:`, notification.title);
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  // Send notification to multiple users
  async sendNotificationToUsers(userIds, notification) {
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
    }
  }

  // Broadcast to all connected users
  async broadcastNotification(notification) {
    this.io.emit('broadcast_notification', {
      notification,
      timestamp: new Date()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId.toString());
  }
}

// Export singleton instance
module.exports = new SocketService();
