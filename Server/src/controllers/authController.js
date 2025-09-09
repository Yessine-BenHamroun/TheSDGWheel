const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const PasswordReset = require('../models/PasswordReset');
const { generateToken } = require('../middleware/auth');
const config = require('../config/config');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/mailer');

const register = async (req, res, next) => {
  try {
    console.log('Registration request body:', { ...req.body, password: '[HIDDEN]' });
    
    const { username, email, password, avatar, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Email or username is already taken'
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Create new user
    const user = new User({
      username,
      email,
      password, // Will be automatically hashed by the pre-save middleware
      avatar,
      country,
      isActive: false,
      verificationToken,
    });

    await user.save();
    // EmailJS will handle email sending from frontend
    // await sendVerificationEmail(user.email, verificationToken);

    // Log registration in ActivityLog
    await ActivityLog.create({
      type: 'user_registration',
      user: user._id,
      action: 'User registered',
      details: `New user account created: ${user.username}\n${user.email}`
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        ...user.toJSON(),
        verificationToken: verificationToken // Include token for frontend email sending
      },
      verificationToken: verificationToken, // Also include it at the top level for easier access
      token
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  try {
    // Get token from query parameter (for URL like: /verify?token=abc123)
    let { token } = req.query;
    
    // Also support token from URL params (for URL like: /verify/abc123)
    if (!token) {
      token = req.params.token;
    }

    console.log('🔍 Email verification attempt with token:', token);

    if (!token) {
      return res.json({ 
        success: false,
        message: 'Verification token is required.' 
      });
    }

    // Find user with the verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      console.log('❌ Verification failed - Invalid or expired token:', token);
      return res.json({ 
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    // Check if user is already verified
    if (user.isActive) {
      console.log('⚠️ User already verified:', user.email);
      return res.json({ 
        success: true,
        message: 'This account has already been verified. You can log in now.',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }

    // Activate the user
    user.isActive = true;
    user.verificationToken = undefined; // Remove the token
    await user.save();

    console.log('✅ Email verified successfully for user:', user.email);

    // Log the verification in ActivityLog
    await ActivityLog.create({
      type: 'email_verification',
      user: user._id,
      action: 'Email verified',
      details: `User ${user.username} (${user.email}) verified their email address`
    });

    res.json({ 
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during verification. Please try again.' 
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      console.log('🚫 Login blocked for unverified user:', email);
      return res.status(403).json({ 
        success: false,
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(409).json({
        error: 'Admin already exists',
        message: 'An admin user already exists in the system'
      });
    }

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: config.admin.email,
      password: config.admin.password,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: admin.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const user = req.user;
    const token = generateToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address.'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified.'
      });
    }

    // Generate new verification token if needed
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    console.log('🔄 Resending verification email to:', email);

    // TODO: Send verification email here
    // await sendVerificationEmail(user.email, user.verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
      verificationToken: user.verificationToken // Include for frontend email sending
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email. Please try again.'
    });
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.token; // Token stored by auth middleware
    
    if (!token) {
      return res.status(400).json({ error: 'No token to logout' });
    }

    // Decode token to get expiration time
    const decoded = jwt.verify(token, config.jwt.secret);
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      userId: req.user._id,
      expiresAt,
      reason: 'logout'
    });

    // Log logout activity
    await ActivityLog.create({
      type: 'user_logout',
      user: req.user._id,
      action: 'User logged out',
      details: `User ${req.user.username} logged out successfully`
    });

    console.log('✅ [LOGOUT] User logged out successfully:', req.user.username);
    
    res.json({ 
      message: 'Logged out successfully',
      success: true 
    });
  } catch (error) {
    console.error('❌ [LOGOUT] Logout error:', error);
    next(error);
  }
};

const logoutAllSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find all active tokens for this user and blacklist them
    // This is a security feature to logout from all devices
    const currentTime = Math.floor(Date.now() / 1000);
    const futureDate = new Date((currentTime + 3600) * 1000); // 1 hour from now as max expiry
    
    // For simplicity, we'll create a blanket blacklist entry
    // In production, you might want to keep track of issued tokens
    await TokenBlacklist.create({
      token: `ALL_TOKENS_${userId}_${currentTime}`,
      userId,
      expiresAt: futureDate,
      reason: 'security'
    });

    // Log security logout
    await ActivityLog.create({
      type: 'security_logout',
      user: userId,
      action: 'All sessions logged out',
      details: `User ${req.user.username} logged out from all devices`
    });

    console.log('✅ [LOGOUT ALL] All sessions logged out for user:', req.user.username);
    
    res.json({ 
      message: 'Logged out from all devices successfully',
      success: true 
    });
  } catch (error) {
    console.error('❌ [LOGOUT ALL] Logout all sessions error:', error);
    next(error);
  }
};

const invalidateTokensOnPasswordChange = async (userId) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const futureDate = new Date((currentTime + 3600) * 1000);
    
    // Invalidate all tokens when password changes
    await TokenBlacklist.create({
      token: `PASSWORD_CHANGE_${userId}_${currentTime}`,
      userId,
      expiresAt: futureDate,
      reason: 'password_change'
    });

    console.log('✅ [TOKEN INVALIDATION] All tokens invalidated due to password change for user:', userId);
  } catch (error) {
    console.error('❌ [TOKEN INVALIDATION] Error invalidating tokens:', error);
  }
};

