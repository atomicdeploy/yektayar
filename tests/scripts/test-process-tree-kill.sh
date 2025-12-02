#!/bin/bash
# Test script to verify process tree killing functionality
# This tests that child processes (like vite and esbuild) are properly killed

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEV_RUNNER_SCRIPT="${SCRIPT_DIR}/dev-runner.sh"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Cleanup function
cleanup() {
    echo "Cleaning up test processes..."
    pkill -f "test-parent-process" 2>/dev/null || true
    pkill -f "test-child-process" 2>/dev/null || true
    rm -f /tmp/yektayar-test-*.pid /tmp/yektayar-test-*.log
    rm -f /tmp/yektayar-backend.pid /tmp/yektayar-admin.pid /tmp/yektayar-mobile.pid
    rm -f /tmp/yektayar-backend.log /tmp/yektayar-admin.log /tmp/yektayar-mobile.log
}

# Setup trap to cleanup on exit
trap cleanup EXIT

echo "=========================================="
echo "Testing Process Tree Killing"
echo "=========================================="
echo ""

# Test 1: Verify process tree killing works with nested children
echo -e "${CYAN}Test 1: Process tree killing with nested children${NC}"
echo "Creating a parent process with children..."

# Create a parent process that spawns children (simulating npm -> vite -> esbuild)
cat > /tmp/test-parent-process.sh << 'EOF'
#!/bin/bash
# Simulate a parent process that spawns children
echo "Parent process started (PID: $$)"

# Start child process 1
(
    echo "Child 1 started (PID: $$)"
    # Start grandchild
    (
        echo "Grandchild 1 started (PID: $$)"
        sleep 999
    ) &
    sleep 999
) &

# Start child process 2
(
    echo "Child 2 started (PID: $$)"
    sleep 999
) &

# Parent waits
sleep 999
EOF
chmod +x /tmp/test-parent-process.sh

# Start the parent process with setsid (like the real dev-runner does)
setsid /tmp/test-parent-process.sh > /tmp/yektayar-backend.log 2>&1 &
PARENT_PID=$!
echo $PARENT_PID > /tmp/yektayar-backend.pid

sleep 2

# Verify parent and children are running
if ! kill -0 $PARENT_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Parent process didn't start${NC}"
    exit 1
fi

CHILD_COUNT=$(pgrep -P $PARENT_PID | wc -l)
if [ $CHILD_COUNT -lt 1 ]; then
    echo -e "${RED}✗ FAILED: No child processes found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Parent and children are running (Parent: $PARENT_PID, Children: $CHILD_COUNT)${NC}"

# Now stop using the dev-runner script
echo "Stopping process tree using dev-runner..."
"${DEV_RUNNER_SCRIPT}" stop 2>&1 | grep -E "(Stopping|stopped|free)" || true

# Wait a moment
sleep 2

# Verify all processes are stopped
if kill -0 $PARENT_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Parent process is still running${NC}"
    pkill -9 -P $PARENT_PID 2>/dev/null || true
    kill -9 $PARENT_PID 2>/dev/null || true
    exit 1
fi

REMAINING_CHILDREN=$(pgrep -P $PARENT_PID 2>/dev/null | wc -l)
if [ $REMAINING_CHILDREN -gt 0 ]; then
    echo -e "${RED}✗ FAILED: $REMAINING_CHILDREN child processes still running${NC}"
    pkill -9 -P $PARENT_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✓ PASSED: All processes in tree were killed${NC}"
echo ""

# Test 2: Test force kill flag
echo -e "${CYAN}Test 2: Force kill flag${NC}"

# Create a process that ignores SIGTERM
cat > /tmp/test-stubborn-process.sh << 'EOF'
#!/bin/bash
# Process that traps SIGTERM
trap "" TERM
echo "Stubborn process started (PID: $$)"
sleep 999
EOF
chmod +x /tmp/test-stubborn-process.sh

setsid /tmp/test-stubborn-process.sh > /tmp/yektayar-admin.log 2>&1 &
STUBBORN_PID=$!
echo $STUBBORN_PID > /tmp/yektayar-admin.pid

sleep 1

if ! kill -0 $STUBBORN_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Stubborn process didn't start${NC}"
    exit 1
fi

echo "Stubborn process running (PID: $STUBBORN_PID)"

# Try to stop with force flag
echo "Force killing..."
"${DEV_RUNNER_SCRIPT}" stop --force 2>&1 | grep -E "(Force|stopped|free)" || true

sleep 2

if kill -0 $STUBBORN_PID 2>/dev/null; then
    echo -e "${RED}✗ FAILED: Stubborn process survived force kill${NC}"
    kill -9 $STUBBORN_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✓ PASSED: Force kill worked${NC}"
echo ""

# Test 3: Test status command
echo -e "${CYAN}Test 3: Status command${NC}"

# Start a test service
echo "999999" > /tmp/yektayar-backend.pid  # Dead PID
sleep 999 &
RUNNING_PID=$!
echo $RUNNING_PID > /tmp/yektayar-admin.pid  # Running service

STATUS_OUTPUT=$("${DEV_RUNNER_SCRIPT}" status 2>&1)

# Check that status shows both conditions
if echo "$STATUS_OUTPUT" | grep -q "stale PID"; then
    echo -e "${GREEN}✓ Status detects stale PID file${NC}"
else
    echo -e "${RED}✗ FAILED: Status doesn't detect stale PID${NC}"
    echo "$STATUS_OUTPUT"
    kill $RUNNING_PID 2>/dev/null || true
    exit 1
fi

if echo "$STATUS_OUTPUT" | grep -q "Running"; then
    echo -e "${GREEN}✓ Status shows running service${NC}"
else
    echo -e "${RED}✗ FAILED: Status doesn't show running service${NC}"
    echo "$STATUS_OUTPUT"
    kill $RUNNING_PID 2>/dev/null || true
    exit 1
fi

# Clean up
kill $RUNNING_PID 2>/dev/null || true
rm -f /tmp/yektayar-backend.pid /tmp/yektayar-admin.pid
echo ""

echo "=========================================="
echo -e "${GREEN}All process tree tests passed! ✓${NC}"
echo "=========================================="
