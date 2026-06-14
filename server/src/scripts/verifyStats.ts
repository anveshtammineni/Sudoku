import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { isMongoReady } from '../config/db.js';

async function verifyStats() {
  try {
    // Connect to MongoDB if not already connected
    if (!isMongoReady()) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sudoku';
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    }

    // Find all users
    const users = await User.find().lean();

    console.log(`\n=== Database Statistics Verification ===`);
    console.log(`Total users in database: ${users.length}\n`);

    for (const user of users) {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Total Games: ${user.totalGames ?? 'NOT SET'}`);
      console.log(`  Total Wins: ${user.totalWins ?? 'NOT SET'}`);
      console.log(`  Best Time: ${user.bestTime ?? 'NOT SET'}`);
      console.log(`  Win Rate: ${user.winRate ?? 'NOT SET'}%`);
      console.log(`  Created At: ${user.createdAt}`);
      console.log('');
    }

    console.log('=== Verification Complete ===');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the verification
verifyStats();
