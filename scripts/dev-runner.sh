#!/bin/bash

# YektaYar Development Mode Runner - Enhanced Version
# Modern CLI interface for managing YektaYar development services
# Supports service-specific actions with clear action-service separation

set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# CONFIGURATION AND CONSTANTS
# ============================================================================

# Colors and formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Emojis for better UX
readonly EMOJI_SUCCESS="✓"
readonly EMOJI_ERROR="✗"
readonly EMOJI_WARNING="⚠"
readonly EMOJI_INFO="ℹ"
readonly EMOJI_ROCKET="🚀"
readonly EMOJI_STOP="🛑"
readonly EMOJI_RESTART="🔄"
readonly EMOJI_LOGS="📋"
readonly EMOJI_STATUS="📊"

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
readonly BACKEND_PORT=${PORT:-3000}
readonly ADMIN_PORT=${VITE_ADMIN_PORT:-5173}
readonly MOBILE_PORT=${VITE_MOBILE_PORT:-8100}

# Service definitions
declare -A SERVICE_NAMES=(
    ["backend"]="Backend API"
    ["admin"]="Admin Panel"
    ["mobile"]="Mobile App"
)

declare -A SERVICE_PORTS=(
    ["backend"]="$BACKEND_PORT"
    ["admin"]="$ADMIN_PORT"
    ["mobile"]="$MOBILE_PORT"
)

declare -A SERVICE_PATHS=(
    ["backend"]="$PROJECT_ROOT/packages/backend"
    ["admin"]="$PROJECT_ROOT/packages/admin-panel"
    ["mobile"]="$PROJECT_ROOT/packages/mobile-app"
)

declare -A SERVICE_COMMANDS=(
    ["backend"]="bun run --watch src/index.ts"
    ["admin"]="npm run dev"
    ["mobile"]="npm run dev"
)

# Valid services and actions
readonly VALID_SERVICES="backend admin mobile all"
readonly VALID_ACTIONS="start stop restart status logs interact help"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Print formatted message
print_msg() {
    local color=$1
    local emoji=$2
    shift 2
    echo -e "${color}${emoji} $*${NC}"
}

print_success() { print_msg "$GREEN" "$EMOJI_SUCCESS" "$@"; }
print_error() { print_msg "$RED" "$EMOJI_ERROR" "$@"; }
print_warning() { print_msg "$YELLOW" "$EMOJI_WARNING" "$@"; }
print_info() { print_msg "$CYAN" "$EMOJI_INFO" "$@"; }

# Print section header
print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${BLUE}  $*${NC}"
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running in multiplexer (screen/tmux)
is_multiplexer_session() {
    [ -n "${STY:-}" ] || [ -n "${TMUX:-}" ] || ps -o comm= -p $PPID 2>/dev/null | grep -q "script"
}

# Validate service name
validate_service() {
    local service=$1
    if [[ "$service" == "all" ]]; then
        return 0
    fi
    if [[ ! " $VALID_SERVICES " =~ " $service " ]]; then
        return 1
    fi
    return 0
}

# Get list of services (expand "all" to actual services)
get_services() {
    local service=$1
    if [[ "$service" == "all" ]]; then
        echo "backend admin mobile"
    else
        echo "$service"
    fi
}

# Get service display name
get_service_name() {
    local service=$1
    echo "${SERVICE_NAMES[$service]}"
}

# Get PID file path
get_pid_file() {
    local service=$1
    echo "/tmp/yektayar-${service}.pid"
}

# Get log file path
get_log_file() {
    local service=$1
    echo "/tmp/yektayar-${service}.log"
}

# Check if port is in use
is_port_in_use() {
    local port=$1
    if command_exists ss; then
        ss -tlnp 2>/dev/null | grep -q ":${port} "
    elif command_exists netstat; then
        netstat -tlnp 2>/dev/null | grep -q ":${port} "
    elif command_exists lsof; then
        lsof -i ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1
    else
        timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/${port}" 2>/dev/null
    fi
}

# Wait for port to be listening
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

# Wait for port to be free
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

