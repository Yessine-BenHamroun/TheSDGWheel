const mongoose = require('mongoose');

const dailySpinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  spinCount: {
    type: Number,
    default: 0,
    max: 1 // Only 1 spin per day
  },
  lastSpinAt: {
    type: Date
  },
  selectedODD: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ODD'
  },
  scenarioType: {
    type: String,
    enum: ['QUIZ', 'CHALLENGE'],
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  quizAnswer: {
    type: Number, // The user's answer choice (0-3)
    min: 0,
    max: 3
  },
  isQuizCorrect: {
    type: Boolean
  },
  challengeAccepted: {
    type: Boolean
  },
  challengeCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure one spin per user per day
dailySpinSchema.index({ 
  user: 1, 
  date: 1 
}, { 
  unique: true,
  partialFilterExpression: { spinCount: { $gte: 1 } }
});

// Static method to check if user can spin today
dailySpinSchema.statics.canUserSpinToday = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysSpin = await this.findOne({
    user: userId,
    date: { $gte: today, $lt: tomorrow },
    spinCount: { $gte: 1 }
  });
  
  return !todaysSpin;
};

// Static method to get today's spin for user
dailySpinSchema.statics.getTodaysSpin = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await this.findOne({
    user: userId,
    date: { $gte: today, $lt: tomorrow }
  }).populate(['selectedODD', 'quizId', 'challengeId']);
};

// Static method to create or update today's spin
dailySpinSchema.statics.recordSpin = async function(userId, oddId, scenarioType, itemId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const spinData = {
    user: userId,
    date: today,
    selectedODD: oddId,
    scenarioType: scenarioType,
    spinCount: 1,
    lastSpinAt: new Date()
  };
  
  if (scenarioType === 'QUIZ') {
    spinData.quizId = itemId;
  } else {
    spinData.challengeId = itemId;
  }
  
  return await this.findOneAndUpdate(
    { user: userId, date: today },
    spinData,
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('DailySpin', dailySpinSchema);
