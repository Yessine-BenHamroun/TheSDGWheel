const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'PROOF_APPROVED',
      'PROOF_REJECTED',
      'CHALLENGE_COMPLETED',
      'BADGE_EARNED',
      'LEVEL_UP',
      'SYSTEM_ANNOUNCEMENT'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // For storing additional data like points, challenge info, etc.
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}, priority = 'MEDIUM') {
  return await this.create({
    user: userId,
    type,
    title,
    message,
    data,
    priority
  });
};

// Static method to get user's unread notifications
notificationSchema.statics.getUnreadNotifications = function(userId) {
  return this.find({
    user: userId,
    isRead: false
  }).sort({ createdAt: -1 });
};

// Static method to get user's notifications with pagination
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({
    user: userId
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    user: userId,
    isRead: false
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to delete old read notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 7) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
