#!/bin/bash

# YektaYar Service Installation Script
# This script installs systemd service files and sets up logging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}=== YektaYar Service Installation ===${NC}\n"

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Variables
SERVICES_DIR="$SCRIPT_DIR/services"
SYSTEMD_DIR="/etc/systemd/system"
LOG_DIR="/var/log/yektayar"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_GROUP="${DEPLOY_GROUP:-deploy}"
PROJECT_PATH="${PROJECT_PATH:-$PROJECT_ROOT}"

echo "Configuration:"
echo "  Project Root: $PROJECT_ROOT"
echo "  Deploy User: $DEPLOY_USER"
echo "  Deploy Group: $DEPLOY_GROUP"
echo "  Log Directory: $LOG_DIR"
echo ""

# Create log directory
echo -e "${YELLOW}Creating log directory...${NC}"
mkdir -p "$LOG_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_GROUP" "$LOG_DIR"
chmod 755 "$LOG_DIR"
echo -e "${GREEN}✓ Log directory created${NC}\n"

# Function to install a service
install_service() {
    local service_name=$1
    local service_file="$SERVICES_DIR/$service_name.service"
    
    if [ ! -f "$service_file" ]; then
        echo -e "${RED}✗ Service file not found: $service_file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Installing $service_name...${NC}"
    
    # Determine bun path - check as deploy user
    if command -v bun >/dev/null 2>&1; then
        BUN_PATH=$(dirname $(which bun))
    elif [ -d "/home/$DEPLOY_USER/.bun/bin" ]; then
        BUN_PATH="/home/$DEPLOY_USER/.bun/bin"
    else
        BUN_PATH="$HOME/.bun/bin"
    fi
    
    # Update paths in service file
    sed -e "s|__BUN_PATH__|$BUN_PATH|g" \
        -e "s|__PROJECT_PATH__|$PROJECT_PATH|g" \
        -e "s|__USER__|$DEPLOY_USER|g" \
        -e "s|__GROUP__|$DEPLOY_GROUP|g" \
        "$service_file" > "$SYSTEMD_DIR/$service_name.service"
    
    # Set permissions
    chmod 644 "$SYSTEMD_DIR/$service_name.service"
    
    # Reload systemd
    systemctl daemon-reload
    
    echo -e "${GREEN}✓ $service_name installed${NC}"
}

# Install services
echo -e "${YELLOW}Installing service files...${NC}\n"
install_service "yektayar-backend"
install_service "yektayar-admin-panel"
install_service "yektayar-mobile-app"

echo ""
echo -e "${GREEN}=== Installation Complete ===${NC}\n"
echo "Available services:"
echo "  - yektayar-backend"
echo "  - yektayar-admin-panel"
echo "  - yektayar-mobile-app"
echo ""
echo "To enable and start services:"
echo "  sudo systemctl enable yektayar-backend"
echo "  sudo systemctl start yektayar-backend"
echo ""
echo "To enable and start all services:"
echo "  sudo systemctl enable yektayar-backend yektayar-admin-panel yektayar-mobile-app"
echo "  sudo systemctl start yektayar-backend yektayar-admin-panel yektayar-mobile-app"
echo ""
echo "To check service status:"
echo "  sudo systemctl status yektayar-backend"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u yektayar-backend -f"
echo "  or"
echo "  tail -f $LOG_DIR/backend.log"
