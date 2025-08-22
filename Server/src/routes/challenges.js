const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/proofs/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});
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
  validateRequest(challengeCreateSchema), 
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

// User challenge proof routes
router.post('/proof/submit', authenticateToken, upload.single('proofFile'), challengeController.submitChallengeProof);
router.get('/pending', authenticateToken, challengeController.getUserPendingChallenges);

// Admin proof verification routes
router.get('/proofs/pending', authenticateToken, requireAdmin, challengeController.getPendingProofs);
router.post('/proof/verify', authenticateToken, requireAdmin, challengeController.verifyProof);

module.exports = router;