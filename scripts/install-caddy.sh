#!/bin/bash

# YektaYar Caddy Configuration Installer
# This script installs Caddy and configurations for all YektaYar services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
CONFIG_DIR="$PROJECT_ROOT/config/webserver/caddy"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YektaYar Caddy Configuration Installer${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if Caddy is installed
if ! command -v caddy &> /dev/null; then
    echo -e "${YELLOW}Caddy is not installed. Installing Caddy...${NC}"
    
    # Install dependencies
    apt update
    apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    
    # Add Caddy repository
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    
    # Install Caddy
    apt update
    apt install -y caddy
    
    echo -e "${GREEN}✓ Caddy installed${NC}\n"
else
    echo -e "${GREEN}✓ Caddy is already installed${NC}\n"
fi

# Create static files directory
echo -e "${BLUE}Creating static files directory...${NC}"
mkdir -p /var/www/yektayar/static
chown -R caddy:caddy /var/www/yektayar/static
echo -e "${GREEN}✓ Created /var/www/yektayar/static${NC}\n"

# Create Caddy config directory if it doesn't exist
mkdir -p /etc/caddy/conf.d

# Copy configuration files
echo -e "${BLUE}Installing Caddy configuration files...${NC}"
SITES=(api.yektayar.ir panel.yektayar.ir app.yektayar.ir static.yektayar.ir)
for site in "${SITES[@]}"; do
    if [ -f "$CONFIG_DIR/$site" ]; then
        cp "$CONFIG_DIR/$site" "/etc/caddy/conf.d/$site"
        echo -e "${GREEN}  ✓ Copied $site${NC}"
    else
        echo -e "${RED}  ✗ Configuration file not found: $site${NC}"
    fi
done

# Copy main Caddyfile
if [ -f "$CONFIG_DIR/Caddyfile" ]; then
    cp "$CONFIG_DIR/Caddyfile" "/etc/caddy/Caddyfile"
    echo -e "${GREEN}  ✓ Copied Caddyfile${NC}"
else
    echo -e "${RED}  ✗ Main Caddyfile not found${NC}"
fi
echo ""

# Update email in Caddyfile
echo -e "${BLUE}Email Configuration:${NC}"
read -r -p "Enter your email for Let's Encrypt notifications (or press Enter to skip): " email
if [ -n "$email" ]; then
    sed -i "s/admin@yektayar.ir/$email/" /etc/caddy/Caddyfile
    echo -e "${GREEN}✓ Email updated to: $email${NC}\n"
else
    echo -e "${YELLOW}→ Using default email: admin@yektayar.ir${NC}\n"
fi

# Create log directory
echo -e "${BLUE}Creating log directory...${NC}"
mkdir -p /var/log/caddy
chown -R caddy:caddy /var/log/caddy
echo -e "${GREEN}✓ Created /var/log/caddy${NC}\n"

# Test Caddy configuration
echo -e "${BLUE}Testing Caddy configuration...${NC}"
if caddy validate --config /etc/caddy/Caddyfile > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Caddy configuration is valid${NC}\n"
else
    echo -e "${RED}✗ Caddy configuration has errors. Please check manually.${NC}"
    caddy validate --config /etc/caddy/Caddyfile
    exit 1
fi

# Enable and start Caddy
echo -e "${BLUE}Starting Caddy...${NC}"
systemctl enable caddy
systemctl restart caddy
echo -e "${GREEN}✓ Caddy started successfully${NC}\n"

# Show status
echo -e "${BLUE}Caddy Status:${NC}"
systemctl status caddy --no-pager | head -5
echo ""

# Show next steps
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Configured domains:${NC}"
echo -e "  • ${YELLOW}api.yektayar.ir${NC} → http://127.0.0.1:3000"
echo -e "  • ${YELLOW}panel.yektayar.ir${NC} → http://127.0.0.1:5173"
echo -e "  • ${YELLOW}app.yektayar.ir${NC} → http://127.0.0.1:8100"
echo -e "  • ${YELLOW}static.yektayar.ir${NC} → /var/www/yektayar/static"
echo ""

echo -e "${GREEN}✨ Caddy Features:${NC}"
echo -e "  • Automatic HTTPS with Let's Encrypt (no manual SSL setup needed!)"
echo -e "  • Automatic certificate renewal"
echo -e "  • HTTP/2 and HTTP/3 support"
echo -e "  • WebSocket support included"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Configure DNS records for your domains to point to this server"
echo -e "  2. Wait for DNS propagation (usually 5-30 minutes)"
echo -e "  3. Caddy will automatically obtain SSL certificates from Let's Encrypt!"
echo -e "  4. Start your services (backend, admin panel, mobile app)"
echo -e "  5. Place static files (e.g., .apk) in /var/www/yektayar/static"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • Validate config: ${YELLOW}sudo caddy validate --config /etc/caddy/Caddyfile${NC}"
echo -e "  • Reload config: ${YELLOW}sudo caddy reload --config /etc/caddy/Caddyfile${NC}"
echo -e "  • Restart: ${YELLOW}sudo systemctl restart caddy${NC}"
echo -e "  • View logs: ${YELLOW}sudo journalctl -u caddy -f${NC}"
echo -e "  • Check certs: ${YELLOW}sudo caddy list-modules --packages | grep tls${NC}"
echo ""

echo -e "${YELLOW}Note: Caddy handles SSL automatically. No need to run certbot!${NC}"
echo ""
