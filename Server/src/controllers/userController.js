const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const ODD = require('../models/ODD');
const Challenge = require('../models/Challenge');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = await UserProgress.find({ user: req.user._id })
      .populate('odd', 'name icon color');
    
    res.json({
      user: user.toJSON(),
      progress: progress
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['username', 'avatar', 'country'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedUser.toJSON());
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await User.getLeaderboard(limit);
    
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

const getUserProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own progress unless they're admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await UserProgress.find({ user: userId })
      .populate('odd', 'name icon color');
    
    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

const spinWheel = async (req, res, next) => {
  try {
    // Get weighted random ODD
    const selectedODD = await ODD.getWeightedRandom();
    
    if (!selectedODD) {
      return res.status(404).json({ error: 'No ODDs available' });
    }

    // Get a random challenge for the selected ODD
    const challenge = await Challenge.getRandomByODD(selectedODD._id);
    
    res.json({
      selectedODD: selectedODD,
      challenge: challenge
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLeaderboard,
  getUserProgress,
  spinWheel
};