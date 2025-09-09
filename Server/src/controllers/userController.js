const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const ODD = require('../models/ODD');
const Challenge = require('../models/Challenge');
const ProofLog = require('../models/ProofLog');
const EmailChangeRequest = require('../models/EmailChangeRequest');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const getProfile = async (req, res, next) => {
  try {
    console.log('🔍 [GET PROFILE] Fetching profile for user ID:', req.user._id);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ [GET PROFILE] User not found for ID:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userJson = user.toJSON();
    console.log('✅ [GET PROFILE] User data being returned:', {
      id: userJson._id,
      username: userJson.username,
      email: userJson.email,
      avatar: userJson.avatar,
      country: userJson.country,
      totalPoints: userJson.totalPoints,
      level: userJson.level,
      role: userJson.role,
      isActive: userJson.isActive,
      createdAt: userJson.createdAt,
      updatedAt: userJson.updatedAt
    });
    
    res.json({ data: userJson });
  } catch (error) {
    console.error('❌ [GET PROFILE] Error fetching profile:', error);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    console.log('🔄 [UPDATE PROFILE] Request body:', req.body);
    console.log('🔄 [UPDATE PROFILE] User ID:', req.user._id);
    
    const allowedUpdates = ['username', 'avatar', 'country'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    console.log('🔄 [UPDATE PROFILE] Updates to apply:', updates);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ [UPDATE PROFILE] Profile updated successfully');
    
    res.json({ 
      message: 'Profile updated successfully',
      data: updatedUser.toJSON() 
    });
  } catch (error) {
    console.error('❌ [UPDATE PROFILE] Error updating profile:', error);
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await User.getLeaderboard(limit);
    
    // Return in multiple formats for frontend compatibility
    res.json({ 
      leaderboard,
      data: leaderboard,
      users: leaderboard 
    });
  } catch (error) {
    next(error);
  }
};

const getUserProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own progress unless they're admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await UserProgress.find({ user: userId })
      .populate('odd', 'name icon color');
    
    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

const spinWheel = async (req, res, next) => {
  try {
    // Get weighted random ODD
    const selectedODD = await ODD.getWeightedRandom();
    
    if (!selectedODD) {
      return res.status(404).json({ error: 'No ODDs available' });
    }

    // Get a random challenge for the selected ODD
    const challenge = await Challenge.getRandomByODD(selectedODD._id);
    
    res.json({
      selectedODD: selectedODD,
      challenge: challenge
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user?._id; // Get from authenticated user if available
    
    if (userId) {
      // Return individual user stats if authenticated
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's completed challenges from ProofLogs
      const completedChallengesCount = await ProofLog.countDocuments({ 
        user: userId, 
        status: { $in: ['APPROVED', 'accepted'] }
      });

      // Get user's total points
      const totalPointsResult = await ProofLog.aggregate([
        { $match: { user: userId, status: { $in: ['APPROVED', 'accepted'] } } },
        { $group: { _id: null, total: { $sum: '$pointsAwarded' } } }
      ]);
      const totalPoints = totalPointsResult.length > 0 ? totalPointsResult[0].total : 0;

      // Get user's badges count
      const badgesCount = await require('../models/UserBadge').countDocuments({ user: userId });

      // Get user's rank from leaderboard
      const leaderboard = await User.getLeaderboard();
      const userRank = leaderboard.findIndex(u => u._id.toString() === userId.toString()) + 1;

      return res.json({
        completedChallenges: completedChallengesCount,
        totalPoints,
        badgesEarned: badgesCount,
        rank: userRank || null,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      });
    }

    // Return general stats if not authenticated (for public use)
    const total = await User.countDocuments({ role: 'user' });

    // Get daily registration data for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const daily = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Generate complete daily counts for the month
    const today = new Date();
    const daysInMonth = today.getDate();
    const dailyCounts = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(startOfMonth);
      d.setDate(i);
      const key = d.toISOString().slice(0, 10);
      const found = daily.find(e => e._id === key);
      dailyCounts.push({ date: key, count: found ? found.count : 0 });
    }

    res.json({ total, daily: dailyCounts });
  } catch (error) {
    next(error);
  }
};

const getComprehensiveStats = async (req, res, next) => {
  try {
    console.log('🔍 [COMPREHENSIVE STATS] Starting to fetch comprehensive statistics...');

    // Fetch most played ODDs from ProofLogs
    const mostPlayedODDs = await ProofLog.getMostPlayedODDs(5);
    console.log('📊 [COMPREHENSIVE STATS] Most played ODDs:', mostPlayedODDs);

    // Fetch most completed challenges from ProofLogs
    const mostCompletedChallenges = await ProofLog.getMostCompletedChallenges(5);
    console.log('🎯 [COMPREHENSIVE STATS] Most completed challenges:', mostCompletedChallenges);

    // Get total users (participants - all users except admins)
    const totalUsers = await User.countDocuments({ role: 'user' });
    console.log('👥 [COMPREHENSIVE STATS] Total participants:', totalUsers);

    // Get users who joined today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const usersJoinedToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log('📅 [COMPREHENSIVE STATS] Users joined today:', usersJoinedToday);

    // Calculate total points of all users (from user totalPoints field)
    const totalPointsResult = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, totalPoints: { $sum: '$totalPoints' } } }
    ]);
    const totalPoints = totalPointsResult.length > 0 ? totalPointsResult[0].totalPoints : 0;
    console.log('💰 [COMPREHENSIVE STATS] Total points of all users:', totalPoints);

    // Calculate average score (total points / number of users)
    const averageScore = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    console.log('📊 [COMPREHENSIVE STATS] Average score per user:', averageScore);

    // Calculate monthly growth (percentage of new registrations this month)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const usersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: firstDayOfMonth }
    });
    
    const usersBeforeThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $lt: firstDayOfMonth }
    });
    
    const monthlyGrowth = usersBeforeThisMonth > 0 ? 
      Math.round((usersThisMonth / usersBeforeThisMonth) * 100 * 100) / 100 : 
      (usersThisMonth > 0 ? 100 : 0);
    console.log('📈 [COMPREHENSIVE STATS] Monthly growth:', monthlyGrowth + '%');

    // Get total completed challenges count
    const totalCompletedChallenges = await ProofLog.countDocuments({ 
      status: { $in: ['APPROVED', 'accepted'] } 
    });

    // Get active challenges count
    const activeChallengesCount = await Challenge.countDocuments({ isActive: true });

    // Get total ODDs count
    const totalODDsCount = await ODD.countDocuments({});

    // Calculate engagement rate (completed challenges / total users)
    const engagementRate = totalUsers > 0 ? 
      Math.round((totalCompletedChallenges / totalUsers) * 100) / 100 : 0;

    const comprehensiveStats = {
      mostPlayedODDs,
      mostCompletedChallenges,
      participants: totalUsers, // Total number of users (excluding admins)
      totalPoints, // Total points of all users combined
      averageScore, // Average points per user (totalPoints / totalUsers)
      monthlyGrowth, // Percentage of new registrations this month
      newToday: usersJoinedToday, // Users who joined today
      totalCompletedChallenges,
      activeChallengesCount,
      totalODDsCount,
      engagementRate
    };

    console.log('✅ [COMPREHENSIVE STATS] Final stats:', {
      ...comprehensiveStats,
      debugInfo: {
        totalUsersQueried: totalUsers,
        totalPointsRaw: totalPointsResult,
        usersThisMonth,
        usersBeforeThisMonth
      }
    });

    res.json(comprehensiveStats);
  } catch (error) {
    console.error('❌ [COMPREHENSIVE STATS] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch comprehensive statistics',
      message: error.message 
    });
  }
};

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const updateProfileWithAvatar = async (req, res, next) => {
  // Use multer middleware
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      const allowedUpdates = ['username', 'country'];
      const updates = {};
      
      // Handle regular profile updates
      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Handle avatar upload
      if (req.file) {
        // Delete old avatar if it exists
        const user = await User.findById(req.user._id);
        if (user.avatar && user.avatar.startsWith('/uploads/')) {
          const oldAvatarPath = path.join(__dirname, '../..', user.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
        
        // Set new avatar path
        updates.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({ 
        message: 'Profile updated successfully',
        data: updatedUser.toJSON() 
      });
    } catch (error) {
      // Clean up uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  });
};

const requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ error: 'New email and current password are required' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ 
      email: newEmail.toLowerCase(),
      _id: { $ne: req.user._id }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Check if email is same as current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({ error: 'New email must be different from current email' });
    }

    // Delete any existing email change requests for this user
    await EmailChangeRequest.deleteMany({ userId: req.user._id });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Create email change request
    const emailChangeRequest = new EmailChangeRequest({
      userId: req.user._id,
      newEmail: newEmail.toLowerCase(),
      token: token
    });

    await emailChangeRequest.save();

    // Note: In a real application, you would send an email here
    // For now, we'll return the token for testing purposes
    res.json({ 
      message: 'Email change requested. Please verify your new email address.',
      verificationToken: token // Remove this in production
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmailChange = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find the email change request
    const emailChangeRequest = await EmailChangeRequest.findOne({ token }).populate('userId');
    if (!emailChangeRequest) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Check if token has expired
    if (new Date() > emailChangeRequest.expiresAt) {
      await EmailChangeRequest.deleteOne({ _id: emailChangeRequest._id });
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Update user email
    const user = emailChangeRequest.userId;
    user.email = emailChangeRequest.newEmail;
    user.isVerified = true; // Mark as verified since they verified the email
    await user.save();

    // Delete the email change request
    await EmailChangeRequest.deleteOne({ _id: emailChangeRequest._id });

    res.json({ 
      message: 'Email updated successfully!',
      data: { email: user.email, isVerified: user.isVerified }
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    console.log('🔐 [UPDATE PASSWORD] Password change request for user:', req.user._id);
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      console.log('❌ [UPDATE PASSWORD] Current password verification failed');
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Invalidate all existing tokens for security
    const { invalidateTokensOnPasswordChange } = require('./authController');
    await invalidateTokensOnPasswordChange(user._id);

    console.log('✅ [UPDATE PASSWORD] Password updated successfully, all tokens invalidated');
    res.json({ 
      message: 'Password updated successfully. Please login again for security.',
      requiresReauth: true 
    });
  } catch (error) {
    console.error('❌ [UPDATE PASSWORD] Error updating password:', error);
    next(error);
  }
};

// Admin User Management Methods
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      role = ''
    } = req.query;

    console.log('🔍 [GET ALL USERS] Request params:', { page, limit, search, status, role });

    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('-password') // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    console.log('✅ [GET ALL USERS] Retrieved:', {
      count: users.length,
      totalCount,
      totalPages,
      currentPage: page
    });

    res.json({
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: limitNum,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ [GET ALL USERS] Error:', error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    console.log('🔍 [GET USER BY ID] Request for user:', userId);

    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ [GET USER BY ID] User found:', user.email);

    res.json({ data: user });

  } catch (error) {
    console.error('❌ [GET USER BY ID] Error:', error);
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    console.log('🔄 [UPDATE USER STATUS] Request:', { userId, isActive });

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the status change
    await ActivityLog.create({
      type: 'admin_action',
      user: req.user.userId,
      action: `User ${isActive ? 'activated' : 'deactivated'}`,
      details: `Changed status for user ${user.email} to ${isActive ? 'active' : 'inactive'}`
    });

    console.log('✅ [UPDATE USER STATUS] Status updated:', {
      userId,
      newStatus: isActive,
      email: user.email
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('❌ [UPDATE USER STATUS] Error:', error);
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    console.log('🔄 [UPDATE USER ROLE] Request:', { userId, role });

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "admin" or "user"' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the role change
    await ActivityLog.create({
      type: 'admin_action',
      user: req.user.userId,
      action: `User role changed`,
      details: `Changed role for user ${user.email} to ${role}`
    });

    console.log('✅ [UPDATE USER ROLE] Role updated:', {
      userId,
      newRole: role,
      email: user.email
    });

    res.json({
      message: `User role updated to ${role} successfully`,
      data: user
    });

  } catch (error) {
    console.error('❌ [UPDATE USER ROLE] Error:', error);
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log('🔄 [UPDATE USER] Request:', { userId, updateData });

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.__v;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the update
    await ActivityLog.create({
      type: 'admin_action',
      user: req.user.userId,
      action: 'User profile updated',
      details: `Updated profile for user ${user.email}`
    });

    console.log('✅ [UPDATE USER] User updated:', user.email);

    res.json({
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('❌ [UPDATE USER] Error:', error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    console.log('🗑️ [DELETE USER] Request for user:', userId);

    // Prevent self-deletion
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store user email for logging
    const userEmail = user.email;

    // Delete user
    await User.findByIdAndDelete(userId);

    // Log the deletion
    await ActivityLog.create({
      type: 'admin_action',
      user: req.user.userId,
      action: 'User deleted',
      details: `Deleted user account: ${userEmail}`
    });

    console.log('✅ [DELETE USER] User deleted:', userEmail);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ [DELETE USER] Error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileWithAvatar,
  requestEmailChange,
  verifyEmailChange,
  updatePassword,
  getLeaderboard,
  getUserProgress,
  spinWheel,
  getUserStats,
  getComprehensiveStats,
  // Admin User Management
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  updateUser,
  deleteUser
};