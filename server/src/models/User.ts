import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document<string> {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  totalGames?: number;
  totalWins?: number;
  bestTime?: number;
  winRate?: number;
}

const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  totalGames: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  bestTime: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
});

export const User = mongoose.model<IUser>('User', userSchema);
