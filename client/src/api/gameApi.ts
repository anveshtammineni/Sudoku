import { apiClient } from './client';
import type { Board, Difficulty, GameSession } from '../types';

export async function getNewGame(difficulty: Difficulty) {
  const response = await apiClient.get('/game/new', { params: { difficulty } });
  return response.data as { gameId: string; difficulty: Difficulty; puzzle: Board; solution: Board; clues: number; session: GameSession };
}

export async function validateGame(payload: { board: Board; solution: Board }) {
  const response = await apiClient.post('/game/validate', payload);
  return response.data as { isComplete: boolean; isSolved: boolean; invalidCells: Array<{ row: number; col: number; value: number }> };
}

export async function solveGame(payload: { board: Board }) {
  const response = await apiClient.post('/game/solve', payload);
  return response.data as { solution: Board };
}

export async function saveGame(payload: {
  gameId?: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  completed: boolean;
  status?: 'active' | 'paused' | 'completed';
}) {
  const response = await apiClient.post('/game/save', payload);
  return response.data as { session: GameSession };
}

export async function getHistory() {
  const response = await apiClient.get('/game/history');
  return response.data as { sessions: GameSession[] };
}

export async function getHint(payload: { board: Board; solution: Board }) {
  const response = await apiClient.post('/game/hint', payload);
  return response.data as { hint: { row: number; col: number; value: number } | null };
}
