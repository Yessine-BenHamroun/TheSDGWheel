const mongoose = require('mongoose');
const ProofLog = require('./src/models/ProofLog');
require('dotenv').config();

async function testProofLogModel() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧪 Testing ProofLog model...');
    
    // Test if the model loads correctly
    console.log('ProofLog model methods:');
    console.log('- createFromProof:', typeof ProofLog.createFromProof);
    console.log('- logAction:', typeof ProofLog.logAction);
    console.log('- findOne:', typeof ProofLog.findOne);
    
    if (typeof ProofLog.findOne === 'function') {
      console.log('✅ ProofLog.findOne is available');
    } else {
      console.log('❌ ProofLog.findOne is not available');
    }
    
    if (typeof ProofLog.createFromProof === 'function') {
      console.log('✅ ProofLog.createFromProof is available');
    } else {
      console.log('❌ ProofLog.createFromProof is not available');
    }

    console.log('\n🔍 Checking existing ProofLogs...');
    const existingLogs = await ProofLog.find({}).limit(5);
    console.log(`Found ${existingLogs.length} existing proof logs`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testProofLogModel();
