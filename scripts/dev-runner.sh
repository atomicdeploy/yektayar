#!/bin/bash

# YektaYar Development Mode Runner
# This script runs services in development mode (foreground or detached)
# Supports both native mode and PM2 mode for process management

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Load .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Default ports (can be overridden by .env)
BACKEND_PORT=${PORT:-3000}
ADMIN_PORT=${VITE_ADMIN_PORT:-5173}
MOBILE_PORT=${VITE_MOBILE_PORT:-8100}

# Function to show usage
show_usage() {
    echo -e "${BLUE}YektaYar Development Mode Runner${NC}"
    echo -e ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "    $0 {backend|admin|mobile|all|stop|logs|status} [options]"
    echo -e ""
    echo -e "${CYAN}Services:${NC}"
    echo -e "    ${GREEN}backend${NC}      - Backend API server (port $BACKEND_PORT)"
    echo -e "    ${GREEN}admin${NC}        - Admin Panel dev server (port $ADMIN_PORT)"
    echo -e "    ${GREEN}mobile${NC}       - Mobile App dev server (port $MOBILE_PORT)"
    echo -e "    ${GREEN}all${NC}          - All services"
    echo -e ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "    ${GREEN}stop${NC}         - Stop all detached services"
    echo -e "    ${GREEN}logs${NC}         - Display logs from detached services"
    echo -e "    ${GREEN}status${NC}       - Show status of services"
    echo -e ""
    echo -e "${CYAN}Options:${NC}"
    echo -e "    ${GREEN}--detached${NC}   - Run in background"
    echo -e "    ${GREEN}--pm2${NC}        - Use PM2 for process management"
    echo -e "    ${GREEN}--force${NC}      - Force kill processes (with stop command)"
    echo -e ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "    $0 backend           # Run backend in foreground"
    echo -e "    $0 all --detached    # Run all services in background"
    echo -e "    $0 backend --pm2     # Run backend with PM2"
    echo -e "    $0 logs backend      # Show backend logs"
    echo -e "    $0 status            # Show service status"
    echo -e "    $0 stop              # Stop all detached services gracefully"
    echo -e "    $0 stop --force      # Force kill all services immediately"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
is_port_in_use() {
    local port=$1
    if command_exists ss; then
        ss -tlnp | grep -q ":${port} "
    elif command_exists netstat; then
        netstat -tlnp 2>/dev/null | grep -q ":${port} "
    elif command_exists lsof; then
        lsof -i ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1
    else
        # Fallback: try to connect to the port
        timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/${port}" 2>/dev/null
        return $?
    fi
}

# Function to wait for port to be in use (service started)
wait_for_port() {
    local port=$1
    local timeout=${2:-30}
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if is_port_in_use "$port"; then
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    return 1
}

# Function to wait for port to be free (service stopped)
wait_for_port_free() {
    local port=$1
    local timeout=${2:-10}
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if ! is_port_in_use "$port"; then
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    return 1
}

# Function to extract port from log file
extract_port_from_log() {
    local log_file=$1
    local default_port=$2
    
    if [ ! -f "$log_file" ]; then
        echo "$default_port"
        return
    fi
    
    # Look for common patterns in vite/backend logs
    local port=$(grep -oP '(Local|localhost):\s*http://[^:]+:(\d+)' "$log_file" | grep -oP '\d+$' | head -1)
    if [ -z "$port" ]; then
        port=$(grep -oP 'port\s*(\d+)' "$log_file" | grep -oP '\d+' | head -1)
    fi
    
    if [ -z "$port" ]; then
        echo "$default_port"
    else
        echo "$port"
    fi
}

# Function to kill process tree (parent and all children)
kill_process_tree() {
    local pid=$1
    local signal=${2:-TERM}
    
    # Check if process exists
    if ! kill -0 "$pid" 2>/dev/null; then
        return 0
    fi
    
    # Try to get the process group ID
    local pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')
    
    if [ -n "$pgid" ] && [ "$pgid" != "0" ]; then
        # Kill entire process group (includes all descendants)
        # Use negative PGID to signal the entire process group
        kill -"$signal" -- -"$pgid" 2>/dev/null || true
        
        # Also try to kill the main process directly as a fallback
        kill -"$signal" "$pid" 2>/dev/null || true
    else
        # Fallback to recursive tree killing if we can't get PGID
        # Get all child PIDs recursively
        local children=$(pgrep -P "$pid" 2>/dev/null)
        
        # Kill children first
        for child in $children; do
            kill_process_tree "$child" "$signal"
        done
        
        # Kill the parent process
        if kill -0 "$pid" 2>/dev/null; then
            kill -"$signal" "$pid" 2>/dev/null || true
        fi
    fi
}

# Function to run backend
run_backend() {
    local mode=$1
    local use_pm2=${2:-false}
    
    echo -e "${GREEN}Starting Backend API Server...${NC}"
    cd "$PROJECT_ROOT/packages/backend"
    
    if [ "$use_pm2" = "true" ]; then
        if ! command_exists pm2; then
            echo -e "${RED}✗ PM2 is not installed. Install it with: npm install -g pm2${NC}"
            exit 1
        fi
        pm2 start --name yektayar-backend "bun run --watch src/index.ts"
        echo -e "${GREEN}✓ Backend started with PM2${NC}"
        echo "  Run 'pm2 logs yektayar-backend' to see logs"
    elif [ "$mode" = "detached" ]; then
        # Check if port is already in use
        if is_port_in_use "$BACKEND_PORT"; then
            echo -e "${YELLOW}⚠ Port $BACKEND_PORT is already in use${NC}"
            echo -e "${YELLOW}  Backend may already be running or another service is using this port${NC}"
        fi
        
        # Start with setsid to create a new process group
        setsid bun run --watch src/index.ts > /tmp/yektayar-backend.log 2>&1 &
        echo $! > /tmp/yektayar-backend.pid
        
        local pid=$(cat /tmp/yektayar-backend.pid)
        echo -e "${GREEN}✓ Backend starting in background (PID: $pid)${NC}"
        echo "  Logs: /tmp/yektayar-backend.log"
        
        # Wait for port to be listening
        echo -n "  Waiting for backend to start on port $BACKEND_PORT..."
        if wait_for_port "$BACKEND_PORT" 30; then
            echo -e " ${GREEN}✓${NC}"
            echo -e "${GREEN}✓ Backend is now listening on port $BACKEND_PORT${NC}"
        else
            echo -e " ${YELLOW}⚠${NC}"
            echo -e "${YELLOW}⚠ Backend may not have started properly (port not detected)${NC}"
            echo -e "${YELLOW}  Check logs at: /tmp/yektayar-backend.log${NC}"
        fi
    else
        bun run --watch src/index.ts
    fi
}

# Function to run admin panel
run_admin() {
    local mode=$1
    local use_pm2=${2:-false}
    
    echo -e "${GREEN}Starting Admin Panel Dev Server...${NC}"
    cd "$PROJECT_ROOT/packages/admin-panel"
    
    if [ "$use_pm2" = "true" ]; then
        if ! command_exists pm2; then
            echo -e "${RED}✗ PM2 is not installed. Install it with: npm install -g pm2${NC}"
            exit 1
        fi
        pm2 start --name yektayar-admin npm -- run dev
        echo -e "${GREEN}✓ Admin Panel started with PM2${NC}"
        echo "  Run 'pm2 logs yektayar-admin' to see logs"
    elif [ "$mode" = "detached" ]; then
        # Check if port is already in use
        if is_port_in_use "$ADMIN_PORT"; then
            echo -e "${YELLOW}⚠ Port $ADMIN_PORT is already in use${NC}"
            echo -e "${YELLOW}  Admin Panel may already be running or another service is using this port${NC}"
        fi
        
        # Start with setsid to create a new process group
        setsid npm run dev > /tmp/yektayar-admin.log 2>&1 &
        echo $! > /tmp/yektayar-admin.pid
        
        local pid=$(cat /tmp/yektayar-admin.pid)
        echo -e "${GREEN}✓ Admin Panel starting in background (PID: $pid)${NC}"
        echo "  Logs: /tmp/yektayar-admin.log"
        
        # Wait for port to be listening
        echo -n "  Waiting for admin panel to start on port $ADMIN_PORT..."
        if wait_for_port "$ADMIN_PORT" 30; then
            echo -e " ${GREEN}✓${NC}"
            echo -e "${GREEN}✓ Admin Panel is now listening on port $ADMIN_PORT${NC}"
        else
            echo -e " ${YELLOW}⚠${NC}"
            echo -e "${YELLOW}⚠ Admin Panel may not have started properly (port not detected)${NC}"
            echo -e "${YELLOW}  Check logs at: /tmp/yektayar-admin.log${NC}"
        fi
    else
        npm run dev
    fi
}

# Function to run mobile app
run_mobile() {
    local mode=$1
    local use_pm2=${2:-false}
    
    echo -e "${GREEN}Starting Mobile App Dev Server...${NC}"
    cd "$PROJECT_ROOT/packages/mobile-app"
    
    if [ "$use_pm2" = "true" ]; then
        if ! command_exists pm2; then
            echo -e "${RED}✗ PM2 is not installed. Install it with: npm install -g pm2${NC}"
            exit 1
        fi
        pm2 start --name yektayar-mobile npm -- run dev
        echo -e "${GREEN}✓ Mobile App started with PM2${NC}"
        echo "  Run 'pm2 logs yektayar-mobile' to see logs"
    elif [ "$mode" = "detached" ]; then
        # Check if port is already in use
        if is_port_in_use "$MOBILE_PORT"; then
            echo -e "${YELLOW}⚠ Port $MOBILE_PORT is already in use${NC}"
            echo -e "${YELLOW}  Mobile App may already be running or another service is using this port${NC}"
        fi
        
        # Start with setsid to create a new process group
        setsid npm run dev > /tmp/yektayar-mobile.log 2>&1 &
        echo $! > /tmp/yektayar-mobile.pid
        
        local pid=$(cat /tmp/yektayar-mobile.pid)
        echo -e "${GREEN}✓ Mobile App starting in background (PID: $pid)${NC}"
        echo "  Logs: /tmp/yektayar-mobile.log"
        
        # Wait for port to be listening
        echo -n "  Waiting for mobile app to start on port $MOBILE_PORT..."
        if wait_for_port "$MOBILE_PORT" 30; then
            echo -e " ${GREEN}✓${NC}"
            echo -e "${GREEN}✓ Mobile App is now listening on port $MOBILE_PORT${NC}"
        else
            echo -e " ${YELLOW}⚠${NC}"
            echo -e "${YELLOW}⚠ Mobile App may not have started properly (port not detected)${NC}"
            echo -e "${YELLOW}  Check logs at: /tmp/yektayar-mobile.log${NC}"
        fi
    else
        npm run dev
    fi
}

# Function to stop a specific service
stop_service() {
    local service_name=$1
    local pid_file=$2
    local log_file=$3
    local expected_port=$4
    local force_kill=${5:-false}
    
    if [ ! -f "$pid_file" ]; then
        echo -e "${YELLOW}⚠ ${service_name} is not running (no PID file found)${NC}"
        # Check if port is still in use
        if [ -n "$expected_port" ] && is_port_in_use "$expected_port"; then
            echo -e "${YELLOW}  But port $expected_port is still in use!${NC}"
            echo -e "${YELLOW}  There may be orphaned processes. Trying to clean up...${NC}"
            cleanup_port "$expected_port"
        fi
        return 0
    fi
    
    local pid=$(cat "$pid_file")
    
    # Check if process is actually running
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${YELLOW}⚠ ${service_name} process (PID $pid) is not running${NC}"
        rm -f "$pid_file"
        # Check if port is still in use
        if [ -n "$expected_port" ] && is_port_in_use "$expected_port"; then
            echo -e "${YELLOW}  But port $expected_port is still in use!${NC}"
            echo -e "${YELLOW}  There may be orphaned processes. Trying to clean up...${NC}"
            cleanup_port "$expected_port"
        fi
        return 0
    fi
    
    if [ "$force_kill" = "true" ]; then
        # Force kill immediately
        echo -e "${YELLOW}Force killing ${service_name} and all child processes...${NC}"
        kill_process_tree "$pid" "KILL"
        sleep 1
        
        if ! kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✓ ${service_name} force stopped (PID $pid)${NC}"
            rm -f "$pid_file"
            
            # Verify port is freed
            if [ -n "$expected_port" ]; then
                if wait_for_port_free "$expected_port" 5; then
                    echo -e "${GREEN}✓ Port $expected_port is now free${NC}"
                else
                    echo -e "${YELLOW}⚠ Port $expected_port may still be in use${NC}"
                fi
            fi
            return 0
        else
            echo -e "${RED}✗ Failed to force stop ${service_name} (PID $pid)${NC}"
            return 1
        fi
    else
        # Try graceful shutdown first
        echo -e "${CYAN}Stopping ${service_name} gracefully (PID $pid)...${NC}"
        kill_process_tree "$pid" "TERM"
        
        # Wait up to 10 seconds for process tree to stop
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 20 ]; do
            sleep 0.5
            count=$((count + 1))
        done
        
        # Check if process stopped
        if ! kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✓ ${service_name} stopped gracefully (PID $pid)${NC}"
            rm -f "$pid_file"
            
            # Verify port is freed
            if [ -n "$expected_port" ]; then
                if wait_for_port_free "$expected_port" 5; then
                    echo -e "${GREEN}✓ Port $expected_port is now free${NC}"
                else
                    echo -e "${YELLOW}⚠ Port $expected_port may still be in use${NC}"
                fi
            fi
            return 0
        else
            # Force kill if graceful shutdown failed
            echo -e "${YELLOW}⚠ ${service_name} did not stop gracefully, forcing...${NC}"
            kill_process_tree "$pid" "KILL"
            sleep 1
            
            if ! kill -0 "$pid" 2>/dev/null; then
                echo -e "${GREEN}✓ ${service_name} force stopped (PID $pid)${NC}"
                rm -f "$pid_file"
                
                # Verify port is freed
                if [ -n "$expected_port" ]; then
                    if wait_for_port_free "$expected_port" 5; then
                        echo -e "${GREEN}✓ Port $expected_port is now free${NC}"
                    else
                        echo -e "${YELLOW}⚠ Port $expected_port may still be in use${NC}"
                    fi
                fi
                return 0
            fi
            
            echo -e "${RED}✗ Failed to stop ${service_name} (PID $pid)${NC}"
            return 1
        fi
    fi
}

