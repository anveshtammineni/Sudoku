import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<boolean> {
  if (!env.mongoUri) {
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri);
    return true;
  } catch (error) {
    console.warn('MongoDB connection unavailable, continuing with in-memory persistence.', error);
    return false;
  }
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
