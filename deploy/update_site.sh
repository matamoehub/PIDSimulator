#!/bin/bash
#
# Matamoe Line Follower PID Simulator — update / deploy script.
# Mirrors the MatamoeBookings update_site.sh pattern: pull, install, build,
# run the full test suite, and only then reload the service. If tests fail the
# deploy aborts and the running service is left untouched.
#
# The admin "Deploy" button calls the same steps via /api/admin/deploy; this
# script is the equivalent for running from a shell on the server.
#
# Usage (on the server):  /opt/robot/pidsim/deploy/update_site.sh

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}▸${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }

APP_DIR="/opt/robot/pidsim"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
VENV="$BACKEND_DIR/.venv"
SERVICE="pidsim-api.service"

cd "$APP_DIR"

echo "═══════════════════════════════════════════════"
echo "  PID Simulator — update"
echo "═══════════════════════════════════════════════"

BRANCH=$(git branch --show-current)
info "Pulling origin/$BRANCH..."
git pull origin "$BRANCH"
ok "Code updated"

info "Installing backend dependencies..."
# shellcheck disable=SC1091
source "$VENV/bin/activate"
pip install -q -r "$BACKEND_DIR/requirements.txt"
ok "Backend deps installed"

info "Building frontend..."
( cd "$FRONTEND_DIR" && npm ci && npm run build )
ok "Frontend built"

info "Running backend tests (pytest)..."
( cd "$BACKEND_DIR" && python -m pytest -q ) || { err "Backend tests failed — deploy aborted."; exit 1; }
ok "Backend tests passed"

info "Running frontend tests (vitest)..."
( cd "$FRONTEND_DIR" && npm run test ) || { err "Frontend tests failed — deploy aborted."; exit 1; }
ok "Frontend tests passed"

info "Reloading $SERVICE..."
if systemctl list-units --full -all | grep -q "$SERVICE"; then
    sudo systemctl reload "$SERVICE" || sudo systemctl restart "$SERVICE"
    sleep 2
    if sudo systemctl is-active --quiet "$SERVICE"; then
        ok "Service running"
    else
        err "Service failed to start"
        sudo journalctl -u "$SERVICE" -n 20 --no-pager
        exit 1
    fi
else
    warn "$SERVICE not found — skipping reload"
fi

echo "═══════════════════════════════════════════════"
ok "Update complete (branch: $BRANCH)"
