const express = require('express');
const router = express.Router();
const proofController = require('../controllers/proofController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, proofCreateSchema, proofUpdateStatusSchema } = require('../middleware/validation');

// Get all proofs
router.get('/', proofController.getAllProofs);

// Get proof by ID
router.get('/:id', proofController.getProofById);

// Create new proof
router.post('/', 
  authenticateToken, 
  validateRequest(proofCreateSchema), 
  proofController.createProof
);

// Update proof status (admin only)
router.put('/:id/status', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(proofUpdateStatusSchema), 
  proofController.updateProofStatus
);

// Get pending proofs (admin only)
router.get('/pending/all', 
  authenticateToken, 
  requireAdmin, 
  proofController.getPendingProofs
);

// Vote for proof
router.post('/:id/vote', authenticateToken, proofController.voteForProof);

// Get user proofs
router.get('/user/:userId', authenticateToken, proofController.getUserProofs);

module.exports = router;