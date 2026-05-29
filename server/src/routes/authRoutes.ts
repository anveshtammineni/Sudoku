import { Router } from 'express';
import { z } from 'zod';
import { loginController, logoutController, meController, registerController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/register', validateRequest(registerSchema), registerController);
authRouter.post('/login', validateRequest(loginSchema), loginController);
authRouter.get('/me', requireAuth, meController);
authRouter.post('/logout', requireAuth, logoutController);

export default authRouter;
