const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function testLeaderboard() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🏆 Testing leaderboard...');
    
    // Get all active users
    const allUsers = await User.find({ isActive: true })
      .select('username totalPoints level');
    
    console.log(`Found ${allUsers.length} active users:`);
    allUsers.forEach(user => {
      console.log(`- ${user.username}: ${user.totalPoints || 0} points (Level ${user.level || 1})`);
    });

    // Get leaderboard
    const leaderboard = await User.getLeaderboard(10);
    
    console.log(`\n🥇 Leaderboard (${leaderboard.length} users):`);
    leaderboard.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}: ${user.totalPoints || 0} points`);
    });

    if (leaderboard.length === 0) {
      console.log('❌ No users in leaderboard - possible issues:');
      console.log('  - No active users');
      console.log('  - All users have 0 or null totalPoints');
      console.log('  - Database query issue');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testLeaderboard();
