#!/bin/bash

# ==============================================================================
# YektaYar Database CLI Launcher
# ==============================================================================
# This script launches either pgcli or psql (as fallback) using credentials
# from the unified .env file in the project root.
# ==============================================================================

set -e

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
ENV_FILE="${PROJECT_ROOT}/.env"

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

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found at: $ENV_FILE"
    print_info "Please create the .env file first using: npm run manage:env init"
    exit 1
fi

# Load environment variables from .env
print_info "Loading database credentials from .env..."
set -a
source "$ENV_FILE" 2>/dev/null || {
    print_error "Failed to load .env file"
    exit 1
}
set +a

# Validate required database variables
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    print_error "Database configuration is incomplete in .env file"
    print_info "Required variables: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    print_info "Please run: npm run manage:env edit"
    exit 1
fi

# Display connection info
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         YektaYar Database CLI Launcher                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
print_info "Database: ${DB_NAME}"
print_info "Host: ${DB_HOST}:${DB_PORT}"
print_info "User: ${DB_USER}"
echo ""

# Check if pgcli is available
if command -v pgcli &> /dev/null; then
    print_success "Launching pgcli..."
    echo ""
    exec pgcli -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
elif command -v psql &> /dev/null; then
    print_warning "pgcli not found, using psql as fallback"
    print_info "Install pgcli for a better experience: pip install pgcli"
    echo ""
    export PGPASSWORD="$DB_PASSWORD"
    exec psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
else
    print_error "Neither pgcli nor psql is installed"
    print_info "Please install PostgreSQL client tools:"
    echo ""
    echo "  Ubuntu/Debian:  sudo apt-get install postgresql-client"
    echo "  macOS:          brew install postgresql"
    echo "  For pgcli:      pip install pgcli"
    echo ""
    exit 1
fi
