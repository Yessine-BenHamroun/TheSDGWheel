const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, userUpdateSchema } = require('../middleware/validation');

// Get user profile
router.get('/profile', authenticateToken, userController.getProfile);

// Update user profile
router.put('/profile', 
  authenticateToken, 
  validateRequest(userUpdateSchema), 
  userController.updateProfile
);

// Get leaderboard
router.get('/leaderboard', userController.getLeaderboard);

// Get user progress
router.get('/:userId/progress', authenticateToken, userController.getUserProgress);

// Spin wheel for random challenge
router.post('/spin-wheel', authenticateToken, userController.spinWheel);

// Get user statistics (supports both authenticated and public access)
router.get('/stats', (req, res, next) => {
  // Try to authenticate, but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticateToken(req, res, (err) => {
      if (err) {
        // If auth fails, proceed without user context
        req.user = null;
      }
      userController.getUserStats(req, res, next);
    });
  } else {
    // No auth header, proceed as public request
    req.user = null;
    userController.getUserStats(req, res, next);
  }
});

// Get comprehensive admin statistics
router.get('/comprehensive-stats', authenticateToken, requireAdmin, userController.getComprehensiveStats);

module.exports = router;