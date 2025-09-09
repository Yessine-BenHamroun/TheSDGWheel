const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proof',
    required: true
  },
  points: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Ensure one vote per user per proof
voteSchema.index({ user: 1, proof: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
