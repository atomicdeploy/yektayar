#!/bin/bash

# YektaYar Adminer Setup Script
# This script installs and configures Adminer for PostgreSQL management
# Adminer is a lightweight alternative to pgAdmin, similar to phpMyAdmin

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
ADMINER_DIR="${ADMINER_DIR:-/var/www/adminer}"
ADMINER_PORT="${ADMINER_PORT:-8080}"
WEB_SERVER="${WEB_SERVER:-apache2}"  # apache2 or nginx or standalone

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║             YektaYar Adminer Setup Script                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

# Function to print info messages
print_info() {
    echo -e "${YELLOW}➜${NC} $1"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error messages and exit
print_error() {
    echo -e "${RED}✗ Error: $1${NC}"
    exit 1
}

# Check if running on Ubuntu/Debian
if [ ! -f /etc/debian_version ]; then
    print_error "This script is designed for Ubuntu/Debian systems only."
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please run setup-postgresql.sh first."
fi

print_section "Checking System"

# Detect web server if not specified
if [ "$WEB_SERVER" != "standalone" ]; then
    if command -v apache2 &> /dev/null; then
        WEB_SERVER="apache2"
        print_info "Detected Apache web server"
    elif command -v nginx &> /dev/null; then
        WEB_SERVER="nginx"
        print_info "Detected Nginx web server"
    else
        print_info "No web server detected, using standalone mode"
        WEB_SERVER="standalone"
    fi
fi

# Install required packages
print_section "Installing Dependencies"

print_info "Installing PHP and required extensions..."
sudo apt update
sudo apt install -y php php-cli php-pgsql php-json php-mbstring wget

print_success "Dependencies installed"

# Create Adminer directory
print_section "Installing Adminer"

print_info "Creating Adminer directory: $ADMINER_DIR"
sudo mkdir -p "$ADMINER_DIR"

# Download latest Adminer
print_info "Downloading Adminer..."
ADMINER_VERSION=$(curl -s https://api.github.com/repos/vrana/adminer/releases/latest | grep tag_name | cut -d '"' -f 4 | sed 's/v//')
if [ -z "$ADMINER_VERSION" ]; then
    ADMINER_VERSION="4.8.1"
    print_info "Using default version: $ADMINER_VERSION"
else
    print_info "Latest version: $ADMINER_VERSION"
fi

sudo wget -q "https://github.com/vrana/adminer/releases/download/v${ADMINER_VERSION}/adminer-${ADMINER_VERSION}.php" -O "$ADMINER_DIR/index.php"

if [ ! -f "$ADMINER_DIR/index.php" ]; then
    print_error "Failed to download Adminer"
fi

print_success "Adminer downloaded"

# Download Adminer theme (optional)
print_info "Downloading Adminer theme..."
sudo wget -q "https://raw.githubusercontent.com/vrana/adminer/master/designs/pepa-linha/adminer.css" -O "$ADMINER_DIR/adminer.css" || true

# Create a custom PHP configuration for Adminer
print_info "Creating Adminer configuration..."
sudo tee "$ADMINER_DIR/config.php" > /dev/null <<'EOF'
<?php
// Adminer configuration for YektaYar

// Set default database system to PostgreSQL
function adminer_object() {
    class AdminerYektaYar extends Adminer {
        function name() {
            return 'YektaYar Database Manager';
        }
        
        function credentials() {
            // Pre-fill server and port for convenience
            return array('localhost', '', '', '');
        }
        
        function database() {
            return 'yektayar';
        }
        
        function login($login, $password) {
            // Allow login without validation (security: limit access via firewall/auth)
            return true;
        }
    }
    
    return new AdminerYektaYar;
}

include './index.php';
EOF

print_success "Adminer configured"

# Set permissions
sudo chown -R www-data:www-data "$ADMINER_DIR"
sudo chmod -R 755 "$ADMINER_DIR"

# Configure web server
print_section "Configuring Web Server"

if [ "$WEB_SERVER" = "apache2" ]; then
    print_info "Configuring Apache..."
    
    # Create Apache configuration
    APACHE_CONF="/etc/apache2/sites-available/adminer.conf"
    sudo tee "$APACHE_CONF" > /dev/null <<EOF
<VirtualHost *:$ADMINER_PORT>
    ServerAdmin webmaster@localhost
    DocumentRoot $ADMINER_DIR
    
    <Directory $ADMINER_DIR>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/adminer-error.log
    CustomLog \${APACHE_LOG_DIR}/adminer-access.log combined
</VirtualHost>
EOF
    
    # Add port to Apache configuration
    if ! grep -q "Listen $ADMINER_PORT" /etc/apache2/ports.conf; then
        echo "Listen $ADMINER_PORT" | sudo tee -a /etc/apache2/ports.conf > /dev/null
    fi
    
    # Enable site and restart Apache
    sudo a2ensite adminer.conf
    sudo systemctl restart apache2
    
    print_success "Apache configured for Adminer"
    
elif [ "$WEB_SERVER" = "nginx" ]; then
    print_info "Configuring Nginx..."
    
    # Create Nginx configuration
    NGINX_CONF="/etc/nginx/sites-available/adminer"
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen $ADMINER_PORT;
    server_name _;
    
    root $ADMINER_DIR;
    index index.php;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
EOF
    
    # Install PHP-FPM if not present
    if ! command -v php-fpm &> /dev/null; then
        print_info "Installing PHP-FPM..."
        sudo apt install -y php-fpm
    fi
    
    # Enable site and restart Nginx
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    sudo systemctl restart nginx
    
    print_success "Nginx configured for Adminer"
    
else
    # Standalone mode using PHP built-in server
    print_info "Setting up standalone mode..."
    
    # Create systemd service for standalone Adminer
    SERVICE_FILE="/etc/systemd/system/adminer.service"
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Adminer Database Management Tool
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$ADMINER_DIR
ExecStart=/usr/bin/php -S 0.0.0.0:$ADMINER_PORT -t $ADMINER_DIR
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable adminer
    sudo systemctl start adminer
    
    print_success "Adminer service created and started"
fi

# Get server information
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Try to get database credentials
DB_USER="yektayar_user"
DB_NAME="yektayar"
DB_PASSWORD=""

if [ -f "$PROJECT_ROOT/postgresql-credentials.txt" ]; then
    DB_PASSWORD=$(grep "Database Password:" "$PROJECT_ROOT/postgresql-credentials.txt" | cut -d: -f2 | xargs)
fi

# Save Adminer access information
CREDENTIALS_FILE="$PROJECT_ROOT/adminer-credentials.txt"
cat > "$CREDENTIALS_FILE" <<EOF
╔════════════════════════════════════════════════════════════╗
║            Adminer Access Information                      ║
╚════════════════════════════════════════════════════════════╝

Adminer Web Interface:
  URL: http://localhost:$ADMINER_PORT

Login Details (PostgreSQL):
  System: PostgreSQL
  Server: localhost
  Username: $DB_USER
  Password: $DB_PASSWORD
  Database: $DB_NAME

Quick Access:
  http://localhost:$ADMINER_PORT/?pgsql=localhost&username=$DB_USER&db=$DB_NAME

Features:
  ✓ Lightweight single-file database manager
  ✓ Support for PostgreSQL, MySQL, SQLite, and more
  ✓ Similar interface to phpMyAdmin
  ✓ Export/Import data
  ✓ Execute SQL queries
  ✓ Manage tables and schemas

Installation Location: $ADMINER_DIR
Web Server: $WEB_SERVER

Important: Keep these credentials secure!
This file should be added to .gitignore and not committed.

Generated: $(date)
EOF

chmod 600 "$CREDENTIALS_FILE"
print_success "Access information saved to: $CREDENTIALS_FILE"

# Update .gitignore
GITIGNORE="$PROJECT_ROOT/.gitignore"
if [ -f "$GITIGNORE" ]; then
    if ! grep -q "postgresql-credentials.txt" "$GITIGNORE"; then
        echo "" >> "$GITIGNORE"
        echo "# Database credentials" >> "$GITIGNORE"
        echo "postgresql-credentials.txt" >> "$GITIGNORE"
        echo "pgadmin-credentials.txt" >> "$GITIGNORE"
        echo "adminer-credentials.txt" >> "$GITIGNORE"
        print_success "Updated .gitignore with credentials files"
    fi
fi

# Print final summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Setup Complete!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Adminer has been successfully installed!${NC}\n"

echo "Access Information:"
echo "  URL: http://localhost:$ADMINER_PORT"
echo "  Location: $ADMINER_DIR"
echo ""
echo "Database Connection:"
echo "  System: PostgreSQL"
echo "  Server: localhost"
echo "  Username: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

if [ "$WEB_SERVER" = "standalone" ]; then
    echo "Service Management:"
    echo "  • Start: sudo systemctl start adminer"
    echo "  • Stop: sudo systemctl stop adminer"
    echo "  • Status: sudo systemctl status adminer"
    echo "  • Logs: sudo journalctl -u adminer -f"
    echo ""
fi

echo "Credentials saved to: $CREDENTIALS_FILE"
echo ""
echo "Quick Start:"
echo "  1. Open http://localhost:$ADMINER_PORT in your browser"
echo "  2. Select 'PostgreSQL' as the system"
echo "  3. Enter server: localhost"
echo "  4. Enter username and password from credentials file"
echo "  5. Select database: $DB_NAME"
echo "  6. Click 'Login'"
echo ""
echo "Adminer Features:"
echo "  • Simple, single-file interface"
echo "  • Support for multiple database systems"
echo "  • Export and import data"
echo "  • Execute SQL queries"
echo "  • Manage tables, views, and schemas"
echo ""
echo "Documentation:"
echo "  https://www.adminer.org/en/"
echo ""
