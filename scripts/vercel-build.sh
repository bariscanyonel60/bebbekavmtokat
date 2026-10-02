#!/bin/sh
# DATABASE_URL yoksa (veritabanı henüz bağlanmadı) site demo SQLite verisiyle derlenir.
set -e

if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
else
  echo "DATABASE_URL tanımlı değil: demo SQLite veritabanı hazırlanıyor."
  node scripts/demo-db.mjs
fi

npx next build
