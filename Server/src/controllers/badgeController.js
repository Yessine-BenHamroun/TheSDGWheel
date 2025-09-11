const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const ODD = require('../models/ODD');
const Notification = require('../models/Notification');
const socketService = require('../services/socketService');

const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ isActive: true })
      .populate('associatedODD', 'name icon color')
      .sort({ requiredPoints: 1 });
    
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

const getBadgeById = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id)
      .populate('associatedODD', 'name icon color');
    
    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }
    
    res.json({ badge });
  } catch (error) {
    next(error);
  }
};

const getBadgesByODD = async (req, res, next) => {
  try {
    const { oddId } = req.params;
    
    // Verify ODD exists
    const odd = await ODD.findById(oddId);
    if (!odd) {
      return res.status(404).json({ error: 'ODD not found' });
    }

    const badges = await Badge.find({ 
      associatedODD: oddId, 
      isActive: true 
    }).sort({ requiredPoints: 1 });
    
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

const createBadge = async (req, res, next) => {
  try {
    // Verify the associated ODD exists
    const odd = await ODD.findById(req.body.associatedODD);
    if (!odd) {
      return res.status(400).json({ error: 'Associated ODD not found' });
    }

    const badge = new Badge(req.body);
    await badge.save();
    
    await badge.populate('associatedODD', 'name icon color');
    
    res.status(201).json({ badge });
  } catch (error) {
    next(error);
  }
};

const checkEligibility = async (req, res, next) => {
  try {
    const { oddId } = req.params;
    const userId = req.user._id;

    const eligibleBadges = await Badge.checkEligibility(userId, oddId);
    res.json({ eligibleBadges });
  } catch (error) {
    next(error);
  }
};

const awardBadge = async (req, res, next) => {
  try {
    const { badgeId, userId } = req.body;

    const badge = await Badge.findById(badgeId)
      .populate('associatedODD', 'name icon color');
    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    await badge.awardToUser(userId);

    // Create notification for user about badge award
    const badgeNotification = await Notification.createNotification(
      userId,
      'BADGE_EARNED',
      '🏆 Badge Earned!',
      `Congratulations! You've earned the "${badge.name}" badge!`,
      {
        badgeId: badge._id,
        badgeName: badge.name,
        badgeIcon: badge.icon,
        associatedODD: badge.associatedODD?.name,
        requiredPoints: badge.requiredPoints
      },
      'HIGH'
    );

    // Send real-time notification
    await socketService.sendNotificationToUser(userId, badgeNotification);

    res.json({ message: 'Badge awarded successfully' });
  } catch (error) {
    if (error.message === 'User already has this badge') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

const getUserBadges = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own badges unless they're admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userBadges = await UserBadge.find({ user: userId })
      .populate('badge')
      .sort({ earnedAt: -1 });

    const badges = userBadges.map(ub => ({
      ...ub.badge.toObject(),
      earnedAt: ub.earnedAt
    }));

    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBadges,
  getBadgeById,
  getBadgesByODD,
  createBadge,
  checkEligibility,
  awardBadge,
  getUserBadges
};