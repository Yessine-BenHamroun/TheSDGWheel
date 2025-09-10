const Message = require('../models/Message');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendEmail } = require('../utils/mailer');

// Submit a new contact message
exports.submitMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Create new message
    const newMessage = new Message({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    await newMessage.save();

    // Log the activity
    await ActivityLog.create({
      type: 'contact_message',
      action: 'Message submitted',
      details: `New contact message from ${name} (${email}): ${subject}`,
      target: newMessage._id,
      targetModel: 'Message'
    });

    res.status(201).json({
      message: 'Message sent successfully! We will get back to you soon.',
      data: {
        id: newMessage._id,
        status: newMessage.status
      }
    });
  } catch (error) {
    console.error('Submit message error:', error);
    next(error);
  }
};

// Get all messages for admin (with pagination and filtering)
exports.getAllMessages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages with pagination
    const [messages, totalCount] = await Promise.all([
      Message.find(filter)
        .populate('repliedBy', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments(filter)
    ]);

    // Get message statistics
    const stats = await Message.getMessageStats();

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasMore: skip + messages.length < totalCount
      },
      stats
    });
  } catch (error) {
    console.error('Get messages error:', error);
    next(error);
  }
};

// Get a single message by ID
exports.getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate('repliedBy', 'username email');

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Mark as read if not already read
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.json({ message });
  } catch (error) {
    console.error('Get message error:', error);
    next(error);
  }
};

// Reply to a message
exports.replyToMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const adminId = req.user._id;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        message: 'Reply message is required'
      });
    }

    // Find the message
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    if (message.status === 'replied') {
      return res.status(400).json({
        message: 'This message has already been replied to'
      });
    }

    // Update message with reply
    message.adminReply = reply.trim();
    message.status = 'replied';
    message.repliedBy = adminId;
    message.repliedAt = new Date();
    message.isRead = true;

    await message.save();

    // Prepare email data for EmailJS
    const emailSubject = `Re: ${message.subject}`;
    const emailContent = `Hello ${message.name},

Thank you for reaching out to us. We have reviewed your message and here is our response:

Your Original Message:
"${message.message}"

Our Response:
${reply}

If you have any further questions or need additional assistance, please don't hesitate to contact us again.

Best regards,
The SDG Wheel Team
support@sdgwheel.com

---
This email was sent in response to your contact form submission.`;

    try {
      const emailResult = await sendEmail(message.email, emailSubject, emailContent);
      console.log(`Email data prepared for EmailJS: ${message.email}`);
      
      // Include email data in response so frontend can send via EmailJS
      message.emailData = emailResult.emailData;
    } catch (emailError) {
      console.error('Failed to prepare reply email:', emailError);
      // Don't fail the request if email preparation fails, just log it
    }

    // Log the activity
    await ActivityLog.create({
      type: 'message_reply',
      user: adminId,
      action: 'Replied to contact message',
      details: `Replied to message from ${message.name} (${message.email}): ${message.subject}`,
      target: message._id,
      targetModel: 'Message'
    });

    // Populate the replied by field for response
    await message.populate('repliedBy', 'username email');

    res.json({
      message: 'Reply sent successfully',
      data: message,
      emailData: message.emailData // Include email data for EmailJS
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    next(error);
  }
};

// Update message status or priority
exports.updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Update fields if provided
    if (status && ['pending', 'replied', 'archived'].includes(status)) {
      message.status = status;
    }
    
    if (priority && ['low', 'normal', 'high'].includes(priority)) {
      message.priority = priority;
    }

    await message.save();

    // Log the activity
    await ActivityLog.create({
      type: 'message_update',
      user: req.user._id,
      action: 'Updated message status/priority',
      details: `Updated message from ${message.name}: status=${message.status}, priority=${message.priority}`,
      target: message._id,
      targetModel: 'Message'
    });

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update message error:', error);
    next(error);
  }
};

// Delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Store message info for logging before deletion
    const messageInfo = {
      name: message.name,
      email: message.email,
      subject: message.subject
    };

    await Message.findByIdAndDelete(id);

    // Log the activity
    await ActivityLog.create({
      type: 'message_delete',
      user: req.user._id,
      action: 'Deleted contact message',
      details: `Deleted message from ${messageInfo.name} (${messageInfo.email}): ${messageInfo.subject}`,
      target: id,
      targetModel: 'Message'
    });

    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    next(error);
  }
};

// Mark message as read/unread
exports.toggleReadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    message.isRead = !message.isRead;
    await message.save();

    res.json({
      message: `Message marked as ${message.isRead ? 'read' : 'unread'}`,
      data: { isRead: message.isRead }
    });
  } catch (error) {
    console.error('Toggle read status error:', error);
    next(error);
  }
};

module.exports = {
  submitMessage: exports.submitMessage,
  getAllMessages: exports.getAllMessages,
  getMessageById: exports.getMessageById,
  replyToMessage: exports.replyToMessage,
  updateMessageStatus: exports.updateMessageStatus,
  deleteMessage: exports.deleteMessage,
  toggleReadStatus: exports.toggleReadStatus
};
