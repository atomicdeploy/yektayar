#!/bin/bash

# YektaYar PostgreSQL Setup Script
# This script installs and configures PostgreSQL for YektaYar platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables (can be overridden with environment variables)
DB_NAME="${DB_NAME:-yektayar}"
DB_USER="${DB_USER:-yektayar_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
PG_VERSION="${PG_VERSION:-15}"
ALLOW_REMOTE_ACCESS="${ALLOW_REMOTE_ACCESS:-false}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         YektaYar PostgreSQL Setup Script                  ║${NC}"
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

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Check if running on Ubuntu/Debian
if [ ! -f /etc/debian_version ]; then
    print_error "This script is designed for Ubuntu/Debian systems only."
fi

# Detect PostgreSQL installation method
print_section "Checking System"

if command -v psql &> /dev/null; then
    INSTALLED_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
    print_info "PostgreSQL $INSTALLED_VERSION is already installed"
    
    if [ "$INSTALLED_VERSION" -ge 15 ]; then
        print_success "PostgreSQL version is compatible (15+)"
        SKIP_INSTALL=true
    else
        print_info "PostgreSQL version is older than 15. Consider upgrading."
        read -p "Continue with existing version? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Aborted by user"
        fi
        SKIP_INSTALL=true
    fi
else
    SKIP_INSTALL=false
fi

# Install PostgreSQL if not present
if [ "$SKIP_INSTALL" = false ]; then
    print_section "Installing PostgreSQL $PG_VERSION"
    
    print_info "Updating package lists..."
    sudo apt update
    
    print_info "Installing PostgreSQL..."
    sudo apt install -y "postgresql-$PG_VERSION" "postgresql-contrib-$PG_VERSION"
    
    print_info "Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    print_success "PostgreSQL installed successfully"
else
    print_success "Using existing PostgreSQL installation"
fi

# Generate password if not provided
if [ -z "$DB_PASSWORD" ]; then
    print_section "Generating Database Password"
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    print_info "Generated secure password for database user"
fi

# Create database and user
print_section "Configuring Database"

print_info "Creating database and user..."

# Create SQL commands
SQL_COMMANDS=$(cat <<EOF
-- Check if database exists
SELECT 'CREATE DATABASE $DB_NAME' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Check if user exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF
)

# Execute SQL commands as postgres user
echo "$SQL_COMMANDS" | sudo -u postgres psql

print_success "Database '$DB_NAME' and user '$DB_USER' configured"

# Configure PostgreSQL for local and remote access
print_section "Configuring PostgreSQL Access"

PG_VERSION_INSTALLED=$(psql --version | awk '{print $3}' | cut -d. -f1)
PG_CONF_DIR="/etc/postgresql/$PG_VERSION_INSTALLED/main"

if [ "$ALLOW_REMOTE_ACCESS" = "true" ]; then
    print_info "Configuring for remote access..."
    
    # Backup configuration files
    sudo cp "$PG_CONF_DIR/postgresql.conf" "$PG_CONF_DIR/postgresql.conf.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$PG_CONF_DIR/pg_hba.conf" "$PG_CONF_DIR/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update postgresql.conf to listen on all interfaces
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF_DIR/postgresql.conf"
    
    # Add remote access to pg_hba.conf
    if ! sudo grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_CONF_DIR/pg_hba.conf"; then
        echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_CONF_DIR/pg_hba.conf" > /dev/null
    fi
    
    print_success "Remote access enabled"
    print_info "Note: Make sure your firewall allows PostgreSQL connections (port 5432)"
else
    print_success "Configured for local access only"
fi

# Restart PostgreSQL to apply changes
print_info "Restarting PostgreSQL service..."
sudo systemctl restart postgresql

print_success "PostgreSQL service restarted"

# Test database connection
print_section "Testing Database Connection"

if PGPASSWORD=$DB_PASSWORD psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection test successful"
else
    print_error "Database connection test failed"
fi

# Save configuration to .env file
print_section "Saving Configuration"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
BACKEND_ENV="$PROJECT_ROOT/packages/backend/.env"

# Create .env from example if it doesn't exist
if [ ! -f "$BACKEND_ENV" ]; then
    if [ -f "$BACKEND_ENV.example" ]; then
        cp "$BACKEND_ENV.example" "$BACKEND_ENV"
        print_info "Created .env file from .env.example"
    else
        print_error ".env.example not found in packages/backend/"
    fi
fi

# Update database configuration in .env
if [ -f "$BACKEND_ENV" ]; then
    print_info "Updating .env file with database credentials..."
    
    # Update DATABASE_URL
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME|" "$BACKEND_ENV"
    
    # Update individual DB variables
    sed -i "s|^DB_HOST=.*|DB_HOST=localhost|" "$BACKEND_ENV"
    sed -i "s|^DB_PORT=.*|DB_PORT=5432|" "$BACKEND_ENV"
    sed -i "s|^DB_NAME=.*|DB_NAME=$DB_NAME|" "$BACKEND_ENV"
    sed -i "s|^DB_USER=.*|DB_USER=$DB_USER|" "$BACKEND_ENV"
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" "$BACKEND_ENV"
    
    print_success "Updated .env file with database credentials"
fi

# Save credentials to a secure file
CREDENTIALS_FILE="$PROJECT_ROOT/postgresql-credentials.txt"
cat > "$CREDENTIALS_FILE" <<EOF
╔════════════════════════════════════════════════════════════╗
║           YektaYar PostgreSQL Credentials                  ║
╚════════════════════════════════════════════════════════════╝

