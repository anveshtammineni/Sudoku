import mongoose from 'mongoose';
import { env } from './env.js';

let mongoReady = false;

export function isMongoReady(): boolean {
  return mongoReady && mongoose.connection.readyState === 1;
}

export async function connectDB(): Promise<'mongo' | 'memory'> {
  const uri = env.mongoUri;

  if (!uri) {
    console.log('No MONGODB_URI set, using in-memory store');
    return 'memory';
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
    mongoReady = true;
    console.log(`MongoDB connected (${mongoose.connection.name} @ ${mongoose.connection.host})`);
    return 'mongo';
  } catch (error) {
    mongoReady = false;
    await mongoose.disconnect().catch(() => undefined);
    console.warn('MongoDB unavailable, using in-memory store.');
    if (error instanceof Error) {
      console.warn(error.message);
    }
    return 'memory';
  }
}
