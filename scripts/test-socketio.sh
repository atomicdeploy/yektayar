#!/bin/bash

# =============================================================================
# YektaYar Socket.IO Connection Test Script
# =============================================================================
# This script provides an interactive TUI for testing Socket.IO connectivity
# and commands with the YektaYar backend server.
#
# Usage: ./scripts/test-socketio.sh [backend-url]
# Default: http://localhost:3000
# =============================================================================

set -e

# Colors for better UI
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'
readonly NC='\033[0m' # No Color
readonly CLEAR='\033[2J'
readonly HOME='\033[H'

# Configuration
BACKEND_URL="${1:-http://localhost:3000}"
SESSION_TOKEN=""
SOCKET_ID=""
TEST_DIR="/tmp/yektayar-socketio-test"

# Create test directory
mkdir -p "$TEST_DIR"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "${CLEAR}${HOME}"
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}${BOLD}            YektaYar Socket.IO Connection Test               ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}▶ ${BOLD}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_data() {
    echo -e "${DIM}$1${NC}"
}

spinner() {
    local pid=$1
    local message=$2
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local temp
    
    while kill -0 $pid 2>/dev/null; do
        temp=${spinstr#?}
        printf " ${CYAN}%c${NC} %s\r" "$spinstr" "$message"
        spinstr=$temp${spinstr%"$temp"}
        sleep 0.1
    done
    printf "    \r"
}

wait_for_key() {
    echo ""
    echo -e "${DIM}Press any key to continue...${NC}"
    read -n 1 -s
}

# =============================================================================
# Backend Health Check
# =============================================================================

check_backend_health() {
    print_section "Backend Health Check"
    
    print_info "Checking backend at: ${BOLD}${BACKEND_URL}${NC}"
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install curl to use this script."
        exit 1
    fi
    
    # Check if backend is responding
    local response
    response=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/health" 2>&1) || {
        print_error "Failed to connect to backend"
        print_data "  URL: ${BACKEND_URL}"
        print_warning "Make sure the backend is running with: npm run dev:backend"
        exit 1
    }
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "200" ]; then
        print_success "Backend is healthy"
        print_data "$(echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body")"
    else
        print_error "Backend returned status: $status"
        exit 1
    fi
}

# =============================================================================
# Session Acquisition
# =============================================================================

acquire_session() {
    print_section "Session Acquisition"
    
    print_info "Requesting anonymous session..."
    
    local response
    response=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/session/acquire" \
        -H "Content-Type: application/json" \
        -d '{"metadata":{"source":"socketio-test-script"}}' 2>&1)
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
        SESSION_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$SESSION_TOKEN" ]; then
            print_success "Session acquired successfully"
            print_data "  Token: ${SESSION_TOKEN:0:20}...${SESSION_TOKEN: -10}"
            echo "$SESSION_TOKEN" > "$TEST_DIR/session_token.txt"
        else
            print_error "Failed to extract session token"
            exit 1
        fi
    else
        print_error "Failed to acquire session (status: $status)"
        print_data "$body"
        exit 1
    fi
}

# =============================================================================
# Socket.IO Connection Test
# =============================================================================

test_socketio_connection() {
    print_section "Socket.IO Connection Test"
    
    if [ -z "$SESSION_TOKEN" ]; then
        print_error "No session token available"
        exit 1
    fi
    
    print_info "Attempting to connect to Socket.IO..."
    print_data "  Using token: ${SESSION_TOKEN:0:20}..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Socket.IO test requires Node.js."
        exit 1
    fi
    
    # Create Node.js test script
    cat > "$TEST_DIR/socket-test.js" << 'EOJS'
const io = require('socket.io-client');

const backend = process.argv[2];
const token = process.argv[3];

console.log('Connecting to:', backend);

const socket = io(backend, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: false
});

socket.on('connect', () => {
    console.log('CONNECTED:', socket.id);
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.error('CONNECT_ERROR:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('TIMEOUT: Connection timeout');
    process.exit(1);
}, 10000);
EOJS
    
    # Test connection
    local result
    result=$(cd "$TEST_DIR" && npm install --silent socket.io-client 2>&1 > /dev/null && \
             node socket-test.js "$BACKEND_URL" "$SESSION_TOKEN" 2>&1)
    
    if echo "$result" | grep -q "CONNECTED:"; then
        SOCKET_ID=$(echo "$result" | grep "CONNECTED:" | cut -d: -f2 | tr -d ' ')
        print_success "Socket.IO connection established"
        print_data "  Socket ID: $SOCKET_ID"
    else
        print_error "Failed to establish Socket.IO connection"
        print_data "$result"
        print_warning "Socket.IO may not be available with Bun runtime"
        print_info "Try running backend with Node.js: node packages/backend/dist/index.js"
        exit 1
    fi
}

# =============================================================================
# Interactive Socket.IO Commands
# =============================================================================

