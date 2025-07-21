const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, activityLogController.createLog);
router.get('/', authenticateToken, requireAdmin, activityLogController.getLogs);

module.exports = router; 