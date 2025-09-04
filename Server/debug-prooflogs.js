const mongoose = require('mongoose');
const Proof = require('./src/models/Proof');
const ProofLog = require('./src/models/ProofLog');
const User = require('./src/models/User');
const Challenge = require('./src/models/Challenge');
require('dotenv').config();

async function debugProofLogMismatch() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Finding proofs without corresponding ProofLogs...');
    
    // Get all proofs
    const allProofs = await Proof.find({})
      .populate('user', 'username')
      .populate('challenge', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Found ${allProofs.length} recent proofs:`);
    
    for (const proof of allProofs) {
      // Check if there's a corresponding ProofLog
      const proofLog = await ProofLog.findOne({ originalProofId: proof._id });
      
      const hasLog = proofLog ? '✅' : '❌';
      console.log(`\n${hasLog} Proof ID: ${proof._id}`);
      console.log(`   User: ${proof.user?.username || 'Unknown'}`);
      console.log(`   Challenge: ${proof.challenge?.title || 'Unknown'}`);
      console.log(`   Status: ${proof.status}`);
      console.log(`   Created: ${proof.createdAt}`);
      console.log(`   Updated: ${proof.updatedAt}`);
      
      if (proofLog) {
        console.log(`   ProofLog Status: ${proofLog.status}`);
        console.log(`   ProofLog Created: ${proofLog.createdAt}`);
        console.log(`   ProofLog Updated: ${proofLog.updatedAt}`);
      } else {
        console.log(`   ❌ NO PROOF LOG FOUND - This is the issue!`);
        
        // Create missing ProofLog for this proof
        console.log(`   🔧 Creating missing ProofLog...`);
        try {
          const newProofLog = await ProofLog.createFromProof(proof, proof.status, {
            performedBy: proof.user,
            details: `ProofLog created retroactively for ${proof.status} proof`,
            pointsAwarded: proof.status === 'APPROVED' ? (proof.challenge?.points || 0) : 0
          });
          
          if (proof.reviewedBy && proof.reviewedAt) {
            newProofLog.reviewedBy = proof.reviewedBy;
            newProofLog.reviewedAt = proof.reviewedAt;
            await newProofLog.save();
          }
          
          console.log(`   ✅ Created ProofLog: ${newProofLog._id}`);
        } catch (createError) {
          console.log(`   ❌ Failed to create ProofLog: ${createError.message}`);
        }
      }
    }

    console.log('\n📊 Summary:');
    const totalProofs = await Proof.countDocuments();
    const totalProofLogs = await ProofLog.countDocuments();
    console.log(`Total Proofs: ${totalProofs}`);
    console.log(`Total ProofLogs: ${totalProofLogs}`);
    
    if (totalProofs !== totalProofLogs) {
      console.log(`❌ Mismatch detected: ${totalProofs - totalProofLogs} proofs are missing ProofLogs`);
    } else {
      console.log(`✅ All proofs have corresponding ProofLogs`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugProofLogMismatch();
