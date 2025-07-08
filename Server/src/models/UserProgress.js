const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  odd: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ODD',
    required: true
  },
  completedChallenges: {
    type: Number,
    default: 0,
    min: 0
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  badgeEarned: {
    type: Boolean,
    default: false
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user-odd uniqueness
userProgressSchema.index({ user: 1, odd: 1 }, { unique: true });
userProgressSchema.index({ points: -1 });

// Static method to update progress
userProgressSchema.statics.updateProgress = async function(userId, oddId, challengePoints) {
  let progress = await this.findOne({ user: userId, odd: oddId });
  
  if (!progress) {
    progress = new this({
      user: userId,
      odd: oddId,
      completedChallenges: 0,
      points: 0
    });
  }
  
  progress.completedChallenges += 1;
  progress.points += challengePoints;
  progress.lastActivityAt = new Date();
  
  await progress.save();
  return progress;
};

// Static method to get leaderboard by ODD
userProgressSchema.statics.getLeaderboardByODD = function(oddId, limit = 10) {
  return this.find({ odd: oddId })
    .populate('user', 'username avatar')
    .sort({ points: -1 })
    .limit(limit);
};

// Method to mark badge as earned
userProgressSchema.methods.markBadgeEarned = function() {
  this.badgeEarned = true;
  return this.save();
};

module.exports = mongoose.model('UserProgress', userProgressSchema);