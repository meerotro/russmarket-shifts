#!/usr/bin/env bash
# One-time local database setup for Ubuntu / WSL. Run with sudo:
#
#   sudo bash scripts/setup-local-db.sh
#
# Installs PostgreSQL and the PHP driver, then creates the role and the two databases named in
# .env (the app database and "<name>_test" for the test suite). The password is read from .env,
# so it never has to be typed on the command line.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Create .env first: cp .env.example .env, then set DB_PASSWORD." >&2
  exit 1
fi

read_env() { grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- | tr -d '"'; }

DB_NAME=$(read_env DB_DATABASE)
DB_USER=$(read_env DB_USERNAME)
DB_PASS=$(read_env DB_PASSWORD)

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
  echo "DB_DATABASE, DB_USERNAME and DB_PASSWORD must all be set in .env." >&2
  exit 1
fi

apt-get update
apt-get install -y postgresql php-pgsql
service postgresql start

as_postgres() { sudo -u postgres psql -v ON_ERROR_STOP=1 "$@"; }

as_postgres -v user="$DB_USER" -v pass="$DB_PASS" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'user', :'pass')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'user') \gexec
SELECT format('ALTER ROLE %I PASSWORD %L', :'user', :'pass') \gexec
SQL

for db in "$DB_NAME" "${DB_NAME}_test"; do
  as_postgres -v db="$db" -v user="$DB_USER" <<'SQL'
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db') \gexec
SQL
done

echo "Done. Next: php artisan migrate --seed"
