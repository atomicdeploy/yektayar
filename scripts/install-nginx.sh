#!/bin/bash

# YektaYar Nginx Configuration Installer
# This script installs Nginx configurations for all YektaYar services

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
CONFIG_DIR="$PROJECT_ROOT/config/webserver/nginx"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YektaYar Nginx Configuration Installer${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx is not installed. Installing Nginx...${NC}"
    apt update
    apt install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}\n"
else
    echo -e "${GREEN}✓ Nginx is already installed${NC}\n"
fi

# Create static files directory
echo -e "${BLUE}Creating static files directory...${NC}"
mkdir -p /var/www/yektayar/static
chown -R www-data:www-data /var/www/yektayar/static
echo -e "${GREEN}✓ Created /var/www/yektayar/static${NC}\n"

# Copy configuration files
echo -e "${BLUE}Installing Nginx configuration files...${NC}"
SITES=(api.yektayar.ir panel.yektayar.ir app.yektayar.ir static.yektayar.ir)
for site in "${SITES[@]}"; do
    if [ -f "$CONFIG_DIR/$site.conf" ]; then
        cp "$CONFIG_DIR/$site.conf" "/etc/nginx/sites-available/$site"
        echo -e "${GREEN}  ✓ Copied $site${NC}"
    else
        echo -e "${RED}  ✗ Configuration file not found: $site.conf${NC}"
    fi
done
echo ""

# Enable sites (create symlinks)
echo -e "${BLUE}Enabling Nginx sites...${NC}"
for site in "${SITES[@]}"; do
    if [ ! -L "/etc/nginx/sites-enabled/$site" ]; then
        ln -s "/etc/nginx/sites-available/$site" "/etc/nginx/sites-enabled/$site"
        echo -e "${GREEN}  ✓ Enabled site: $site${NC}"
    else
        echo -e "${YELLOW}  → Site $site already enabled${NC}"
    fi
done
echo ""

# Disable default site (optional)
echo -e "${BLUE}Disabling default Nginx site (optional)...${NC}"
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm "/etc/nginx/sites-enabled/default"
    echo -e "${GREEN}✓ Default site disabled${NC}\n"
else
    echo -e "${YELLOW}→ Default site already disabled or not found${NC}\n"
fi

# Test Nginx configuration
echo -e "${BLUE}Testing Nginx configuration...${NC}"
if nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}\n"
else
    echo -e "${RED}✗ Nginx configuration has errors. Please check manually.${NC}"
    nginx -t
    exit 1
fi

# Restart Nginx
echo -e "${BLUE}Restarting Nginx...${NC}"
systemctl restart nginx
echo -e "${GREEN}✓ Nginx restarted successfully${NC}\n"

# Show status
echo -e "${BLUE}Nginx Status:${NC}"
systemctl status nginx --no-pager | head -5
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

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Configure DNS records for your domains to point to this server"
echo -e "  2. Install SSL certificates using Let's Encrypt:"
echo -e "     ${YELLOW}sudo apt install certbot python3-certbot-nginx${NC}"
echo -e "     ${YELLOW}sudo certbot --nginx -d api.yektayar.ir${NC}"
echo -e "     ${YELLOW}sudo certbot --nginx -d panel.yektayar.ir${NC}"
echo -e "     ${YELLOW}sudo certbot --nginx -d app.yektayar.ir${NC}"
echo -e "     ${YELLOW}sudo certbot --nginx -d static.yektayar.ir${NC}"
echo -e "  3. Start your services (backend, admin panel, mobile app)"
echo -e "  4. Place static files (e.g., .apk) in /var/www/yektayar/static"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • Test config: ${YELLOW}sudo nginx -t${NC}"
echo -e "  • Restart: ${YELLOW}sudo systemctl restart nginx${NC}"
echo -e "  • View logs: ${YELLOW}sudo tail -f /var/log/nginx/*.log${NC}"
echo -e "  • SSL renewal: ${YELLOW}sudo certbot renew --dry-run${NC}"
echo ""
