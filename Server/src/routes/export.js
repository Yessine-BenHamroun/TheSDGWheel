const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/export/data - Export selected data types
router.post('/data', authenticateToken, requireAdmin, exportController.exportData);

module.exports = router;
