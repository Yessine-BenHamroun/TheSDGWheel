const mongoose = require('mongoose');

const proofSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['IMAGE', 'VIDEO', 'DOCUMENT']
  },
  url: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  votes: {
    type: Number,
    default: 0,
    min: 0
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Custom validation to ensure either url or description is provided
proofSchema.pre('validate', function(next) {
  if (!this.url && (!this.description || this.description.trim() === '')) {
    this.invalidate('proof', 'Either file upload (url) or description is required');
  }
  next();
});

// Index for performance
proofSchema.index({ user: 1 });
proofSchema.index({ challenge: 1 });
proofSchema.index({ status: 1 });
proofSchema.index({ createdAt: -1 });

// Compound index for user-challenge uniqueness
proofSchema.index({ user: 1, challenge: 1 }, { unique: true });

// Static method to get pending proofs
proofSchema.statics.getPendingProofs = function() {
  return this.find({ status: 'PENDING' })
    .populate('user', 'username avatar')
    .populate('challenge', 'title points')
    .sort({ createdAt: 1 });
};

// Static method to get approved proofs for audit/logs
proofSchema.statics.getApprovedProofs = function(filters = {}) {
  return this.find({ status: 'APPROVED', ...filters })
    .populate('user', 'username avatar email')
    .populate('challenge', 'title points associatedODD')
    .populate('reviewedBy', 'username')
    .sort({ reviewedAt: -1 });
};

// Method to add vote
proofSchema.methods.addVote = function(userId) {
  if (this.voters.includes(userId)) {
    throw new Error('User has already voted for this proof');
  }
  
  this.voters.push(userId);
  this.votes += 1;
  return this.save();
};

// Method to update status
proofSchema.methods.updateStatus = function(status, rejectionReason = null, reviewerId = null) {
  this.status = status;
  this.reviewedAt = new Date();
  
  if (reviewerId) {
    this.reviewedBy = reviewerId;
  }
  
  if (status === 'REJECTED' && rejectionReason) {
    this.rejectionReason = rejectionReason;
  }
  
  return this.save();
};

module.exports = mongoose.model('Proof', proofSchema);