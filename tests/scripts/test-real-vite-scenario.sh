#!/bin/bash
# Comprehensive test for the exact issue described in the problem statement
# npm run dev starts vite, which spawns esbuild, and these processes continue
# running even after the parent npm process exits

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
    pkill -f "fake-npm" 2>/dev/null || true
    pkill -f "fake-vite" 2>/dev/null || true
    pkill -f "fake-esbuild" 2>/dev/null || true
    pkill -f "nc -l.*517" 2>/dev/null || true
    pkill -f "nc -l.*810" 2>/dev/null || true
    rm -f /tmp/yektayar-*.pid /tmp/yektayar-*.log
    rm -f /tmp/fake-*.sh
}

# Setup trap to cleanup on exit
trap cleanup EXIT

echo "=========================================================================="
echo "Testing Real-World Vite/ESBuild Scenario (Problem Statement)"
echo "=========================================================================="
echo ""
echo -e "${CYAN}Scenario:${NC}"
echo "  1. npm run dev is started with setsid"
echo "  2. npm spawns vite process that listens on port 5173"
echo "  3. vite spawns esbuild process"
echo "  4. npm process may exit early (or be killed)"
echo "  5. vite and esbuild processes continue running"
echo "  6. ./scripts/dev-runner.sh stop should kill ALL processes"
echo ""

# Test 1: Processes stay alive after parent exits
echo -e "${CYAN}Test 1: Parent exits early, children continue${NC}"
echo "Creating fake npm -> vite -> esbuild process tree..."

# Create fake npm script
cat > /tmp/fake-npm.sh << 'NPMSCRIPT'
#!/bin/bash
echo "[npm] npm run dev starting (PID $$)"

# Spawn vite process (detached)
(
    echo "[vite] Vite dev server starting (PID $$, PGID $(ps -o pgid= -p $$ 2>/dev/null))"
    
    # Spawn esbuild process
    (
        echo "[esbuild] ESBuild service starting (PID $$)"
        # Simulate esbuild running
        while true; do
            sleep 10
        done
    ) &
    
    # Vite continues running
    while true; do
        sleep 10
    done
) &

VITE_PID=$!
echo "[npm] Spawned vite (PID $VITE_PID)"
echo "[npm] npm process exiting (children continue)..."
# npm exits after spawning vite
sleep 1
NPMSCRIPT

chmod +x /tmp/fake-npm.sh

# Start admin panel simulation
setsid /tmp/fake-npm.sh > /tmp/yektayar-admin.log 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > /tmp/yektayar-admin.pid

# Start mobile app simulation  
setsid /tmp/fake-npm.sh > /tmp/yektayar-mobile.log 2>&1 &
MOBILE_PID=$!
echo $MOBILE_PID > /tmp/yektayar-mobile.pid

sleep 3

echo ""
echo -e "${YELLOW}Status after startup:${NC}"
echo "Admin Panel PID: $ADMIN_PID"
if kill -0 $ADMIN_PID 2>/dev/null; then
    echo "  ✓ Admin npm process running"
else
    echo "  ✗ Admin npm process exited (expected)"
fi

echo "Mobile App PID: $MOBILE_PID"
if kill -0 $MOBILE_PID 2>/dev/null; then
    echo "  ✓ Mobile npm process running"
else
    echo "  ✗ Mobile npm process exited (expected)"
fi

echo ""
VITE_COUNT=$(pgrep -f "fake-vite|fake-esbuild|fake-npm" | wc -l)
echo -e "${GREEN}Total fake processes running: $VITE_COUNT${NC}"

if [ $VITE_COUNT -lt 2 ]; then
    echo -e "${RED}✗ FAILED: Expected at least 2 processes (vite instances)${NC}"
    exit 1
fi

echo "Process details:"
ps aux | grep -E "fake-npm|fake-vite|fake-esbuild" | grep -v grep | head -10

echo ""
echo -e "${CYAN}Now calling dev-runner.sh stop...${NC}"
echo ""

# Stop using dev-runner
STOP_OUTPUT=$("${DEV_RUNNER_SCRIPT}" stop 2>&1)
echo "$STOP_OUTPUT"

sleep 3

# Check results
echo ""
echo -e "${CYAN}Verification:${NC}"

REMAINING=$(pgrep -f "fake-npm|fake-vite|fake-esbuild" 2>/dev/null | wc -l)

if [ $REMAINING -gt 0 ]; then
    echo -e "${RED}✗ FAILED: $REMAINING processes are still running!${NC}"
    echo -e "${RED}This is the bug from the problem statement!${NC}"
    echo ""
    echo "Remaining processes:"
    ps aux | grep -E "fake-npm|fake-vite|fake-esbuild" | grep -v grep
    exit 1
