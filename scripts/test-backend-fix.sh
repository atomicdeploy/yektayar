#!/bin/bash

# Test script to verify the double-listen fix

set -e

echo "=== Testing Backend Double-Listen Fix ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Add bun to path
export PATH="/home/runner/.bun/bin:$PATH"

cd "$(dirname "$0")/../packages/backend"

echo "Test 1: Starting backend on default port (3000)..."
timeout 3 bun src/index.ts > /tmp/test-backend-default.log 2>&1 || true
sleep 1

if grep -q "Started development server" /tmp/test-backend-default.log && \
   ! grep -q "EADDRINUSE" /tmp/test-backend-default.log; then
    echo -e "${GREEN}✓ Test 1 PASSED: Backend started successfully on default port${NC}"
else
    echo -e "${RED}✗ Test 1 FAILED: Backend failed to start or had errors${NC}"
    cat /tmp/test-backend-default.log
    exit 1
fi

echo ""
echo "Test 2: Starting backend on custom port (3001)..."
PORT=3001 timeout 3 bun src/index.ts > /tmp/test-backend-custom.log 2>&1 || true
sleep 1

if grep -q "Started development server: http://localhost:3001" /tmp/test-backend-custom.log && \
   ! grep -q "EADDRINUSE" /tmp/test-backend-custom.log; then
    echo -e "${GREEN}✓ Test 2 PASSED: Backend started successfully on custom port${NC}"
else
    echo -e "${RED}✗ Test 2 FAILED: Backend failed to start on custom port${NC}"
    cat /tmp/test-backend-custom.log
    exit 1
fi

echo ""
echo "Test 3: Verifying no double-listen errors..."
if ! grep -q "error" /tmp/test-backend-default.log && \
   ! grep -q "error" /tmp/test-backend-custom.log; then
    echo -e "${GREEN}✓ Test 3 PASSED: No error messages found${NC}"
else
    echo -e "${RED}✗ Test 3 FAILED: Error messages found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== All Tests PASSED ===${NC}"
echo ""
echo "Summary:"
echo "  ✓ Backend starts without EADDRINUSE errors"
echo "  ✓ Custom PORT environment variable works"
echo "  ✓ No double-listen issues detected"
echo ""

# Cleanup
rm -f /tmp/test-backend-*.log
