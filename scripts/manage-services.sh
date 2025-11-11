#!/bin/bash

# YektaYar Service Management Script
# This script provides easy commands to manage YektaYar services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Services
SERVICES=(
    "yektayar-backend"
    "yektayar-admin-panel"
    "yektayar-mobile-app"
)

# Check if running as root for certain commands
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}Error: This command requires root privileges (use sudo)${NC}"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}YektaYar Service Manager${NC}"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|enable|disable|logs} [service]"
    echo ""
    echo "Commands:"
    echo "  start     - Start service(s)"
    echo "  stop      - Stop service(s)"
    echo "  restart   - Restart service(s)"
    echo "  status    - Show service(s) status"
    echo "  enable    - Enable service(s) to start on boot"
    echo "  disable   - Disable service(s) from starting on boot"
    echo "  logs      - Show service logs (real-time)"
    echo ""
    echo "Services:"
    echo "  backend      - Backend API server (port 3000)"
    echo "  admin        - Admin Panel web server (port 5173)"
    echo "  mobile       - Mobile App web server (port 8100)"
    echo "  all          - All services (default)"
    echo ""
    echo "Examples:"
    echo "  $0 start            # Start all services"
    echo "  $0 start backend    # Start only backend"
    echo "  $0 restart all      # Restart all services"
    echo "  $0 status           # Show status of all services"
    echo "  $0 logs backend     # Show backend logs"
}

# Function to get service name from shorthand
get_service_name() {
    case "$1" in
        backend)
            echo "yektayar-backend"
            ;;
        admin|admin-panel)
            echo "yektayar-admin-panel"
            ;;
        mobile|mobile-app)
            echo "yektayar-mobile-app"
            ;;
        all|"")
            echo "all"
            ;;
        *)
            echo -e "${RED}Unknown service: $1${NC}"
            echo "Available services: backend, admin, mobile, all"
            exit 1
            ;;
    esac
}

# Function to execute command on service(s)
execute_command() {
    local cmd=$1
    local service_filter=$2
    local require_root=$3
    
    if [ "$require_root" = "true" ]; then
        check_root
    fi
    
    if [ "$service_filter" = "all" ]; then
        echo -e "${YELLOW}${cmd^}ing all services...${NC}\n"
        for service in "${SERVICES[@]}"; do
            echo -e "${BLUE}$service:${NC}"
            systemctl "$cmd" "$service" 2>&1 || echo -e "${RED}Failed to $cmd $service${NC}"
            echo ""
        done
    else
        echo -e "${YELLOW}${cmd^}ing $service_filter...${NC}"
        systemctl "$cmd" "$service_filter"
    fi
}

# Function to show status
show_status() {
    local service_filter=$1
    
    if [ "$service_filter" = "all" ]; then
        echo -e "${BLUE}=== YektaYar Services Status ===${NC}\n"
        for service in "${SERVICES[@]}"; do
            systemctl status "$service" --no-pager --lines=0 2>&1 || true
            echo ""
        done
    else
        systemctl status "$service_filter" --no-pager
    fi
}

# Function to show logs
show_logs() {
    local service_filter=$1
    
    if [ "$service_filter" = "all" ]; then
        echo -e "${YELLOW}Showing logs for all services (Ctrl+C to exit)...${NC}\n"
        journalctl -u yektayar-backend -u yektayar-admin-panel -u yektayar-mobile-app -f
    else
        echo -e "${YELLOW}Showing logs for $service_filter (Ctrl+C to exit)...${NC}\n"
        journalctl -u "$service_filter" -f
    fi
}

# Main script
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
SERVICE=${2:-all}
SERVICE_NAME=$(get_service_name "$SERVICE")

case "$COMMAND" in
    start)
        execute_command "start" "$SERVICE_NAME" "true"
        ;;
    stop)
        execute_command "stop" "$SERVICE_NAME" "true"
        ;;
    restart)
        execute_command "restart" "$SERVICE_NAME" "true"
        ;;
    status)
        show_status "$SERVICE_NAME"
        ;;
    enable)
        execute_command "enable" "$SERVICE_NAME" "true"
        ;;
    disable)
        execute_command "disable" "$SERVICE_NAME" "true"
        ;;
    logs)
        show_logs "$SERVICE_NAME"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}\n"
        show_usage
        exit 1
        ;;
esac
