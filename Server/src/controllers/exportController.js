const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Proof = require('../models/Proof');
const ActivityLog = require('../models/ActivityLog');
const ODD = require('../models/ODD');
const UserProgress = require('../models/UserProgress');
const ProofLog = require('../models/ProofLog');
const DailySpin = require('../models/DailySpin');
const Quiz = require('../models/Quiz');

// Helper function to apply date filters
const applyDateFilter = (dateRange) => {
  const now = new Date();
  let dateFilter = {};

  switch (dateRange) {
    case 'last_month':
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) } };
      break;
    case 'last_3_months':
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()) } };
      break;
    case 'last_6_months':
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()) } };
      break;
    case 'last_year':
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) } };
      break;
    case 'all':
    default:
      dateFilter = {};
      break;
  }

  return dateFilter;
};

// Export users data
const exportUsers = async (dateRange = 'all') => {
  const dateFilter = applyDateFilter(dateRange);
  
  const users = await User.find(dateFilter)
    .select('username email country totalPoints level badges isActive createdAt updatedAt')
    .sort({ createdAt: -1 });

  return users.map(user => ({
    id: user._id,
    username: user.username,
    email: user.email,
    country: user.country || 'Not specified',
    totalPoints: user.totalPoints || 0,
    level: user.level || 'BEGINNER',
    badgeCount: user.badges ? user.badges.length : 0,
    isActive: user.isActive,
    registrationDate: user.createdAt,
    lastUpdate: user.updatedAt
  }));
};

// Export challenges data
const exportChallenges = async (dateRange = 'all') => {
  const dateFilter = applyDateFilter(dateRange);
  
  const challenges = await Challenge.find(dateFilter)
    .populate('associatedODD', 'title')
    .sort({ createdAt: -1 });

  return challenges.map(challenge => ({
    id: challenge._id,
    title: challenge.title,
    description: challenge.description,
    associatedODD: challenge.associatedODD?.title || 'Unknown',
    points: challenge.points || 0,
    difficulty: challenge.difficulty || 'medium',
    completionCount: challenge.completionCount || 0,
    isActive: challenge.isActive,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt
  }));
};

// Export proofs data
const exportProofs = async (dateRange = 'all') => {
  const dateFilter = applyDateFilter(dateRange);
  
  const proofs = await Proof.find(dateFilter)
    .populate('user', 'username email')
    .populate('challenge', 'title')
    .populate('reviewedBy', 'username')
    .sort({ createdAt: -1 });

  return proofs.map(proof => ({
    id: proof._id,
    user: proof.user?.username || 'Unknown',
    userEmail: proof.user?.email || 'Unknown',
    challenge: proof.challenge?.title || 'Unknown',
    status: proof.status,
    proofText: proof.proofText || '',
    mediaUrl: proof.mediaUrl || '',
    reviewedBy: proof.reviewedBy?.username || null,
    reviewedAt: proof.reviewedAt || null,
    rejectionReason: proof.rejectionReason || null,
    submittedAt: proof.createdAt,
    lastUpdate: proof.updatedAt
  }));
};

// Export votes data (placeholder - voting functionality not implemented yet)
const exportVotes = async (dateRange = 'all') => {
  console.log('Vote model not available, returning empty array');
  return [];
};

// Export wheel spins data (using DailySpin model)
const exportWheelSpins = async (dateRange = 'all') => {
  try {
    const dateFilter = applyDateFilter(dateRange);
    
    const wheelSpins = await DailySpin.find(dateFilter)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    return wheelSpins.map(spin => ({
      id: spin._id,
      user: spin.userId?.username || 'Unknown',
      selectedODD: spin.selectedODD || 'Unknown',
      result: spin.oddSelection || 'unknown',
      pointsAwarded: spin.pointsEarned || 0,
      createdAt: spin.createdAt,
      spinDate: spin.spinDate
    }));
  } catch (error) {
    console.log('DailySpin model error, returning empty array:', error.message);
    return [];
  }
};

