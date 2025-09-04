const mongoose = require('mongoose');
const User = require('./src/models/User');
const Proof = require('./src/models/Proof');
const Challenge = require('./src/models/Challenge');
require('dotenv').config();

async function fixUserPoints() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔧 Fixing user points based on approved proofs...');
    
    // Get all approved proofs
    const approvedProofs = await Proof.find({ status: 'APPROVED' })
      .populate('user', 'username totalPoints')
      .populate('challenge', 'title points');

    console.log(`Found ${approvedProofs.length} approved proofs:`);

    for (const proof of approvedProofs) {
      const user = proof.user;
      const challenge = proof.challenge;
      const points = challenge.points || 25; // Use default if still missing

      console.log(`\n👤 User: ${user.username}`);
      console.log(`🎯 Challenge: ${challenge.title}`);
      console.log(`💰 Points to award: ${points}`);
      console.log(`📊 Current user points: ${user.totalPoints || 0}`);

      // Update user points
      const updatedUser = await User.findById(user._id);
      const newTotalPoints = (updatedUser.totalPoints || 0) + points;
      updatedUser.totalPoints = newTotalPoints;
      updatedUser.updateLevel();
      await updatedUser.save();

      console.log(`✅ Updated ${user.username}: ${newTotalPoints} total points`);
    }

    console.log('\n🏆 Updated leaderboard:');
    const leaderboard = await User.getLeaderboard(5);
    leaderboard.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}: ${user.totalPoints || 0} points (Level ${user.level})`);
    });

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixUserPoints();
