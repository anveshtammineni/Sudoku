import type { RequestHandler } from 'express';
import { createHintForGame, createNewGame, getHistory, saveGameProgress, solveCurrentGame, validateCurrentGame } from '../services/gameService.js';
import type { Difficulty } from '../types/domain.js';

function resolveDifficulty(value: unknown): Difficulty {
  return value === 'medium' || value === 'hard' || value === 'expert' ? value : 'easy';
}

export const newGameController: RequestHandler = async (req, res, next) => {
  try {
    const difficulty = resolveDifficulty(req.query.difficulty);
    const result = await createNewGame(difficulty, req.user?.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const validateGameController: RequestHandler = (req, res, next) => {
  try {
    const { board, solution } = req.body;
    const result = validateCurrentGame({ board, solution });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const solveGameController: RequestHandler = (req, res, next) => {
  try {
    const { board } = req.body;
    const solution = solveCurrentGame(board);
    if (!solution) {
      res.status(400).json({ message: 'Puzzle cannot be solved' });
      return;
    }

    res.json({ solution });
  } catch (error) {
    next(error);
  }
};

export const saveGameController: RequestHandler = async (req, res, next) => {
  try {
    console.log('[STATS DEBUG] saveGameController called with:', {
      userId: req.user?.id,
      completed: req.body.completed,
      status: req.body.status,
      timeElapsed: req.body.timeElapsed,
    });
    const session = await saveGameProgress({
      ...req.body,
      userId: req.user?.id,
    });
    console.log('[STATS DEBUG] saveGameController response:', {
      sessionId: session.id,
      userId: session.userId,
      completed: session.completed,
      status: session.status,
    });
    res.status(201).json({ session });
  } catch (error) {
    console.error('[STATS DEBUG] saveGameController error:', error);
    next(error);
  }
};

export const historyController: RequestHandler = async (req, res, next) => {
  try {
    const sessions = await getHistory(req.user?.id);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

export const hintController: RequestHandler = async (req, res, next) => {
  try {
    const hint = await createHintForGame(req.body.board, req.body.solution);
    res.json({ hint });
  } catch (error) {
    next(error);
  }
};