// Forgot Password - Request reset code
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('🔐 [FORGOT PASSWORD] Reset request for email:', email);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return res.json({ 
        message: 'If an account with that email exists, a reset link has been sent.',
        success: true 
      });
    }

    if (!user.isActive) {
      return res.status(400).json({ 
        error: 'Please verify your email first before resetting password.' 
      });
    }

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate secure reset token
    const resetToken = PasswordReset.generateToken();

    // Create new password reset record
    const passwordReset = new PasswordReset({
      userId: user._id,
      email: user.email,
      resetToken: resetToken
    });

    await passwordReset.save();

    // Log the reset request
    await ActivityLog.create({
      type: 'system_action',
      user: user._id,
      action: 'Password reset requested',
      details: `Password reset token generated for ${user.email}`
    });

    console.log('✅ [FORGOT PASSWORD] Reset token generated for user:', user.email);

    // Return success response with token for email sending
    res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
      success: true,
      // Include info for frontend email sending
      resetToken: resetToken,
      email: user.email,
      userName: user.firstName || user.email.split('@')[0]
    });

  } catch (error) {
    console.error('❌ [FORGOT PASSWORD] Error:', error);
    next(error);
  }
};

// Verify Reset Token (when user clicks the email link)
const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    console.log('🔐 [VERIFY RESET TOKEN] Verification attempt for token:', token);

    // Find the reset token
    const passwordReset = await PasswordReset.findOne({
      resetToken: token,
      isUsed: false
    }).populate('userId', 'email firstName');

    if (!passwordReset) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token',
        success: false 
      });
    }

    // Check if token is still valid
    if (!passwordReset.isValid()) {
      return res.status(400).json({ 
        error: 'Reset token has expired',
        success: false 
      });
    }

    console.log('✅ [VERIFY RESET TOKEN] Token verified successfully');

    res.json({
      message: 'Reset token is valid',
      success: true,
      email: passwordReset.email,
      userName: passwordReset.userId.firstName || passwordReset.userId.email.split('@')[0]
    });

  } catch (error) {
    console.error('❌ [VERIFY RESET TOKEN] Error:', error);
    next(error);
  }
};

// Reset Password with new password using token
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    console.log('🔐 [RESET PASSWORD] Password reset attempt with token:', token);

    // Find the password reset record by token
    const passwordReset = await PasswordReset.findOne({
      resetToken: token,
      isUsed: false
    });

    if (!passwordReset) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token',
        success: false 
      });
    }

    // Check if still valid and not used
    if (!passwordReset.isValid()) {
      return res.status(400).json({ 
        error: 'Reset token has expired',
        success: false 
      });
    }

    // Find the user
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Mark reset token as used
    passwordReset.isUsed = true;
    await passwordReset.save();

    // Invalidate all existing tokens for security
    const currentTime = Math.floor(Date.now() / 1000);
    const futureDate = new Date((currentTime + 3600) * 1000); // 1 hour from now
    
    await TokenBlacklist.create({
      token: `PASSWORD_RESET_${user._id}_${currentTime}`,
      userId: user._id,
      expiresAt: futureDate,
      reason: 'password_reset'
    });

    // Generate new token for automatic login
    const authToken = generateToken(user._id);

    // Log the password reset
    await ActivityLog.create({
      type: 'system_action',
      user: user._id,
      action: 'Password reset completed',
      details: `Password successfully reset for ${user.email}`
    });

    console.log('✅ [RESET PASSWORD] Password reset successfully for user:', user.email);

    res.json({
      message: 'Password reset successfully! You are now logged in.',
      success: true,
      user: user.toJSON(),
      token: authToken
    });

  } catch (error) {
    console.error('❌ [RESET PASSWORD] Error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  createAdmin,
  refreshToken,
  verifyEmail,
  resendVerification,
  logout,
  logoutAllSessions,
  invalidateTokensOnPasswordChange,
  forgotPassword,
  verifyResetToken,
  resetPassword
};