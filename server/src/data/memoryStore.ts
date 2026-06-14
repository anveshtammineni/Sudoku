import type { Difficulty, GameSessionRecord, LeaderboardEntry, UserRecord } from '../types/domain.js';

const users = new Map<string, UserRecord>();
const games = new Map<string, GameSessionRecord>();
const leaderboard = new Map<string, LeaderboardEntry>();

export function getUsers(): UserRecord[] {
  return Array.from(users.values());
}

export function getUserById(id: string): UserRecord | undefined {
  return users.get(id);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return Array.from(users.values()).find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: UserRecord): UserRecord {
  users.set(user.id, user);
  return user;
}

export function saveGameSession(session: GameSessionRecord): GameSessionRecord {
  games.set(session.id, session);
  return session;
}

export function getGameSessionsByUser(userId?: string): GameSessionRecord[] {
  const all = Array.from(games.values());
  return userId ? all.filter((session) => session.userId === userId) : all;
}

export function getGameSessionById(id: string): GameSessionRecord | undefined {
  return games.get(id);
}

export function upsertLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry {
  const key = `${entry.userId}:${entry.difficulty}`;
  const current = leaderboard.get(key);
  const nextEntry: LeaderboardEntry = {
    ...entry,
    wins: (current?.wins ?? 0) + entry.wins,
    bestScore: current ? Math.max(current.bestScore, entry.bestScore) : entry.bestScore,
    bestTime: current && current.wins > 0 ? Math.min(current.bestTime, entry.bestTime) : entry.bestTime,
  };

  leaderboard.set(key, nextEntry);
  return nextEntry;
}

export function getLeaderboardEntries(): LeaderboardEntry[] {
  return Array.from(leaderboard.values()).sort((left, right) => right.wins - left.wins || left.bestTime - right.bestTime);
}

export function getLeaderboardByDifficulty(difficulty?: Difficulty): LeaderboardEntry[] {
  return getLeaderboardEntries().filter((entry) => !difficulty || entry.difficulty === difficulty);
}
