// Veritabanı kurulumu.
// DATABASE_URL "mysql://" ile başlıyorsa MySQL istemcisi üretilir (--deploy ile migration uygulanır).
// Aksi halde proje içi SQLite veritabanı kullanılır: prisma/demo/demo.db (src/lib/db.ts ile aynı kural).
// Mevcut SQLite verisi korunur; şema değiştiyse veya --reset verilirse seed verisiyle yeniden oluşturulur.
// Kullanım: node scripts/db-setup.mjs [--if-missing] [--reset] [--deploy]
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));

const envPath = path.join(root, ".env");
if (existsSync(envPath)) process.loadEnvFile(envPath);

const run = (command, extraEnv = {}) =>
  execSync(command, { stdio: "inherit", env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "1", ...extraEnv } });

if (process.env.DATABASE_URL?.startsWith("mysql://")) {
  run("npx prisma generate");
  if (args.has("--deploy")) run("npx prisma migrate deploy");
  process.exit(0);
}

const demoDir = path.join(root, "prisma", "demo");
const schemaPath = path.join(demoDir, "schema.prisma");
const dbPath = path.join(demoDir, "demo.db");
const generatedSchemaPath = path.join(root, "node_modules", ".prisma", "client", "schema.prisma");

const schema = readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8")
  .replace('provider = "mysql"', 'provider = "sqlite"')
  .replace(/\s*@db\.\w+(\([^)]*\))?/g, "");

const readOrEmpty = (file) => (existsSync(file) ? readFileSync(file, "utf8") : "");
const schemaChanged = readOrEmpty(schemaPath) !== schema;
const clientReady = readOrEmpty(generatedSchemaPath).includes('provider = "sqlite"');
const dbReady = existsSync(dbPath) && !schemaChanged;

if (args.has("--if-missing") && clientReady && dbReady) process.exit(0);

mkdirSync(demoDir, { recursive: true });
writeFileSync(schemaPath, schema);

const dbEnv = { DATABASE_URL: `file:${dbPath}` };
run(`npx prisma generate --schema "${schemaPath}"`, dbEnv);

if (args.has("--reset") || !dbReady) {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  run(`npx prisma db push --schema "${schemaPath}" --skip-generate`, dbEnv);
  run("npx tsx prisma/seed.ts", dbEnv);
}