// Export activity logs data
const exportActivityLogs = async (dateRange = 'all') => {
  const dateFilter = applyDateFilter(dateRange);
  
  const logs = await ActivityLog.find(dateFilter)
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(10000); // Limit to prevent memory issues

  return logs.map(log => ({
    id: log._id,
    type: log.type,
    user: log.user?.username || 'System',
    action: log.action,
    details: log.details || '',
    points: log.points || 0,
    target: log.target || null,
    targetModel: log.targetModel || null,
    createdAt: log.createdAt
  }));
};

// Export statistics data
const exportStatistics = async () => {
  const stats = {
    totalUsers: await User.countDocuments({ isActive: true }),
    totalChallenges: await Challenge.countDocuments({ isActive: true }),
    totalProofs: await Proof.countDocuments(),
    approvedProofs: await Proof.countDocuments({ status: 'APPROVED' }),
    pendingProofs: await Proof.countDocuments({ status: 'PENDING' }),
    rejectedProofs: await Proof.countDocuments({ status: 'REJECTED' }),
    totalActivityLogs: await ActivityLog.countDocuments(),
    averagePointsPerUser: 0,
    topCountries: [],
    monthlyRegistrations: [],
    generatedAt: new Date()
  };

  // Calculate average points
  const userStats = await User.aggregate([
    { $group: { _id: null, avgPoints: { $avg: '$totalPoints' } } }
  ]);
  stats.averagePointsPerUser = userStats[0]?.avgPoints || 0;

  // Get top countries
  const countryStats = await User.aggregate([
    { $match: { country: { $exists: true, $ne: null } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  stats.topCountries = countryStats.map(c => ({ country: c._id, userCount: c.count }));

  return [stats];
};

// Export ODD configuration data
const exportODDs = async () => {
  const odds = await ODD.find().sort({ number: 1 });
  
  return odds.map(odd => ({
    id: odd._id,
    number: odd.number,
    title: odd.title,
    description: odd.description || '',
    color: odd.color || '',
    icon: odd.icon || '',
    challengeCount: 0, // Will be populated by aggregation if needed
    isActive: odd.isActive !== false,
    createdAt: odd.createdAt,
    updatedAt: odd.updatedAt
  }));
};

// Main export function
const exportData = async (req, res, next) => {
  try {
    const { exportTypes, format = 'csv', dateRange = 'all' } = req.body;

    if (!exportTypes || exportTypes.length === 0) {
      return res.status(400).json({ error: 'No export types specified' });
    }

    console.log(`📊 Exporting data: ${exportTypes.join(', ')} in ${format} format`);

    const exportData = {};

    // Export each selected data type
    for (const exportType of exportTypes) {
      try {
        switch (exportType) {
          case 'users':
            exportData.users = await exportUsers(dateRange);
            break;
          case 'challenges':
            exportData.challenges = await exportChallenges(dateRange);
            break;
          case 'proofs':
            exportData.proofs = await exportProofs(dateRange);
            break;
          case 'votes':
            exportData.votes = await exportVotes(dateRange);
            break;
          case 'wheel_spins':
            exportData.wheel_spins = await exportWheelSpins(dateRange);
            break;
          case 'activity_logs':
            exportData.activity_logs = await exportActivityLogs(dateRange);
            break;
          case 'statistics':
            exportData.statistics = await exportStatistics();
            break;
          case 'odds':
            exportData.odds = await exportODDs();
            break;
          default:
            console.warn(`Unknown export type: ${exportType}`);
        }
      } catch (error) {
        console.error(`Error exporting ${exportType}:`, error);
        exportData[exportType] = [];
      }
    }

    // Calculate total records
    const totalRecords = Object.values(exportData).reduce((sum, data) => sum + data.length, 0);

    console.log(`✅ Export completed: ${totalRecords} total records`);

    res.json({
      success: true,
      data: exportData,
      format: format,
      dateRange: dateRange,
      totalRecords: totalRecords,
      exportedAt: new Date(),
      exportTypes: exportTypes
    });

  } catch (error) {
    console.error('❌ Export error:', error);
    next(error);
  }
};

module.exports = {
  exportData
};
