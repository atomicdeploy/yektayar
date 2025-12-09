#!/bin/bash
# Test script to verify dev-runner.sh functionality
# Tests: stop functionality, logs feature, and colorized help

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEV_RUNNER_SCRIPT="${SCRIPT_DIR}/dev-runner.sh"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Cleanup function
cleanup() {
    echo "Cleaning up test files..."
    pkill -f "sleep 999" 2>/dev/null || true
    rm -f /tmp/yektayar-test-*.pid /tmp/yektayar-test-*.log
    rm -f /tmp/yektayar-backend.pid /tmp/yektayar-backend.log
    rm -f /tmp/yektayar-admin.pid /tmp/yektayar-admin.log
    rm -f /tmp/yektayar-mobile.pid /tmp/yektayar-mobile.log
    rm -f /tmp/test-logs-output.txt
}

# Setup trap to cleanup on exit
trap cleanup EXIT

echo "======================================"
echo "Testing dev-runner.sh"
echo "======================================"
echo ""

# Test 1: Help output has colors
echo "Test 1: Verifying help output has colors..."
HELP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" help 2>&1)

# Check for literal escape sequences (should not exist)
if echo "${HELP_OUTPUT}" | grep -q '\\033'; then
    echo -e "${RED}✗ FAILED: Found literal escape sequences in help output${NC}"
    exit 1
fi

# Check for ANSI escape codes (should exist)
if "${DEV_RUNNER_SCRIPT}" help 2>&1 | cat -A | grep -q '\^\[\['; then
    echo -e "${GREEN}✓ PASSED: ANSI escape codes are present${NC}"
else
    echo -e "${RED}✗ FAILED: ANSI escape codes not found${NC}"
    exit 1
fi

# Test 2: Help output contains logs command
echo ""
echo "Test 2: Verifying help shows logs command..."
if echo "${HELP_OUTPUT}" | grep -q "logs"; then
    echo -e "${GREEN}✓ PASSED: Help mentions logs command${NC}"
else
    echo -e "${RED}✗ FAILED: Help does not mention logs command${NC}"
    exit 1
fi

# Test 3: Stop command with no services
echo ""
echo "Test 3: Testing stop command with no running services..."
STOP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" stop 2>&1)
if echo "${STOP_OUTPUT}" | grep -q "not running"; then
    echo -e "${GREEN}✓ PASSED: Stop command handles no running services${NC}"
else
    echo -e "${RED}✗ FAILED: Stop command output unexpected${NC}"
    exit 1
fi

# Test 4: Stop command with running service
echo ""
echo "Test 4: Testing stop command with running service..."

# Start a fake service (use setsid to create new process group)
setsid sleep 999 > /tmp/yektayar-backend.log 2>&1 &
TEST_PID=$!
echo $TEST_PID > /tmp/yektayar-backend.pid
sleep 0.5

# Verify it's running
if ! kill -0 $TEST_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Test service didn't start${NC}"
    exit 1
fi

# Stop it
STOP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" stop 2>&1)

# Verify the output says it stopped
if echo "${STOP_OUTPUT}" | grep -q "Backend stopped"; then
    echo -e "${GREEN}✓ PASSED: Stop command reports service stopped${NC}"
else
    echo -e "${RED}✗ FAILED: Stop command didn't report stopping service${NC}"
    echo "${STOP_OUTPUT}"
    exit 1
fi

# Verify the process is actually stopped
sleep 0.5
if kill -0 $TEST_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Process is still running after stop${NC}"
    kill -9 $TEST_PID 2>/dev/null
    exit 1
else
    echo -e "${GREEN}✓ PASSED: Process actually stopped${NC}"
fi

# Verify PID file was removed
if [ -f /tmp/yektayar-backend.pid ]; then
    echo -e "${RED}✗ FAILED: PID file was not removed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ PASSED: PID file was removed${NC}"
fi

# Test 5: Stop command with dead process (PID file exists but process doesn't)
echo ""
echo "Test 5: Testing stop command with stale PID file..."
echo "99999" > /tmp/yektayar-backend.pid
STOP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" stop 2>&1)

if echo "${STOP_OUTPUT}" | grep -q "not running"; then
    echo -e "${GREEN}✓ PASSED: Stop command detects stale PID file${NC}"
else
    echo -e "${RED}✗ FAILED: Stop command didn't detect stale PID${NC}"
    exit 1
fi

if [ -f /tmp/yektayar-backend.pid ]; then
    echo -e "${RED}✗ FAILED: Stale PID file was not removed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ PASSED: Stale PID file was removed${NC}"
fi

# Test 6: Logs command with no log file
echo ""
echo "Test 6: Testing logs command with no log file..."
rm -f /tmp/yektayar-backend.log
LOGS_OUTPUT=$("${DEV_RUNNER_SCRIPT}" logs backend 2>&1 || true)

if echo "${LOGS_OUTPUT}" | grep -q "not found"; then
    echo -e "${GREEN}✓ PASSED: Logs command handles missing log file${NC}"
