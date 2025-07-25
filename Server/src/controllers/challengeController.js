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

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeProofs
};