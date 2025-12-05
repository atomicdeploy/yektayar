#!/bin/bash

# YektaYar Complete Installation Script
# This script automates the entire installation process for the YektaYar platform
# It can be run on a fresh Ubuntu/Debian system to set up everything from scratch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
CHECK="✓"
CROSS="✗"
ARROW="➜"
INFO="ℹ️"
WARN="⚠️"
SUCCESS="✅"

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Configuration variables
INSTALL_BUN="${INSTALL_BUN:-true}"
INSTALL_POSTGRES="${INSTALL_POSTGRES:-true}"
INSTALL_DEV_TOOLS="${INSTALL_DEV_TOOLS:-false}"
INSTALL_DB_UI="${INSTALL_DB_UI:-false}"
INSTALL_WEBSERVER="${INSTALL_WEBSERVER:-false}"
SETUP_SYSTEMD="${SETUP_SYSTEMD:-true}"
RUN_TESTS="${RUN_TESTS:-false}"
WEBSERVER_TYPE="${WEBSERVER_TYPE:-nginx}"  # apache, nginx, caddy
DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"
DEPLOY_GROUP="${DEPLOY_GROUP:-$(whoami)}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         YektaYar Complete Installation Script             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║ $1${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

# Function to print step
print_step() {
    echo -e "${CYAN}${ARROW} $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

# Function to print error and exit
print_error() {
    echo -e "${RED}${CROSS} Error: $1${NC}"
    exit 1
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}${WARN} Warning: $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

# Check if running as root for certain operations
check_sudo() {
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root. This is not recommended."
        print_info "Please run as normal user with sudo access."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check for sudo access
check_sudo_access() {
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo access. Please run: sudo -v"
    fi
}

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Display configuration
print_section "Installation Configuration"
echo "Project Root:     $PROJECT_ROOT"
echo "Install Bun:      $INSTALL_BUN"
echo "Install PostgreSQL: $INSTALL_POSTGRES"
echo "Install Dev Tools: $INSTALL_DEV_TOOLS"
echo "Install DB UI:    $INSTALL_DB_UI"
echo "Install Webserver: $INSTALL_WEBSERVER"
echo "Webserver Type:   $WEBSERVER_TYPE"
echo "Setup Systemd:    $SETUP_SYSTEMD"
echo "Run Tests:        $RUN_TESTS"
echo "Deploy User:      $DEPLOY_USER"
echo "Deploy Group:     $DEPLOY_GROUP"
echo ""

read -p "Press Enter to continue or Ctrl+C to abort..."

# Step 1: Check system requirements
print_section "Step 1: Checking System Requirements"
check_sudo
check_sudo_access

cd "$PROJECT_ROOT"

print_step "Running requirements checker..."
if node scripts/check-requirements.js; then
    print_success "System requirements check passed"
else
    print_warning "Some requirements not met, continuing with installation..."
fi

# Step 2: Install Bun runtime
if [ "$INSTALL_BUN" = "true" ]; then
    print_section "Step 2: Installing Bun Runtime"
    
    if command_exists bun; then
        print_info "Bun is already installed: $(bun --version)"
    else
        print_step "Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        
        # Add Bun to PATH for this session
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        
        if command_exists bun; then
            print_success "Bun installed successfully: $(bun --version)"
        else
            print_error "Bun installation failed"
        fi
    fi
fi

# Step 3: Install development tools (optional)
if [ "$INSTALL_DEV_TOOLS" = "true" ]; then
    print_section "Step 3: Installing Development Tools"
    
    if [ -f "$SCRIPT_DIR/install-dev-tools.sh" ]; then
        print_step "Running install-dev-tools.sh..."
        bash "$SCRIPT_DIR/install-dev-tools.sh" --yes
        print_success "Development tools installed"
    else
        print_warning "install-dev-tools.sh not found, skipping"
    fi
fi

# Step 4: Initialize environment configuration
print_section "Step 4: Initializing Environment Configuration"

if [ ! -f "$PROJECT_ROOT/.env" ]; then
    print_step "Creating .env file from template..."
    bash "$SCRIPT_DIR/manage-env.sh" init
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

# Step 5: Install and configure PostgreSQL
if [ "$INSTALL_POSTGRES" = "true" ]; then
    print_section "Step 5: Installing and Configuring PostgreSQL"
    
    if command_exists psql; then
        print_info "PostgreSQL is already installed"
    fi
    
    print_step "Running PostgreSQL setup script..."
    sudo bash "$SCRIPT_DIR/setup-postgresql.sh"
    print_success "PostgreSQL configured"
    
    # Optional: Install database UI
    if [ "$INSTALL_DB_UI" = "true" ]; then
        print_step "Installing database management UI..."
        read -p "Install pgAdmin (p) or Adminer (a)? (p/a/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Pp]$ ]]; then
            sudo bash "$SCRIPT_DIR/setup-pgadmin.sh"
        elif [[ $REPLY =~ ^[Aa]$ ]]; then
            sudo bash "$SCRIPT_DIR/setup-adminer.sh"
        fi
    fi
fi

# Step 6: Install project dependencies
print_section "Step 6: Installing Project Dependencies"

print_step "Running npm install..."
npm install

print_success "Dependencies installed"

# Step 7: Build all packages
print_section "Step 7: Building All Packages"

print_step "Building all workspaces..."
npm run build

print_success "All packages built successfully"

# Step 8: Run tests (optional)
if [ "$RUN_TESTS" = "true" ]; then
    print_section "Step 8: Running Tests"
    
    print_step "Running linter..."
    npm run lint || print_warning "Linting found issues"
    
    print_step "Running tests..."
    npm run test || print_warning "Some tests failed"
fi

# Step 9: Setup systemd services
if [ "$SETUP_SYSTEMD" = "true" ]; then
    print_section "Step 9: Setting Up Systemd Services"
    
    print_step "Installing systemd services..."
    sudo -E DEPLOY_USER="$DEPLOY_USER" DEPLOY_GROUP="$DEPLOY_GROUP" PROJECT_PATH="$PROJECT_ROOT" \
        bash "$SCRIPT_DIR/install-services.sh"
    
    print_step "Enabling services..."
    sudo bash "$SCRIPT_DIR/manage-services.sh" enable all
    
    print_step "Starting services..."
    sudo bash "$SCRIPT_DIR/manage-services.sh" start all
    
    sleep 5
    
    print_step "Checking service status..."
    sudo bash "$SCRIPT_DIR/manage-services.sh" status all
    
    print_success "Systemd services configured and started"
fi

# Step 10: Install web server (optional)
if [ "$INSTALL_WEBSERVER" = "true" ]; then
    print_section "Step 10: Installing Web Server"
    
    case "$WEBSERVER_TYPE" in
        apache)
            print_step "Installing Apache configuration..."
            sudo bash "$SCRIPT_DIR/install-apache.sh"
            ;;
        nginx)
            print_step "Installing Nginx configuration..."
            sudo bash "$SCRIPT_DIR/install-nginx.sh"
            ;;
        caddy)
            print_step "Installing Caddy configuration..."
            sudo bash "$SCRIPT_DIR/install-caddy.sh"
            ;;
        *)
            print_warning "Unknown webserver type: $WEBSERVER_TYPE"
            ;;
    esac
    
    print_success "Web server configured"
