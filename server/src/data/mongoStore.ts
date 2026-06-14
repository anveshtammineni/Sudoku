import type { Difficulty, GameSessionRecord, LeaderboardEntry, UserRecord } from '../types/domain.js';
import { User } from '../models/User.js';
import { GameSession } from '../models/GameSession.js';
import { Leaderboard } from '../models/Leaderboard.js';

function mapUser(doc: {
  _id: string | { toString(): string };
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  totalGames?: number;
  totalWins?: number;
  bestTime?: number;
  winRate?: number;
}): UserRecord {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt.toISOString(),
    totalGames: doc.totalGames ?? 0,
    totalWins: doc.totalWins ?? 0,
    bestTime: doc.bestTime ?? 0,
    winRate: doc.winRate ?? 0,
  };
}

function mapGame(doc: {
  _id: string | { toString(): string };
  userId?: string;
  difficulty: GameSessionRecord['difficulty'];
  puzzle: GameSessionRecord['puzzle'];
  solution: GameSessionRecord['solution'];
  board: GameSessionRecord['board'];
  completed: boolean;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  status: GameSessionRecord['status'];
  createdAt: Date;
  updatedAt: Date;
}): GameSessionRecord {
  return {
    id: doc._id.toString(),
    difficulty: doc.difficulty,
    puzzle: doc.puzzle,
    solution: doc.solution,
    board: doc.board,
    completed: doc.completed,
    timeElapsed: doc.timeElapsed,
    mistakes: doc.mistakes,
    hintsUsed: doc.hintsUsed,
    score: doc.score,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    ...(doc.userId ? { userId: doc.userId } : {}),
  };
}

function mapLeaderboard(doc: {
  userId: string;
  name: string;
  difficulty: LeaderboardEntry['difficulty'];
  bestScore: number;
  bestTime: number;
  wins: number;
  updatedAt: Date;
}): LeaderboardEntry {
  return {
    userId: doc.userId,
    name: doc.name,
    difficulty: doc.difficulty,
    bestScore: doc.bestScore,
    bestTime: doc.bestTime,
    wins: doc.wins,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getUsers(): Promise<UserRecord[]> {
  const docs = await User.find().lean();
  return docs.map(mapUser);
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const doc = await User.findById(id).lean();
  return doc ? mapUser(doc) : undefined;
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  const doc = await User.findOne({ email: email.toLowerCase() }).lean();
  return doc ? mapUser(doc) : undefined;
}

export async function saveUser(user: UserRecord): Promise<UserRecord> {
  console.log('[STATS DEBUG] saveUser called with:', {
    id: user.id,
    name: user.name,
    totalGames: user.totalGames,
    totalWins: user.totalWins,
    bestTime: user.bestTime,
    winRate: user.winRate,
  });

  const doc = await User.findOneAndUpdate(
    { _id: user.id },
    {
      $set: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        totalGames: user.totalGames ?? 0,
        totalWins: user.totalWins ?? 0,
        bestTime: user.bestTime ?? 0,
        winRate: user.winRate ?? 0,
      },
      $setOnInsert: {
        _id: user.id,
        createdAt: new Date(user.createdAt),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  if (!doc) {
    console.error('[STATS DEBUG] Failed to save user - no document returned');
    throw new Error('Failed to save user');
  }

  const mappedUser = mapUser(doc);
  console.log('[STATS DEBUG] User saved successfully, mapped result:', {
    id: mappedUser.id,
    totalGames: mappedUser.totalGames,
    totalWins: mappedUser.totalWins,
    bestTime: mappedUser.bestTime,
    winRate: mappedUser.winRate,
  });

  return mappedUser;
}

export async function saveGameSession(session: GameSessionRecord): Promise<GameSessionRecord> {
  const now = new Date();
  const doc = await GameSession.findOneAndUpdate(
    { _id: session.id },
    {
      $set: {
        userId: session.userId,
        difficulty: session.difficulty,
        puzzle: session.puzzle,
        solution: session.solution,
        board: session.board,
        completed: session.completed,
        timeElapsed: session.timeElapsed,
        mistakes: session.mistakes,
        hintsUsed: session.hintsUsed,
        score: session.score,
        status: session.status,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: session.id,
        createdAt: new Date(session.createdAt),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  if (!doc) {
    throw new Error('Failed to save game session');
  }

  return mapGame(doc);
}

export async function getGameSessionsByUser(userId?: string): Promise<GameSessionRecord[]> {
  const filter = userId ? { userId } : {};
  const docs = await GameSession.find(filter).sort({ updatedAt: -1 }).lean();
  return docs.map(mapGame);
}

export async function getGameSessionById(id: string): Promise<GameSessionRecord | undefined> {
  const doc = await GameSession.findById(id).lean();
  return doc ? mapGame(doc) : undefined;
}

export async function upsertLeaderboardEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
  const existing = await Leaderboard.findOne({
    userId: entry.userId,
    difficulty: entry.difficulty,
  }).lean();

  const nextEntry: LeaderboardEntry = {
    ...entry,
    wins: (existing?.wins ?? 0) + entry.wins,
    bestScore: existing ? Math.max(existing.bestScore, entry.bestScore) : entry.bestScore,
    bestTime: existing && existing.wins > 0 ? Math.min(existing.bestTime, entry.bestTime) : entry.bestTime,
    updatedAt: new Date().toISOString(),
  };

  const doc = await Leaderboard.findOneAndUpdate(
    { userId: entry.userId, difficulty: entry.difficulty },
    {
      userId: nextEntry.userId,
      name: nextEntry.name,
      difficulty: nextEntry.difficulty,
      bestScore: nextEntry.bestScore,
      bestTime: nextEntry.bestTime,
      wins: nextEntry.wins,
      updatedAt: new Date(nextEntry.updatedAt),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  if (!doc) {
    throw new Error('Failed to update leaderboard');
  }

  return mapLeaderboard(doc);
}

export async function getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const docs = await Leaderboard.find().sort({ wins: -1, bestTime: 1 }).lean();
  return docs.map(mapLeaderboard);
}

export async function getLeaderboardByDifficulty(difficulty?: Difficulty): Promise<LeaderboardEntry[]> {
  const filter = difficulty ? { difficulty } : {};
  const docs = await Leaderboard.find(filter).sort({ wins: -1, bestTime: 1 }).lean();
  return docs.map(mapLeaderboard);
}
