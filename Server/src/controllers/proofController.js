const Proof = require('../models/Proof');
const ProofLog = require('../models/ProofLog');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const ActivityLog = require('../models/ActivityLog');

const getAllProofs = async (req, res, next) => {
  try {
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.userId) filters.user = req.query.userId;
    if (req.query.challengeId) filters.challenge = req.query.challengeId;

    const proofs = await Proof.find(filters)
      .populate('user', 'username avatar')
      .populate('challenge', 'title points')
      .sort({ createdAt: -1 });
    
    res.json({ proofs });
  } catch (error) {
    next(error);
  }
};

const getProofById = async (req, res, next) => {
  try {
    const proof = await Proof.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('challenge', 'title points')
      .populate('reviewedBy', 'username');
    
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }
    
    res.json({ proof });
  } catch (error) {
    next(error);
  }
};

const createProof = async (req, res, next) => {
  try {
    // Verify the challenge exists
    const challenge = await Challenge.findById(req.body.challenge);
    if (!challenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const proofData = {
      ...req.body,
      user: req.user._id
    };

    const proof = new Proof(proofData);
    await proof.save();
    
    // Create proof log entry
    const proofLog = await ProofLog.createFromProof(proof, 'SUBMITTED', {
      performedBy: req.user._id,
      details: 'Proof submitted for challenge',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Update pending challenge if it exists
    const PendingChallenge = require('../models/PendingChallenge');
    const pendingChallenge = await PendingChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id,
      status: 'PENDING'
    });

    if (pendingChallenge) {
      await pendingChallenge.submitProof(proof._id, proofLog._id);
    }
    
    // Log proof submission in activity log
    await ActivityLog.create({
      type: 'proof_submitted',
      user: req.user._id,
      action: 'Proof submitted for challenge',
      details: `Proof submitted for challenge "${challenge.title}"`,
      target: proof._id,
      targetModel: 'Proof'
    });
    
    await proof.populate([
      { path: 'user', select: 'username avatar' },
      { path: 'challenge', select: 'title points' }
    ]);
    
    res.status(201).json({ proof });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate proof',
        message: 'You have already submitted proof for this challenge'
      });
    }
    next(error);
  }
};

const updateProofStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const proof = await Proof.findById(id)
      .populate('challenge', 'points associatedODD');

    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }

    await proof.updateStatus(status, rejectionReason, req.user._id);

    // Update corresponding pending challenge status if it exists
    const PendingChallenge = require('../models/PendingChallenge');
    const pendingChallenge = await PendingChallenge.findOne({
      user: proof.user,
      challenge: proof.challenge._id,
      proof: proof._id
    });

    if (pendingChallenge) {
      // Update pending challenge with proof log reference
      let proofLog = await ProofLog.findOne({ originalProofId: proof._id });
      if (proofLog) {
        pendingChallenge.proofLog = proofLog._id;
      }

      if (status === 'APPROVED') {
        await pendingChallenge.verify(rejectionReason || '');
      } else if (status === 'REJECTED') {
        await pendingChallenge.reject(rejectionReason || '');
      }
    }

    // IMPORTANT: Always ensure ProofLog exists for this proof
    let proofLog = await ProofLog.findOne({ originalProofId: proof._id });
    
    // If approved, update user progress and points
    if (status === 'APPROVED') {
      const challenge = proof.challenge;

      // Validate that challenge has valid points (but don't fail if missing)
      if (!challenge.points || isNaN(challenge.points)) {
        console.warn(`⚠️ Challenge ${challenge._id} has invalid points: ${challenge.points}`);
        // Set default points if missing
        challenge.points = 25;
        console.log(`✅ Using default points: ${challenge.points}`);
      }

      // Create/Update proof log with approval
      if (proofLog) {
        console.log('✅ Updating existing ProofLog for approval:', proofLog._id);
        await ProofLog.logAction(
          proofLog._id, 
          'APPROVED', 
          req.user._id, 
          rejectionReason || 'Proof approved by admin',
          proofLog.status,
          'APPROVED'
        );
        proofLog.status = 'APPROVED';
        proofLog.pointsAwarded = challenge.points;
        proofLog.reviewedBy = req.user._id;
        proofLog.reviewedAt = new Date();
        await proofLog.save();
      } else {
        // Create proof log if it doesn't exist
        console.log('🆕 Creating new ProofLog for approval');
        proofLog = await ProofLog.createFromProof(proof, 'APPROVED', {
          performedBy: req.user._id,
          details: rejectionReason || 'Proof approved by admin',
          pointsAwarded: challenge.points
        });
        proofLog.reviewedBy = req.user._id;
        proofLog.reviewedAt = new Date();
        await proofLog.save();
        console.log('✅ Created ProofLog:', proofLog._id);
      }

      // Log proof approval in activity log
      await ActivityLog.create({
        type: 'proof_verified',
        user: proof.user,
        action: 'Proof approved for challenge',
        details: `Proof for challenge "${challenge.title}" was approved by admin`,
        target: proof._id,
        targetModel: 'Proof',
        points: challenge.points
      });

      // Update user progress
      await UserProgress.updateProgress(
        proof.user,
        challenge.associatedODD,
        challenge.points
      );

      // Update user total points and level
      const user = await User.findById(proof.user);
      if (user) {
        user.totalPoints = (user.totalPoints || 0) + challenge.points;
        user.updateLevel();
        await user.save();
      }

      // Get the full challenge document and increment completion count
      const Challenge = require('../models/Challenge');
      const fullChallenge = await Challenge.findById(challenge._id);
      if (fullChallenge) {
        await fullChallenge.incrementCompletion();
      }
    } else if (status === 'REJECTED') {
      // Create/Update proof log with rejection
      if (proofLog) {
        console.log('✅ Updating existing ProofLog for rejection:', proofLog._id);
        await ProofLog.logAction(
          proofLog._id, 
          'REJECTED', 
          req.user._id, 
          rejectionReason || 'Proof rejected by admin',
          proofLog.status,
          'REJECTED'
        );
        proofLog.status = 'REJECTED';
        proofLog.reviewedBy = req.user._id;
        proofLog.reviewedAt = new Date();
        proofLog.rejectionReason = rejectionReason;
        await proofLog.save();
      } else {
        // Create proof log if it doesn't exist
        console.log('🆕 Creating new ProofLog for rejection');
        proofLog = await ProofLog.createFromProof(proof, 'REJECTED', {
          performedBy: req.user._id,
          details: rejectionReason || 'Proof rejected by admin'
        });
        proofLog.reviewedBy = req.user._id;
        proofLog.reviewedAt = new Date();
        proofLog.rejectionReason = rejectionReason;
        await proofLog.save();
        console.log('✅ Created ProofLog:', proofLog._id);
      }

      // Log proof rejection in activity log
      await ActivityLog.create({
        type: 'proof_rejected',
        user: proof.user,
        action: 'Proof rejected for challenge',
        details: `Proof for challenge "${proof.challenge.title}" was rejected: ${rejectionReason || 'No reason provided'}`,
        target: proof._id,
        targetModel: 'Proof'
      });
    }

    // Final validation: Ensure ProofLog exists
    const finalProofLog = await ProofLog.findOne({ originalProofId: proof._id });
    if (!finalProofLog) {
      console.error('❌ CRITICAL: ProofLog still missing after update attempt!');
      // Create emergency ProofLog
      await ProofLog.createFromProof(proof, status, {
        performedBy: req.user._id,
        details: `Emergency ProofLog creation - Status: ${status}`,
        pointsAwarded: status === 'APPROVED' ? (proof.challenge?.points || 0) : 0
      });
      console.log('🚨 Emergency ProofLog created');
    } else {
      console.log('✅ ProofLog validation successful:', finalProofLog._id);
    }

    await proof.populate([
      { path: 'user', select: 'username avatar' },
      { path: 'challenge', select: 'title points' },
      { path: 'reviewedBy', select: 'username' }
    ]);

    res.json({ proof });
  } catch (error) {
    next(error);
  }
};

