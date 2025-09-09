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

// Logout current session
router.post('/logout', authenticateToken, authController.logout);

// Logout from all sessions (security feature)
router.post('/logout-all', authenticateToken, authController.logoutAllSessions);

// Password Reset routes
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.verifyResetToken); // Verify token when user clicks email link
router.post('/reset-password', authController.resetPassword); // Reset password with new password

module.exports = router;