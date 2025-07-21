const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const config = require('../config/config');
const ActivityLog = require('../models/ActivityLog');

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

    // Create new user
    const user = new User({
      username,
      email,
      password, // Will be automatically hashed by the pre-save middleware
      avatar,
      country
    });

    await user.save();

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
      message: 'User registered successfully',
      user: user.toJSON(), // Password is excluded in toJSON method
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
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

module.exports = {
  register,
  login,
  createAdmin,
  refreshToken
};