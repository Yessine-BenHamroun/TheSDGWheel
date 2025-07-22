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
    
    res.json(user.toJSON());
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

const getUserStats = async (req, res, next) => {
  try {
    // Nombre total d'utilisateurs (hors admin)
    const total = await User.countDocuments({ role: 'user' });

    // Nombre d'inscriptions par jour pour le mois courant
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const daily = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Générer la liste complète des jours du mois
    const today = new Date();
    const daysInMonth = today.getDate();
    const dailyCounts = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(startOfMonth);
      d.setDate(i);
      const key = d.toISOString().slice(0, 10);
      const found = daily.find(e => e._id === key);
      dailyCounts.push({ date: key, count: found ? found.count : 0 });
    }

    res.json({ total, daily: dailyCounts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLeaderboard,
  getUserProgress,
  spinWheel,
  getUserStats
};