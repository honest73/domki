import { PrismaClient } from "@prisma/client";

// Adres bazy bierzemy z DATABASE_URL, a jeśli go nie ma — z typowych nazw,
// które ustawia integracja Postgres/Neon w Vercel. Dzięki temu działa niezależnie
// od sposobu podpięcia bazy.
const databaseUrl = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
].find((v) => v && v.trim() !== "");

// Singleton Prisma — unika tworzenia wielu połączeń przy hot-reloadzie w dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
