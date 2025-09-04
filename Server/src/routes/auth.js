const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validation');

// Register new user
router.post('/register', validateRequest(registerSchema), authController.register);

// Login user
router.post('/login', validateRequest(loginSchema), authController.login);

// Create admin user (development only)
router.post('/create-admin', authController.createAdmin);

// Refresh token
router.post('/refresh', authenticateToken, authController.refreshToken);

// Email verification routes - support both query parameter and URL parameter
router.get('/verify', authController.verifyEmail); // For URL: /verify?token=abc123
router.get('/verify/:token', authController.verifyEmail); // For URL: /verify/abc123

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

module.exports = router;