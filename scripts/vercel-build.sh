#!/bin/sh
# DATABASE_URL geçerli bir MySQL adresi değilse (veritabanı henüz bağlanmadı) site demo SQLite verisiyle derlenir.
set -e

case "$DATABASE_URL" in
  mysql://*)
    npx prisma migrate deploy
    ;;
  *)
    if [ -n "$DATABASE_URL" ]; then
      echo "UYARI: DATABASE_URL 'mysql://' ile başlamıyor; yok sayılıp demo moduna geçiliyor."
    else
      echo "DATABASE_URL tanımlı değil: demo SQLite veritabanı hazırlanıyor."
    fi
    node scripts/demo-db.mjs
    ;;
esac

npx next build
