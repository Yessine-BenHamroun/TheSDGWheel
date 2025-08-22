const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  question: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1000
  },
  choices: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'There must be exactly 4 choices']
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  associatedODD: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ODD',
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
quizSchema.index({ associatedODD: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ isActive: 1 });

// Static method to get random quiz by ODD
quizSchema.statics.getRandomByODD = function(oddId) {
  return this.aggregate([
    { $match: { associatedODD: oddId, isActive: true } },
    { $sample: { size: 1 } }
  ]).then(results => results[0] || null);
};

module.exports = mongoose.model('Quiz', quizSchema); 