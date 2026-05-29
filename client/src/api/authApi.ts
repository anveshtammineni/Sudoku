import { apiClient } from './client';
import type { User } from '../types';

export async function register(payload: { name: string; email: string; password: string }) {
  const response = await apiClient.post('/auth/register', payload);
  return response.data as { user: User; token: string };
}

export async function login(payload: { email: string; password: string }) {
  const response = await apiClient.post('/auth/login', payload);
  return response.data as { user: User; token: string };
}

export async function me() {
  const response = await apiClient.get('/auth/me');
  return response.data as { user: User };
}

export async function logout() {
  const response = await apiClient.post('/auth/logout');
  return response.data as { message: string };
}