# Function to cleanup orphaned processes on a port
cleanup_port() {
    local port=$1
    
    # Find processes listening on the port
    local pids=""
    if command_exists lsof; then
        pids=$(lsof -ti ":$port" 2>/dev/null || true)
    elif command_exists ss; then
        pids=$(ss -tlnp | grep ":${port} " | grep -oP 'pid=\K\d+' | sort -u || true)
    fi
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}  Found processes on port $port: $pids${NC}"
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${YELLOW}  Killing process $pid...${NC}"
                kill_process_tree "$pid" "TERM"
                sleep 1
                if kill -0 "$pid" 2>/dev/null; then
                    kill_process_tree "$pid" "KILL"
                fi
            fi
        done
    fi
}

# Function to stop detached services
stop_services() {
    local force_kill=${1:-false}
    local use_pm2=${2:-false}
    
    if [ "$use_pm2" = "true" ]; then
        if ! command_exists pm2; then
            echo -e "${RED}✗ PM2 is not installed${NC}"
            return 1
        fi
        
        echo -e "${YELLOW}Stopping PM2 services...${NC}"
        echo ""
        
        pm2 stop yektayar-backend yektayar-admin yektayar-mobile 2>/dev/null || true
        if [ "$force_kill" = "true" ]; then
            pm2 delete yektayar-backend yektayar-admin yektayar-mobile 2>/dev/null || true
        fi
        
        echo ""
        echo -e "${GREEN}PM2 services stopped${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}Stopping detached services...${NC}"
    if [ "$force_kill" = "true" ]; then
        echo -e "${YELLOW}(Force mode: immediate kill)${NC}"
    fi
    echo ""
    
    local failed=0
    
    stop_service "Backend" "/tmp/yektayar-backend.pid" "/tmp/yektayar-backend.log" "$BACKEND_PORT" "$force_kill" || failed=1
    stop_service "Admin Panel" "/tmp/yektayar-admin.pid" "/tmp/yektayar-admin.log" "$ADMIN_PORT" "$force_kill" || failed=1
    stop_service "Mobile App" "/tmp/yektayar-mobile.pid" "/tmp/yektayar-mobile.log" "$MOBILE_PORT" "$force_kill" || failed=1
    
    # Final check: ensure all expected ports are freed
    # This catches any orphaned processes that weren't tracked by PID files
    echo ""
    echo -e "${CYAN}Verifying all ports are freed...${NC}"
    local ports_cleaned=0
    
    for port_info in "$BACKEND_PORT:Backend" "$ADMIN_PORT:Admin Panel" "$MOBILE_PORT:Mobile App"; do
        local port="${port_info%%:*}"
        local name="${port_info#*:}"
        if is_port_in_use "$port"; then
            echo -e "${YELLOW}⚠ Port $port ($name) is still in use, cleaning up...${NC}"
            cleanup_port "$port"
            ports_cleaned=1
        fi
    done
    
    if [ $ports_cleaned -eq 1 ]; then
        echo -e "${GREEN}✓ Orphaned processes cleaned up${NC}"
    fi
    
    echo ""
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All services stopped successfully${NC}"
        return 0
    else
        echo -e "${RED}Some services failed to stop${NC}"
        return 1
    fi
}