else
    echo -e "${RED}✗ FAILED: Logs command didn't handle missing log file${NC}"
    exit 1
fi

# Test 7: Logs command shows available log files
echo ""
echo "Test 7: Testing logs command with log files..."
echo "Test backend log" > /tmp/yektayar-backend.log
echo "Test admin log" > /tmp/yektayar-admin.log

# We need to test that the command starts properly, but we can't wait for tail -f
# So we'll just check if the command starts without error and shows the header
timeout 2 "${DEV_RUNNER_SCRIPT}" logs all 2>&1 | head -10 > /tmp/test-logs-output.txt || true

if grep -q "Available log files" /tmp/test-logs-output.txt && \
   grep -q "Backend:" /tmp/test-logs-output.txt && \
   grep -q "Admin Panel:" /tmp/test-logs-output.txt; then
    echo -e "${GREEN}✓ PASSED: Logs command shows available log files${NC}"
else
    echo -e "${RED}✗ FAILED: Logs command output unexpected${NC}"
    cat /tmp/test-logs-output.txt
    exit 1
fi

rm -f /tmp/test-logs-output.txt

# Test 8: Restart command with no running services
echo ""
echo "Test 8: Testing restart command with no running services..."
RESTART_OUTPUT=$("${DEV_RUNNER_SCRIPT}" restart 2>&1)

if echo "${RESTART_OUTPUT}" | grep -q "No services are currently running"; then
    echo -e "${GREEN}✓ PASSED: Restart command handles no running services${NC}"
else
    echo -e "${RED}✗ FAILED: Restart command output unexpected${NC}"
    exit 1
fi

# Test 9: Restart command with running services
echo ""
echo "Test 9: Testing restart command detects running services..."

# Start fake services (use setsid to create new process group)
setsid sleep 999 > /tmp/yektayar-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/yektayar-backend.pid
sleep 0.2

setsid sleep 999 > /tmp/yektayar-admin.log 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > /tmp/yektayar-admin.pid
sleep 0.2

# Verify they're running
if ! kill -0 $BACKEND_PID 2>/dev/null || ! kill -0 $ADMIN_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Test services didn't start${NC}"
    exit 1
fi

# Run restart command with timeout (will timeout trying to start real services, but that's ok)
# We just want to verify it detects the running services and tries to stop them
RESTART_OUTPUT=$(timeout 5 "${DEV_RUNNER_SCRIPT}" restart 2>&1 || true)

# Verify the output mentions detecting the services
if echo "${RESTART_OUTPUT}" | grep -q "backend" && \
   echo "${RESTART_OUTPUT}" | grep -q "admin" && \
   echo "${RESTART_OUTPUT}" | grep -q "Currently running services"; then
    echo -e "${GREEN}✓ PASSED: Restart command detects running services${NC}"
else
    echo -e "${RED}✗ FAILED: Restart command didn't detect services${NC}"
    echo "${RESTART_OUTPUT}"
    exit 1
fi

# Verify services were stopped
sleep 0.5
if ! kill -0 $BACKEND_PID 2>/dev/null && ! kill -0 $ADMIN_PID 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED: Services were stopped by restart command${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: Services may still be running, cleaning up...${NC}"
    kill -9 $BACKEND_PID $ADMIN_PID 2>/dev/null || true
fi

# Clean up any remaining files
rm -f /tmp/yektayar-backend.pid /tmp/yektayar-admin.pid /tmp/yektayar-backend.log /tmp/yektayar-admin.log

# Test 10: Prevent duplicate start - start backend twice
echo ""
echo "Test 10: Testing duplicate start prevention..."

# Start a fake backend service (use setsid to create new process group)
setsid sleep 999 > /tmp/yektayar-backend.log 2>&1 &
TEST_PID=$!
echo $TEST_PID > /tmp/yektayar-backend.pid
sleep 0.2

# Verify it's running
if ! kill -0 $TEST_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Test service didn't start${NC}"
    exit 1
fi

# Try to start backend again (should be prevented)
START_OUTPUT=$("${DEV_RUNNER_SCRIPT}" backend --detached 2>&1 || true)

if echo "${START_OUTPUT}" | grep -q "already running"; then
    echo -e "${GREEN}✓ PASSED: Duplicate start was prevented${NC}"
else
    echo -e "${RED}✗ FAILED: Duplicate start was not prevented${NC}"
    echo "${START_OUTPUT}"
    kill -9 $TEST_PID 2>/dev/null || true
    rm -f /tmp/yektayar-backend.pid
    exit 1
fi

# Verify original process is still running
if kill -0 $TEST_PID 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED: Original process still running${NC}"
    kill -9 $TEST_PID 2>/dev/null || true
    rm -f /tmp/yektayar-backend.pid
else
    echo -e "${RED}✗ FAILED: Original process was killed${NC}"
    exit 1
fi

rm -f /tmp/test-logs-output.txt

echo ""
echo "======================================"
echo -e "${GREEN}All tests passed! ✓${NC}"
echo "======================================"
