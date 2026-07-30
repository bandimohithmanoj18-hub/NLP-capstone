#!/usr/bin/env bash

echo "=== Starting AI Consumer Complaint & NCH Guidance System ==="
echo "Backend: http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo "Frontend: http://localhost:5173"
echo ""

# Start Backend in background
cd /home/user/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start Frontend
cd /home/user/frontend
npm run dev -- --host 0.0.0.0 --port 5173

# Clean up on exit
trap "kill $BACKEND_PID" EXIT
