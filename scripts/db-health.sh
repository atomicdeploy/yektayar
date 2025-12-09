#!/bin/bash

# ==============================================================================
# YektaYar Database Health Check & Troubleshooting Script
# ==============================================================================
# This script performs comprehensive database health checks and troubleshooting
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
ENV_FILE="${PROJECT_ROOT}/.env"
BACKEND_ENV="${PROJECT_ROOT}/packages/backend/.env"

# Helper functions
print_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${MAGENTA}=== $1 ===${NC}"
    echo ""
}

# Parse command line arguments
ACTION="${1:-check}"

case "$ACTION" in
    setup)
        print_header "Database Setup"
        print_info "Running PostgreSQL setup script..."
        echo ""
        bash "$SCRIPT_DIR/setup-postgresql.sh"
        exit 0
        ;;
    init)
        print_header "Database Initialization"
        print_info "This will initialize database tables and default data..."
        echo ""
        
        # Check if backend server is installed
        if [ ! -d "$PROJECT_ROOT/packages/backend/node_modules" ]; then
            print_error "Backend dependencies not installed"
            print_info "Please run: npm install"
            exit 1
        fi
        
        # Start the backend briefly to initialize database
        print_info "Starting backend to initialize database..."
        cd "$PROJECT_ROOT/packages/backend"
        
        # Use timeout to run backend for 10 seconds
        timeout 10s npm run dev 2>&1 | grep -E "(Database|✅|❌|ℹ️|⚠️)" || true
        
        print_success "Database initialization complete"
        exit 0
        ;;
    check|health)
        # Continue to health check below
        ;;
    debug)
        # Continue to debug mode below
        ACTION="debug"
        ;;
    *)
        echo "Usage: $0 {setup|init|check|health|debug}"
        echo ""
        echo "Commands:"
        echo "  setup  - Install and configure PostgreSQL"
        echo "  init   - Initialize database tables and default data"
        echo "  check  - Check database health via API endpoint"
        echo "  health - Alias for check"
        echo "  debug  - Run comprehensive diagnostic checks"
        echo ""
        exit 1
        ;;
esac

print_header "YektaYar Database Health Check"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ] && [ ! -f "$BACKEND_ENV" ]; then
    print_error "No .env file found"
    print_info "Please run: npm run db:setup"
    exit 1
fi

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    print_info "Loading environment from: $ENV_FILE"
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
elif [ -f "$BACKEND_ENV" ]; then
    print_info "Loading environment from: $BACKEND_ENV"
    set -a
    source "$BACKEND_ENV" 2>/dev/null || true
    set +a
fi

