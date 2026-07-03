import { PrismaClient } from '@prisma/client/edge'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

let prisma: PrismaClient | null = null;

export const getPrisma = (databaseUrl: string) => {
  if (prisma) return prisma;
  
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool as any);
  prisma = new PrismaClient({ adapter });
  
  return prisma;
};