# Kill process tree
kill_process_tree() {
    local pid=$1
    local signal=${2:-TERM}
    
    if ! kill -0 "$pid" 2>/dev/null; then
        return 0
    fi
    
    # Try to get process group ID
    local pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')
    
    if [ -n "$pgid" ] && [ "$pgid" != "0" ]; then
        # Kill entire process group
        kill -"$signal" -- -"$pgid" 2>/dev/null || true
        kill -"$signal" "$pid" 2>/dev/null || true
    else
        # Recursive kill
        local children=$(pgrep -P "$pid" 2>/dev/null)
        for child in $children; do
            kill_process_tree "$child" "$signal"
        done
        if kill -0 "$pid" 2>/dev/null; then
            kill -"$signal" "$pid" 2>/dev/null || true
        fi
    fi
}

# Check if service is running
is_service_running() {
    local service=$1
    local pid_file=$(get_pid_file "$service")
    
    if [ ! -f "$pid_file" ]; then
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    kill -0 "$pid" 2>/dev/null
}

# ============================================================================
# SERVICE MANAGEMENT FUNCTIONS
# ============================================================================

# Start a service
start_service() {
    local service=$1
    local mode=${2:-foreground}
    local use_pm2=${3:-false}
    local force=${4:-false}
    
    local service_name=$(get_service_name "$service")
    local service_path="${SERVICE_PATHS[$service]}"
    local service_cmd="${SERVICE_COMMANDS[$service]}"
    local service_port="${SERVICE_PORTS[$service]}"
    local pid_file=$(get_pid_file "$service")
    local log_file=$(get_log_file "$service")
    
    # Check if already running
    if [ "$force" = "false" ] && is_service_running "$service"; then
        print_warning "$service_name is already running"
        print_info "Use 'restart $service' to restart it, or 'stop $service' first"
        return 0
    fi
    
    print_info "${EMOJI_ROCKET} Starting $service_name..."
    
    # Change to service directory
    cd "$service_path"
    
    if [ "$use_pm2" = "true" ]; then
        # PM2 mode
        if ! command_exists pm2; then
            print_error "PM2 is not installed. Install it with: npm install -g pm2"
            return 1
        fi
        pm2 start --name "yektayar-${service}" "$service_cmd"
        print_success "$service_name started with PM2"
        print_info "View logs: pm2 logs yektayar-${service}"
    elif [ "$mode" = "detached" ]; then
        # Detached mode
        if is_port_in_use "$service_port"; then
            print_warning "Port $service_port is already in use"
        fi
        
        # Start with setsid for new process group
        setsid $service_cmd > "$log_file" 2>&1 &
        local pid=$!
        echo $pid > "$pid_file"
        
        print_success "$service_name started in background (PID: $pid)"
        print_info "Logs: $log_file"
        
        # Wait for port
        echo -n "  Waiting for $service_name to start on port $service_port..."
        if wait_for_port "$service_port" 30; then
            echo -e " ${GREEN}${EMOJI_SUCCESS}${NC}"
            print_success "$service_name is now listening on port $service_port"
        else
            echo -e " ${YELLOW}${EMOJI_WARNING}${NC}"
            print_warning "$service_name may not have started properly"
            print_info "Check logs: tail -f $log_file"
        fi
    else
        # Foreground mode
        print_info "Running $service_name in foreground (Ctrl+C to stop)..."
        exec $service_cmd
    fi
}

# Stop a service
stop_service() {
    local service=$1
    local force=${2:-false}
    
    local service_name=$(get_service_name "$service")
    local service_port="${SERVICE_PORTS[$service]}"
    local pid_file=$(get_pid_file "$service")
    local log_file=$(get_log_file "$service")
    
    if [ ! -f "$pid_file" ]; then
        print_warning "$service_name is not running (no PID file)"
        if is_port_in_use "$service_port"; then
            print_warning "But port $service_port is in use!"
            print_info "Attempting cleanup..."
            cleanup_port "$service_port"
        fi
        return 0
    fi
    
    local pid=$(cat "$pid_file")
    
    if ! kill -0 "$pid" 2>/dev/null; then
        print_warning "$service_name process (PID $pid) is not running"
        rm -f "$pid_file"
        if is_port_in_use "$service_port"; then
            print_warning "But port $service_port is in use!"
            print_info "Attempting cleanup..."
            cleanup_port "$service_port"
        fi
        return 0
    fi
    
    if [ "$force" = "true" ]; then
        print_info "Force stopping $service_name (PID: $pid)..."
        kill_process_tree "$pid" "KILL"
        sleep 1
        
        if ! kill -0 "$pid" 2>/dev/null; then
            print_success "$service_name force stopped"
            rm -f "$pid_file"
            wait_for_port_free "$service_port" 5
            return 0
        else
            print_error "Failed to force stop $service_name"
            return 1
        fi
    else
        print_info "Stopping $service_name gracefully (PID: $pid)..."
        kill_process_tree "$pid" "TERM"
        
        # Wait for graceful shutdown
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 20 ]; do
            sleep 0.5
            count=$((count + 1))
        done
        
        if ! kill -0 "$pid" 2>/dev/null; then
            print_success "$service_name stopped gracefully"
            rm -f "$pid_file"
            wait_for_port_free "$service_port" 5
            return 0
        else
            print_warning "$service_name did not stop gracefully, forcing..."
            kill_process_tree "$pid" "KILL"
            sleep 1
            
            if ! kill -0 "$pid" 2>/dev/null; then
                print_success "$service_name force stopped"
                rm -f "$pid_file"
                wait_for_port_free "$service_port" 5
                return 0
            fi
            
            print_error "Failed to stop $service_name"
            return 1
        fi
    fi
}

