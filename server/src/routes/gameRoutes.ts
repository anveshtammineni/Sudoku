import { Router } from 'express';
import { z } from 'zod';
import { historyController, hintController, newGameController, saveGameController, solveGameController, validateGameController } from '../controllers/gameController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const gameRouter = Router();

const boardSchema = z.array(z.array(z.number().int().min(0).max(9))).length(9);

const validateSchema = z.object({
  board: boardSchema,
  solution: boardSchema.optional(),
});

const solveSchema = z.object({
  board: boardSchema,
});

const saveSchema = z.object({
  gameId: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  puzzle: boardSchema,
  solution: boardSchema,
  board: boardSchema,
  timeElapsed: z.number().nonnegative(),
  mistakes: z.number().nonnegative(),
  hintsUsed: z.number().nonnegative(),
  completed: z.boolean(),
  status: z.enum(['active', 'paused', 'completed', 'lost']).optional(),
});

gameRouter.get('/new', requireAuth, newGameController);
gameRouter.post('/validate', validateRequest(validateSchema), validateGameController);
gameRouter.post('/solve', validateRequest(solveSchema), solveGameController);
gameRouter.post('/save', requireAuth, validateRequest(saveSchema), saveGameController);
gameRouter.post('/hint', validateRequest(z.object({ board: boardSchema, solution: boardSchema })), hintController);
gameRouter.get('/history', requireAuth, historyController);

export default gameRouter;
