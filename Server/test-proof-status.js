const mongoose = require('mongoose');
const Proof = require('./src/models/Proof');
const User = require('./src/models/User');
const Challenge = require('./src/models/Challenge');
require('dotenv').config();

async function testProofStatusUpdate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking proof statuses...');
    
    // Find proofs with different statuses
    const pendingProofs = await Proof.find({ status: 'PENDING' })
      .populate('user', 'username')
      .populate('challenge', 'title')
      .limit(5);
      
    const approvedProofs = await Proof.find({ status: 'APPROVED' })
      .populate('user', 'username')
      .populate('challenge', 'title')
      .limit(5);

    console.log(`\n📋 Pending proofs (${pendingProofs.length}):`);
    pendingProofs.forEach(proof => {
      console.log(`- ID: ${proof._id}`);
      console.log(`  User: ${proof.user?.username || 'Unknown'}`);
      console.log(`  Challenge: ${proof.challenge?.title || 'Unknown'}`);
      console.log(`  Status: ${proof.status}`);
      console.log(`  Created: ${proof.createdAt}`);
      console.log('');
    });

    console.log(`\n✅ Approved proofs (${approvedProofs.length}):`);
    approvedProofs.forEach(proof => {
      console.log(`- ID: ${proof._id}`);
      console.log(`  User: ${proof.user?.username || 'Unknown'}`);
      console.log(`  Challenge: ${proof.challenge?.title || 'Unknown'}`);
      console.log(`  Status: ${proof.status}`);
      console.log(`  Reviewed At: ${proof.reviewedAt || 'Not set'}`);
      console.log(`  Reviewed By: ${proof.reviewedBy || 'Not set'}`);
      console.log('');
    });

    // Check the specific proof that was mentioned in the error
    const specificProof = await Proof.findById('68b9e45eb330cb51bd452509')
      .populate('user', 'username')
      .populate('challenge', 'title')
      .populate('reviewedBy', 'username');
      
    if (specificProof) {
      console.log('\n🎯 Specific proof from error log:');
      console.log(`- ID: ${specificProof._id}`);
      console.log(`- User: ${specificProof.user?.username || 'Unknown'}`);
      console.log(`- Challenge: ${specificProof.challenge?.title || 'Unknown'}`);
      console.log(`- Status: ${specificProof.status}`);
      console.log(`- Reviewed At: ${specificProof.reviewedAt || 'Not set'}`);
      console.log(`- Reviewed By: ${specificProof.reviewedBy?.username || 'Not set'}`);
      console.log(`- Created: ${specificProof.createdAt}`);
      console.log(`- Updated: ${specificProof.updatedAt}`);
    } else {
      console.log('\n❌ Specific proof not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testProofStatusUpdate();
