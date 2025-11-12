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

# Function to detect if running in screen or script session
is_multiplexer_session() {
    # Check for GNU screen
    [ -n "$STY" ] && return 0
    # Check for tmux
    [ -n "$TMUX" ] && return 0
    # Check if running inside script command (checks for script in parent process tree)
    if ps -o comm= -p $PPID 2>/dev/null | grep -q "script"; then
        return 0
    fi
    return 1
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}YektaYar Development Mode Runner${NC}"
    echo -e ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "    $0 {backend|admin|mobile|all|stop|logs|status|interact} [options]"
    echo -e ""
    echo -e "${CYAN}Services:${NC}"
    echo -e "    ${GREEN}backend${NC}      - Backend API server (port $BACKEND_PORT)"
    echo -e "    ${GREEN}admin${NC}        - Admin Panel dev server (port $ADMIN_PORT)"
    echo -e "    ${GREEN}mobile${NC}       - Mobile App dev server (port $MOBILE_PORT)"
    echo -e "    ${GREEN}all${NC}          - All services"
    echo -e ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "    ${GREEN}stop${NC}         - Stop all detached services"
    echo -e "    ${GREEN}logs${NC}         - Display logs from detached services (interactive)"
    echo -e "    ${GREEN}interact${NC}     - Send interactive input to a detached service"
    echo -e "    ${GREEN}status${NC}       - Show status of services"
    echo -e ""
    echo -e "${CYAN}Options:${NC}"
    echo -e "    ${GREEN}--detached${NC}   - Run in background (auto-detected in screen/tmux/script)"
    echo -e "    ${GREEN}--pm2${NC}        - Use PM2 for process management"
    echo -e "    ${GREEN}--force${NC}      - Force kill processes (with stop command)"
    echo -e "    ${GREEN}--follow${NC}     - Use live follow mode for logs (default)"
    echo -e "    ${GREEN}--pager${NC}      - Use less pager for logs (allows scrollback)"
    echo -e ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "    $0 backend           # Run backend in foreground"
    echo -e "    $0 all --detached    # Run all services in background"
    echo -e "    $0 all               # In screen/tmux: auto-detached"
    echo -e "    $0 backend --pm2     # Run backend with PM2"
    echo -e "    $0 logs backend      # Show backend logs (live follow)"
    echo -e "    $0 logs backend --pager  # Show backend logs with less (scrollback)"
    echo -e "    $0 interact backend  # Send input to backend service"
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
    
    echo ""
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All services stopped successfully${NC}"
        return 0
    else
        echo -e "${RED}Some services failed to stop${NC}"
        return 1
    fi
}

