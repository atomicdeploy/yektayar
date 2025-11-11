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
    echo ""
    echo "Usage: $0 {backend|admin|mobile|all} [--detached]"
    echo ""
    echo "Services:"
    echo "  backend      - Backend API server (port 3000)"
    echo "  admin        - Admin Panel dev server (port 5173)"
    echo "  mobile       - Mobile App dev server (port 8100)"
    echo "  all          - All services in separate terminals"
    echo ""
    echo "Options:"
    echo "  --detached   - Run in background (requires tmux or screen)"
    echo ""
    echo "Examples:"
    echo "  $0 backend           # Run backend in foreground"
    echo "  $0 all               # Run all services (opens in terminal tabs)"
    echo "  $0 backend --detached # Run backend in background"
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

# Function to stop detached services
stop_services() {
    echo -e "${YELLOW}Stopping detached services...${NC}"
    
    if [ -f /tmp/yektayar-backend.pid ]; then
        kill $(cat /tmp/yektayar-backend.pid) 2>/dev/null && echo -e "${GREEN}✓ Backend stopped${NC}"
        rm /tmp/yektayar-backend.pid
    fi
    
    if [ -f /tmp/yektayar-admin.pid ]; then
        kill $(cat /tmp/yektayar-admin.pid) 2>/dev/null && echo -e "${GREEN}✓ Admin Panel stopped${NC}"
        rm /tmp/yektayar-admin.pid
    fi
    
    if [ -f /tmp/yektayar-mobile.pid ]; then
        kill $(cat /tmp/yektayar-mobile.pid) 2>/dev/null && echo -e "${GREEN}✓ Mobile App stopped${NC}"
        rm /tmp/yektayar-mobile.pid
    fi
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
            echo "To view logs:"
            echo "  tail -f /tmp/yektayar-backend.log"
            echo "  tail -f /tmp/yektayar-admin.log"
            echo "  tail -f /tmp/yektayar-mobile.log"
            echo ""
            echo "To stop all services:"
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
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown service: $SERVICE${NC}\n"
        show_usage
        exit 1
        ;;
esac
