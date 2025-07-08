const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, badgeCreateSchema } = require('../middleware/validation');

// Get all badges
router.get('/', badgeController.getAllBadges);

// Get badge by ID
router.get('/:id', badgeController.getBadgeById);

// Get badges by ODD
router.get('/odd/:oddId', badgeController.getBadgesByODD);

// Create new badge (admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(badgeCreateSchema), 
  badgeController.createBadge
);

// Check badge eligibility
router.get('/eligibility/:oddId', authenticateToken, badgeController.checkEligibility);

// Award badge (admin only)
router.post('/award', 
  authenticateToken, 
  requireAdmin, 
  badgeController.awardBadge
);

// Get user badges
router.get('/user/:userId', authenticateToken, badgeController.getUserBadges);

module.exports = router;