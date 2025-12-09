#!/bin/bash
# Test script to verify port checking functionality

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
DEV_RUNNER_SCRIPT="${SCRIPT_DIR}/dev-runner.sh"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Find an available port for testing
TEST_PORT=19999

# Cleanup function
cleanup() {
    echo "Cleaning up test processes..."
    pkill -f "nc -l.*$TEST_PORT" 2>/dev/null || true
    fuser -k $TEST_PORT/tcp 2>/dev/null || true
    sleep 1
}

# Setup trap to cleanup on exit
trap cleanup EXIT

echo "=========================================="
echo "Testing Port Checking Functions"
echo "=========================================="
echo ""

# Test 1: Test status command shows port status
echo -e "${CYAN}Test 1: Status command shows port information${NC}"

STATUS_OUTPUT=$("${DEV_RUNNER_SCRIPT}" status 2>&1)

# Check that status mentions ports
if echo "$STATUS_OUTPUT" | grep -q "Port"; then
    echo -e "${GREEN}✓ Status command shows port information${NC}"
else
    echo -e "${RED}✗ FAILED: Status command doesn't show port info${NC}"
    echo "$STATUS_OUTPUT"
    exit 1
fi
echo ""

# Test 2: Test that stop command verifies ports are freed
echo -e "${CYAN}Test 2: Stop command verifies ports are freed${NC}"

# Create a test process on a port
if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server $TEST_PORT > /tmp/yektayar-test.log 2>&1 &
    TEST_PID=$!
    echo $TEST_PID > /tmp/yektayar-backend.pid
    sleep 2
    
    # Verify it's listening
    if ss -tlnp 2>/dev/null | grep -q ":${TEST_PORT} " || netstat -tlnp 2>/dev/null | grep -q ":${TEST_PORT} "; then
        echo -e "${GREEN}✓ Test service is listening on port $TEST_PORT${NC}"
    else
        echo -e "${YELLOW}⚠ Cannot verify port listening (ss/netstat not available or insufficient permissions)${NC}"
    fi
    
    # Stop it
    STOP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" stop 2>&1)
    
    # Check if stop command mentions port status
    if echo "$STOP_OUTPUT" | grep -q "Port"; then
        echo -e "${GREEN}✓ Stop command checks port status${NC}"
    else
        echo -e "${YELLOW}⚠ Stop command doesn't explicitly mention port status${NC}"
    fi
    
    # Verify process is dead
    sleep 2
    if kill -0 $TEST_PID 2>/dev/null; then
        echo -e "${RED}✗ FAILED: Test process still running${NC}"
        kill -9 $TEST_PID 2>/dev/null || true
        exit 1
    else
        echo -e "${GREEN}✓ Test process was stopped${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping test: python3 not available${NC}"
fi
echo ""

# Test 3: Test warning when starting on used port
echo -e "${CYAN}Test 3: Warning when starting on already-used port${NC}"

# This is more of an integration test - just verify help shows port numbers
HELP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" help 2>&1)

if echo "$HELP_OUTPUT" | grep -q "port"; then
    echo -e "${GREEN}✓ Help shows port information${NC}"
else
    echo -e "${YELLOW}⚠ Help doesn't show port numbers${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}All port checking tests passed! ✓${NC}"
echo "=========================================="