# Function to show service status
show_status() {
    local use_pm2=${1:-false}
    
    if [ "$use_pm2" = "true" ]; then
        if ! command_exists pm2; then
            echo -e "${RED}✗ PM2 is not installed${NC}"
            return 1
        fi
        
        echo -e "${BLUE}=== PM2 Services Status ===${NC}"
        pm2 list | grep -E "(yektayar-backend|yektayar-admin|yektayar-mobile)" || echo "No YektaYar services found"
        return 0
    fi
    
    echo -e "${BLUE}=== Services Status ===${NC}"
    echo ""
    
    # Backend
    echo -e "${CYAN}Backend (Port $BACKEND_PORT):${NC}"
    if [ -f /tmp/yektayar-backend.pid ]; then
        local pid=$(cat /tmp/yektayar-backend.pid)
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  PID: $pid - ${GREEN}Running ✓${NC}"
            if is_port_in_use "$BACKEND_PORT"; then
                echo -e "  Port $BACKEND_PORT: ${GREEN}Listening ✓${NC}"
            else
                echo -e "  Port $BACKEND_PORT: ${YELLOW}Not listening ⚠${NC}"
            fi
        else
            echo -e "  ${YELLOW}Not running (stale PID file)${NC}"
        fi
    else
        echo -e "  ${YELLOW}Not running${NC}"
        if is_port_in_use "$BACKEND_PORT"; then
            echo -e "  Port $BACKEND_PORT: ${YELLOW}In use by another process ⚠${NC}"
        fi
    fi
    echo ""
    
    # Admin Panel
    echo -e "${CYAN}Admin Panel (Port $ADMIN_PORT):${NC}"
    if [ -f /tmp/yektayar-admin.pid ]; then
        local pid=$(cat /tmp/yektayar-admin.pid)
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  PID: $pid - ${GREEN}Running ✓${NC}"
            if is_port_in_use "$ADMIN_PORT"; then
                echo -e "  Port $ADMIN_PORT: ${GREEN}Listening ✓${NC}"
            else
                echo -e "  Port $ADMIN_PORT: ${YELLOW}Not listening ⚠${NC}"
            fi
        else
            echo -e "  ${YELLOW}Not running (stale PID file)${NC}"
        fi
    else
        echo -e "  ${YELLOW}Not running${NC}"
        if is_port_in_use "$ADMIN_PORT"; then
            echo -e "  Port $ADMIN_PORT: ${YELLOW}In use by another process ⚠${NC}"
        fi
    fi
    echo ""
    
    # Mobile App
    echo -e "${CYAN}Mobile App (Port $MOBILE_PORT):${NC}"
    if [ -f /tmp/yektayar-mobile.pid ]; then
        local pid=$(cat /tmp/yektayar-mobile.pid)
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  PID: $pid - ${GREEN}Running ✓${NC}"
            if is_port_in_use "$MOBILE_PORT"; then
                echo -e "  Port $MOBILE_PORT: ${GREEN}Listening ✓${NC}"
            else
                echo -e "  Port $MOBILE_PORT: ${YELLOW}Not listening ⚠${NC}"
            fi
        else
            echo -e "  ${YELLOW}Not running (stale PID file)${NC}"
        fi
    else
        echo -e "  ${YELLOW}Not running${NC}"
        if is_port_in_use "$MOBILE_PORT"; then
            echo -e "  Port $MOBILE_PORT: ${YELLOW}In use by another process ⚠${NC}"
        fi
    fi
}

