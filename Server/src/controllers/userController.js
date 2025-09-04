const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const ODD = require('../models/ODD');
const Challenge = require('../models/Challenge');
const ProofLog = require('../models/ProofLog');

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
    
    // Return in multiple formats for frontend compatibility
    res.json({ 
      leaderboard,
      data: leaderboard,
      users: leaderboard 
    });
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
    const userId = req.user?._id; // Get from authenticated user if available
    
    if (userId) {
      // Return individual user stats if authenticated
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's completed challenges from ProofLogs
      const completedChallengesCount = await ProofLog.countDocuments({ 
        user: userId, 
        status: { $in: ['APPROVED', 'accepted'] }
      });

      // Get user's total points
      const totalPointsResult = await ProofLog.aggregate([
        { $match: { user: userId, status: { $in: ['APPROVED', 'accepted'] } } },
        { $group: { _id: null, total: { $sum: '$pointsAwarded' } } }
      ]);
      const totalPoints = totalPointsResult.length > 0 ? totalPointsResult[0].total : 0;

      // Get user's badges count
      const badgesCount = await require('../models/UserBadge').countDocuments({ user: userId });

      // Get user's rank from leaderboard
      const leaderboard = await User.getLeaderboard();
      const userRank = leaderboard.findIndex(u => u._id.toString() === userId.toString()) + 1;

      return res.json({
        completedChallenges: completedChallengesCount,
        totalPoints,
        badgesEarned: badgesCount,
        rank: userRank || null,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      });
    }

    // Return general stats if not authenticated (for public use)
    const total = await User.countDocuments({ role: 'user' });

    // Get daily registration data for current month
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

    // Generate complete daily counts for the month
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

const getComprehensiveStats = async (req, res, next) => {
  try {
    console.log('🔍 [COMPREHENSIVE STATS] Starting to fetch comprehensive statistics...');

    // Fetch most played ODDs from ProofLogs
    const mostPlayedODDs = await ProofLog.getMostPlayedODDs(5);
    console.log('📊 [COMPREHENSIVE STATS] Most played ODDs:', mostPlayedODDs);

    // Fetch most completed challenges from ProofLogs
    const mostCompletedChallenges = await ProofLog.getMostCompletedChallenges(5);
    console.log('🎯 [COMPREHENSIVE STATS] Most completed challenges:', mostCompletedChallenges);

    // Get total users (participants - all users except admins)
    const totalUsers = await User.countDocuments({ role: 'user' });
    console.log('👥 [COMPREHENSIVE STATS] Total participants:', totalUsers);

    // Get users who joined today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const usersJoinedToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log('📅 [COMPREHENSIVE STATS] Users joined today:', usersJoinedToday);

    // Calculate total points of all users (from user totalPoints field)
    const totalPointsResult = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, totalPoints: { $sum: '$totalPoints' } } }
    ]);
    const totalPoints = totalPointsResult.length > 0 ? totalPointsResult[0].totalPoints : 0;
    console.log('💰 [COMPREHENSIVE STATS] Total points of all users:', totalPoints);

    // Calculate average score (total points / number of users)
    const averageScore = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    console.log('📊 [COMPREHENSIVE STATS] Average score per user:', averageScore);

    // Calculate monthly growth (percentage of new registrations this month)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const usersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: firstDayOfMonth }
    });
    
    const usersBeforeThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $lt: firstDayOfMonth }
    });
    
    const monthlyGrowth = usersBeforeThisMonth > 0 ? 
      Math.round((usersThisMonth / usersBeforeThisMonth) * 100 * 100) / 100 : 
      (usersThisMonth > 0 ? 100 : 0);
    console.log('📈 [COMPREHENSIVE STATS] Monthly growth:', monthlyGrowth + '%');

    // Get total completed challenges count
    const totalCompletedChallenges = await ProofLog.countDocuments({ 
      status: { $in: ['APPROVED', 'accepted'] } 
    });

    // Get active challenges count
    const activeChallengesCount = await Challenge.countDocuments({ isActive: true });

    // Get total ODDs count
    const totalODDsCount = await ODD.countDocuments({});

    // Calculate engagement rate (completed challenges / total users)
    const engagementRate = totalUsers > 0 ? 
      Math.round((totalCompletedChallenges / totalUsers) * 100) / 100 : 0;

    const comprehensiveStats = {
      mostPlayedODDs,
      mostCompletedChallenges,
      participants: totalUsers, // Total number of users (excluding admins)
      totalPoints, // Total points of all users combined
      averageScore, // Average points per user (totalPoints / totalUsers)
      monthlyGrowth, // Percentage of new registrations this month
      newToday: usersJoinedToday, // Users who joined today
      totalCompletedChallenges,
      activeChallengesCount,
      totalODDsCount,
      engagementRate
    };

    console.log('✅ [COMPREHENSIVE STATS] Final stats:', {
      ...comprehensiveStats,
      debugInfo: {
        totalUsersQueried: totalUsers,
        totalPointsRaw: totalPointsResult,
        usersThisMonth,
        usersBeforeThisMonth
      }
    });

    res.json(comprehensiveStats);
  } catch (error) {
    console.error('❌ [COMPREHENSIVE STATS] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch comprehensive statistics',
      message: error.message 
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLeaderboard,
  getUserProgress,
  spinWheel,
  getUserStats,
  getComprehensiveStats
};