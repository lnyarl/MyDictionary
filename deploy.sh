#!/bin/bash
set -euo pipefail

# Usage:
#   ./deploy.sh              # deploy HEAD
#   ./deploy.sh <commit>     # deploy specific commit/tag/branch

COMMIT="${1:-HEAD}"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
ENVS_DIR="$PROJECT_ROOT/envs"

# Validate required env files
REQUIRED_ENVS=("backend" "backend-admin" "frontend" "frontend-admin")
for pkg in "${REQUIRED_ENVS[@]}"; do
  if [ ! -f "$ENVS_DIR/$pkg.env.prod" ]; then
    echo "Error: envs/$pkg.env.prod not found"
    echo "  Copy the example: cp envs/$pkg.env.prod.example envs/$pkg.env.prod"
    exit 1
  fi
done

# Resolve commit SHA
RESOLVED="$(git -C "$PROJECT_ROOT" rev-parse --short "$COMMIT")"
FULL_SHA="$(git -C "$PROJECT_ROOT" rev-parse "$COMMIT")"

echo ""
echo "============================================"
echo "  Deploying commit: $RESOLVED"
echo "  Full SHA: $FULL_SHA"
echo "============================================"
echo ""

# Create temp worktree at the target commit
WORKTREE="$(mktemp -d)/stashy-$RESOLVED"
git -C "$PROJECT_ROOT" worktree add "$WORKTREE" "$FULL_SHA"

# Cleanup worktree on exit (success or failure)
cleanup() {
  echo ""
  echo "Cleaning up worktree..."
  git -C "$PROJECT_ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true
  rm -rf "$(dirname "$WORKTREE")"
}
trap cleanup EXIT

# Copy each package's env file to the right location
cp "$ENVS_DIR/backend.env.prod"       "$WORKTREE/backend/.env"
cp "$ENVS_DIR/backend-admin.env.prod" "$WORKTREE/backend-admin/.env"
cp "$ENVS_DIR/frontend.env.prod"      "$WORKTREE/frontend/.env.production"
cp "$ENVS_DIR/frontend-admin.env.prod" "$WORKTREE/frontend-admin/.env.production"
cp "$ENVS_DIR/backend.env.prod"       "$WORKTREE/envs/"
cp "$ENVS_DIR/backend-admin.env.prod" "$WORKTREE/envs/"
cp "$ENVS_DIR/frontend.env.prod"      "$WORKTREE/envs/"
cp "$ENVS_DIR/frontend-admin.env.prod" "$WORKTREE/envs/"

# Merge all env files into root .env for docker-compose variable substitution
# (later files override earlier ones if keys conflict)
cat "$ENVS_DIR/backend.env.prod" \
    "$ENVS_DIR/backend-admin.env.prod" \
    "$ENVS_DIR/frontend.env.prod" \
    "$ENVS_DIR/frontend-admin.env.prod" > "$WORKTREE/.env"

cd "$WORKTREE"

echo "Building images..."
docker compose -f docker-compose.prod.yml --env-file .env build

echo ""
echo "Starting services..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

echo ""
echo "============================================"
echo "  Done! Deployed: $RESOLVED"
echo "  Run 'docker compose -f docker-compose.prod.yml logs -f' to watch logs"
echo "============================================"
  