# Restart a service
restart_service() {
    local service=$1
    local mode=${2:-detached}
    local use_pm2=${3:-false}
    
    local service_name=$(get_service_name "$service")
    
    print_info "${EMOJI_RESTART} Restarting $service_name..."
    
    if is_service_running "$service"; then
        stop_service "$service" false
        sleep 2
    else
        print_warning "$service_name is not running, starting it..."
    fi
    
    start_service "$service" "$mode" "$use_pm2" true
}

# Show service status
show_service_status() {
    local service=$1
    
    local service_name=$(get_service_name "$service")
    local service_port="${SERVICE_PORTS[$service]}"
    local pid_file=$(get_pid_file "$service")
    
    echo -e "${CYAN}${service_name} (Port ${service_port}):${NC}"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  PID: $pid - ${GREEN}${EMOJI_SUCCESS} Running${NC}"
            if is_port_in_use "$service_port"; then
                echo -e "  Port $service_port: ${GREEN}${EMOJI_SUCCESS} Listening${NC}"
            else
                echo -e "  Port $service_port: ${YELLOW}${EMOJI_WARNING} Not listening${NC}"
            fi
        else
            echo -e "  ${YELLOW}${EMOJI_WARNING} Not running (stale PID file)${NC}"
            if is_port_in_use "$service_port"; then
                echo -e "  Port $service_port: ${YELLOW}${EMOJI_WARNING} In use by another process${NC}"
            fi
        fi
    else
        echo -e "  ${YELLOW}${EMOJI_WARNING} Not running${NC}"
        if is_port_in_use "$service_port"; then
            echo -e "  Port $service_port: ${YELLOW}${EMOJI_WARNING} In use by another process${NC}"
        fi
    fi
    echo ""
}

# Show logs for a service
show_service_logs() {
    local service=$1
    local use_pager=${2:-false}
    local lines=${3:-50}
    
    local service_name=$(get_service_name "$service")
    local log_file=$(get_log_file "$service")
    
    if [ ! -f "$log_file" ]; then
        print_error "$service_name log file not found"
        print_info "Make sure $service_name is running in detached mode"
        return 1
    fi
    
    echo -e "${BLUE}${EMOJI_LOGS} $service_name Logs${NC}"
    echo -e "${YELLOW}Log file: $log_file${NC}"
    echo ""
    
    if [ "$use_pager" = "true" ] && command_exists less; then
        print_info "Using less pager (press 'q' to quit, 'F' to follow)"
        less +F "$log_file"
    else
        print_info "Following logs (press Ctrl+C to exit)"
        tail -n "$lines" -f "$log_file"
    fi
}

