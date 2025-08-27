const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'user_registration',
      'challenge_completion',
      'challenge_accepted',
      'challenge_declined',
      'proof_validation',
      'proof_submitted',
      'proof_verified',
      'proof_rejected',
      'wheel_spin',
      'quiz_completion',
      'community_vote',
      'badge_earned',
      'admin_action',
      'system_action',
    ],
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true },
  details: { type: String },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel', required: false },
  targetModel: { type: String, required: false },
  points: { type: Number },
  score: { type: Number },
  badge: { type: String },
  ip: { type: String },
  old: { type: Object },
  updated: { type: Object },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 