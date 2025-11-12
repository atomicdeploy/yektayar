#!/bin/bash

# YektaYar Development Mode Runner
# This script runs services in development mode (foreground)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Function to show usage
show_usage() {
    echo -e "${BLUE}YektaYar Development Mode Runner${NC}"
    echo -e ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "    $0 {backend|admin|mobile|all|stop|logs} [--detached]"
    echo -e ""
    echo -e "${CYAN}Services:${NC}"
    echo -e "    ${GREEN}backend${NC}      - Backend API server (port 3000)"
    echo -e "    ${GREEN}admin${NC}        - Admin Panel dev server (port 5173)"
    echo -e "    ${GREEN}mobile${NC}       - Mobile App dev server (port 8100)"
    echo -e "    ${GREEN}all${NC}          - All services in separate terminals"
    echo -e ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "    ${GREEN}stop${NC}         - Stop all detached services"
    echo -e "    ${GREEN}logs${NC}         - Display logs from detached services"
    echo -e ""
    echo -e "${CYAN}Options:${NC}"
    echo -e "    ${GREEN}--detached${NC}   - Run in background"
    echo -e ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "    $0 backend           # Run backend in foreground"
    echo -e "    $0 all --detached    # Run all services in background"
    echo -e "    $0 backend --detached # Run backend in background"
    echo -e "    $0 logs backend      # Show backend logs"
    echo -e "    $0 stop              # Stop all detached services"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run backend
run_backend() {
    local mode=$1
    echo -e "${GREEN}Starting Backend API Server...${NC}"
    cd "$PROJECT_ROOT/packages/backend"
    
    if [ "$mode" = "detached" ]; then
        nohup bun run --watch src/index.ts > /tmp/yektayar-backend.log 2>&1 &
        echo $! > /tmp/yektayar-backend.pid
        echo -e "${GREEN}✓ Backend started in background (PID: $(cat /tmp/yektayar-backend.pid))${NC}"
        echo "  Logs: /tmp/yektayar-backend.log"
    else
        bun run --watch src/index.ts
    fi
}

# Function to run admin panel
run_admin() {
    local mode=$1
    echo -e "${GREEN}Starting Admin Panel Dev Server...${NC}"
    cd "$PROJECT_ROOT/packages/admin-panel"
    
    if [ "$mode" = "detached" ]; then
        nohup npm run dev > /tmp/yektayar-admin.log 2>&1 &
        echo $! > /tmp/yektayar-admin.pid
        echo -e "${GREEN}✓ Admin Panel started in background (PID: $(cat /tmp/yektayar-admin.pid))${NC}"
        echo "  Logs: /tmp/yektayar-admin.log"
    else
        npm run dev
    fi
}

# Function to run mobile app
run_mobile() {
    local mode=$1
    echo -e "${GREEN}Starting Mobile App Dev Server...${NC}"
    cd "$PROJECT_ROOT/packages/mobile-app"
    
    if [ "$mode" = "detached" ]; then
        nohup npm run dev > /tmp/yektayar-mobile.log 2>&1 &
        echo $! > /tmp/yektayar-mobile.pid
        echo -e "${GREEN}✓ Mobile App started in background (PID: $(cat /tmp/yektayar-mobile.pid))${NC}"
        echo "  Logs: /tmp/yektayar-mobile.log"
    else
        npm run dev
    fi
}

# Function to stop a specific service
stop_service() {
    local service_name=$1
    local pid_file=$2
    local log_file=$3
    
    if [ ! -f "$pid_file" ]; then
        echo -e "${YELLOW}⚠ ${service_name} is not running (no PID file found)${NC}"
        return 0
    fi
    
    local pid=$(cat "$pid_file")
    
    # Check if process is actually running
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${YELLOW}⚠ ${service_name} process (PID $pid) is not running${NC}"
        rm -f "$pid_file"
        return 0
    fi
    
    # Try to kill the process gracefully
    if kill "$pid" 2>/dev/null; then
        # Wait up to 5 seconds for process to stop
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
            sleep 0.5
            count=$((count + 1))
        done
        
        # Check if process stopped
        if ! kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✓ ${service_name} stopped (PID $pid)${NC}"
            rm -f "$pid_file"
            return 0
        else
            # Force kill if graceful shutdown failed
            echo -e "${YELLOW}⚠ ${service_name} did not stop gracefully, forcing...${NC}"
            if kill -9 "$pid" 2>/dev/null; then
                sleep 1
                if ! kill -0 "$pid" 2>/dev/null; then
                    echo -e "${GREEN}✓ ${service_name} force stopped (PID $pid)${NC}"
                    rm -f "$pid_file"
                    return 0
                fi
            fi
            echo -e "${RED}✗ Failed to stop ${service_name} (PID $pid)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Failed to send stop signal to ${service_name} (PID $pid)${NC}"
        return 1
    fi
}

# Function to stop detached services
stop_services() {
    echo -e "${YELLOW}Stopping detached services...${NC}"
    echo ""
    
    local failed=0
    
    stop_service "Backend" "/tmp/yektayar-backend.pid" "/tmp/yektayar-backend.log" || failed=1
    stop_service "Admin Panel" "/tmp/yektayar-admin.pid" "/tmp/yektayar-admin.log" || failed=1
    stop_service "Mobile App" "/tmp/yektayar-mobile.pid" "/tmp/yektayar-mobile.log" || failed=1
    
    echo ""
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All services stopped successfully${NC}"
        return 0
    else
        echo -e "${RED}Some services failed to stop${NC}"
        return 1
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

if [ "$2" = "--detached" ]; then
    MODE="detached"
fi

case "$SERVICE" in
    backend)
        run_backend "$MODE"
        ;;
    admin|admin-panel)
        run_admin "$MODE"
        ;;
    mobile|mobile-app)
        run_mobile "$MODE"
        ;;
    all)
        if [ "$MODE" = "detached" ]; then
            echo -e "${BLUE}Starting all services in detached mode...${NC}\n"
            run_backend "detached"
            sleep 1
            run_admin "detached"
            sleep 1
            run_mobile "detached"
            echo ""
            echo -e "${GREEN}All services started!${NC}"
            echo ""
            echo -e "${CYAN}To view logs:${NC}"
            echo "  $0 logs [backend|admin|mobile|all]"
            echo ""
            echo -e "${CYAN}To stop all services:${NC}"
            echo "  $0 stop"
        else
            echo -e "${RED}Error: Running all services in foreground mode requires a terminal multiplexer${NC}"
            echo "Please use --detached flag or run services individually in separate terminals"
            exit 1
        fi
        ;;
    stop)
        stop_services
        ;;
    logs)
        show_logs "$2"
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
