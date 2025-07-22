const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, userUpdateSchema } = require('../middleware/validation');
const { getUserStats } = require('../controllers/userController');

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

router.get('/stats', getUserStats);

module.exports = router;