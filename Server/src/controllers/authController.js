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
  const { token } = req.params;
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification token.' });
  }
  user.isActive = true;
  user.verificationToken = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully. You can now log in.' });
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
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
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

module.exports = {
  register,
  login,
  createAdmin,
  refreshToken,
  verifyEmail
};