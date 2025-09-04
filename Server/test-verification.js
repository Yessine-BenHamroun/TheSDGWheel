const mongoose = require('mongoose');
const User = require('./src/models/User');
const ActivityLog = require('./src/models/ActivityLog');
require('dotenv').config();

async function testVerification() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Check for users with verification tokens
    console.log('\n📋 Checking users with verification tokens...');
    const usersWithTokens = await User.find({ 
      verificationToken: { $exists: true, $ne: null } 
    }).select('email username isActive verificationToken');
    
    if (usersWithTokens.length > 0) {
      console.log(`Found ${usersWithTokens.length} user(s) with verification tokens:`);
      usersWithTokens.forEach(user => {
        console.log(`- ${user.email} (${user.username})`);
        console.log(`  Active: ${user.isActive}`);
        console.log(`  Token: ${user.verificationToken.substring(0, 10)}...`);
      });
    } else {
      console.log('❌ No users found with verification tokens');
    }

    // 2. Check all users status
    console.log('\n👥 All users overview:');
    const allUsers = await User.find({}).select('email username isActive verificationToken');
    console.log(`Total users: ${allUsers.length}`);
    
    allUsers.forEach(user => {
      const status = user.isActive ? '✅ Active' : '❌ Inactive';
      const hasToken = user.verificationToken ? '🔑 Has Token' : '🚫 No Token';
      console.log(`- ${user.email} | ${status} | ${hasToken}`);
    });

    // 3. Test verification process with a specific token
    if (usersWithTokens.length > 0) {
      const testUser = usersWithTokens[0];
      console.log(`\n🧪 Testing verification for: ${testUser.email}`);
      console.log(`Token to test: ${testUser.verificationToken}`);
      
      // Simulate the verification process
      const foundUser = await User.findOne({ verificationToken: testUser.verificationToken });
      if (foundUser) {
        console.log('✅ Token lookup successful');
        console.log(`User found: ${foundUser.email}`);
        console.log(`Current active status: ${foundUser.isActive}`);
        
        // Don't actually verify, just simulate
        console.log('🔄 Would activate user and clear token...');
        console.log('📧 Verification URL would be:');
        console.log(`http://localhost:5173/verify?token=${testUser.verificationToken}`);
        console.log(`http://localhost:5173/verify/${testUser.verificationToken}`);
      } else {
        console.log('❌ Token lookup failed');
      }
    }

    // 4. Check recent activity logs
    console.log('\n📊 Recent verification activities:');
    const recentLogs = await ActivityLog.find({ 
      type: { $in: ['email_verification', 'user_registration'] } 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'email username');
    
    if (recentLogs.length > 0) {
      recentLogs.forEach(log => {
        console.log(`- ${log.type}: ${log.user?.email || 'Unknown'} at ${log.createdAt}`);
        console.log(`  Details: ${log.details}`);
      });
    } else {
      console.log('No recent verification activities found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testVerification();
