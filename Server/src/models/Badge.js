const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true
  },
  requiredPoints: {
    type: Number,
    required: true,
    min: 1
  },
  associatedODD: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ODD',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  earnedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for performance
badgeSchema.index({ associatedODD: 1 });
badgeSchema.index({ requiredPoints: 1 });
badgeSchema.index({ isActive: 1 });

// Static method to check eligibility
badgeSchema.statics.checkEligibility = async function(userId, oddId) {
  const UserProgress = require('./UserProgress');
  
  const progress = await UserProgress.findOne({ user: userId, odd: oddId });
  if (!progress) return [];
  
  return this.find({
    associatedODD: oddId,
    requiredPoints: { $lte: progress.points },
    isActive: true
  }).sort({ requiredPoints: 1 });
};

// Method to award to user
badgeSchema.methods.awardToUser = async function(userId) {
  const UserBadge = require('./UserBadge');
  
  // Check if user already has this badge
  const existingBadge = await UserBadge.findOne({
    user: userId,
    badge: this._id
  });
  
  if (existingBadge) {
    throw new Error('User already has this badge');
  }
  
  // Create user badge record
  await UserBadge.create({
    user: userId,
    badge: this._id
  });
  
  // Increment earned count
  this.earnedCount += 1;
  await this.save();
  
  return true;
};

module.exports = mongoose.model('Badge', badgeSchema);