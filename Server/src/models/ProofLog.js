const mongoose = require('mongoose');

const proofLogSchema = new mongoose.Schema({
  originalProofId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proof',
    required: true
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    required: true
  },
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
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  reviewNotes: {
    type: String
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actions: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: String
  }]
}, {
  timestamps: true
});

// Static method to create ProofLog from Proof
proofLogSchema.statics.createFromProof = async function(proof, status, metadata = {}) {
  try {
    const proofLog = new this({
      originalProofId: proof._id,
      status: status,
      user: proof.user,
      challenge: proof.challenge,
      metadata: metadata,
      submittedAt: proof.createdAt || new Date()
    });

    await proofLog.save();
    return proofLog;
  } catch (error) {
    console.error('Error creating ProofLog from Proof:', error);
    throw error;
  }
};

// Static method to log actions
proofLogSchema.statics.logAction = async function(proofLogId, action, performedBy, details = '') {
  try {
    const proofLog = await this.findById(proofLogId);
    if (!proofLog) {
      throw new Error('ProofLog not found');
    }

    proofLog.actions.push({
      action: action,
      performedBy: performedBy,
      details: details,
      timestamp: new Date()
    });

    await proofLog.save();
    return proofLog;
  } catch (error) {
    console.error('Error logging action:', error);
    throw error;
  }
};

// Instance method to update status
proofLogSchema.methods.updateStatus = function(newStatus, reviewedBy = null, notes = '') {
  this.status = newStatus;
  if (reviewedBy) {
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
  }
  if (notes) {
    this.reviewNotes = notes;
  }
  return this.save();
};

// Static method to get most played ODDs
proofLogSchema.statics.getMostPlayedODDs = async function(limit = 5) {
  try {
    const result = await this.aggregate([
      {
        $lookup: {
          from: 'challenges',
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeInfo'
        }
      },
      { $unwind: '$challengeInfo' },
      {
        $lookup: {
          from: 'odds',
          localField: 'challengeInfo.odd',
          foreignField: '_id',
          as: 'oddInfo'
        }
      },
      { $unwind: '$oddInfo' },
      {
        $group: {
          _id: '$oddInfo._id',
          oddNumber: { $first: '$oddInfo.number' },
          oddTitle: { $first: '$oddInfo.title' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    return result.map(item => ({
      id: item._id,
      number: item.oddNumber,
      title: item.oddTitle,
      submissions: item.count
    }));
  } catch (error) {
    console.error('Error getting most played ODDs:', error);
    return [];
  }
};

// Static method to get most completed challenges
proofLogSchema.statics.getMostCompletedChallenges = async function(limit = 5) {
  try {
    const result = await this.aggregate([
      { $match: { status: { $in: ['APPROVED', 'accepted'] } } },
      {
        $lookup: {
          from: 'challenges',
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeInfo'
        }
      },
      { $unwind: '$challengeInfo' },
      {
        $group: {
          _id: '$challenge',
          title: { $first: '$challengeInfo.title' },
          description: { $first: '$challengeInfo.description' },
          completions: { $sum: 1 }
        }
      },
      { $sort: { completions: -1 } },
      { $limit: limit }
    ]);

    return result.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      completions: item.completions
    }));
  } catch (error) {
    console.error('Error getting most completed challenges:', error);
    return [];
  }
};

module.exports = mongoose.model('ProofLog', proofLogSchema);