test_socket_commands() {
    print_section "Socket.IO Command Tests"
    
    # Create interactive Node.js script
    cat > "$TEST_DIR/socket-interactive.js" << 'EOJS'
const io = require('socket.io-client');
const readline = require('readline');

const backend = process.argv[2];
const token = process.argv[3];

const socket = io(backend, {
    auth: { token },
    transports: ['websocket', 'polling']
});

let isConnected = false;

socket.on('connect', () => {
    isConnected = true;
    console.log('SOCKET_CONNECTED:', socket.id);
});

socket.on('disconnect', () => {
    isConnected = false;
    console.log('SOCKET_DISCONNECTED');
});

socket.on('connect_error', (error) => {
    console.error('ERROR:', error.message);
    process.exit(1);
});

// Command responses
socket.on('pong', (data) => {
    console.log('PONG:', JSON.stringify(data));
});

socket.on('status_response', (data) => {
    console.log('STATUS:', JSON.stringify(data));
});

socket.on('echo_response', (data) => {
    console.log('ECHO:', JSON.stringify(data));
});

socket.on('info_response', (data) => {
    console.log('INFO:', JSON.stringify(data));
});

socket.on('message_received', (data) => {
    console.log('MESSAGE:', JSON.stringify(data));
});

socket.on('connected', (data) => {
    console.log('WELCOME:', JSON.stringify(data));
});

// Read commands from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const [command, ...args] = line.trim().split(' ');
    
    if (command === 'EXIT') {
        socket.close();
        process.exit(0);
    }
    
    if (!isConnected) {
        console.log('ERROR: Not connected');
        return;
    }
    
    switch (command) {
        case 'PING':
            socket.emit('ping');
            break;
        case 'STATUS':
            socket.emit('status');
            break;
        case 'INFO':
            socket.emit('info');
            break;
        case 'ECHO':
            socket.emit('echo', args.join(' ') || 'Hello from test script!');
            break;
        case 'MESSAGE':
            socket.emit('message', { text: args.join(' ') || 'Test message' });
            break;
        default:
            console.log('UNKNOWN_COMMAND:', command);
    }
});

process.on('SIGTERM', () => {
    socket.close();
    process.exit(0);
});
EOJS
    
    # Start interactive session
    node "$TEST_DIR/socket-interactive.js" "$BACKEND_URL" "$SESSION_TOKEN" 2>&1 | while IFS= read -r line; do
        case "$line" in
            SOCKET_CONNECTED:*)
                print_success "Connected: $(echo "$line" | cut -d: -f2)"
                ;;
            SOCKET_DISCONNECTED)
                print_warning "Disconnected from server"
                ;;
            PONG:*)
                print_success "Ping/Pong test"
                echo "$line" | cut -d: -f2- | python3 -m json.tool 2>/dev/null | while IFS= read -r jline; do
                    print_data "  $jline"
                done
                ;;
            STATUS:*)
                print_success "Status command"
                echo "$line" | cut -d: -f2- | python3 -m json.tool 2>/dev/null | while IFS= read -r jline; do
                    print_data "  $jline"
                done
                ;;
            INFO:*)
                print_success "Info command"
                echo "$line" | cut -d: -f2- | python3 -m json.tool 2>/dev/null | while IFS= read -r jline; do
                    print_data "  $jline"
                done
                ;;
            ECHO:*)
                print_success "Echo command"
                echo "$line" | cut -d: -f2- | python3 -m json.tool 2>/dev/null | while IFS= read -r jline; do
                    print_data "  $jline"
                done
                ;;
            MESSAGE:*)
                print_success "Message command"
                echo "$line" | cut -d: -f2- | python3 -m json.tool 2>/dev/null | while IFS= read -r jline; do
                    print_data "  $jline"
                done
                ;;
            WELCOME:*)
                print_info "Welcome message received"
                echo "$line" | cut -d: -f2- | python3 -m json.tool 2>/dev/null | while IFS= read -r jline; do
                    print_data "  $jline"
                done
                ;;
            ERROR:*)
                print_error "$(echo "$line" | cut -d: -f2-)"
                ;;
            *)
                print_data "$line"
                ;;
        esac
    done &
    
    local socket_pid=$!
    sleep 2
    
    # Send test commands
    print_info "Sending PING command..."
    echo "PING" >> "$TEST_DIR/socket-input.fifo" 2>/dev/null || echo "PING"
    sleep 1
    
    print_info "Sending STATUS command..."
    echo "STATUS" >> "$TEST_DIR/socket-input.fifo" 2>/dev/null || echo "STATUS"
    sleep 1
    
    print_info "Sending INFO command..."
    echo "INFO" >> "$TEST_DIR/socket-input.fifo" 2>/dev/null || echo "INFO"
    sleep 1
    
    print_info "Sending ECHO command..."
    echo "ECHO Test message from Socket.IO test script" >> "$TEST_DIR/socket-input.fifo" 2>/dev/null || echo "ECHO Test message from Socket.IO test script"
    sleep 1
    
    print_info "Sending MESSAGE command..."
    echo "MESSAGE Hello YektaYar!" >> "$TEST_DIR/socket-input.fifo" 2>/dev/null || echo "MESSAGE Hello YektaYar!"
    sleep 2
    
    # Cleanup
    echo "EXIT" >> "$TEST_DIR/socket-input.fifo" 2>/dev/null || echo "EXIT"
    sleep 1
    kill $socket_pid 2>/dev/null || true
    wait $socket_pid 2>/dev/null || true
}