# Cleanup orphaned processes on a port
cleanup_port() {
    local port=$1
    
    local pids=""
    if command_exists lsof; then
        pids=$(lsof -ti ":$port" 2>/dev/null || true)
    elif command_exists ss; then
        pids=$(ss -tlnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K\d+' | sort -u || true)
    fi
    
    if [ -n "$pids" ]; then
        print_info "Found processes on port $port: $pids"
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                print_info "Killing process $pid..."
                kill_process_tree "$pid" "TERM"
                sleep 1
                if kill -0 "$pid" 2>/dev/null; then
                    kill_process_tree "$pid" "KILL"
                fi
            fi
        done
    fi
}

# Interactive mode for a service
interact_with_service() {
    local service=$1
    
    local service_name=$(get_service_name "$service")
    local pid_file=$(get_pid_file "$service")
    local log_file=$(get_log_file "$service")
    
    if [ ! -f "$pid_file" ]; then
        print_error "$service_name is not running in detached mode"
        print_info "Start it with: $0 start $service --detached"
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    
    if ! kill -0 "$pid" 2>/dev/null; then
        print_error "$service_name process is not running"
        return 1
    fi
    
    print_header "Interactive mode for $service_name (PID: $pid)"
    print_warning "Services in background cannot receive direct terminal input"
    print_info "Use these actions for process management:"
    echo ""
    echo -e "${CYAN}Available actions:${NC}"
    echo -e "  ${GREEN}r${NC} - Restart service"
    echo -e "  ${GREEN}s${NC} - Show service status"
    echo -e "  ${GREEN}l${NC} - Show last 20 log lines"
    echo -e "  ${GREEN}f${NC} - Follow logs (tail -f)"
    echo -e "  ${GREEN}q${NC} - Quit interactive mode"
    echo ""
    
    while true; do
        read -rp "Enter action: " action
        case "$action" in
            r|R)
                restart_service "$service" "detached" "false"
                break
                ;;
            s|S)
                show_service_status "$service"
                ;;
            l|L)
                if [ -f "$log_file" ]; then
                    tail -20 "$log_file"
                else
                    print_error "Log file not found"
                fi
                ;;
            f|F)
                if [ -f "$log_file" ]; then
                    print_info "Following logs (Ctrl+C to return to menu)..."
                    tail -f "$log_file" || true
                else
                    print_error "Log file not found"
                fi
                ;;
            q|Q)
                print_info "Exiting interactive mode"
                break
                ;;
            *)
                print_warning "Unknown action. Please try again."
                ;;
        esac
        echo ""
    done
}

# ============================================================================
# ACTION HANDLERS
# ============================================================================

# Handle start action
action_start() {
    local service=$1
    shift
    
    local mode="foreground"
    local use_pm2=false
    
    # Auto-detect detached mode in multiplexer
    if is_multiplexer_session; then
        mode="detached"
        print_info "Detected screen/tmux session - auto-enabling detached mode"
    fi
    
    # Parse options
    while [ $# -gt 0 ]; do
        case "$1" in
            --detached|-d)
                mode="detached"
                ;;
            --pm2)
                use_pm2=true
                mode="detached"
                ;;
            *)
                print_error "Unknown option: $1"
                return 1
                ;;
        esac
        shift
    done
    
    if [[ "$service" == "all" ]] && [[ "$mode" != "detached" ]] && [[ "$use_pm2" != "true" ]]; then
        print_error "Cannot run all services in foreground mode"
        print_info "Use --detached flag or run in screen/tmux"
        return 1
    fi
    
    local services=$(get_services "$service")
    
    if [[ "$service" == "all" ]]; then
        print_header "${EMOJI_ROCKET} Starting All Services"
    fi
    
    for svc in $services; do
        start_service "$svc" "$mode" "$use_pm2" false
        if [[ "$service" == "all" ]]; then
            sleep 1
        fi
    done
    
    if [[ "$service" == "all" ]]; then
        echo ""
        print_success "All services started!"
        echo ""
        print_info "View logs: $0 logs all"
        print_info "Check status: $0 status"
        print_info "Stop all: $0 stop all"
    fi
}

# Handle stop action
action_stop() {
    local service=$1
    shift
    
    local force=false
    
    # Parse options
    while [ $# -gt 0 ]; do
        case "$1" in
            --force|-f)
                force=true
                ;;
            *)
                print_error "Unknown option: $1"
                return 1
                ;;
        esac
        shift
    done
    
    local services=$(get_services "$service")
    
    if [[ "$service" == "all" ]]; then
        print_header "${EMOJI_STOP} Stopping All Services"
        if [ "$force" = "true" ]; then
            print_warning "Force mode: immediate kill"
        fi
    fi
    
    for svc in $services; do
        stop_service "$svc" "$force"
    done
    
    if [[ "$service" == "all" ]]; then
        echo ""
        print_success "All services stopped"
    fi
}

