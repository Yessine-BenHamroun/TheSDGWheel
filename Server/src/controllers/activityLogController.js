const ActivityLog = require('../models/ActivityLog');

exports.createLog = async (req, res, next) => {
  try {
    const log = new ActivityLog(req.body);
    await log.save();
    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const type = req.query.type || '';

    // Build filters
    const filters = {};
    if (type && type !== 'all') {
      filters.type = type;
    }

    // Build search filter
    if (search) {
      filters.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await ActivityLog.find(filters)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await ActivityLog.countDocuments(filters);

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await ActivityLog.countDocuments({
      ...filters,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get user actions count (excluding admin and system actions)
    const userActionsCount = await ActivityLog.countDocuments({
      ...filters,
      type: { $nin: ['admin_action', 'system_action'] }
    });
    
    // Get admin actions count
    const adminActionsCount = await ActivityLog.countDocuments({
      ...filters,
      type: { $in: ['admin_action', 'system_action'] }
    });

    res.json({ 
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: totalCount > page * limit
      },
      statistics: {
        todayCount,
        userActionsCount,
        adminActionsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyLogs = async (req, res, next) => {
  try {
    const filters = { user: req.user._id };
    if (req.query.type) filters.type = req.query.type;
    
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * limit;
    
    const logs = await ActivityLog.find(filters)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

exports.getLastWheelSpin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find the last wheel spin activity for the current user
    const lastSpin = await ActivityLog.findOne({
      user: userId,
      type: 'wheel_spin'
    })
    .sort({ createdAt: -1 })
    .populate('target', 'oddId name color');
    
    if (!lastSpin) {
      return res.status(404).json({ 
        message: 'No wheel spin found for this user' 
      });
    }
    
    // Extract ODD information from the activity log
    const oddInfo = lastSpin.target || {};
    
    res.json({
      oddId: oddInfo.oddId,
      name: oddInfo.name,
      color: oddInfo.color,
      timestamp: lastSpin.createdAt
    });
  } catch (error) {
    next(error);
  }
}; 