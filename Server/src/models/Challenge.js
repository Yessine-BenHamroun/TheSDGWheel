const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  associatedODD: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ODD',
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 25,
    min: 1,
    max: 100
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for performance
challengeSchema.index({ associatedODD: 1 });
challengeSchema.index({ type: 1 });
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ isActive: 1 });

// Static method to get random challenge by ODD
challengeSchema.statics.getRandomByODD = function(oddId) {
  return this.aggregate([
    { $match: { associatedODD: oddId, isActive: true } },
    { $sample: { size: 1 } }
  ]).then(results => results[0] || null);
};

// Method to increment completion count
challengeSchema.methods.incrementCompletion = function() {
  this.completionCount += 1;
  return this.save();
};

module.exports = mongoose.model('Challenge', challengeSchema);