# Function to send interactive input to a detached service
interact_with_service() {
    local service=$1
    local service_name=""
    local pid_file=""
    
    case "$service" in
        backend)
            service_name="Backend"
            pid_file="/tmp/yektayar-backend.pid"
            ;;
        admin|admin-panel)
            service_name="Admin Panel"
            pid_file="/tmp/yektayar-admin.pid"
            ;;
        mobile|mobile-app)
            service_name="Mobile App"
            pid_file="/tmp/yektayar-mobile.pid"
            ;;
        *)
            echo -e "${RED}Unknown service: $service${NC}"
            echo "Available services: backend, admin, mobile"
            exit 1
            ;;
    esac
    
    if [ ! -f "$pid_file" ]; then
        echo -e "${RED}✗ ${service_name} is not running in detached mode${NC}"
        echo "  Start it with: $0 $service --detached"
        exit 1
    fi
    
    local pid=$(cat "$pid_file")
    
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${RED}✗ ${service_name} process is not running${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}=== Interactive mode for ${service_name} (PID: $pid) ===${NC}"
    echo -e "${YELLOW}Note: Services run in background cannot receive direct terminal input.${NC}"
    echo -e "${YELLOW}This feature sends signals to the process for common actions.${NC}"
    echo ""
    echo -e "${CYAN}Available actions:${NC}"
    echo -e "  ${GREEN}1${NC} - Send SIGUSR1 (custom signal, app-specific)"
    echo -e "  ${GREEN}2${NC} - Send SIGUSR2 (custom signal, app-specific)"
    echo -e "  ${GREEN}r${NC} - Restart service"
    echo -e "  ${GREEN}s${NC} - Show service status"
    echo -e "  ${GREEN}l${NC} - Show logs"
    echo -e "  ${GREEN}q${NC} - Quit interactive mode"
    echo ""
    
    while true; do
        read -p "Enter action: " action
        case "$action" in
            1)
                echo "Sending SIGUSR1 to $service_name..."
                kill -USR1 "$pid" 2>/dev/null && echo -e "${GREEN}Signal sent${NC}" || echo -e "${RED}Failed to send signal${NC}"
                ;;
            2)
                echo "Sending SIGUSR2 to $service_name..."
                kill -USR2 "$pid" 2>/dev/null && echo -e "${GREEN}Signal sent${NC}" || echo -e "${RED}Failed to send signal${NC}"
                ;;
            r|R)
                echo "Restarting $service_name..."
                stop_service "$service_name" "$pid_file" "" "" false
                sleep 2
                case "$service" in
                    backend) run_backend "detached" "false" ;;
                    admin|admin-panel) run_admin "detached" "false" ;;
                    mobile|mobile-app) run_mobile "detached" "false" ;;
                esac
                echo -e "${GREEN}Service restarted${NC}"
                exit 0
                ;;
            s|S)
                if kill -0 "$pid" 2>/dev/null; then
                    echo -e "${GREEN}$service_name is running (PID: $pid)${NC}"
                else
                    echo -e "${RED}$service_name is not running${NC}"
                    exit 1
                fi
                ;;
            l|L)
                local log_file=""
                case "$service" in
                    backend) log_file="/tmp/yektayar-backend.log" ;;
                    admin|admin-panel) log_file="/tmp/yektayar-admin.log" ;;
                    mobile|mobile-app) log_file="/tmp/yektayar-mobile.log" ;;
                esac
                if [ -f "$log_file" ]; then
                    tail -20 "$log_file"
                else
                    echo -e "${RED}Log file not found${NC}"
                fi
                ;;
            q|Q)
                echo "Exiting interactive mode"
                exit 0
                ;;
            *)
                echo -e "${YELLOW}Unknown action. Please try again.${NC}"
                ;;
        esac
        echo ""
    done
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
    local use_pager=${2:-false}
    
    case "$service" in
        backend)
            if [ -f /tmp/yektayar-backend.log ]; then
                echo -e "${BLUE}=== Backend Logs ===${NC}"
                echo -e "${YELLOW}Log file: /tmp/yektayar-backend.log${NC}"
                if [ "$use_pager" = "true" ] && command_exists less; then
                    echo -e "${CYAN}Using less pager (press 'q' to quit, 'F' to follow, 'Ctrl+C' then 'F' to resume following)${NC}"
                    echo ""
                    less +F /tmp/yektayar-backend.log
                else
                    echo -e "${CYAN}Following logs (press Ctrl+C to exit)${NC}"
                    echo ""
                    tail -f /tmp/yektayar-backend.log
                fi
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
                if [ "$use_pager" = "true" ] && command_exists less; then
                    echo -e "${CYAN}Using less pager (press 'q' to quit, 'F' to follow, 'Ctrl+C' then 'F' to resume following)${NC}"
                    echo ""
                    less +F /tmp/yektayar-admin.log
                else
                    echo -e "${CYAN}Following logs (press Ctrl+C to exit)${NC}"
                    echo ""
                    tail -f /tmp/yektayar-admin.log
                fi
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
                if [ "$use_pager" = "true" ] && command_exists less; then
                    echo -e "${CYAN}Using less pager (press 'q' to quit, 'F' to follow, 'Ctrl+C' then 'F' to resume following)${NC}"
                    echo ""
                    less +F /tmp/yektayar-mobile.log
                else
                    echo -e "${CYAN}Following logs (press Ctrl+C to exit)${NC}"
                    echo ""
                    tail -f /tmp/yektayar-mobile.log
                fi
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
            
            # Use tail to follow all available logs
            local tail_args=()
            [ -f /tmp/yektayar-backend.log ] && tail_args+=("/tmp/yektayar-backend.log")
            [ -f /tmp/yektayar-admin.log ] && tail_args+=("/tmp/yektayar-admin.log")
            [ -f /tmp/yektayar-mobile.log ] && tail_args+=("/tmp/yektayar-mobile.log")
            
            if [ "$use_pager" = "true" ] && command_exists less; then
                echo -e "${CYAN}Using less pager for multiple logs${NC}"
                echo -e "${CYAN}Note: Multiple log files shown sequentially${NC}"
                echo -e "${CYAN}(press 'q' to quit, 'F' to follow, 'Ctrl+C' then 'F' to resume following)${NC}"
                echo ""
                # For multiple files, we'll use multitail if available, otherwise just tail
                if command_exists multitail; then
                    multitail "${tail_args[@]}"
                else
                    # Show all files with less, using +F for follow mode
                    for log_file in "${tail_args[@]}"; do
                        echo -e "${YELLOW}==> $log_file <==${NC}"
                    done
                    tail -f "${tail_args[@]}"
                fi
            else
                echo -e "${CYAN}Following logs (press Ctrl+C to exit)${NC}"
                echo ""
                tail -f "${tail_args[@]}"
            fi
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
USE_PAGER=false

# Auto-detect if running in screen/tmux/script and default to detached mode
if is_multiplexer_session; then
    MODE="detached"
    echo -e "${CYAN}ℹ Detected screen/tmux/script session - auto-enabling detached mode${NC}"
fi

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
        --pager)
            USE_PAGER=true
            ;;
        --follow)
            USE_PAGER=false
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
                echo "  $0 logs backend --pager  # with scrollback support"
                echo ""
                echo -e "${CYAN}To interact with a service:${NC}"
                echo "  $0 interact [backend|admin|mobile]"
                echo ""
                echo -e "${CYAN}To check status:${NC}"
                echo "  $0 status"
                echo ""
                echo -e "${CYAN}To stop all services:${NC}"
                echo "  $0 stop"
            fi
        else
            echo -e "${RED}Error: Running all services in foreground mode requires a terminal multiplexer${NC}"
            echo "Please use --detached flag, run in screen/tmux, or run services individually"
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
            show_logs "$EXTRA_ARG" "$USE_PAGER"
        fi
        ;;
    interact)
        if [ "$USE_PM2" = "true" ]; then
            echo -e "${RED}✗ Interactive mode is not supported with PM2${NC}"
            echo "  Use 'pm2 logs' to view logs instead"
            exit 1
        fi
        if [ -z "$EXTRA_ARG" ]; then
            echo -e "${RED}✗ Please specify a service to interact with${NC}"
            echo "  Usage: $0 interact [backend|admin|mobile]"
            exit 1
        fi
        interact_with_service "$EXTRA_ARG"
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
