import { randomUUID } from 'crypto';
import { isDatabaseReady } from '../config/db.js';
import { saveGameSession, getGameSessionsByUser, upsertLeaderboardEntry, getLeaderboardEntries, getLeaderboardByDifficulty, getUserById } from '../data/memoryStore.js';
import { GameSessionModel } from '../models/GameSession.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
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
  saveGameSession(session);

  if (isDatabaseReady()) {
    await GameSessionModel.create({
      _id: session.id,
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
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    });
  }

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

  const session: GameSessionRecord = {
    id: input.gameId ?? randomUUID(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(input.userId ? { userId: input.userId } : {}),
  };

  saveGameSession(session);

  if (session.userId) {
    const user = getUserById(session.userId);
    upsertLeaderboardEntry({
      userId: session.userId,
      name: user?.name ?? session.userId,
      difficulty: session.difficulty,
      bestScore: session.score,
      bestTime: session.timeElapsed,
      wins: session.completed ? 1 : 0,
      updatedAt: session.updatedAt,
    });
  }

  if (isDatabaseReady()) {
    await GameSessionModel.findByIdAndUpdate(session.id, session, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    if (session.userId) {
      const user = getUserById(session.userId);
      await LeaderboardModel.findOneAndUpdate(
        { userId: session.userId, difficulty: session.difficulty },
        {
          _id: `${session.userId}:${session.difficulty}`,
          userId: session.userId,
          name: user?.name ?? session.userId,
          difficulty: session.difficulty,
          bestScore: session.score,
          bestTime: session.timeElapsed,
          wins: session.completed ? 1 : 0,
          updatedAt: new Date(session.updatedAt),
        },
        { upsert: true, new: true }
      ).exec();
    }
  }

  return session;
}

export async function createHintForGame(board: Board, solution: Board) {
  return createHint(normalizeBoard(board), solution);
}

export function getHistory(userId?: string) {
  return getGameSessionsByUser(userId).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getLeaderboard(difficulty?: Difficulty) {
  return difficulty ? getLeaderboardByDifficulty(difficulty) : getLeaderboardEntries();
}
