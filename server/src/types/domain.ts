export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type CellValue = number | 0;
export type Board = CellValue[][];

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  totalGames?: number;
  totalWins?: number;
  bestTime?: number;
  winRate?: number;
}

export interface GameSessionRecord {
  id: string;
  userId?: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  completed: boolean;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  status: 'active' | 'paused' | 'completed' | 'lost';
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  difficulty: Difficulty;
  bestScore: number;
  bestTime: number;
  wins: number;
  updatedAt: string;
}
