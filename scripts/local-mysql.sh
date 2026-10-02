#!/bin/sh
# Proje içi, izole bir MySQL örneği başlatır (yalnızca yerel geliştirme).
# Veri .local/mysql-data altında tutulur; sistemdeki diğer MySQL kurulumlarına dokunmaz.
# Kullanım: npm run db:local   |   durdurmak için: npm run db:local -- stop
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/.local"
PORT="${LOCAL_DB_PORT:-3307}"
DB_NAME="${LOCAL_DB_NAME:-bebbek}"
DB_USER="${LOCAL_DB_USER:-bebbek}"
DB_PASS="${LOCAL_DB_PASSWORD:-bebbek_local}"
SOCK="$DIR/mysql.sock"

command -v mysqld >/dev/null 2>&1 || { echo "mysqld bulunamadı. macOS: brew install mysql"; exit 1; }

if [ "${1:-}" = "stop" ]; then
  if [ -f "$DIR/mysql.pid" ]; then kill "$(cat "$DIR/mysql.pid")" && echo "MySQL durduruldu."; else echo "Çalışan yerel MySQL yok."; fi
  exit 0
fi

mkdir -p "$DIR/mysql-tmp"

if [ ! -d "$DIR/mysql-data/mysql" ]; then
  echo "Veri dizini hazırlanıyor…"
  mysqld --no-defaults --initialize-insecure --datadir="$DIR/mysql-data" --log-error="$DIR/mysql.err"
fi

if [ -S "$SOCK" ] && mysqladmin --no-defaults -uroot --socket="$SOCK" ping >/dev/null 2>&1; then
  echo "Yerel MySQL zaten çalışıyor (port $PORT)."
else
  mysqld --no-defaults --datadir="$DIR/mysql-data" --port="$PORT" --bind-address=127.0.0.1 \
    --socket="$SOCK" --pid-file="$DIR/mysql.pid" --tmpdir="$DIR/mysql-tmp" \
    --log-error="$DIR/mysql.err" --mysqlx=OFF --daemonize
  i=0
  until mysqladmin --no-defaults -uroot --socket="$SOCK" ping >/dev/null 2>&1; do
    i=$((i + 1)); [ "$i" -gt 30 ] && { echo "MySQL başlatılamadı, bkz. $DIR/mysql.err"; exit 1; }
    sleep 1
  done
  echo "Yerel MySQL başlatıldı (port $PORT)."
fi

mysql --no-defaults -uroot --socket="$SOCK" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'127.0.0.1' IDENTIFIED BY '$DB_PASS';
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT CREATE, DROP, ALTER, REFERENCES ON *.* TO '$DB_USER'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

echo "DATABASE_URL=\"mysql://$DB_USER:$DB_PASS@127.0.0.1:$PORT/$DB_NAME\""
