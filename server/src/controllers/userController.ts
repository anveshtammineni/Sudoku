import type { RequestHandler } from 'express';
import { getDashboard } from '../services/userService.js';
import { getLeaderboard } from '../services/gameService.js';
import type { Difficulty } from '../types/domain.js';

function resolveDifficulty(value: unknown): Difficulty | undefined {
  return value === 'easy' || value === 'medium' || value === 'hard' || value === 'expert' ? value : undefined;
}

export const dashboardController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const dashboard = await getDashboard(req.user.id);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const leaderboardController: RequestHandler = async (req, res, next) => {
  try {
    const difficulty = resolveDifficulty(req.query.difficulty);
    const leaderboard = await getLeaderboard(difficulty);
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};
