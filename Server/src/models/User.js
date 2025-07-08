const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty values
        // Allow both URLs and base64 data URLs
        const urlPattern = /^https?:\/\/.+/;
        const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
        return urlPattern.test(v) || base64Pattern.test(v);
      },
      message: 'Avatar must be a valid URL or base64 image data'
    }
  },
  country: {
    type: String,
    maxlength: 100,
    default: null
  },
  level: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    default: 'BEGINNER'
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ totalPoints: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update level based on total points
userSchema.methods.updateLevel = function() {
  if (this.totalPoints >= 10000) {
    this.level = 'EXPERT';
  } else if (this.totalPoints >= 5000) {
    this.level = 'ADVANCED';
  } else if (this.totalPoints >= 1000) {
    this.level = 'INTERMEDIATE';
  } else {
    this.level = 'BEGINNER';
  }
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true })
    .select('username avatar totalPoints level')
    .sort({ totalPoints: -1 })
    .limit(limit);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Method to validate and process avatar
userSchema.methods.processAvatar = function(avatarData) {
  if (!avatarData) return null;
  
  // If it's already a URL, return as is
  if (avatarData.startsWith('http')) {
    return avatarData;
  }
  
  // If it's base64 data, validate and return
  if (avatarData.startsWith('data:image/')) {
    // You could add size validation here
    const base64Data = avatarData.split(',')[1];
    if (base64Data && base64Data.length > 0) {
      return avatarData;
    }
  }
  
  return null;
};

module.exports = mongoose.model('User', userSchema);