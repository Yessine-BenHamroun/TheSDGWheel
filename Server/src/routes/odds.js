const express = require('express');
const router = express.Router();
const oddController = require('../controllers/oddController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, oddCreateSchema, oddUpdateSchema, multipleODDsCreateSchema } = require('../middleware/validation');

// Get all ODDs
router.get('/', oddController.getAllODDs);

// Get climate-focused ODDs
router.get('/climate-focus', oddController.getClimateFocusedODDs);

// Get weighted random ODD
router.get('/random', oddController.getWeightedRandomODD);

// Seed default ODDs (admin only)
router.post('/seed', 
  authenticateToken, 
  requireAdmin, 
  oddController.seedDefaultODDs
);

// Reset all ODDs (admin only) - DELETE for destructive operation
router.delete('/seed', 
  authenticateToken, 
  requireAdmin, 
  oddController.resetODDs
);

// Create multiple ODDs (admin only)
router.post('/bulk', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(multipleODDsCreateSchema), 
  oddController.createMultipleODDs
);

// Get ODD by ID
router.get('/:id', oddController.getODDById);

// Create new ODD (admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(oddCreateSchema), 
  oddController.createODD
);

// Update ODD (admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(oddUpdateSchema),
  oddController.updateODD
);

// Delete ODD (admin only)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  oddController.deleteODD
);

// Get ODD challenges
router.get('/:id/challenges', oddController.getODDChallenges);

// Wheel game routes
router.post('/spin', authenticateToken, oddController.spinWheel);
router.get('/spin/status', authenticateToken, oddController.getTodaysSpinStatus);
router.post('/quiz/answer', authenticateToken, oddController.submitQuizAnswer);
router.post('/challenge/accept', authenticateToken, oddController.acceptChallenge);
router.post('/challenge/decline', authenticateToken, oddController.declineChallenge);

module.exports = router;