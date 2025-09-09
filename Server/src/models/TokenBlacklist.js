const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    enum: ['logout', 'security', 'password_change', 'password_reset', 'account_deactivation'],
    default: 'logout'
  }
}, {
  timestamps: true
});

// Index for automatic document deletion when token expires
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index for fast token lookups
tokenBlacklistSchema.index({ token: 1 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