# Debug mode - show all diagnostic information
if [ "$ACTION" = "debug" ]; then
    print_section "1. Environment Configuration"
    
    echo "Environment variables:"
    if [ -n "$DATABASE_URL" ]; then
        # Mask password in output
        MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/(:[^:@]+@)/:*****@/')
        echo "  DATABASE_URL: $MASKED_URL"
    else
        print_warning "DATABASE_URL not set"
    fi
    
    echo "  DB_HOST: ${DB_HOST:-not set}"
    echo "  DB_PORT: ${DB_PORT:-not set}"
    echo "  DB_NAME: ${DB_NAME:-not set}"
    echo "  DB_USER: ${DB_USER:-not set}"
    echo "  DB_PASSWORD: ${DB_PASSWORD:+*****} (${DB_PASSWORD:+set}${DB_PASSWORD:-not set})"
    
    print_section "2. PostgreSQL Service Status"
    
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet postgresql; then
            print_success "PostgreSQL service is running"
            systemctl status postgresql --no-pager | head -15
        else
            print_error "PostgreSQL service is not running"
            print_info "Start with: sudo systemctl start postgresql"
        fi
    else
        print_warning "systemctl not available (not on systemd)"
    fi
    
    print_section "3. PostgreSQL Client Test"
    
    if command -v psql &> /dev/null; then
        print_success "psql client found: $(psql --version | head -1)"
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ] && [ -n "$DB_NAME" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
            print_info "Testing direct database connection..."
            
            export PGPASSWORD="$DB_PASSWORD"
            if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>&1 | head -3; then
                print_success "Direct database connection successful"
                
                print_info "Checking tables..."
                psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>&1 | head -20
            else
                print_error "Direct database connection failed"
                print_info "Check credentials and PostgreSQL service status"
            fi
            unset PGPASSWORD
        else
            print_warning "Database credentials incomplete - skipping connection test"
        fi
    else
        print_warning "psql client not found"
        print_info "Install with: sudo apt-get install postgresql-client"
    fi
    
    print_section "4. Network Connectivity"
    
    if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
        print_info "Testing network connectivity to ${DB_HOST}:${DB_PORT}..."
        
        if command -v nc &> /dev/null; then
            if nc -z -w 2 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
                print_success "Port ${DB_PORT} is open on ${DB_HOST}"
            else
                print_error "Cannot connect to ${DB_HOST}:${DB_PORT}"
                print_info "Possible causes:"
                echo "  - PostgreSQL is not running"
                echo "  - Firewall blocking port ${DB_PORT}"
                echo "  - Wrong host/port in configuration"
            fi
        else
            print_warning "netcat (nc) not found - skipping port check"
        fi
    fi
fi

# Health check via API endpoint
print_section "Health Check via API Endpoint"

# Check if backend is running
BACKEND_PORT="${PORT:-3000}"
BACKEND_HOST="${HOST:-localhost}"
BACKEND_URL="http://${BACKEND_HOST}:${BACKEND_PORT}"

print_info "Checking if backend is running at ${BACKEND_URL}..."

if curl -s -f "${BACKEND_URL}/health" > /dev/null 2>&1; then
    print_success "Backend is running"
    
    print_info "Calling /health/db endpoint (timeout: 30s)..."
    echo ""
    
    # Call the health endpoint with timeout and show response
    RESPONSE=$(timeout 30 curl -s "${BACKEND_URL}/health/db" 2>&1)
    CURL_EXIT=$?
    
    if [ $CURL_EXIT -eq 124 ]; then
        print_error "Health check endpoint timed out after 30 seconds"
        echo ""
        print_info "This usually means:"
        echo "  - Database connection is hanging (check DATABASE_URL)"
        echo "  - Backend code has an infinite loop or deadlock"
        echo "  - Database is not responding"
        echo ""
        print_info "Troubleshooting steps:"
        echo "  1. Check if database is accessible:"
        echo "     psql -h \${DB_HOST:-localhost} -U \${DB_USER} -d \${DB_NAME} -c 'SELECT 1;'"
        echo ""
        echo "  2. Check backend logs for errors"
        echo ""
        echo "  3. Restart backend:"
        echo "     cd packages/backend && npm run dev"
        echo ""
        echo "  4. Run full diagnostics:"
        echo "     npm run db:debug"
        exit 3
    elif [ $CURL_EXIT -eq 0 ]; then
        echo "$RESPONSE" | head -100
        echo ""
        
        # Parse the response to determine overall health
        if echo "$RESPONSE" | grep -q '"overall"[[:space:]]*:[[:space:]]*"healthy"'; then
            print_success "Database health check: HEALTHY"
            exit 0
        elif echo "$RESPONSE" | grep -q '"overall"[[:space:]]*:[[:space:]]*"degraded"'; then
            print_warning "Database health check: DEGRADED"
            print_info "Some database operations may not be working correctly"
            exit 1
        elif echo "$RESPONSE" | grep -q '"overall"[[:space:]]*:[[:space:]]*"unhealthy"'; then
            print_error "Database health check: UNHEALTHY"
            print_info "Database is not accessible or critically failing"
            exit 2
        else
            print_warning "Database health status unknown"
            exit 3
        fi
    else
        print_error "Failed to call health endpoint"
        exit 1
    fi
else
    print_error "Backend is not running at ${BACKEND_URL}"
    print_info "Start the backend with: npm run dev:backend"
    print_info "Or check server logs for errors"
    
    if [ "$ACTION" = "debug" ]; then
        print_section "Backend Startup Test"
        print_info "Attempting to start backend for diagnostics..."
        
        cd "$PROJECT_ROOT/packages/backend"
        print_info "Running: npm run dev (will stop after 10 seconds)"
        echo ""
        
        timeout 10s npm run dev 2>&1 | grep -E "(Error|error|failed|Failed|Database|✅|❌|ℹ️|⚠️|running at)" || true
        echo ""
        print_info "Backend startup test complete"
    fi
    
    exit 1
fi
