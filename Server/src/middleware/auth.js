const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const config = require('../config/config');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 [AUTH] Token verification attempt...');
    console.log('🔐 [AUTH] Authorization header present:', !!authHeader);

    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      console.log('❌ [AUTH] Token is blacklisted:', blacklistedToken.reason);
      return res.status(403).json({ 
        error: 'Token has been invalidated', 
        reason: 'Please login again'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('🔐 [AUTH] Token decoded successfully, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ [AUTH] User not found for ID:', decoded.userId);
      return res.status(403).json({ error: 'User not found' });
    }
    
    if (!user.isActive) {
      console.log('❌ [AUTH] User account is not active:', decoded.userId);
      return res.status(403).json({ error: 'Account is not active' });
    }

    console.log('✅ [AUTH] Authentication successful for user:', user.username);
    
    // Store token in request for potential blacklisting
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Token verification failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
};