import mongoose, { Document, Schema } from 'mongoose';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ILeaderboard extends Document {
  userId: string;
  name: string;
  difficulty: Difficulty;
  bestScore: number;
  bestTime: number;
  wins: number;
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboard>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
  bestScore: { type: Number, default: 0 },
  bestTime: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

leaderboardSchema.index({ userId: 1, difficulty: 1 }, { unique: true });
leaderboardSchema.index({ difficulty: 1, wins: -1, bestTime: 1 });

export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);