export interface AppEnv {
  port: number;
  clientUrl: string;
  jwtSecret: string;
  mongoUri: string | undefined;
}

const defaultPort = 4000;
const defaultDatabase = 'sudoku';

function normalizeMongoUri(raw: string | undefined): string | undefined {
  if (!raw?.trim()) {
    return undefined;
  }

  const [basePart, queryPart] = raw.trim().split('?');
  const base = basePart!.replace(/\/+$/, '');
  const hasDatabase = /^mongodb(\+srv)?:\/\/[^/]+\/.+/.test(base);
  const normalizedBase = hasDatabase ? base : `${base}/${defaultDatabase}`;

  return queryPart ? `${normalizedBase}?${queryPart}` : normalizedBase;
}

export const env: AppEnv = {
  port: Number(process.env.PORT ?? defaultPort),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'replace-this-with-a-long-random-secret',
  mongoUri: normalizeMongoUri(process.env.MONGODB_URI),
};
