export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Board = number[][];

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalGames?: number;
  totalWins?: number;
  bestTime?: number;
  winRate?: number;
}

export interface GameSession {
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

export interface DashboardData {
  user: User;
  stats: {
    totalGames: number;
    wins: number;
    winRate: number;
    bestTime: number;
    averageTime: number;
    totalMistakes: number;
    totalHints: number;
    totalWins: number;
  };
  recentGames: GameSession[];
  leaderboard: LeaderboardEntry[];
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  [key: string]: unknown;
}
