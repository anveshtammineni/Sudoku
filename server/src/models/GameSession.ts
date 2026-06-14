import mongoose, { Document, Schema } from 'mongoose';
import type { Board, Difficulty } from '../types/domain.js';

export interface IGameSession extends Document<string> {
  userId?: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  completed: boolean;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  status: 'active' | 'paused' | 'completed' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

const gameSessionSchema = new Schema<IGameSession>({
  _id: { type: String, required: true },
  userId: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
  puzzle: { type: [[Number]], required: true },
  solution: { type: [[Number]], required: true },
  board: { type: [[Number]], required: true },
  completed: { type: Boolean, default: false },
  timeElapsed: { type: Number, default: 0 },
  mistakes: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'completed', 'lost'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

gameSessionSchema.index({ userId: 1, createdAt: -1 });

export const GameSession = mongoose.model<IGameSession>('GameSession', gameSessionSchema);
