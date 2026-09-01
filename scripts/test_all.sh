#!/usr/bin/env bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "=== Testing AI Consumer Complaint & NCH Guidance System ==="
echo ""

echo "[1/2] Running Backend Tests (Pytest)..."
cd "$ROOT_DIR/backend"
pytest -v
echo ""

echo "[2/2] Verifying Frontend Build..."
cd "$ROOT_DIR/frontend"
npm run build
echo ""

echo "=== All verification checks passed successfully! ==="
