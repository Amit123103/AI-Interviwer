import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Parse DATABASE_URL into explicit parameters to guarantee types
function parseDbUrl(raw: string): { host: string; port: number; user: string; password: string; database: string } {
  const cleaned = raw.replace(/^["']|["']$/g, '').trim();
  try {
    const url = new URL(cleaned);
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port, 10) || 5432,
      user: decodeURIComponent(url.username) || 'postgres',
      password: decodeURIComponent(url.password) || 'password',
      database: url.pathname.replace(/^\//, '') || 'intervyxa_ai',
    };
  } catch {
    console.error('[PRISMA] Invalid DATABASE_URL, using defaults');
    return { host: 'localhost', port: 5432, user: 'postgres', password: 'password', database: 'intervyxa_ai' };
  }
}

if (!process.env.DATABASE_URL) {
  console.warn('[PRISMA] ⚠️ DATABASE_URL is missing from environment. Using local defaults.');
}

const dbConfig = parseDbUrl(process.env.DATABASE_URL || '');
console.log(`[PRISMA] 🔗 Connecting to PostgreSQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: String(dbConfig.password), // Ensure password is ALWAYS a string
  database: dbConfig.database,
  ssl: false,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
