import { Router } from 'express';
import { dashboardController, leaderboardController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const userRouter = Router();

userRouter.get('/dashboard', requireAuth, dashboardController);
userRouter.get('/leaderboard', leaderboardController);

export default userRouter;
