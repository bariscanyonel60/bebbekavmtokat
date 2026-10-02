// MySQL şemasından SQLite kopyası üretir, Prisma Client'ı ona göre oluşturur ve seed verisini yükler.
// Çıktı: prisma/demo/demo.db (src/lib/db.ts, DATABASE_URL yoksa bunu kullanır).
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const demoDir = path.join(root, "prisma", "demo");
const schemaPath = path.join(demoDir, "schema.prisma");
const dbPath = path.join(demoDir, "demo.db");

const schema = readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8")
  .replace('provider = "mysql"', 'provider = "sqlite"')
  .replace(/\s*@db\.\w+(\([^)]*\))?/g, "");

rmSync(demoDir, { recursive: true, force: true });
mkdirSync(demoDir, { recursive: true });
writeFileSync(schemaPath, schema);

const env = { ...process.env, DATABASE_URL: `file:${dbPath}` };
const run = (command) => execSync(command, { stdio: "inherit", env });

run(`npx prisma generate --schema "${schemaPath}"`);
run(`npx prisma db push --schema "${schemaPath}" --skip-generate`);
run("npx tsx prisma/seed.ts");
