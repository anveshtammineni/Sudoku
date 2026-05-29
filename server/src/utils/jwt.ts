import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtUserPayload {
  id: string;
  email: string;
}

export function signToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.jwtSecret) as JwtUserPayload;
}
