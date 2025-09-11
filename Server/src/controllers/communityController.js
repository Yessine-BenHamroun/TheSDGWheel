const Proof = require('../models/Proof');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Notification = require('../models/Notification');
const socketService = require('../services/socketService');

// Get community posts (approved proofs with user info)
const getCommunityPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Proof.find({ 
      status: { $in: ['APPROVED', 'accepted'] } 
    })
    .populate('user', 'username avatar country level')
    .populate('challenge', 'title description')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get vote counts for each post
    const postsWithVotes = await Promise.all(
      posts.map(async (post) => {
        const voteCount = await Vote.countDocuments({ proof: post._id });
        return {
          ...post,
          votes: voteCount
        };
      })
    );

    const total = await Proof.countDocuments({ 
      status: { $in: ['APPROVED', 'accepted'] } 
    });

    res.json({
      data: postsWithVotes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
};

// Get user's votes
const getUserVotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const votes = await Vote.find({ user: userId }).select('proof');
    const votedProofIds = votes.map(vote => vote.proof.toString());
    
    res.json({ data: votedProofIds });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({ error: 'Failed to fetch user votes' });
  }
};

// Vote on a post
const voteOnPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if proof exists and is approved
    const proof = await Proof.findOne({ 
      _id: postId, 
      status: { $in: ['APPROVED', 'accepted'] } 
    });

    if (!proof) {
      return res.status(404).json({ error: 'Post not found or not approved' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ 
      user: userId, 
      proof: postId 
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this post' });
    }

    // Prevent self-voting
    if (proof.user.toString() === userId) {
      return res.status(400).json({ error: 'You cannot vote on your own post' });
    }

    // Create vote
    const vote = new Vote({
      user: userId,
      proof: postId,
      points: 1
    });

    await vote.save();

    // Add points to proof owner
    await User.findByIdAndUpdate(
      proof.user,
      { $inc: { totalPoints: 1 } }
    );

    // Update proof owner's level
    const proofOwner = await User.findById(proof.user);
    if (proofOwner) {
      proofOwner.updateLevel();
      await proofOwner.save();
    }

    // Get updated vote count
    const voteCount = await Vote.countDocuments({ proof: postId });

    // Create notification for post owner
    const voter = await User.findById(userId).select('username');
    console.log(`📝 Creating notification for post owner ${proof.user} from voter ${voter.username}`);
    
    const notification = await Notification.createNotification(
      proof.user,
      'POST_VOTED',
      'New Vote on Your Post!',
      `${voter.username} voted on your post. You now have ${voteCount} vote${voteCount === 1 ? '' : 's'}!`,
      {
        postId: postId,
        voterUsername: voter.username,
        voterId: userId,
        totalVotes: voteCount,
        pointsAwarded: 1
      },
      'MEDIUM'
    );

    console.log(`📢 Notification created:`, notification);

    // Send real-time notification via socket
    console.log(`🔌 Sending real-time notification to user ${proof.user.toString()}`);
    await socketService.sendNotificationToUser(proof.user.toString(), notification);

    res.json({ 
      success: true, 
      votes: voteCount,
      message: 'Vote recorded successfully' 
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already voted on this post' });
    }
    res.status(500).json({ error: 'Failed to vote on post' });
  }
};

module.exports = {
  getCommunityPosts,
  getUserVotes,
  voteOnPost
};
