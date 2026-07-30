#!/usr/bin/env bash
set -e

echo "=== Testing AI Consumer Complaint & NCH Guidance System ==="
echo ""

echo "[1/2] Running Backend Tests (Pytest)..."
cd /home/user/backend
python3 -m pytest -v
echo ""

echo "[2/2] Verifying Frontend TypeScript & Build..."
cd /home/user/frontend
npm run build
echo ""

echo "=== All verification checks passed successfully! ==="
