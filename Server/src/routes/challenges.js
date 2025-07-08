const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, challengeCreateSchema } = require('../middleware/validation');

// Get all challenges
router.get('/', challengeController.getAllChallenges);

// Get challenge by ID
router.get('/:id', challengeController.getChallengeById);

// Create new challenge (admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(challengeCreateSchema), 
  challengeController.createChallenge
);

// Update challenge (admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  challengeController.updateChallenge
);

// Delete challenge (admin only)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  challengeController.deleteChallenge
);

// Get challenge proofs
router.get('/:id/proofs', challengeController.getChallengeProofs);

module.exports = router;