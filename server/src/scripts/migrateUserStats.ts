import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { isMongoReady } from '../config/db.js';

async function migrateUserStats() {
  try {
    // Connect to MongoDB if not already connected
    if (!isMongoReady()) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sudoku';
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    }

    // Find all users without the new fields
    const users = await User.find({
      $or: [
        { totalGames: { $exists: false } },
        { totalWins: { $exists: false } },
        { bestTime: { $exists: false } },
        { winRate: { $exists: false } },
      ],
    });

    console.log(`Found ${users.length} users needing migration`);

    if (users.length === 0) {
      console.log('No users need migration. All users already have the new fields.');
      return;
    }

    // Update each user with default values
    for (const user of users) {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          totalGames: user.totalGames ?? 0,
          totalWins: user.totalWins ?? 0,
          bestTime: user.bestTime ?? 0,
          winRate: user.winRate ?? 0,
        },
      });
      console.log(`Migrated user: ${user.name} (${user.email})`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateUserStats();
