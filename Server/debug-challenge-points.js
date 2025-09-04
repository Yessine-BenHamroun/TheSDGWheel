const mongoose = require('mongoose');
const Proof = require('./src/models/Proof');
const Challenge = require('./src/models/Challenge');
const User = require('./src/models/User');
require('dotenv').config();

async function debugChallengePoints() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check the specific proof that's causing issues
    const proofId = '68b9e78d47819b9bc1b3522b';
    console.log(`\n🔍 Investigating proof: ${proofId}`);
    
    const proof = await Proof.findById(proofId)
      .populate('challenge')
      .populate('user', 'username');
    
    if (proof) {
      console.log('📄 Proof Details:');
      console.log(`  User: ${proof.user?.username || 'Unknown'}`);
      console.log(`  Status: ${proof.status}`);
      console.log(`  Challenge ID: ${proof.challenge?._id || 'Missing'}`);
      console.log(`  Challenge Title: ${proof.challenge?.title || 'Missing'}`);
      console.log(`  Challenge Points: ${proof.challenge?.points}`);
      console.log(`  Points Type: ${typeof proof.challenge?.points}`);
      console.log(`  Points Valid: ${!!(proof.challenge?.points && !isNaN(proof.challenge?.points))}`);
      
      if (proof.challenge) {
        console.log('\n🎯 Challenge Analysis:');
        console.log(`  Points value: ${proof.challenge.points}`);
        console.log(`  Is number: ${typeof proof.challenge.points === 'number'}`);
        console.log(`  Is NaN: ${isNaN(proof.challenge.points)}`);
        console.log(`  Is null/undefined: ${proof.challenge.points == null}`);
        console.log(`  Truthy: ${!!proof.challenge.points}`);
      }
    } else {
      console.log('❌ Proof not found');
    }

    // Check a few other challenges to see their points
    console.log('\n📊 Sample of all challenges and their points:');
    const challenges = await Challenge.find({}).limit(10);
    challenges.forEach(challenge => {
      console.log(`- ${challenge.title}: ${challenge.points} (${typeof challenge.points})`);
    });

    // Look for challenges with missing or invalid points
    console.log('\n⚠️ Challenges with invalid points:');
    const invalidChallenges = await Challenge.find({
      $or: [
        { points: { $exists: false } },
        { points: null },
        { points: { $type: "string" } },
        { points: { $lte: 0 } }
      ]
    });
    
    console.log(`Found ${invalidChallenges.length} challenges with invalid points:`);
    invalidChallenges.forEach(challenge => {
      console.log(`- ${challenge.title}: ${challenge.points} (${typeof challenge.points})`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugChallengePoints();
