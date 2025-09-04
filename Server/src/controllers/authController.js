const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const config = require('../config/config');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');
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

module.exports = {
  register,
  login,
  createAdmin,
  refreshToken,
  verifyEmail,
  resendVerification
};