Database Name: $DB_NAME
Database User: $DB_USER
Database Password: $DB_PASSWORD

Connection String:
postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

Connection Details:
  Host: localhost
  Port: 5432
  Database: $DB_NAME
  Username: $DB_USER
  Password: $DB_PASSWORD

psql Connection:
  psql -h localhost -U $DB_USER -d $DB_NAME

Important: Keep these credentials secure!
This file should be added to .gitignore and not committed.

Generated: $(date)
EOF

chmod 600 "$CREDENTIALS_FILE"
print_success "Credentials saved to: $CREDENTIALS_FILE"

# Ask user if they want to update the unified .env file
print_section "Update Unified .env Configuration"

UNIFIED_ENV="$PROJECT_ROOT/.env"

if [ -f "$UNIFIED_ENV" ]; then
    print_info "Found unified .env file at: $UNIFIED_ENV"
    echo ""
    read -p "Do you want to update the unified .env with these database credentials? (Y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Updating unified .env file..."
        
        # Ask if they want to force update or be prompted for each value
        read -p "Force update without confirmation for each value? (y/N): " -n 1 -r
        echo ""
        
        FORCE_FLAG=""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            FORCE_FLAG="--force"
        fi
        
        # Use the manage-env.sh script to set each database value
        MANAGE_ENV_SCRIPT="$SCRIPT_DIR/manage-env.sh"
        
        if [ -f "$MANAGE_ENV_SCRIPT" ]; then
            print_info "Setting DB_HOST..."
            "$MANAGE_ENV_SCRIPT" set --key=DB_HOST --val=localhost $FORCE_FLAG
            
            print_info "Setting DB_PORT..."
            "$MANAGE_ENV_SCRIPT" set --key=DB_PORT --val=5432 $FORCE_FLAG
            
            print_info "Setting DB_NAME..."
            "$MANAGE_ENV_SCRIPT" set --key=DB_NAME --val="$DB_NAME" $FORCE_FLAG
            
            print_info "Setting DB_USER..."
            "$MANAGE_ENV_SCRIPT" set --key=DB_USER --val="$DB_USER" $FORCE_FLAG
            
            print_info "Setting DB_PASSWORD..."
            "$MANAGE_ENV_SCRIPT" set --key=DB_PASSWORD --val="$DB_PASSWORD" $FORCE_FLAG
            
            print_info "Setting DATABASE_URL..."
            "$MANAGE_ENV_SCRIPT" set --key=DATABASE_URL --val="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME" $FORCE_FLAG
            
            print_success "Unified .env file updated successfully!"
        else
            print_warning "manage-env.sh script not found at: $MANAGE_ENV_SCRIPT"
            print_info "You can manually update the unified .env file later using:"
            echo "  $MANAGE_ENV_SCRIPT set --key=DB_HOST --val=localhost"
            echo "  $MANAGE_ENV_SCRIPT set --key=DB_PORT --val=5432"
            echo "  $MANAGE_ENV_SCRIPT set --key=DB_NAME --val=$DB_NAME"
            echo "  $MANAGE_ENV_SCRIPT set --key=DB_USER --val=$DB_USER"
            echo "  $MANAGE_ENV_SCRIPT set --key=DB_PASSWORD --val=$DB_PASSWORD"
        fi
    else
        print_info "Skipping unified .env update"
        print_info "You can update it later using: $SCRIPT_DIR/manage-env.sh set --key=KEY --val=VALUE"
    fi
else
    print_warning "Unified .env file not found at: $UNIFIED_ENV"
    print_info "Create it first using: $SCRIPT_DIR/manage-env.sh init"
    print_info "Then you can set database credentials using:"
    echo "  $SCRIPT_DIR/manage-env.sh set --key=DB_HOST --val=localhost"
    echo "  $SCRIPT_DIR/manage-env.sh set --key=DB_PORT --val=5432"
    echo "  $SCRIPT_DIR/manage-env.sh set --key=DB_NAME --val=$DB_NAME"
    echo "  $SCRIPT_DIR/manage-env.sh set --key=DB_USER --val=$DB_USER"
    echo "  $SCRIPT_DIR/manage-env.sh set --key=DB_PASSWORD --val=$DB_PASSWORD"
fi

# Print final summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Setup Complete!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}PostgreSQL has been successfully configured for YektaYar!${NC}\n"

echo "Database Information:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: localhost"
echo "  Port: 5432"
echo ""
echo "Connection string has been saved to:"
echo "  $BACKEND_ENV"
echo "  $CREDENTIALS_FILE"
echo ""
echo "Next Steps:"
echo "  1. Review the credentials file: cat $CREDENTIALS_FILE"
echo "  2. Test backend connection: cd packages/backend && bun src/index.ts"
echo "  3. Install web UI management tools:"
echo "     - pgAdmin: ./scripts/setup-pgadmin.sh"
echo "     - Adminer: ./scripts/setup-adminer.sh"
echo ""
echo "Useful Commands:"
echo "  • Connect to database: psql -h localhost -U $DB_USER -d $DB_NAME"
echo "  • Check PostgreSQL status: sudo systemctl status postgresql"
echo "  • View PostgreSQL logs: sudo journalctl -u postgresql -f"
echo ""

if [ "$ALLOW_REMOTE_ACCESS" = "true" ]; then
    echo -e "${YELLOW}Warning: Remote access is enabled. Ensure proper firewall rules are in place!${NC}"
    echo ""
fi
