#!/bin/bash
# Test script that simulates the vite/esbuild child process issue
# This creates a realistic process tree similar to npm -> vite -> esbuild

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
    echo ""
    echo "Final cleanup..."
    pkill -f "simulate-npm" 2>/dev/null || true
    pkill -f "simulate-vite" 2>/dev/null || true
    pkill -f "simulate-esbuild" 2>/dev/null || true
    rm -f /tmp/yektayar-*.pid /tmp/yektayar-*.log
    rm -f /tmp/simulate-*.sh
    sleep 1
}

# Setup trap to cleanup on exit
trap cleanup EXIT

echo "=========================================="
echo "Testing Vite/ESBuild Process Tree Issue"
echo "=========================================="
echo ""

echo -e "${CYAN}This test simulates the real-world scenario:${NC}"
echo "  npm run dev -> vite -> esbuild"
echo "  Where child processes (vite, esbuild) were surviving after stop"
echo ""

# Create a realistic simulation
cat > /tmp/simulate-npm.sh << 'EOF'
#!/bin/bash
# Simulates: npm run dev
echo "[npm] Starting npm run dev (PID: $$)"

# Spawn "vite" process
(
    echo "[vite] Vite dev server starting (PID: $$)"
    
    # Spawn "esbuild" child
    (
        echo "[esbuild] ESBuild service starting (PID: $$)"
        while true; do
            sleep 1
        done
    ) &
    
    # Vite main loop
    while true; do
        sleep 1
    done
) &

# npm main loop
while true; do
    sleep 1
done
EOF

chmod +x /tmp/simulate-npm.sh

echo -e "${CYAN}Starting simulated npm -> vite -> esbuild process tree...${NC}"

# Start with setsid (like the actual dev-runner does)
setsid /tmp/simulate-npm.sh > /tmp/yektayar-admin.log 2>&1 &
NPM_PID=$!
echo $NPM_PID > /tmp/yektayar-admin.pid

sleep 3

# Show the process tree
echo ""
echo -e "${YELLOW}Process tree created:${NC}"
pstree -p $NPM_PID 2>/dev/null || ps --forest -o pid,ppid,cmd -g $NPM_PID 2>/dev/null || {
    echo "  NPM PID: $NPM_PID"
    echo "  Children: $(pgrep -P $NPM_PID | tr '\n' ' ')"
}

# Count all processes
ALL_PROCESSES=$(pgrep -f "simulate-" | wc -l)
echo ""
echo -e "${GREEN}Total processes in tree: $ALL_PROCESSES${NC}"

if [ $ALL_PROCESSES -lt 3 ]; then
    echo -e "${RED}✗ FAILED: Expected at least 3 processes (npm, vite, esbuild)${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}Now stopping using dev-runner.sh...${NC}"
echo ""

# Stop using the dev-runner
STOP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" stop 2>&1)
echo "$STOP_OUTPUT"

sleep 3

# Check if ALL processes are dead
echo ""
echo -e "${CYAN}Checking if all processes were killed...${NC}"

REMAINING=$(pgrep -f "simulate-" | wc -l)

if [ $REMAINING -gt 0 ]; then
    echo -e "${RED}✗ FAILED: $REMAINING processes are still running!${NC}"
    echo -e "${RED}This is the bug we're trying to fix!${NC}"
    echo ""
    echo "Remaining processes:"
    ps aux | grep "simulate-" | grep -v grep || true
    exit 1
else
    echo -e "${GREEN}✓ SUCCESS: All processes in the tree were killed!${NC}"
    echo -e "${GREEN}✓ The vite/esbuild orphan issue is fixed!${NC}"
fi

# Verify PID file was cleaned up
echo ""
if [ -f /tmp/yektayar-admin.pid ]; then
    echo -e "${RED}✗ FAILED: PID file was not cleaned up${NC}"
    exit 1
else
    echo -e "${GREEN}✓ PID file was properly cleaned up${NC}"
fi

# Check if stop command mentioned port status
echo ""
if echo "$STOP_OUTPUT" | grep -q "Port"; then
    echo -e "${GREEN}✓ Stop command verified port status${NC}"
else
    echo -e "${YELLOW}⚠ Stop command didn't mention port status${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Vite/ESBuild simulation test PASSED! ✓${NC}"
echo "=========================================="
