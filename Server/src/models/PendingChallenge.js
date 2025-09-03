const mongoose = require('mongoose');

const pendingChallengeSchema = new mongoose.Schema({
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
  dailySpin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailySpin',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROOF_SUBMITTED', 'VERIFIED', 'REJECTED', 'DECLINED'],
    default: 'PENDING'
  },
  acceptedAt: {
    type: Date,
    default: Date.now
  },
  proofSubmittedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  proof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proof'
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for performance
pendingChallengeSchema.index({ user: 1, status: 1 });
pendingChallengeSchema.index({ challenge: 1 });
pendingChallengeSchema.index({ status: 1 });

// Static method to get user's pending challenges (including recent completed ones)
pendingChallengeSchema.statics.getUserPendingChallenges = function(userId) {
  // Get all active challenges (PENDING, PROOF_SUBMITTED) and recent completed ones (VERIFIED, REJECTED from last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return this.find({
    user: userId,
    $or: [
      // Active challenges
      { status: { $in: ['PENDING', 'PROOF_SUBMITTED'] } },
      // Recent completed challenges (last 7 days)
      {
        status: { $in: ['VERIFIED', 'REJECTED'] },
        updatedAt: { $gte: sevenDaysAgo }
      }
    ]
  }).populate([
    { path: 'challenge', select: 'title description points' },
    { path: 'proof' }
  ]).sort({ updatedAt: -1 });
};

// Static method to accept a challenge
pendingChallengeSchema.statics.acceptChallenge = async function(dailySpinId, userId) {
  // Check if challenge exists for this daily spin
  const existingChallenge = await this.findOne({
    dailySpin: dailySpinId,
    user: userId
  });
  
  if (existingChallenge) {
    return existingChallenge;
  }
  
  // Get the daily spin to find the challenge
  const DailySpin = require('./DailySpin');
  const dailySpin = await DailySpin.findById(dailySpinId).populate('challengeId');
  
  if (!dailySpin || dailySpin.scenarioType !== 'CHALLENGE') {
    throw new Error('Invalid challenge or daily spin');
  }
  
  // Create new pending challenge
  return await this.create({
    user: userId,
    challenge: dailySpin.challengeId,
    dailySpin: dailySpinId,
    status: 'PENDING'
  });
};

// Method to submit proof
pendingChallengeSchema.methods.submitProof = function(proofId) {
  this.proof = proofId;
  this.status = 'PROOF_SUBMITTED';
  this.proofSubmittedAt = new Date();
  return this.save();
};

// Method to verify challenge completion
pendingChallengeSchema.methods.verify = function(adminNotes = '') {
  this.status = 'VERIFIED';
  this.verifiedAt = new Date();
  this.pointsAwarded = 20; // Standard points for challenge completion
  if (adminNotes) this.adminNotes = adminNotes;
  return this.save();
};

// Method to reject challenge completion
pendingChallengeSchema.methods.reject = function(adminNotes = '') {
  this.status = 'REJECTED';
  this.pointsAwarded = 0;
  if (adminNotes) this.adminNotes = adminNotes;
  return this.save();
};

module.exports = mongoose.model('PendingChallenge', pendingChallengeSchema);
