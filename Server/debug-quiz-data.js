const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sustainability-db');

const Quiz = require('./models/Quiz');
const Challenge = require('./models/Challenge');
const ODD = require('./models/ODD');

async function checkData() {
  try {
    console.log('🔍 Checking database content...\n');
    
    // Count total items
    const quizCount = await Quiz.countDocuments();
    const challengeCount = await Challenge.countDocuments();
    const oddCount = await ODD.countDocuments();
    
    console.log(`📊 Database Stats:`);
    console.log(`   Quizzes: ${quizCount}`);
    console.log(`   Challenges: ${challengeCount}`);
    console.log(`   ODDs: ${oddCount}\n`);
    
    // Check quizzes per ODD
    const odds = await ODD.find({});
    console.log('📝 Quizzes per ODD:');
    for (const odd of odds) {
      const quizCount = await Quiz.countDocuments({ odd: odd._id });
      console.log(`   ODD ${odd.oddId}: ${quizCount} quizzes`);
    }
    
    console.log('\n💪 Challenges per ODD:');
    for (const odd of odds) {
      const challengeCount = await Challenge.countDocuments({ odd: odd._id });
      console.log(`   ODD ${odd.oddId}: ${challengeCount} challenges`);
    }
    
    // Test the getRandomByODD method for a specific ODD
    if (odds.length > 0) {
      const testODD = odds[0];
      console.log(`\n🎯 Testing random selection for ODD ${testODD.oddId}:`);
      
      const randomQuiz = await Quiz.getRandomByODD(testODD._id);
      const randomChallenge = await Challenge.getRandomByODD(testODD._id);
      
      console.log(`   Random quiz: ${randomQuiz ? 'Found' : 'Not found'}`);
      console.log(`   Random challenge: ${randomChallenge ? 'Found' : 'Not found'}`);
      
      if (randomQuiz) {
        console.log(`   Quiz title: ${randomQuiz.question.substring(0, 50)}...`);
      }
      if (randomChallenge) {
        console.log(`   Challenge title: ${randomChallenge.title}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkData();
