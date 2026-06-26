#!/usr/bin/env bash
# One-shot test runner: build the server, start it, run the Python HTTP tests,
# then tear everything down — even if the tests fail.
#
# Assumes Postgres is running and the database has been created + migrated:
#   make db-create migrate
#
# For an interactive loop, prefer two terminals instead:
#   terminal 1:  make run
#   terminal 2:  make test
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

TESTS_DIR="$ROOT/apps/server/__tests__"
VENV="$TESTS_DIR/.venv"
REQUIREMENTS="$ROOT/apps/server/requirements-dev.txt"

# Load .env so the server (and tests) see DATABASE_URL / PORT.
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi
PORT="${PORT:-8080}"
export TEST_BASE_URL="${TEST_BASE_URL:-http://localhost:$PORT}"

# 1. Python test deps in a local virtualenv (created once).
if [[ ! -x "$VENV/bin/pytest" ]]; then
  echo "==> creating test venv at $VENV"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet -r "$REQUIREMENTS"
fi

# 2. Build the server.
echo "==> building server"
make build

# 3. Start the server in the background; always stop it on exit.
echo "==> starting server on port $PORT"
"$ROOT/apps/server/build/server" &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT

# 4. Run the suite. conftest.py waits for /health before the first test, so we
#    don't need to poll here.
echo "==> running tests against $TEST_BASE_URL"
"$VENV/bin/pytest" -c "$ROOT/apps/server/pytest.ini" "$TESTS_DIR" "$@"
