import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/authRoutes.js';
import gameRouter from './routes/gameRoutes.js';
import userRouter from './routes/userRoutes.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';
import { env } from './config/env.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/user', userRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
