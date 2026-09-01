#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "=== Starting AI Consumer Complaint & NCH Guidance System ==="
echo "Backend: http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo "Frontend: http://localhost:5173"
echo ""

cd "$ROOT_DIR/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 5173

trap "kill $BACKEND_PID" EXIT