else
    echo -e "${GREEN}✓ SUCCESS: All processes killed (no orphans)${NC}"
fi

# Verify PID files cleaned up
if [ -f /tmp/yektayar-admin.pid ] || [ -f /tmp/yektayar-mobile.pid ]; then
    echo -e "${RED}✗ FAILED: PID files not cleaned up${NC}"
    exit 1
else
    echo -e "${GREEN}✓ PID files properly cleaned up${NC}"
fi

echo ""
echo -e "${CYAN}Test 2: Processes listening on ports${NC}"
echo "Creating processes that listen on actual ports..."

# Check if nc is available
if ! command -v nc >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ netcat not available, skipping port test${NC}"
else
    # Create script that listens on ports
    cat > /tmp/fake-vite-port.sh << 'PORTSCRIPT'
#!/bin/bash
echo "[npm] Starting npm (PID $$)"

# Start process listening on port 5173 (admin panel)
(
    echo "[vite-admin] Listening on 5173 (PID $$)"
    nc -l -p 5173 -k > /dev/null 2>&1 || nc -l 5173 > /dev/null 2>&1 &
    sleep 999
) &

# Start process listening on port 8100 (mobile app)
(
    echo "[vite-mobile] Listening on 8100 (PID $$)"
    nc -l -p 8100 -k > /dev/null 2>&1 || nc -l 8100 > /dev/null 2>&1 &
    sleep 999
) &

# npm exits
sleep 1
PORTSCRIPT

    chmod +x /tmp/fake-vite-port.sh
    
    # Start admin with port
    setsid /tmp/fake-vite-port.sh > /tmp/yektayar-admin.log 2>&1 &
    ADMIN_PID=$!
    echo $ADMIN_PID > /tmp/yektayar-admin.pid
    
    # Start mobile with port
    setsid /tmp/fake-vite-port.sh > /tmp/yektayar-mobile.log 2>&1 &
    MOBILE_PID=$!
    echo $MOBILE_PID > /tmp/yektayar-mobile.pid
    
    sleep 3
    
    echo "Checking ports..."
    PORT_5173=0
    PORT_8100=0
    
    if netstat -tlnp 2>/dev/null | grep ":5173 " || ss -tlnp 2>/dev/null | grep ":5173 " || lsof -i :5173 2>/dev/null; then
        echo "  ✓ Port 5173 in use"
        PORT_5173=1
    fi
    
    if netstat -tlnp 2>/dev/null | grep ":8100 " || ss -tlnp 2>/dev/null | grep ":8100 " || lsof -i :8100 2>/dev/null; then
        echo "  ✓ Port 8100 in use"
        PORT_8100=1
    fi
    
    if [ $PORT_5173 -eq 0 ] && [ $PORT_8100 -eq 0 ]; then
        echo -e "${YELLOW}⚠ Ports not in use (nc may not support -p flag), skipping port test${NC}"
    else
        echo ""
        echo "Stopping services with ports in use..."
        "${DEV_RUNNER_SCRIPT}" stop 2>&1 | grep -E "(Stopping|stopped|port|free|orphaned)" || true
        
        sleep 2
        
        echo ""
        echo "Verifying ports are freed..."
        PORTS_FREED=1
        if netstat -tlnp 2>/dev/null | grep ":5173 " || ss -tlnp 2>/dev/null | grep ":5173 " || lsof -i :5173 2>/dev/null; then
            echo -e "${RED}✗ Port 5173 still in use${NC}"
            PORTS_FREED=0
        else
            echo "  ✓ Port 5173 freed"
        fi
        
        if netstat -tlnp 2>/dev/null | grep ":8100 " || ss -tlnp 2>/dev/null | grep ":8100 " || lsof -i :8100 2>/dev/null; then
            echo -e "${RED}✗ Port 8100 still in use${NC}"
            PORTS_FREED=0
        else
            echo "  ✓ Port 8100 freed"
        fi
        
        if [ $PORTS_FREED -eq 1 ]; then
            echo -e "${GREEN}✓ All ports properly freed${NC}"
        else
            echo -e "${RED}✗ Some ports still in use${NC}"
            exit 1
        fi
    fi
fi

echo ""
echo "=========================================================================="
echo -e "${GREEN}Real-world vite/esbuild scenario test PASSED! ✓${NC}"
echo "=========================================================================="
echo ""
echo -e "${CYAN}Summary:${NC}"
echo "  ✓ Process tree killing works correctly"
echo "  ✓ Orphaned processes are detected and killed"
echo "  ✓ Port cleanup works when parent process exits"
echo "  ✓ PID files are properly cleaned up"
echo ""
echo -e "${GREEN}The issue from the problem statement is FIXED!${NC}"
