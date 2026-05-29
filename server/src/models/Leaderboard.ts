import { Schema, model } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
    bestScore: { type: Number, default: 0 },
    bestTime: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const LeaderboardModel = model('Leaderboard', leaderboardSchema);
