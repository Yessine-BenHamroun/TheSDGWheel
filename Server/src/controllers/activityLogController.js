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