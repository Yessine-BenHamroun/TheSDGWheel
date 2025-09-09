const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/auth');

// Get community posts (public, but better with auth for vote status)
router.get('/posts', authenticateToken, communityController.getCommunityPosts);

// Get user's votes (requires auth)
router.get('/votes/user', authenticateToken, communityController.getUserVotes);

// Vote on a post (requires auth)
router.post('/posts/:postId/vote', authenticateToken, communityController.voteOnPost);

module.exports = router;
