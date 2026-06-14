import { randomUUID } from 'crypto';
import {
  saveGameSession,
  getGameSessionsByUser,
  upsertLeaderboardEntry,
  getLeaderboardEntries,
  getLeaderboardByDifficulty,
  getUserById,
  getGameSessionById,
  saveUser,
} from '../data/store.js';
import type { Board, Difficulty, GameSessionRecord } from '../types/domain.js';
import { calculateScore } from './scoreService.js';
import { createHint, generatePuzzle, normalizeBoard, solveBoard, validateBoard } from './sudokuService.js';

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function toGameSessionRecord(params: {
  userId?: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board?: Board;
  completed?: boolean;
  timeElapsed?: number;
  mistakes?: number;
  hintsUsed?: number;
  score?: number;
  status?: GameSessionRecord['status'];
}): GameSessionRecord {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    difficulty: params.difficulty,
    puzzle: cloneBoard(params.puzzle),
    solution: cloneBoard(params.solution),
    board: cloneBoard(params.board ?? params.puzzle),
    completed: params.completed ?? false,
    timeElapsed: params.timeElapsed ?? 0,
    mistakes: params.mistakes ?? 0,
    hintsUsed: params.hintsUsed ?? 0,
    score: params.score ?? 0,
    status: params.status ?? 'active',
    createdAt: now,
    updatedAt: now,
    ...(params.userId ? { userId: params.userId } : {}),
  };
}

export async function createNewGame(difficulty: Difficulty, userId?: string) {
  const { puzzle, solution, clues } = generatePuzzle(difficulty);
  const session = toGameSessionRecord(userId ? { userId, difficulty, puzzle, solution } : { difficulty, puzzle, solution });
  await saveGameSession(session);

  return {
    gameId: session.id,
    difficulty,
    puzzle,
    solution,
    clues,
    session,
  };
}

export function validateCurrentGame(input: { board: Board; solution?: Board }) {
  const board = normalizeBoard(input.board);
  return validateBoard(board, input.solution);
}

export function solveCurrentGame(board: Board) {
  return solveBoard(normalizeBoard(board));
}

export async function saveGameProgress(input: {
  gameId?: string;
  userId?: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  completed: boolean;
  status?: GameSessionRecord['status'];
}) {
  const validation = validateBoard(normalizeBoard(input.board), input.solution);
  const score = calculateScore({
    difficulty: input.difficulty,
    timeElapsed: input.timeElapsed,
    mistakes: input.mistakes + validation.invalidCells.length,
    hintsUsed: input.hintsUsed,
  });

  const sessionId = input.gameId ?? randomUUID();
  const existingSession = input.gameId ? await getGameSessionById(input.gameId) : undefined;
  const now = new Date().toISOString();

  const session: GameSessionRecord = {
    id: sessionId,
    difficulty: input.difficulty,
    puzzle: cloneBoard(input.puzzle),
    solution: cloneBoard(input.solution),
    board: cloneBoard(input.board),
    completed: input.completed,
    timeElapsed: input.timeElapsed,
    mistakes: input.mistakes + validation.invalidCells.length,
    hintsUsed: input.hintsUsed,
    score,
    status: input.status ?? (input.completed ? 'completed' : 'active'),
    createdAt: existingSession?.createdAt ?? now,
    updatedAt: now,
    ...(input.userId ? { userId: input.userId } : {}),
  };

  await saveGameSession(session);

  console.log('[STATS DEBUG] Game saved:', {
    sessionId: session.id,
    userId: session.userId,
    completed: session.completed,
    status: session.status,
    timeElapsed: session.timeElapsed,
    score: session.score,
  });

  if (session.userId && session.completed) {
    console.log('[STATS DEBUG] Game completed, updating user statistics');
    const user = await getUserById(session.userId);
    console.log('[STATS DEBUG] Current user stats:', user);

    await upsertLeaderboardEntry({
      userId: session.userId,
      name: user?.name ?? session.userId,
      difficulty: session.difficulty,
      bestScore: session.score,
      bestTime: session.timeElapsed,
      wins: 1,
      updatedAt: session.updatedAt,
    });

    // Update user statistics
    if (user) {
      const totalGames = (user.totalGames ?? 0) + 1;
      const totalWins = (user.totalWins ?? 0) + 1;
      const bestTime = user.bestTime && user.bestTime > 0 ? Math.min(user.bestTime, session.timeElapsed) : session.timeElapsed;
      const winRate = Math.round((totalWins / totalGames) * 100);

      console.log('[STATS DEBUG] Calculated new stats:', {
        totalGames,
        totalWins,
        bestTime,
        winRate,
        previousBestTime: user.bestTime,
        currentTime: session.timeElapsed,
      });

      const updatedUser = await saveUser({
        ...user,
        totalGames,
        totalWins,
        bestTime,
        winRate,
      });

      console.log('[STATS DEBUG] User updated successfully:', updatedUser);
    } else {
      console.error('[STATS DEBUG] User not found for ID:', session.userId);
    }
  } else if (session.userId) {
    console.log('[STATS DEBUG] Game not completed, updating total games only');
    // Update total games even if not completed
    const user = await getUserById(session.userId);
    console.log('[STATS DEBUG] Current user stats before update:', user);

    if (user) {
      const totalGames = (user.totalGames ?? 0) + 1;
      const totalWins = user.totalWins ?? 0;
      const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

      console.log('[STATS DEBUG] Calculated new stats (non-completed):', {
        totalGames,
        totalWins,
        winRate,
      });

      const updatedUser = await saveUser({
        ...user,
        totalGames,
        totalWins,
        winRate,
      });

      console.log('[STATS DEBUG] User updated successfully (non-completed):', updatedUser);
    } else {
      console.error('[STATS DEBUG] User not found for ID:', session.userId);
    }
  } else {
    console.log('[STATS DEBUG] No userId associated with session, skipping stats update');
  }

  return session;
}

export async function createHintForGame(board: Board, solution: Board) {
  return createHint(normalizeBoard(board), solution);
}

export async function getHistory(userId?: string) {
  const games = await getGameSessionsByUser(userId);
  return games.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getLeaderboard(difficulty?: Difficulty) {
  return difficulty ? getLeaderboardByDifficulty(difficulty) : getLeaderboardEntries();
}