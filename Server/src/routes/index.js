const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const challengeRoutes = require('./challenges');
const proofRoutes = require('./proofs');
const badgeRoutes = require('./badges');
const oddRoutes = require('./odds');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/proofs', proofRoutes);
router.use('/badges', badgeRoutes);
router.use('/odds', oddRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Sustainability Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      challenges: '/api/challenges',
      proofs: '/api/proofs',
      badges: '/api/badges',
      odds: '/api/odds'
    },
    docs: 'https://api-docs.example.com'
  });
});

module.exports = router;