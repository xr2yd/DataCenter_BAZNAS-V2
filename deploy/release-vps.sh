#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="${BAZNAS_REPO_DIR:-/home/xruncy/repo}"
TARGET_SHA="${1:?Usage: release-vps.sh <commit-sha>}"
PREVIOUS_SHA=""
RELEASE_SUCCEEDED=0

restart_services() {
  if pm2 describe baznas-frontend-next >/dev/null 2>&1; then
    pm2 restart baznas-frontend-next
  else
    pm2 start frontend-next/ecosystem.config.cjs
  fi

  if pm2 describe baznas-backend >/dev/null 2>&1; then
    pm2 restart baznas-backend
  else
    pm2 start npm --name baznas-backend -- run server
  fi
}

wait_for_http() {
  local url="$1"
  local attempts=20
  while (( attempts > 0 )); do
    if curl -fsS --max-time 3 "$url" >/dev/null; then
      return 0
    fi
    attempts=$((attempts - 1))
    sleep 2
  done
  echo "Health check failed: $url" >&2
  return 1
}

rollback() {
  local exit_code=$?
  trap - ERR
  if [[ "$RELEASE_SUCCEEDED" -eq 0 && -n "$PREVIOUS_SHA" ]]; then
    echo "Release failed; restoring $PREVIOUS_SHA" >&2
    set +e
    cd "$REPO_DIR"
    git reset --hard "$PREVIOUS_SHA"
    npm ci
    (
      cd frontend-next
      npm ci
      npm run build
    )
    restart_services
    pm2 save
  fi
  exit "$exit_code"
}

trap rollback ERR

cd "$REPO_DIR"
PREVIOUS_SHA="$(git rev-parse HEAD)"
git fetch --no-tags origin main
git cat-file -e "${TARGET_SHA}^{commit}"
if [[ "$(git rev-parse origin/main)" != "$TARGET_SHA" ]]; then
  echo "Target rilis harus identik dengan commit terbaru origin/main." >&2
  exit 1
fi
git reset --hard "$TARGET_SHA"

npm ci
(
  cd frontend-next
  npm ci
  npm run build
)

restart_services
wait_for_http "http://127.0.0.1:3001/api/health"
wait_for_http "http://127.0.0.1:3002/penyaluran"
pm2 save
RELEASE_SUCCEEDED=1
echo "Release complete: $TARGET_SHA"
