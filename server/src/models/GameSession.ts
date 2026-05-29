import { Schema, model } from 'mongoose';

const gameSessionSchema = new Schema(
  {
    _id: { type: String },
    userId: { type: String, ref: 'User' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
    puzzle: { type: [[Number]], required: true },
    solution: { type: [[Number]], required: true },
    board: { type: [[Number]], required: true },
    completed: { type: Boolean, default: false },
    timeElapsed: { type: Number, default: 0 },
    mistakes: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

gameSessionSchema.pre('save', function updateTimestamp(this: any, next) {
  this.updatedAt = new Date();
  next();
});

export const GameSessionModel = model('GameSession', gameSessionSchema);
