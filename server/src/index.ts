import './config/loadEnv.js';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  const storage = await connectDB();
  app.locals.storage = storage;

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Sudoku API running on http://localhost:${env.port} (${storage} store)`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
