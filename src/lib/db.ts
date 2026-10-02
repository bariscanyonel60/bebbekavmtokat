import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** DATABASE_URL yoksa build sırasında scripts/demo-db.mjs ile üretilen SQLite demo verisi kullanılır. */
export const isDemoDatabase = !process.env.DATABASE_URL;

// Serverless dosya sistemi salt okunur; admin değişiklikleri için kopya /tmp'de tutulur (kalıcı değildir).
function demoDatabaseUrl(): string {
  const source = path.join(process.cwd(), "prisma", "demo", "demo.db");
  const target = path.join(os.tmpdir(), "bebbek-demo.db");
  if (existsSync(source) && (!existsSync(target) || statSync(source).mtimeMs > statSync(target).mtimeMs)) {
    copyFileSync(source, target);
  }
  return `file:${target}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(isDemoDatabase ? { datasourceUrl: demoDatabaseUrl() } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
