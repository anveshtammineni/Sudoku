import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { saveUser, getUserByEmail, getUserById } from '../data/store.js';
import type { UserRecord } from '../types/domain.js';
import { signToken } from '../utils/jwt.js';

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await getUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await saveUser(user);

  return {
    user: sanitizeUser(user),
    token: signToken({ id: user.id, email: user.email }),
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await getUserByEmail(input.email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return {
    user: sanitizeUser(user),
    token: signToken({ id: user.id, email: user.email }),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }
  return sanitizeUser(user);
}