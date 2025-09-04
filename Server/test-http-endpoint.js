const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./src/models/User');
const ActivityLog = require('./src/models/ActivityLog');
require('dotenv').config();

// Test the actual HTTP endpoint
async function testVerificationEndpoint() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test user
    const testEmail = 'endpoint-test@example.com';
    const testToken = crypto.randomBytes(32).toString('hex');
    
    console.log('\n🧪 Creating test user...');
    await User.deleteOne({ email: testEmail }); // Clean up
    
    const testUser = new User({
      username: 'EndpointTestUser',
      email: testEmail,
      password: 'TestPassword123!',
      isActive: false,
      verificationToken: testToken
    });
    
    await testUser.save();
    console.log(`✅ Test user created: ${testEmail}`);
    console.log(`🔑 Token: ${testToken}`);

    // Test different URL formats
    const testUrls = [
      `http://localhost:3001/api/auth/verify?token=${testToken}`,
      `http://localhost:3001/api/auth/verify/${testToken}`
    ];

    for (const url of testUrls) {
      console.log(`\n🌐 Testing URL: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        
        if (response.ok && data.success) {
          console.log('   ✅ Verification successful');
          
          // Check if user was actually activated
          const updatedUser = await User.findOne({ email: testEmail });
          console.log(`   User activated: ${updatedUser.isActive}`);
          console.log(`   Token cleared: ${updatedUser.verificationToken === undefined}`);
        } else {
          console.log('   ❌ Verification failed');
        }
        
      } catch (fetchError) {
        console.log(`   ❌ Fetch error: ${fetchError.message}`);
        console.log('   💡 Make sure the server is running on port 3001');
      }
    }

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await User.deleteOne({ email: testEmail });
    await ActivityLog.deleteMany({ 
      type: 'email_verification',
      details: { $regex: testEmail }
    });
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Alternative test using axios if available
async function testWithAxios() {
  try {
    const axios = require('axios');
    console.log('\n🔄 Testing with axios...');
    
    // This would test the actual HTTP endpoint
    // You'll need to have the server running for this to work
    
  } catch (error) {
    console.log('📦 Axios not available, skipping HTTP tests');
    console.log('💡 To test HTTP endpoints, install axios: npm install axios');
  }
}

// Instructions for manual testing
function printManualTestInstructions() {
  console.log('\n📝 Manual Testing Instructions:');
  console.log('=' .repeat(50));
  console.log('1. Make sure your server is running (npm start in Server folder)');
  console.log('2. Make sure your client is running (npm run dev in Client folder)');
  console.log('3. Register a new user and note the verification token from the response');
  console.log('4. Test these URLs in your browser:');
  console.log('   - http://localhost:5173/verify?token=YOUR_TOKEN');
  console.log('   - http://localhost:5173/verify/YOUR_TOKEN');
  console.log('5. Check the browser console for any errors');
  console.log('6. Check the server console for verification logs');
  console.log('');
  console.log('🔍 Debugging checklist:');
  console.log('   ✓ Server responds to /api/auth/verify endpoint');
  console.log('   ✓ Frontend correctly extracts token from URL');
  console.log('   ✓ API service makes correct request');
  console.log('   ✓ Backend finds user and activates account');
  console.log('   ✓ Frontend displays success message');
  console.log('   ✓ User can navigate to dashboard');
}

// Run the tests
console.log('🧪 HTTP Endpoint Verification Tests');
console.log('=' .repeat(50));

testVerificationEndpoint()
  .then(() => {
    printManualTestInstructions();
  })
  .catch(error => {
    console.error('Test suite failed:', error);
  });
