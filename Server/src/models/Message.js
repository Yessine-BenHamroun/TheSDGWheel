const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'archived'],
    default: 'pending'
  },
  adminReply: {
    type: String,
    trim: true,
    maxlength: [2000, 'Reply cannot exceed 2000 characters']
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  repliedAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ email: 1 });
messageSchema.index({ isRead: 1 });

// Static methods
messageSchema.statics.getMessageStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = { pending: 0, replied: 0, archived: 0 };
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  
  return result;
};

// Virtual for reply status
messageSchema.virtual('hasReply').get(function() {
  return this.status === 'replied' && this.adminReply && this.repliedAt;
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);
