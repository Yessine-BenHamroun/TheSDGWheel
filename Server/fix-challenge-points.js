const mongoose = require('mongoose');
const Challenge = require('./src/models/Challenge');
require('dotenv').config();

async function fixChallengePoints() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔧 Fixing challenge points...');
    
    // Get all challenges with missing points
    const challengesWithoutPoints = await Challenge.find({
      $or: [
        { points: { $exists: false } },
        { points: null },
        { points: undefined }
      ]
    });

    console.log(`Found ${challengesWithoutPoints.length} challenges without points`);

    // Define default points based on difficulty/type
    const defaultPointsByDifficulty = {
      'easy': 10,
      'medium': 20,
      'hard': 30,
      'expert': 50
    };

    let updateCount = 0;
    
    for (const challenge of challengesWithoutPoints) {
      // Assign points based on difficulty, or default to 25
      let points = 25; // Default points
      
      if (challenge.difficulty && defaultPointsByDifficulty[challenge.difficulty.toLowerCase()]) {
        points = defaultPointsByDifficulty[challenge.difficulty.toLowerCase()];
      }
      
      // Update the challenge
      await Challenge.findByIdAndUpdate(challenge._id, { points: points });
      updateCount++;
      
      console.log(`✅ Updated "${challenge.title}": ${points} points`);
    }

    console.log(`\n🎉 Successfully updated ${updateCount} challenges with points!`);

    // Verify the fix
    console.log('\n🔍 Verification - checking a few challenges:');
    const sampleChallenges = await Challenge.find({}).limit(5);
    sampleChallenges.forEach(challenge => {
      console.log(`- ${challenge.title}: ${challenge.points} points ✅`);
    });

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixChallengePoints();
