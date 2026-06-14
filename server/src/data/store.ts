import { isMongoReady } from '../config/db.js';
import type { Difficulty, GameSessionRecord, LeaderboardEntry, UserRecord } from '../types/domain.js';
import * as memoryStore from './memoryStore.js';
import * as mongoStore from './mongoStore.js';

function useMongo(): boolean {
  return isMongoReady();
}

export async function getUsers(): Promise<UserRecord[]> {
  return useMongo() ? mongoStore.getUsers() : memoryStore.getUsers();
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  return useMongo() ? mongoStore.getUserById(id) : memoryStore.getUserById(id);
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  return useMongo() ? mongoStore.getUserByEmail(email) : memoryStore.getUserByEmail(email);
}

export async function saveUser(user: UserRecord): Promise<UserRecord> {
  return useMongo() ? mongoStore.saveUser(user) : memoryStore.saveUser(user);
}

export async function saveGameSession(session: GameSessionRecord): Promise<GameSessionRecord> {
  return useMongo() ? mongoStore.saveGameSession(session) : memoryStore.saveGameSession(session);
}

export async function getGameSessionsByUser(userId?: string): Promise<GameSessionRecord[]> {
  return useMongo() ? mongoStore.getGameSessionsByUser(userId) : memoryStore.getGameSessionsByUser(userId);
}

export async function getGameSessionById(id: string): Promise<GameSessionRecord | undefined> {
  return useMongo() ? mongoStore.getGameSessionById(id) : memoryStore.getGameSessionById(id);
}

export async function upsertLeaderboardEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
  return useMongo() ? mongoStore.upsertLeaderboardEntry(entry) : memoryStore.upsertLeaderboardEntry(entry);
}

export async function getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  return useMongo() ? mongoStore.getLeaderboardEntries() : memoryStore.getLeaderboardEntries();
}

export async function getLeaderboardByDifficulty(difficulty?: Difficulty): Promise<LeaderboardEntry[]> {
  return useMongo() ? mongoStore.getLeaderboardByDifficulty(difficulty) : memoryStore.getLeaderboardByDifficulty(difficulty);
}
