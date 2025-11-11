#!/bin/bash

# YektaYar Apache Configuration Installer
# This script installs Apache configurations for all YektaYar services

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
CONFIG_DIR="$PROJECT_ROOT/config/webserver/apache"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YektaYar Apache Configuration Installer${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if Apache is installed
if ! command -v apache2 &> /dev/null; then
    echo -e "${YELLOW}Apache is not installed. Installing Apache...${NC}"
    apt update
    apt install -y apache2
    echo -e "${GREEN}✓ Apache installed${NC}\n"
else
    echo -e "${GREEN}✓ Apache is already installed${NC}\n"
fi

# Enable required Apache modules
echo -e "${BLUE}Enabling required Apache modules...${NC}"
MODULES=(proxy proxy_http proxy_wstunnel ssl rewrite headers)
for module in "${MODULES[@]}"; do
    if a2enmod "$module" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Enabled module: $module${NC}"
    else
        echo -e "${YELLOW}  → Module $module already enabled${NC}"
    fi
done
echo ""

# Create static files directory
echo -e "${BLUE}Creating static files directory...${NC}"
mkdir -p /var/www/yektayar/static
chown -R www-data:www-data /var/www/yektayar/static
echo -e "${GREEN}✓ Created /var/www/yektayar/static${NC}\n"

# Copy configuration files
echo -e "${BLUE}Installing Apache configuration files...${NC}"
SITES=(api.yektayar.ir panel.yektayar.ir app.yektayar.ir static.yektayar.ir)
for site in "${SITES[@]}"; do
    if [ -f "$CONFIG_DIR/$site.conf" ]; then
        cp "$CONFIG_DIR/$site.conf" "/etc/apache2/sites-available/$site.conf"
        echo -e "${GREEN}  ✓ Copied $site.conf${NC}"
    else
        echo -e "${RED}  ✗ Configuration file not found: $site.conf${NC}"
    fi
done
echo ""

# Enable sites
echo -e "${BLUE}Enabling Apache sites...${NC}"
for site in "${SITES[@]}"; do
    if a2ensite "$site.conf" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Enabled site: $site${NC}"
    else
        echo -e "${YELLOW}  → Site $site already enabled${NC}"
    fi
done
echo ""

# Disable default site (optional)
echo -e "${BLUE}Disabling default Apache site (optional)...${NC}"
if a2dissite 000-default.conf > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Default site disabled${NC}\n"
else
    echo -e "${YELLOW}→ Default site already disabled or not found${NC}\n"
fi

# Test Apache configuration
echo -e "${BLUE}Testing Apache configuration...${NC}"
if apache2ctl configtest > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Apache configuration is valid${NC}\n"
else
    echo -e "${RED}✗ Apache configuration has errors. Please check manually.${NC}"
    apache2ctl configtest
    exit 1
fi

# Restart Apache
echo -e "${BLUE}Restarting Apache...${NC}"
systemctl restart apache2
echo -e "${GREEN}✓ Apache restarted successfully${NC}\n"

# Show status
echo -e "${BLUE}Apache Status:${NC}"
systemctl status apache2 --no-pager | head -5
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
echo -e "     ${YELLOW}sudo apt install certbot python3-certbot-apache${NC}"
echo -e "     ${YELLOW}sudo certbot --apache -d api.yektayar.ir${NC}"
echo -e "     ${YELLOW}sudo certbot --apache -d panel.yektayar.ir${NC}"
echo -e "     ${YELLOW}sudo certbot --apache -d app.yektayar.ir${NC}"
echo -e "     ${YELLOW}sudo certbot --apache -d static.yektayar.ir${NC}"
echo -e "  3. Start your services (backend, admin panel, mobile app)"
echo -e "  4. Place static files (e.g., .apk) in /var/www/yektayar/static"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • Test config: ${YELLOW}sudo apache2ctl configtest${NC}"
echo -e "  • Restart: ${YELLOW}sudo systemctl restart apache2${NC}"
echo -e "  • View logs: ${YELLOW}sudo tail -f /var/log/apache2/*.log${NC}"
echo -e "  • SSL renewal: ${YELLOW}sudo certbot renew --dry-run${NC}"
echo ""
