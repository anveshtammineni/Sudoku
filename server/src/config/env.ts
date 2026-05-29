export interface AppEnv {
  port: number;
  clientUrl: string;
  jwtSecret: string;
  mongoUri: string | undefined;
}

const defaultPort = 4000;

export const env: AppEnv = {
  port: Number(process.env.PORT ?? defaultPort),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'replace-this-with-a-long-random-secret',
  mongoUri: process.env.MONGODB_URI?.trim() || undefined,
};