# Handle restart action
action_restart() {
    local service=$1
    shift
    
    local mode="detached"
    local use_pm2=false
    
    # Parse options
    while [ $# -gt 0 ]; do
        case "$1" in
            --pm2)
                use_pm2=true
                ;;
            *)
                print_error "Unknown option: $1"
                return 1
                ;;
        esac
        shift
    done
    
    local services=$(get_services "$service")
    
    if [[ "$service" == "all" ]]; then
        print_header "${EMOJI_RESTART} Restarting All Services"
    fi
    
    for svc in $services; do
        restart_service "$svc" "$mode" "$use_pm2"
        if [[ "$service" == "all" ]]; then
            sleep 1
        fi
    done
    
    if [[ "$service" == "all" ]]; then
        echo ""
        print_success "All services restarted"
    fi
}

# Handle status action
action_status() {
    local service=$1
    
    local services=$(get_services "$service")
    
    print_header "${EMOJI_STATUS} Service Status"
    
    for svc in $services; do
        show_service_status "$svc"
    done
}

# Handle logs action
action_logs() {
    local service=$1
    shift
    
    local use_pager=false
    local lines=50
    
    # Parse options
    while [ $# -gt 0 ]; do
        case "$1" in
            --pager|-p)
                use_pager=true
                ;;
            --follow|-f)
                use_pager=false
                ;;
            --lines|-n)
                shift
                lines=$1
                ;;
            *)
                print_error "Unknown option: $1"
                return 1
                ;;
        esac
        shift
    done
    
    if [[ "$service" == "all" ]]; then
        print_header "${EMOJI_LOGS} All Service Logs"
        
        local log_files=()
        for svc in backend admin mobile; do
            local log_file=$(get_log_file "$svc")
            if [ -f "$log_file" ]; then
                echo -e "  ${GREEN}${EMOJI_SUCCESS}${NC} $(get_service_name "$svc"): $log_file"
                log_files+=("$log_file")
            else
                echo -e "  ${YELLOW}${EMOJI_WARNING}${NC} $(get_service_name "$svc"): No log file"
            fi
        done
        
        if [ ${#log_files[@]} -eq 0 ]; then
            echo ""
            print_error "No log files found"
            print_info "Make sure services are running in detached mode"
            return 1
        fi
        
        echo ""
        print_info "Following all logs (Ctrl+C to exit)"
        echo ""
        tail -n "$lines" -f "${log_files[@]}"
    else
        show_service_logs "$service" "$use_pager" "$lines"
    fi
}

# Handle interact action
action_interact() {
    local service=$1
    
    if [[ "$service" == "all" ]]; then
        print_error "Cannot interact with 'all' services"
        print_info "Specify a single service: backend, admin, or mobile"
        return 1
    fi
    
    interact_with_service "$service"
}

# ============================================================================
# HELP AND USAGE
# ============================================================================

show_help() {
    cat << 'EOF'

  ██╗   ██╗███████╗██╗  ██╗████████╗ █████╗ ██╗   ██╗ █████╗ ██████╗ 
  ╚██╗ ██╔╝██╔════╝██║ ██╔╝╚══██╔══╝██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗
   ╚████╔╝ █████╗  █████╔╝    ██║   ███████║ ╚████╔╝ ███████║██████╔╝
    ╚██╔╝  ██╔══╝  ██╔═██╗    ██║   ██╔══██║  ╚██╔╝  ██╔══██║██╔══██╗
     ██║   ███████╗██║  ██╗   ██║   ██║  ██║   ██║   ██║  ██║██║  ██║
     ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
                                                                        
EOF
    echo -e "${CYAN}                   Development Mode Runner                    ${NC}"
    echo -e "${CYAN}           Modern CLI for YektaYar service management          ${NC}"
    echo ""
    echo -e "${BOLD}USAGE:${NC}"
    echo -e "    $0 ${GREEN}<action>${NC} ${BLUE}<service>${NC} ${YELLOW}[options]${NC}"
    echo ""
    echo -e "${BOLD}ACTIONS:${NC}"
    echo -e "    ${GREEN}start${NC}        Start a service or all services"
    echo -e "    ${GREEN}stop${NC}         Stop a service or all services"
    echo -e "    ${GREEN}restart${NC}      Restart a service or all services"
    echo -e "    ${GREEN}status${NC}       Show status of services"
    echo -e "    ${GREEN}logs${NC}         Display service logs"
    echo -e "    ${GREEN}interact${NC}     Interactive mode for a service"
    echo -e "    ${GREEN}help${NC}         Show this help message"
    echo ""
    echo -e "${BOLD}SERVICES:${NC}"
    echo -e "    ${BLUE}backend${NC}      Backend API server (port $BACKEND_PORT)"
    echo -e "    ${BLUE}admin${NC}        Admin Panel dev server (port $ADMIN_PORT)"
    echo -e "    ${BLUE}mobile${NC}       Mobile App dev server (port $MOBILE_PORT)"
    echo -e "    ${BLUE}all${NC}          All services"
    echo ""
    echo -e "${BOLD}OPTIONS:${NC}"
    echo -e "    ${YELLOW}--detached, -d${NC}     Run in background (auto-enabled in screen/tmux)"
    echo -e "    ${YELLOW}--pm2${NC}              Use PM2 for process management"
    echo -e "    ${YELLOW}--force, -f${NC}        Force kill processes (with stop)"
    echo -e "    ${YELLOW}--pager, -p${NC}        Use less pager for logs (with logs)"
    echo -e "    ${YELLOW}--follow, -f${NC}       Use tail -f for logs (default, with logs)"
    echo -e "    ${YELLOW}--lines, -n <num>${NC}  Number of lines to show (with logs)"
    echo ""
    echo -e "${BOLD}EXAMPLES:${NC}"
    echo ""
    echo -e "  ${CYAN}# Start services${NC}"
    echo -e "    $0 start backend              # Run backend in foreground"
    echo -e "    $0 start backend --detached   # Run backend in background"
    echo -e "    $0 start all --detached       # Run all services in background"
    echo -e "    $0 start admin --pm2          # Run admin with PM2"
    echo ""
    echo -e "  ${CYAN}# Stop services${NC}"
    echo -e "    $0 stop backend               # Stop backend service"
    echo -e "    $0 stop all                   # Stop all services"
    echo -e "    $0 stop admin --force         # Force kill admin service"
    echo ""
    echo -e "  ${CYAN}# Restart services${NC}"
    echo -e "    $0 restart backend            # Restart backend service"
    echo -e "    $0 restart all                # Restart all services"
    echo ""
    echo -e "  ${CYAN}# Monitor services${NC}"
    echo -e "    $0 status                     # Show status of all services"
    echo -e "    $0 status backend             # Show status of backend"
    echo -e "    $0 logs backend               # Follow backend logs"
    echo -e "    $0 logs all                   # Follow all service logs"
    echo -e "    $0 logs admin --pager         # View admin logs with less"
    echo -e "    $0 logs mobile -n 100         # Show last 100 lines of mobile logs"
    echo ""
    echo -e "  ${CYAN}# Interactive mode${NC}"
    echo -e "    $0 interact backend           # Interactive menu for backend"
    echo ""
    echo -e "${BOLD}NOTES:${NC}"
    echo -e "  • Services auto-run in detached mode in screen/tmux sessions"
    echo -e "  • Log files: /tmp/yektayar-{service}.log"
    echo -e "  • PID files: /tmp/yektayar-{service}.pid"
    echo -e "  • Press Ctrl+C to exit foreground mode or log following"
    echo ""
}

# ============================================================================
# MAIN SCRIPT LOGIC
# ============================================================================

main() {
    # Handle no arguments
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local action=$1
    shift
    
    # Handle help
    if [[ "$action" == "help" ]] || [[ "$action" == "--help" ]] || [[ "$action" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    # Validate action
    if [[ ! " $VALID_ACTIONS " =~ " $action " ]]; then
        print_error "Unknown action: $action"
        echo ""
        print_info "Valid actions: $VALID_ACTIONS"
        print_info "Run '$0 help' for more information"
        exit 1
    fi
    
    # Handle status without service (default to all)
    if [[ "$action" == "status" ]] && [ $# -eq 0 ]; then
        action_status "all"
        exit 0
    fi
    
    # Require service argument
    if [ $# -eq 0 ]; then
        print_error "Service argument required for $action"
        print_info "Usage: $0 $action <service>"
        print_info "Services: $VALID_SERVICES"
        exit 1
    fi
    
    local service=$1
    shift
    
    # Validate service
    if ! validate_service "$service"; then
        print_error "Unknown service: $service"
        print_info "Valid services: $VALID_SERVICES"
        exit 1
    fi
    
    # Dispatch to action handler
    case "$action" in
        start)
            action_start "$service" "$@"
            ;;
        stop)
            action_stop "$service" "$@"
            ;;
        restart)
            action_restart "$service" "$@"
            ;;
        status)
            action_status "$service"
            ;;
        logs)
            action_logs "$service" "$@"
            ;;
        interact)
            action_interact "$service"
            ;;
    esac
}

# Run main function
main "$@"
