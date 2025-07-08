const Proof = require('../models/Proof');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

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

    // If approved, update user progress and points
    if (status === 'APPROVED') {
      const challenge = proof.challenge;
      
      // Update user progress
      await UserProgress.updateProgress(
        proof.user, 
        challenge.associatedODD, 
        challenge.points
      );

      // Update user total points and level
      const user = await User.findById(proof.user);
      if (user) {
        user.totalPoints += challenge.points;
        user.updateLevel();
        await user.save();
      }

      // Increment challenge completion count
      await challenge.incrementCompletion();
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

module.exports = {
  getAllProofs,
  getProofById,
  createProof,
  updateProofStatus,
  getPendingProofs,
  voteForProof,
  getUserProofs
};