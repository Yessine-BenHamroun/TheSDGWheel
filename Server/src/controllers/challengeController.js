const Challenge = require('../models/Challenge');
const ODD = require('../models/ODD');
const ActivityLog = require('../models/ActivityLog');

const getAllChallenges = async (req, res, next) => {
  try {
    const filters = { isActive: true };
    
    if (req.query.oddId) filters.associatedODD = req.query.oddId;

    const challenges = await Challenge.find(filters)
      .populate('associatedODD', 'name icon color')
      .sort({ createdAt: -1 });
    
    res.json({ challenges });
  } catch (error) {
    next(error);
  }
};

const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('associatedODD', 'name icon color');
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json({ challenge });
  } catch (error) {
    next(error);
  }
};

const createChallenge = async (req, res, next) => {
  try {
    // Verify the associated ODD exists
    const odd = await ODD.findById(req.body.associatedODD);
    if (!odd) {
      return res.status(400).json({ error: 'Associated ODD not found' });
    }

    const challenge = new Challenge(req.body);
    await challenge.save();
    await challenge.populate('associatedODD', 'name icon color');

    // Log admin action
    if (req.user) {
      await ActivityLog.create({
        type: 'admin_action',
        user: req.user._id,
        action: 'Challenge created',
        details: `Admin created challenge: ${challenge.title}`
      });
    }

    res.status(201).json({ challenge });
  } catch (error) {
    next(error);
  }
};

const updateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ['title', 'description'];
    
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const oldChallenge = await Challenge.findById(id).lean();
    const challenge = await Challenge.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('associatedODD', 'name icon color');

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge && req.user) {
      await ActivityLog.create({
        type: 'admin_action',
        user: req.user._id,
        action: 'Challenge updated',
        details: `Admin updated challenge: ${challenge.title}`,
        old: oldChallenge,
        updated: challenge
      });
    }

    res.json({ old: oldChallenge, updated: challenge });
  } catch (error) {
    next(error);
  }
};

const deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const challenge = await Challenge.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge && req.user) {
      await ActivityLog.create({
        type: 'admin_action',
        user: req.user._id,
        action: 'Challenge deleted',
        details: `Admin deleted challenge: ${challenge.title}`
      });
    }

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getChallengeProofs = async (req, res, next) => {
  try {
    const Proof = require('../models/Proof');
    
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const proofs = await Proof.find({ challenge: req.params.id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json({ proofs });
  } catch (error) {
    next(error);
  }
};

// Submit proof for pending challenge
const submitChallengeProof = async (req, res, next) => {
  try {
    const PendingChallenge = require('../models/PendingChallenge');
    const Proof = require('../models/Proof');
    const { challengeId, description } = req.body;
    
    // Get file info if uploaded
    const file = req.file;
    let fileUrl = null;
    
    if (file) {
      // Create file URL (adjust path as needed for your setup)
      fileUrl = `/uploads/proofs/${file.filename}`;
    }
    
    // Find the pending challenge
    const pendingChallenge = await PendingChallenge.findOne({
      _id: challengeId,
      user: req.user._id,
      status: 'PENDING'
    }).populate('challenge');
    
    if (!pendingChallenge) {
      return res.status(404).json({ message: 'Pending challenge not found' });
    }
    
    // Create proof record
    const proof = new Proof({
      user: req.user._id,
      challenge: pendingChallenge.challenge._id,
      mediaType: file ? (file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE') : 'DOCUMENT',
      url: fileUrl,
      description: description,
      status: 'PENDING'
    });
    
    await proof.save();
    
    // Update pending challenge
    await pendingChallenge.submitProof(proof._id);
    
    // Log the action
    await ActivityLog.create({
      type: 'proof_submitted',
      user: req.user._id,
      action: 'Proof submitted for challenge',
      details: `Proof submitted for challenge: ${pendingChallenge.challenge.title}`,
      target: proof._id,
      targetModel: 'Proof',
    });
    
    res.json({
      message: 'Proof submitted successfully! Waiting for admin verification.',
      proof: proof
    });
  } catch (error) {
    next(error);
  }
};

// Get user's pending challenges
const getUserPendingChallenges = async (req, res, next) => {
  try {
    const PendingChallenge = require('../models/PendingChallenge');
    const pendingChallenges = await PendingChallenge.getUserPendingChallenges(req.user._id);
    res.json({ pendingChallenges });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all pending proofs for verification
const getPendingProofs = async (req, res, next) => {
  try {
    const PendingChallenge = require('../models/PendingChallenge');
    const pendingProofs = await PendingChallenge.find({
      status: 'PROOF_SUBMITTED'
    }).populate(['user', 'challenge', 'proof']).sort({ proofSubmittedAt: -1 });
    
    res.json({ pendingProofs });
  } catch (error) {
    next(error);
  }
};

// Admin: Verify proof and award points
const verifyProof = async (req, res, next) => {
  try {
    const PendingChallenge = require('../models/PendingChallenge');
    const User = require('../models/User');
    const { challengeId, isApproved, adminNotes } = req.body;
    
    const pendingChallenge = await PendingChallenge.findOne({
      _id: challengeId,
      status: 'PROOF_SUBMITTED'
    }).populate(['user', 'challenge', 'proof']);
    
    if (!pendingChallenge) {
      return res.status(404).json({ message: 'Pending challenge not found' });
    }
    
    if (isApproved) {
      // Verify the challenge and award points
      await pendingChallenge.verify(adminNotes);
      
      // Award points to user
      await User.findByIdAndUpdate(pendingChallenge.user._id, {
        $inc: { totalPoints: 20 }
      });
      
      // Update proof status
      if (pendingChallenge.proof) {
        pendingChallenge.proof.status = 'VERIFIED';
        pendingChallenge.proof.verifiedAt = new Date();
        await pendingChallenge.proof.save();
      }
      
      // Log the action
      await ActivityLog.create({
        type: 'proof_verified',
        user: pendingChallenge.user._id,
        action: 'Proof verified and points awarded',
        details: `Challenge completed: ${pendingChallenge.challenge.title} - 20 points awarded`,
        target: pendingChallenge.proof._id,
        targetModel: 'Proof',
      });
      
      res.json({
        message: 'Proof verified successfully! 20 points awarded to user.',
        pointsAwarded: 20
      });
    } else {
      // Reject the proof
      await pendingChallenge.reject(adminNotes);
      
      // Update proof status
      if (pendingChallenge.proof) {
        pendingChallenge.proof.status = 'REJECTED';
        pendingChallenge.proof.adminNotes = adminNotes;
        await pendingChallenge.proof.save();
      }
      
      // Log the action
      await ActivityLog.create({
        type: 'proof_rejected',
        user: pendingChallenge.user._id,
        action: 'Proof rejected',
        details: `Challenge proof rejected: ${pendingChallenge.challenge.title}`,
        target: pendingChallenge.proof._id,
        targetModel: 'Proof',
      });
      
      res.json({
        message: 'Proof rejected.',
        reason: adminNotes
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeProofs,
  submitChallengeProof,
  getUserPendingChallenges,
  getPendingProofs,
  verifyProof
};