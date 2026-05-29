import { apiClient } from './client';
import type { DashboardData, LeaderboardEntry } from '../types';

export async function getDashboard() {
  const response = await apiClient.get('/user/dashboard');
  return response.data as DashboardData;
}

export async function getLeaderboard(difficulty?: string) {
  const response = await apiClient.get('/user/leaderboard', { params: { difficulty } });
  return response.data as { leaderboard: LeaderboardEntry[] };
}
