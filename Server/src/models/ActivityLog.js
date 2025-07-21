const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true },
  details: { type: String },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel', required: false },
  targetModel: { type: String, required: false },
  points: { type: Number },
  score: { type: Number },
  badge: { type: String },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 