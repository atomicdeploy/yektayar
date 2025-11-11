#!/bin/bash

# YektaYar pgAdmin 4 Setup Script
# This script installs and configures pgAdmin 4 for PostgreSQL management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PGADMIN_EMAIL="${PGADMIN_EMAIL:-admin@yektayar.local}"
PGADMIN_PASSWORD="${PGADMIN_PASSWORD:-}"
PGADMIN_PORT="${PGADMIN_PORT:-5050}"
INSTALL_MODE="${INSTALL_MODE:-web}"  # web or desktop

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            YektaYar pgAdmin 4 Setup Script                 ║${NC}"
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

# Check if pgAdmin is already installed
if command -v pgadmin4 &> /dev/null; then
    print_info "pgAdmin 4 is already installed"
    read -p "Do you want to reconfigure it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping installation"
        exit 0
    fi
fi

# Generate password if not provided
if [ -z "$PGADMIN_PASSWORD" ]; then
    print_section "Generating Admin Password"
    PGADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    print_info "Generated secure password for pgAdmin"
fi

# Install pgAdmin 4
print_section "Installing pgAdmin 4"

print_info "Adding pgAdmin 4 repository..."

# Install the public key for the repository
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg

# Create the repository configuration file
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'

print_info "Updating package lists..."
sudo apt update

if [ "$INSTALL_MODE" = "desktop" ]; then
    print_info "Installing pgAdmin 4 Desktop..."
    sudo apt install -y pgadmin4-desktop
    print_success "pgAdmin 4 Desktop installed"
    print_info "Launch from your applications menu or run: pgadmin4"
else
    print_info "Installing pgAdmin 4 Web..."
    sudo apt install -y pgadmin4-web
    
    print_info "Configuring pgAdmin 4 Web..."
    
    # Configure pgAdmin in web mode
    print_info "Setting up pgAdmin web server..."
    
    # Create setup script
    SETUP_SCRIPT="/tmp/pgadmin_setup.exp"
    cat > "$SETUP_SCRIPT" <<EOF
#!/usr/bin/expect -f
set timeout -1
spawn sudo /usr/pgadmin4/bin/setup-web.sh
expect "Email address:"
send "$PGADMIN_EMAIL\r"
expect "Password:"
send "$PGADMIN_PASSWORD\r"
expect "Retype password:"
send "$PGADMIN_PASSWORD\r"
expect "Do you wish to continue (y/n)?"
send "y\r"
expect eof
EOF
    
    # Install expect if not present
    if ! command -v expect &> /dev/null; then
        print_info "Installing expect..."
        sudo apt install -y expect
    fi
    
    chmod +x "$SETUP_SCRIPT"
    
    # Run the setup
    expect "$SETUP_SCRIPT" || true
    
    rm -f "$SETUP_SCRIPT"
    
    print_success "pgAdmin 4 Web installed and configured"
fi

# Create systemd service for pgAdmin (web mode only)
if [ "$INSTALL_MODE" = "web" ]; then
    print_section "Creating pgAdmin Service"
    
    SERVICE_FILE="/etc/systemd/system/pgadmin4.service"
    
    if [ ! -f "$SERVICE_FILE" ]; then
        print_info "Creating systemd service file..."
        
        sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=pgAdmin 4 Web Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
ExecStart=/usr/pgadmin4/bin/pgadmin4
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable pgadmin4
        sudo systemctl start pgadmin4
        
        print_success "pgAdmin service created and started"
    else
        print_info "Service file already exists"
        sudo systemctl restart pgadmin4
        print_success "pgAdmin service restarted"
    fi
fi

# Configure Apache/Nginx reverse proxy (optional)
print_section "Web Server Configuration"

if command -v apache2 &> /dev/null; then
    print_info "Detected Apache web server"
    
    # Apache is configured by pgAdmin setup script
    # Just verify it's running
    if sudo systemctl is-active --quiet apache2; then
        print_success "Apache is running and configured for pgAdmin"
    else
        print_info "Starting Apache..."
        sudo systemctl start apache2
        sudo systemctl enable apache2
    fi
    
elif command -v nginx &> /dev/null; then
    print_info "Detected Nginx web server"
    print_info "Note: You may need to manually configure Nginx for pgAdmin"
    print_info "See: https://www.pgadmin.org/docs/pgadmin4/latest/server_deployment.html"
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

# Save pgAdmin credentials
CREDENTIALS_FILE="$PROJECT_ROOT/pgadmin-credentials.txt"
cat > "$CREDENTIALS_FILE" <<EOF
╔════════════════════════════════════════════════════════════╗
║              pgAdmin 4 Access Information                  ║
╚════════════════════════════════════════════════════════════╝

pgAdmin Web Interface:
  URL: http://localhost/pgadmin4
  Alternative: http://localhost:$PGADMIN_PORT

Login Credentials:
  Email: $PGADMIN_EMAIL
  Password: $PGADMIN_PASSWORD

PostgreSQL Connection Details (to add in pgAdmin):
  Host: localhost
  Port: 5432
  Database: $DB_NAME
  Username: $DB_USER
  Password: $DB_PASSWORD

Steps to Connect:
  1. Open pgAdmin: http://localhost/pgadmin4
  2. Login with the email and password above
  3. Right-click "Servers" → "Register" → "Server"
  4. General tab: Name = "YektaYar Local"
  5. Connection tab: Fill in the PostgreSQL details above
  6. Click "Save"

Important: Keep these credentials secure!
This file should be added to .gitignore and not committed.

Generated: $(date)
EOF

chmod 600 "$CREDENTIALS_FILE"
print_success "Credentials saved to: $CREDENTIALS_FILE"

# Print final summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Setup Complete!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}pgAdmin 4 has been successfully installed!${NC}\n"

if [ "$INSTALL_MODE" = "web" ]; then
    echo "Access Information:"
    echo "  URL: http://localhost/pgadmin4"
    echo "  Email: $PGADMIN_EMAIL"
    echo "  Password: [saved in $CREDENTIALS_FILE]"
    echo ""
    echo "Service Management:"
    echo "  • Start: sudo systemctl start pgadmin4"
    echo "  • Stop: sudo systemctl stop pgadmin4"
    echo "  • Status: sudo systemctl status pgadmin4"
    echo "  • Logs: sudo journalctl -u pgadmin4 -f"
    echo ""
else
    echo "pgAdmin 4 Desktop installed."
    echo "Launch from your applications menu or run: pgadmin4"
    echo ""
fi

echo "Credentials saved to: $CREDENTIALS_FILE"
echo ""
echo "Next Steps:"
echo "  1. Open pgAdmin in your web browser"
echo "  2. Login with the credentials above"
echo "  3. Add PostgreSQL server connection"
echo "  4. Start managing your YektaYar database!"
echo ""
echo "Documentation:"
echo "  https://www.pgadmin.org/docs/"
echo ""
