#!/usr/bin/env bash
# Serve this site locally on http://localhost:8080
# Usage: ./serve.sh [port]
set -euo pipefail

PORT="${1:-8080}"
cd "$(dirname "$0")"

echo "Serving $(pwd) at http://localhost:$PORT  (Ctrl+C to stop)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