# Function to show logs
show_logs() {
    local service=$1
    
    case "$service" in
        backend)
            if [ -f /tmp/yektayar-backend.log ]; then
                echo -e "${BLUE}=== Backend Logs ===${NC}"
                echo -e "${YELLOW}Log file: /tmp/yektayar-backend.log${NC}"
                echo ""
                tail -f /tmp/yektayar-backend.log
            else
                echo -e "${RED}✗ Backend log file not found${NC}"
                echo "  Make sure backend is running in detached mode"
                exit 1
            fi
            ;;
        admin|admin-panel)
            if [ -f /tmp/yektayar-admin.log ]; then
                echo -e "${BLUE}=== Admin Panel Logs ===${NC}"
                echo -e "${YELLOW}Log file: /tmp/yektayar-admin.log${NC}"
                echo ""
                tail -f /tmp/yektayar-admin.log
            else
                echo -e "${RED}✗ Admin Panel log file not found${NC}"
                echo "  Make sure admin panel is running in detached mode"
                exit 1
            fi
            ;;
        mobile|mobile-app)
            if [ -f /tmp/yektayar-mobile.log ]; then
                echo -e "${BLUE}=== Mobile App Logs ===${NC}"
                echo -e "${YELLOW}Log file: /tmp/yektayar-mobile.log${NC}"
                echo ""
                tail -f /tmp/yektayar-mobile.log
            else
                echo -e "${RED}✗ Mobile App log file not found${NC}"
                echo "  Make sure mobile app is running in detached mode"
                exit 1
            fi
            ;;
        all|"")
            echo -e "${BLUE}=== All Services Logs ===${NC}"
            echo -e "${YELLOW}Available log files:${NC}"
            local found=0
            if [ -f /tmp/yektayar-backend.log ]; then
                echo "  - Backend: /tmp/yektayar-backend.log"
                found=1
            fi
            if [ -f /tmp/yektayar-admin.log ]; then
                echo "  - Admin Panel: /tmp/yektayar-admin.log"
                found=1
            fi
            if [ -f /tmp/yektayar-mobile.log ]; then
                echo "  - Mobile App: /tmp/yektayar-mobile.log"
                found=1
            fi
            
            if [ $found -eq 0 ]; then
                echo -e "${RED}✗ No log files found${NC}"
                echo "  Make sure services are running in detached mode"
                exit 1
            fi
            
            echo ""
            echo -e "${CYAN}Press Ctrl+C to exit${NC}"
            echo ""
            
            # Use tail to follow all available logs
            local tail_args=()
            [ -f /tmp/yektayar-backend.log ] && tail_args+=("/tmp/yektayar-backend.log")
            [ -f /tmp/yektayar-admin.log ] && tail_args+=("/tmp/yektayar-admin.log")
            [ -f /tmp/yektayar-mobile.log ] && tail_args+=("/tmp/yektayar-mobile.log")
            
            tail -f "${tail_args[@]}"
            ;;
        *)
            echo -e "${RED}Unknown service: $service${NC}"
            echo "Available services: backend, admin, mobile, all"
            exit 1
            ;;
    esac
}