const getPendingProofs = async (req, res, next) => {
  try {
    const proofs = await Proof.getPendingProofs();
    res.json({ proofs });
  } catch (error) {
    next(error);
  }
};

const voteForProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const proof = await Proof.findById(id);
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }

    // Users cannot vote for their own proofs
    if (proof.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot vote for your own proof' });
    }

    await proof.addVote(req.user._id);
    
    await proof.populate([
      { path: 'user', select: 'username avatar' },
      { path: 'challenge', select: 'title points' }
    ]);
    
    res.json({ proof });
  } catch (error) {
    if (error.message === 'User has already voted for this proof') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const getUserProofs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own proofs unless they're admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const proofs = await Proof.find({ user: userId })
      .populate('challenge', 'title points')
      .sort({ createdAt: -1 });
    
    res.json({ proofs });
  } catch (error) {
    next(error);
  }
};

const getApprovedProofs = async (req, res, next) => {
  try {
    // Admin only function to get approved proofs for audit/log purposes
    const filters = { status: 'APPROVED' };
    
    // Optional filters
    if (req.query.userId) filters.user = req.query.userId;
    if (req.query.challengeId) filters.challenge = req.query.challengeId;
    if (req.query.startDate || req.query.endDate) {
      filters.reviewedAt = {};
      if (req.query.startDate) filters.reviewedAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.reviewedAt.$lte = new Date(req.query.endDate);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const proofs = await Proof.find(filters)
      .populate('user', 'username email avatar')
      .populate('challenge', 'title points associatedODD')
      .populate('reviewedBy', 'username')
      .sort({ reviewedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Proof.countDocuments(filters);

    res.json({ 
      proofs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProofAuditLogs = async (req, res, next) => {
  try {
    // Get activity logs related to proof verification and rejection
    const filters = {
      type: { $in: ['proof_submitted', 'proof_verified', 'proof_rejected'] }
    };
    
    // Optional filters
    if (req.query.userId) filters.user = req.query.userId;
    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate) filters.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.timestamp.$lte = new Date(req.query.endDate);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(filters)
      .populate('user', 'username email')
      .populate('target')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(filters);

    res.json({ 
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProofs,
  getProofById,
  createProof,
  updateProofStatus,
  getPendingProofs,
  voteForProof,
  getUserProofs,
  getApprovedProofs,
  getProofAuditLogs
};