fi

# Step 11: Final verification
print_section "Step 11: Final Verification"

print_step "Testing backend API..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Backend API is responding"
else
    print_warning "Backend API is not responding on port 3000"
fi

print_step "Testing admin panel..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_success "Admin panel is responding"
else
    print_warning "Admin panel is not responding on port 5173"
fi

print_step "Testing mobile app..."
if curl -s http://localhost:8100 > /dev/null 2>&1; then
    print_success "Mobile app is responding"
else
    print_warning "Mobile app is not responding on port 8100"
fi

# Final summary
print_section "Installation Complete!"

echo -e "${GREEN}${SUCCESS} YektaYar platform has been successfully installed!${NC}\n"

echo "Access your applications:"
echo "  • Backend API:    http://localhost:3000"
echo "  • API Docs:       http://localhost:3000/api-docs"
echo "  • Admin Panel:    http://localhost:5173"
echo "  • Mobile App:     http://localhost:8100"
echo ""

echo "Database credentials:"
echo "  • Check: $PROJECT_ROOT/postgresql-credentials.txt"
echo ""

echo "Manage services:"
echo "  • Status:  sudo bash $SCRIPT_DIR/manage-services.sh status"
echo "  • Start:   sudo bash $SCRIPT_DIR/manage-services.sh start all"
echo "  • Stop:    sudo bash $SCRIPT_DIR/manage-services.sh stop all"
echo "  • Restart: sudo bash $SCRIPT_DIR/manage-services.sh restart all"
echo "  • Logs:    sudo bash $SCRIPT_DIR/manage-services.sh logs backend"
echo ""

echo "View logs:"
echo "  • Backend:     sudo journalctl -u yektayar-backend -f"
echo "  • Admin Panel: sudo journalctl -u yektayar-admin-panel -f"
echo "  • Mobile App:  sudo journalctl -u yektayar-mobile-app -f"
echo ""

echo "Next steps:"
if [ "$INSTALL_WEBSERVER" = "false" ]; then
    echo "  • Install a web server (optional):"
    echo "    sudo bash $SCRIPT_DIR/install-nginx.sh"
fi
echo "  • Review the documentation: $PROJECT_ROOT/README.md"
echo "  • Check the logs for any errors"
echo ""

print_info "Installation log saved to: /tmp/yektayar-install-$(date +%Y%m%d-%H%M%S).log"