# Main script
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

SERVICE=$1
MODE="foreground"
USE_PM2=false
FORCE_KILL=false

# Parse options
shift
while [ $# -gt 0 ]; do
    case "$1" in
        --detached)
            MODE="detached"
            ;;
        --pm2)
            USE_PM2=true
            MODE="detached"  # PM2 implies detached
            ;;
        --force)
            FORCE_KILL=true
            ;;
        *)
            # Could be a service name for logs/status command
            EXTRA_ARG="$1"
            ;;
    esac
    shift
done

case "$SERVICE" in
    backend)
        run_backend "$MODE" "$USE_PM2"
        ;;
    admin|admin-panel)
        run_admin "$MODE" "$USE_PM2"
        ;;
    mobile|mobile-app)
        run_mobile "$MODE" "$USE_PM2"
        ;;
    all)
        if [ "$MODE" = "detached" ] || [ "$USE_PM2" = "true" ]; then
            if [ "$USE_PM2" = "true" ]; then
                echo -e "${BLUE}Starting all services with PM2...${NC}\n"
            else
                echo -e "${BLUE}Starting all services in detached mode...${NC}\n"
            fi
            
            run_backend "$MODE" "$USE_PM2"
            sleep 1
            run_admin "$MODE" "$USE_PM2"
            sleep 1
            run_mobile "$MODE" "$USE_PM2"
            echo ""
            echo -e "${GREEN}All services started!${NC}"
            echo ""
            
            if [ "$USE_PM2" = "true" ]; then
                echo -e "${CYAN}To view logs:${NC}"
                echo "  pm2 logs [yektayar-backend|yektayar-admin|yektayar-mobile]"
                echo ""
                echo -e "${CYAN}To stop all services:${NC}"
                echo "  $0 stop --pm2"
            else
                echo -e "${CYAN}To view logs:${NC}"
                echo "  $0 logs [backend|admin|mobile|all]"
                echo ""
                echo -e "${CYAN}To check status:${NC}"
                echo "  $0 status"
                echo ""
                echo -e "${CYAN}To stop all services:${NC}"
                echo "  $0 stop"
            fi
        else
            echo -e "${RED}Error: Running all services in foreground mode requires a terminal multiplexer${NC}"
            echo "Please use --detached flag or run services individually in separate terminals"
            exit 1
        fi
        ;;
    stop)
        stop_services "$FORCE_KILL" "$USE_PM2"
        ;;
    status)
        show_status "$USE_PM2"
        ;;
    logs)
        if [ "$USE_PM2" = "true" ]; then
            if ! command_exists pm2; then
                echo -e "${RED}✗ PM2 is not installed${NC}"
                exit 1
            fi
            if [ -n "$EXTRA_ARG" ]; then
                case "$EXTRA_ARG" in
                    backend)
                        pm2 logs yektayar-backend
                        ;;
                    admin|admin-panel)
                        pm2 logs yektayar-admin
                        ;;
                    mobile|mobile-app)
                        pm2 logs yektayar-mobile
                        ;;
                    all|"")
                        pm2 logs
                        ;;
                    *)
                        echo -e "${RED}Unknown service: $EXTRA_ARG${NC}"
                        exit 1
                        ;;
                esac
            else
                pm2 logs
            fi
        else
            show_logs "$EXTRA_ARG"
        fi
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown service: $SERVICE${NC}\n"
        show_usage
        exit 1
        ;;
esac
