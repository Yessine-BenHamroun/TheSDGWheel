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

module.exports = mongoose.model('Quiz', quizSchema); 