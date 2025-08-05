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
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.user) filters.user = req.query.user;
    const logs = await ActivityLog.find(filters)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
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