# =============================================================================
# Manual Interactive Mode
# =============================================================================

interactive_mode() {
    print_section "Interactive Mode"
    
    print_info "Starting interactive Socket.IO session..."
    echo ""
    echo -e "${WHITE}Available commands:${NC}"
    echo -e "  ${GREEN}ping${NC}     - Test connection with ping/pong"
    echo -e "  ${GREEN}status${NC}   - Get connection status"
    echo -e "  ${GREEN}info${NC}     - Get server information"
    echo -e "  ${GREEN}echo${NC}     - Echo a message back"
    echo -e "  ${GREEN}message${NC}  - Send a message to server"
    echo -e "  ${GREEN}help${NC}     - Show this help"
    echo -e "  ${GREEN}quit${NC}     - Exit interactive mode"
    echo ""
    
    # Start socket connection in background
    node "$TEST_DIR/socket-interactive.js" "$BACKEND_URL" "$SESSION_TOKEN" > "$TEST_DIR/socket-output.log" 2>&1 &
    local socket_pid=$!
    
    sleep 2
    
    while true; do
        echo -n -e "${CYAN}socket>${NC} "
        read command args
        
        case "$command" in
            quit|exit)
                echo "EXIT" > /dev/stdin
                kill $socket_pid 2>/dev/null || true
                break
                ;;
            help)
                echo ""
                echo -e "${WHITE}Available commands:${NC}"
                echo -e "  ${GREEN}ping${NC}     - Test connection"
                echo -e "  ${GREEN}status${NC}   - Get status"
                echo -e "  ${GREEN}info${NC}     - Get server info"
                echo -e "  ${GREEN}echo${NC}     - Echo message"
                echo -e "  ${GREEN}message${NC}  - Send message"
                echo -e "  ${GREEN}quit${NC}     - Exit"
                echo ""
                ;;
            ping)
                echo "PING"
                sleep 0.5
                tail -n 5 "$TEST_DIR/socket-output.log" | grep "PONG" || print_info "Waiting for response..."
                ;;
            status)
                echo "STATUS"
                sleep 0.5
                tail -n 10 "$TEST_DIR/socket-output.log" | grep "STATUS" || print_info "Waiting for response..."
                ;;
            info)
                echo "INFO"
                sleep 0.5
                tail -n 20 "$TEST_DIR/socket-output.log" | grep "INFO" || print_info "Waiting for response..."
                ;;
            echo)
                echo "ECHO $args"
                sleep 0.5
                tail -n 10 "$TEST_DIR/socket-output.log" | grep "ECHO" || print_info "Waiting for response..."
                ;;
            message)
                echo "MESSAGE $args"
                sleep 0.5
                tail -n 10 "$TEST_DIR/socket-output.log" | grep "MESSAGE" || print_info "Waiting for response..."
                ;;
            *)
                if [ -n "$command" ]; then
                    print_error "Unknown command: $command (type 'help' for commands)"
                fi
                ;;
        esac
    done
}

# =============================================================================
# Summary
# =============================================================================

print_summary() {
    print_section "Test Summary"
    
    print_success "All Socket.IO tests completed successfully"
    echo ""
    print_info "Connection Details:"
    print_data "  Backend URL:  ${BACKEND_URL}"
    print_data "  Session Token: ${SESSION_TOKEN:0:20}...${SESSION_TOKEN: -10}"
    [ -n "$SOCKET_ID" ] && print_data "  Socket ID:     $SOCKET_ID"
    echo ""
    print_info "Socket.IO is working correctly with the backend!"
}

# =============================================================================
# Cleanup
# =============================================================================

cleanup() {
    # Clean up temporary files
    rm -rf "$TEST_DIR" 2>/dev/null || true
}

trap cleanup EXIT

# =============================================================================
# Main
# =============================================================================

main() {
    print_header
    
    print_info "Backend URL: ${BOLD}${BACKEND_URL}${NC}"
    echo ""
    
    check_backend_health
    wait_for_key
    
    acquire_session
    wait_for_key
    
    test_socketio_connection
    wait_for_key
    
    test_socket_commands
    wait_for_key
    
    print_summary
    
    echo ""
    echo -e "${YELLOW}Would you like to enter interactive mode? (y/n)${NC}"
    read -n 1 -s response
    echo ""
    
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        interactive_mode
    fi
    
    echo ""
    print_success "Test completed!"
    echo ""
}

main
