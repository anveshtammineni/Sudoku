import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const UserModel = model('User', userSchema);
