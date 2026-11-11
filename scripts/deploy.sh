#!/usr/bin/env bash
# Deploy to alwaysdata (or any PHP host with SSH): build the frontend locally, upload one release
# archive over SSH and finish the installation on the server. Nothing is built on the server and
# no background process is started there.
#
#   DEPLOY_HOST=account@ssh-account.alwaysdata.net bash scripts/deploy.sh
#
# Optional: DEPLOY_DIR (directory in the remote home, default "russmarket"),
#           DEPLOY_SSH (ssh client to use, default "ssh"),
#           DEPLOY_SEED=1 (also load the demo data).
set -euo pipefail

HOST="${DEPLOY_HOST:?Set DEPLOY_HOST, e.g. account@ssh-account.alwaysdata.net}"
DIR="${DEPLOY_DIR:-russmarket}"
SSH="${DEPLOY_SSH:-ssh}"
SEED="${DEPLOY_SEED:-0}"

cd "$(dirname "$0")/.."

echo "==> Building the frontend"
npm run build

echo "==> Packing the release"
archive="$(mktemp)"
trap 'rm -f "$archive"' EXIT
# Tracked files that the server needs at runtime, plus the fresh build. Tests, design files,
# docs and frontend sources stay out; vendor/ is installed on the server; .env is never sent.
git ls-files -z -- . \
  ':!tests' ':!design' ':!docs' ':!.github' ':!resources/js' ':!scripts' \
  ':!*.md' ':!package*.json' ':!*.config.*' ':!tsconfig.json' ':!phpunit.xml' ':!.prettier*' \
  | tar -czf "$archive" --null -T - public/build
echo "    $(du -h "$archive" | cut -f1) archive"

echo "==> Uploading to $HOST:~/$DIR"
"$SSH" "$HOST" "mkdir -p ~/$DIR && cat > ~/$DIR/release.tgz" < "$archive"

echo "==> Installing on the server"
"$SSH" "$HOST" "DIR='$DIR' SEED='$SEED' bash -s" <<'REMOTE'
set -euo pipefail
cd ~/"$DIR"

rm -rf public/build
tar -xzf release.tgz
rm release.tgz

if [ ! -f .env ]; then
  account="$(whoami)"
  sed -e 's/^APP_ENV=.*/APP_ENV=production/' \
      -e 's/^APP_DEBUG=.*/APP_DEBUG=false/' \
      -e "s|^APP_URL=.*|APP_URL=https://${account}.alwaysdata.net|" \
      -e 's/^LOG_LEVEL=.*/LOG_LEVEL=warning/' \
      -e "s/^DB_HOST=.*/DB_HOST=postgresql-${account}.alwaysdata.net/" \
      -e "s/^DB_DATABASE=.*/DB_DATABASE=${account}_russmarket/" \
      -e "s/^DB_USERNAME=.*/DB_USERNAME=${account}/" \
      .env.example > .env
  chmod 600 .env
  first_run=1
fi

composer install --no-dev --optimize-autoloader --no-interaction --no-progress --quiet

if [ "${first_run:-0}" = 1 ]; then
  php artisan key:generate --force --quiet
  echo
  echo "First run: ~/$DIR/.env was created. Check DB_* in it, set DB_PASSWORD, then deploy again."
  exit 3
fi

php artisan migrate --force
if [ "$SEED" = 1 ]; then php artisan db:seed --force; fi
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "    vendor: $(du -sh vendor | cut -f1), total: $(du -sh . | cut -f1)"
REMOTE

echo "==> Done"
