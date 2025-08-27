const cron = require('node-cron');
const DailySpin = require('../models/DailySpin');
const PendingChallenge = require('../models/PendingChallenge');

const startScheduler = () => {
  // Run cleanup every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕛 Running daily cleanup at midnight...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Delete ALL pending challenges from previous days (regardless of status)
      const deletedPendingChallenges = await PendingChallenge.deleteMany({
        createdAt: { $lt: today }
      });

      // Clean up unaccepted daily spins from previous days
      const deletedSpins = await DailySpin.deleteMany({
        spinDate: { $lt: today },
        scenarioType: 'challenge',
        challengeAccepted: false
      });

      console.log(`🧹 Daily cleanup completed:
        - Deleted ${deletedPendingChallenges.deletedCount} old pending challenges
        - Deleted ${deletedSpins.deletedCount} unaccepted challenge spins`);

    } catch (error) {
      console.error('❌ Daily cleanup error:', error);
    }
  });

  console.log('⏰ Daily cleanup scheduler started');
};

const cleanupOldChallenges = async (userId = null) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = userId 
      ? { user: userId, createdAt: { $lt: today } }
      : { createdAt: { $lt: today } };

    // Delete all pending challenges older than today
    const deletedPendingChallenges = await PendingChallenge.deleteMany(filter);

    if (userId) {
      // Also clean up old daily spins for this specific user
      const deletedSpins = await DailySpin.deleteMany({
        user: userId,
        spinDate: { $lt: today },
        scenarioType: 'challenge',
        challengeAccepted: false
      });

      if (deletedPendingChallenges.deletedCount > 0 || deletedSpins.deletedCount > 0) {
        console.log(`🧹 User cleanup for ${userId}: ${deletedPendingChallenges.deletedCount} pending challenges, ${deletedSpins.deletedCount} spins`);
      }
    }

    return deletedPendingChallenges.deletedCount;
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return 0;
  }
};

module.exports = { startScheduler, cleanupOldChallenges };