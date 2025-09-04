const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./src/models/User');
const ActivityLog = require('./src/models/ActivityLog');
require('dotenv').config();

async function testVerificationAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test user with verification token for testing
    const testEmail = 'test-verification@example.com';
    const testToken = crypto.randomBytes(32).toString('hex');
    
    console.log('\n🧪 Creating test user for verification...');
    
    // Clean up any existing test user
    await User.deleteOne({ email: testEmail });
    
    // Create new test user
    const testUser = new User({
      username: 'TestVerificationUser',
      email: testEmail,
      password: 'TestPassword123!',
      isActive: false,
      verificationToken: testToken
    });
    
    await testUser.save();
    console.log(`✅ Test user created: ${testEmail}`);
    console.log(`🔑 Verification token: ${testToken}`);

    // Test the verification logic (simulate the controller logic)
    console.log('\n🔄 Testing verification logic...');
    
    // 1. Test token extraction (query parameter format)
    const queryToken = testToken;
    console.log(`Testing with token: ${queryToken}`);
    
    // 2. Find user by token
    const userToVerify = await User.findOne({ verificationToken: queryToken });
    
    if (!userToVerify) {
      console.log('❌ User not found with token');
      return;
    }
    
    console.log(`✅ User found: ${userToVerify.email}`);
    console.log(`Current status - Active: ${userToVerify.isActive}`);
    
    // 3. Check if already active
    if (userToVerify.isActive) {
      console.log('⚠️ User is already active');
      const response = {
        success: false,
        message: 'This account has already been verified. You can log in now.'
      };
      console.log('Response would be:', response);
    } else {
      // 4. Activate the user
      userToVerify.isActive = true;
      userToVerify.verificationToken = undefined;
      await userToVerify.save();
      
      console.log('✅ User activated successfully');
      
      // 5. Log the activity
      await ActivityLog.create({
        type: 'email_verification',
        user: userToVerify._id,
        action: 'Email verified',
        details: `User ${userToVerify.username} (${userToVerify.email}) verified their email address`
      });
      
      console.log('📝 Activity logged');
      
      // 6. Create success response
      const response = {
        success: true,
        message: 'Email verified successfully! You can now log in to your account.',
        user: {
          id: userToVerify._id,
          username: userToVerify.username,
          email: userToVerify.email
        }
      };
      
      console.log('✅ Success response:', JSON.stringify(response, null, 2));
    }

    // Test URL formats that should work
    console.log('\n🌐 Testing URL formats:');
    console.log(`Query parameter: http://localhost:5173/verify?token=${testToken}`);
    console.log(`URL parameter: http://localhost:5173/verify/${testToken}`);

    // Verify the user is now active
    const verifiedUser = await User.findById(userToVerify._id);
    console.log(`\n✅ Final verification - User active: ${verifiedUser.isActive}`);
    console.log(`🔑 Token cleared: ${verifiedUser.verificationToken === undefined}`);

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await User.deleteOne({ email: testEmail });
    await ActivityLog.deleteMany({ 
      type: 'email_verification',
      details: { $regex: testEmail }
    });
    console.log('✅ Test cleanup completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the API test
testVerificationAPI();
