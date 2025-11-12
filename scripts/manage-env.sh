#!/bin/bash

# ==============================================================================
# YektaYar .env Management Script
# ==============================================================================
# This script manages the unified .env file for the YektaYar platform.
# It can:
# - Show current .env configuration
# - Create .env from template if missing
# - Validate that all required values are set
# - Test connectivity/configuration
# - Provide interactive TUI mode for editing values
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
ENV_EXAMPLE="${PROJECT_ROOT}/.env.example"

# Required environment variables (must be non-default)
REQUIRED_VARS=(
    "PORT"
    "HOST"
    "NODE_ENV"
    "DATABASE_URL"
    "DB_HOST"
    "DB_PORT"
    "DB_NAME"
    "DB_USER"
    "DB_PASSWORD"
    "SESSION_SECRET"
    "JWT_SECRET"
    "JWT_EXPIRY"
    "CORS_ORIGIN"
    "WEBSOCKET_PORT"
    "RATE_LIMIT_WINDOW"
    "RATE_LIMIT_MAX_REQUESTS"
    "API_BASE_URL"
    "VITE_ENVIRONMENT"
)

# Variables that must not contain default/placeholder values
SECURE_VARS=(
    "DB_PASSWORD:your_secure_password_here"
    "SESSION_SECRET:change_this_to_a_secure_random_string"
    "JWT_SECRET:change_this_to_another_secure_random_string"
)

# ==============================================================================
# Helper Functions
# ==============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# ==============================================================================
# Core Functions
# ==============================================================================

check_env_exists() {
    if [ -f "$ENV_FILE" ]; then
        return 0
    else
        return 1
    fi
}

create_env_from_template() {
    print_header "Creating .env from template"
    
    if [ ! -f "$ENV_EXAMPLE" ]; then
        print_error "Template file .env.example not found!"
        exit 1
    fi
    
    if check_env_exists; then
        print_warning ".env file already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled."
            exit 0
        fi
    fi
    
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    print_success ".env file created from template"
    
    # Scan .env.example and check for missing values in .env
    print_info "Scanning for variables that need values..."
    echo ""
    
    # Source the new .env file
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
    
    local needs_input=0
    
    # Extract all variable names from .env.example (excluding comments and empty lines)
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ "$key" =~ ^#.*$ ]] || [ -z "$key" ]; then
            continue
        fi
        
        # Get current value from environment
        current_value="${!key}"
        
        # Check if value is empty or is a placeholder
        if [ -z "$current_value" ] || \
           [[ "$current_value" == "your_"* ]] || \
           [[ "$current_value" == "change_this_"* ]] || \
           [[ "$current_value" == "******"* ]]; then
            
            # Check if this is a required variable
            local is_required=0
            for req_var in "${REQUIRED_VARS[@]}"; do
                if [ "$key" = "$req_var" ]; then
                    is_required=1
                    break
                fi
            done
            
            if [ $is_required -eq 1 ]; then
                needs_input=1
                echo -e "${YELLOW}Variable ${CYAN}${key}${YELLOW} needs a value${NC}"
                
                # Provide help for specific variables
                case "$key" in
                    SESSION_SECRET|JWT_SECRET)
                        echo -e "${CYAN}  Hint: Generate with: ./scripts/manage-env.sh generate-secret${NC}"
                        ;;
                    DB_PASSWORD)
                        echo -e "${CYAN}  Hint: Set a secure password for your database${NC}"
                        ;;
                esac
                
                echo -e -n "${GREEN}  Enter value for ${key}: ${NC}"
                read -r new_value
                
                if [ -n "$new_value" ]; then
                    # Update the .env file
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        sed -i '' "s|^${key}=.*|${key}=${new_value}|" "$ENV_FILE"
                    else
                        sed -i "s|^${key}=.*|${key}=${new_value}|" "$ENV_FILE"
                    fi
                    print_success "Set ${key}"
                else
                    print_warning "Skipped ${key} (you can set it later)"
                fi
                echo ""
            fi
        fi
    done < <(grep -E '^[A-Z_]+=' "$ENV_EXAMPLE")
    
    echo ""
    print_success ".env file is ready!"
    
    if [ $needs_input -eq 1 ]; then
        print_info "Some required variables still need values"
        print_info "Run '$0 validate' to check if all required values are set"
        print_info "Run '$0 edit' for interactive editing"
    else
        print_info "Run '$0 validate' to verify your configuration"
    fi
}

show_env() {
    print_header "Current .env Configuration"
    
    if ! check_env_exists; then
        print_error ".env file does not exist!"
        print_info "Run '$0 init' to create it from template"
        exit 1
    fi
    
    echo -e "${CYAN}Environment Variables:${NC}\n"
    
    # Load and display env vars with sensitive data masked
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ "$key" =~ ^#.*$ ]] || [ -z "$key" ]; then
            continue
        fi
        
        # Mask sensitive values
        if [[ "$key" =~ (PASSWORD|SECRET|KEY|TOKEN) ]]; then
            if [ -n "$value" ]; then
                masked_value="********"
            else
                masked_value="<not set>"
            fi
            echo -e "  ${YELLOW}${key}${NC}=${masked_value}"
        else
            echo -e "  ${GREEN}${key}${NC}=${value}"
        fi
    done < <(grep -v '^[[:space:]]*$' "$ENV_FILE" | grep -v '^[[:space:]]*#')
    
    echo ""
}

validate_env() {
    print_header "Validating .env Configuration"
    
    if ! check_env_exists; then
        print_error ".env file does not exist!"
        print_info "Run '$0 init' to create it from template"
        exit 1
    fi
    
    # Source the env file
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
    
    local has_errors=0
    
    # Check required variables
    print_info "Checking required variables..."
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "$var is not set"
            has_errors=1
        else
            print_success "$var is set"
        fi
    done
    
    echo ""
    
    # Check for default/placeholder values in secure variables
    print_info "Checking for placeholder values in secure variables..."
    for entry in "${SECURE_VARS[@]}"; do
        var="${entry%%:*}"
        placeholder="${entry##*:}"
        value="${!var}"
        
        if [ -z "$value" ]; then
            print_error "$var is not set"
            has_errors=1
        elif [ "$value" = "$placeholder" ]; then
            print_error "$var still contains placeholder value"
            has_errors=1
        else
            print_success "$var has been customized"
        fi
    done
    
    echo ""
    
    if [ $has_errors -eq 0 ]; then
        print_success "All validation checks passed!"
        return 0
    else
        print_error "Validation failed! Please fix the issues above."
        return 1
    fi
}

test_database_connection() {
    print_header "Testing Database Connection"
    
    if ! check_env_exists; then
        print_error ".env file does not exist!"
        return 1
    fi
    
    # Source the env file
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
    
    # Check if required database variables are set
    if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        print_error "Database configuration is incomplete"
        return 1
    fi
    
    print_info "Testing connection to PostgreSQL..."
    print_info "Host: $DB_HOST:$DB_PORT"
    print_info "Database: $DB_NAME"
    print_info "User: $DB_USER"
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_warning "psql command not found. Cannot test database connection."
        print_info "Install PostgreSQL client to enable database testing:"
        print_info "  Ubuntu/Debian: sudo apt-get install postgresql-client"
        print_info "  macOS: brew install postgresql"
        return 1
    fi
    
    # Test connection
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful!"
        return 0
    else
        print_error "Failed to connect to database"
        print_info "Please check your database configuration and ensure PostgreSQL is running"
        return 1
    fi
}

test_configuration() {
    print_header "Testing Configuration"
    
    local has_errors=0
    
    # Validate first
    if ! validate_env; then
        has_errors=1
    fi
    
    echo ""
    
    # Test database connection
    if ! test_database_connection; then
        has_errors=1
    fi
    
    echo ""
    
    if [ $has_errors -eq 0 ]; then
        print_success "All configuration tests passed!"
        return 0
    else
        print_warning "Some tests failed. Please review the issues above."
        return 1
    fi
}

generate_secret() {
    # Generate a secure random string
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32 | tr -d '\n'
    else
        # Fallback to /dev/urandom
        head -c 32 /dev/urandom | base64 | tr -d '\n'
    fi
}

create_backup() {
    if [ -f "$ENV_FILE" ]; then
        local backup_dir="${PROJECT_ROOT}/.env.backups"
        mkdir -p "$backup_dir"
        local timestamp=$(date +%Y%m%d_%H%M%S)
        local backup_file="${backup_dir}/.env.backup.${timestamp}"
        cp "$ENV_FILE" "$backup_file"
        print_success "Backup created: $backup_file"
    fi
}

set_env_value() {
    local key=""
    local value=""
    local force=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --key=*)
                key="${1#*=}"
                shift
                ;;
            --val=*)
                value="${1#*=}"
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            *)
                # Handle positional arguments: set KEY VALUE
                if [ -z "$key" ]; then
                    key="$1"
                elif [ -z "$value" ]; then
                    value="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Validate inputs
    if [ -z "$key" ]; then
        print_error "Key is required"
        print_info "Usage: $0 set --key=KEY --val=VALUE [--force]"
        print_info "   or: $0 set KEY VALUE [--force]"
        exit 1
    fi
    
    if [ -z "$value" ]; then
        print_error "Value is required"
        print_info "Usage: $0 set --key=KEY --val=VALUE [--force]"
        print_info "   or: $0 set KEY VALUE [--force]"
        exit 1
    fi
    
    print_header "Setting Environment Variable"
    
    # Check if .env file exists
    if ! check_env_exists; then
        print_warning ".env file does not exist. Creating from template..."
        create_env_from_template
    fi
    
    # Check if key exists in .env
    local old_value=""
    if grep -q "^${key}=" "$ENV_FILE"; then
        old_value=$(grep "^${key}=" "$ENV_FILE" | cut -d= -f2-)
        
        # Check if value is the same
        if [ "$old_value" = "$value" ]; then
            print_info "Value for $key is already set to: $value"
            print_success "No changes needed"
            return 0
        fi
        
        # Ask for confirmation if not forced
        if [ "$force" = false ]; then
            echo -e "\n${YELLOW}Key '$key' already exists${NC}"
            echo -e "Old value: ${RED}$old_value${NC}"
            echo -e "New value: ${GREEN}$value${NC}\n"
            read -p "Do you want to overwrite it? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Operation cancelled"
                return 0
            fi
        fi
        
        # Create backup before modifying
        create_backup
        
        # Update existing key
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        print_success "Updated $key in .env"
    else
        # Key doesn't exist, check if it should be added
        print_warning "Key '$key' does not exist in .env file"
        
        if [ "$force" = false ]; then
            read -p "Do you want to add it? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Operation cancelled"
                return 0
            fi
        fi
        
        # Create backup before modifying
        create_backup
        
        # Add new key at the end
        echo "" >> "$ENV_FILE"
        echo "${key}=${value}" >> "$ENV_FILE"
        print_success "Added $key to .env"
    fi
    
    # Update DATABASE_URL if any DB credentials were changed
    if [[ "$key" =~ ^DB_(HOST|PORT|NAME|USER|PASSWORD)$ ]]; then
        print_info "Database credential changed, updating DATABASE_URL..."
        
        # Source the updated env file
        set -a
        source "$ENV_FILE" 2>/dev/null || true
        set +a
        
        # Update DATABASE_URL if all components are present
        if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ] && [ -n "$DB_NAME" ]; then
            local db_url="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${db_url}|" "$ENV_FILE"
            print_success "Updated DATABASE_URL"
        fi
    fi
    
    print_success "Environment variable set successfully!"
}

interactive_setup() {
    print_header "Interactive .env Setup"
    
    # Check if dialog/whiptail is available
    local dialog_cmd=""
    if command -v whiptail &> /dev/null; then
        dialog_cmd="whiptail"
    elif command -v dialog &> /dev/null; then
        dialog_cmd="dialog"
    fi
    
    if [ -z "$dialog_cmd" ]; then
        print_warning "whiptail or dialog not found. Using basic interactive mode."
        basic_interactive_setup
        return
    fi
    
    tui_interactive_setup "$dialog_cmd"
}

basic_interactive_setup() {
    print_info "Starting basic interactive setup..."
    echo ""
    
    # Create .env if it doesn't exist
    if ! check_env_exists; then
        create_env_from_template
        echo ""
    fi
    
    # Source current values
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
    
    # Temporary file for new values
    local temp_env="/tmp/yektayar_env_$$"
    cp "$ENV_FILE" "$temp_env"
    
    echo -e "${CYAN}=== Backend Configuration ===${NC}\n"
    
    read -r -p "Backend Port [${PORT}]: " input
    [ -n "$input" ] && sed -i "s|^PORT=.*|PORT=${input}|" "$temp_env"
    
    read -r -p "Backend Host [${HOST}]: " input
    [ -n "$input" ] && sed -i "s|^HOST=.*|HOST=${input}|" "$temp_env"
    
    read -r -p "Node Environment (development/production) [${NODE_ENV}]: " input
    [ -n "$input" ] && sed -i "s|^NODE_ENV=.*|NODE_ENV=${input}|" "$temp_env"
    
    echo -e "\n${CYAN}=== Database Configuration ===${NC}\n"
    
    read -r -p "Database Host [${DB_HOST}]: " input
    [ -n "$input" ] && sed -i "s|^DB_HOST=.*|DB_HOST=${input}|" "$temp_env"
    
    read -r -p "Database Port [${DB_PORT}]: " input
    [ -n "$input" ] && sed -i "s|^DB_PORT=.*|DB_PORT=${input}|" "$temp_env"
    
    read -r -p "Database Name [${DB_NAME}]: " input
    [ -n "$input" ] && sed -i "s|^DB_NAME=.*|DB_NAME=${input}|" "$temp_env"
    
    read -r -p "Database User [${DB_USER}]: " input
    [ -n "$input" ] && sed -i "s|^DB_USER=.*|DB_USER=${input}|" "$temp_env"
    
    read -r -sp "Database Password: " input
    echo ""
    [ -n "$input" ] && sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${input}|" "$temp_env"
    
    # Update DATABASE_URL
    source "$temp_env"
    local db_url="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${db_url}|" "$temp_env"
    
    echo -e "\n${CYAN}=== Security Configuration ===${NC}\n"
    
    read -p "Generate new SESSION_SECRET? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        local new_secret=$(generate_secret)
        sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=${new_secret}|" "$temp_env"
        print_success "New SESSION_SECRET generated"
    fi
    
    read -p "Generate new JWT_SECRET? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        local new_secret=$(generate_secret)
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${new_secret}|" "$temp_env"
        print_success "New JWT_SECRET generated"
    fi
    
    echo -e "\n${CYAN}=== Frontend Configuration ===${NC}\n"
    
    read -r -p "Frontend API Base URL [${VITE_API_BASE_URL}]: " input
    [ -n "$input" ] && sed -i "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${input}|" "$temp_env"
    
    read -r -p "Frontend Environment (development/production) [${VITE_ENVIRONMENT}]: " input
    [ -n "$input" ] && sed -i "s|^VITE_ENVIRONMENT=.*|VITE_ENVIRONMENT=${input}|" "$temp_env"
    
    # Save changes
    echo ""
    read -p "Save changes? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create backup before saving
        create_backup
        cp "$temp_env" "$ENV_FILE"
        print_success ".env file updated successfully!"
        rm "$temp_env"
    else
        print_info "Changes discarded."
        rm "$temp_env"
    fi
}

tui_interactive_setup() {
    local dialog_cmd="$1"
    
    # Create .env if it doesn't exist
    if ! check_env_exists; then
        create_env_from_template
    fi
    
    # Source current values
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
    
    local temp_env="/tmp/yektayar_env_$$"
    cp "$ENV_FILE" "$temp_env"
    
    while true; do
        local choice=$($dialog_cmd --title "YektaYar .env Manager" --menu "Choose a section to configure:" 20 70 10 \
            "1" "Backend Configuration" \
            "2" "Database Configuration" \
            "3" "Security Configuration" \
            "4" "Frontend Configuration" \
            "5" "Show Current Configuration" \
            "6" "Validate Configuration" \
            "7" "Test Configuration" \
            "8" "Save & Exit" \
            "9" "Exit without saving" \
            3>&1 1>&2 2>&3)
        
        local exit_status=$?
        if [ $exit_status != 0 ]; then
            rm "$temp_env"
            exit 0
        fi
        
        case $choice in
            1)
                tui_backend_config "$dialog_cmd" "$temp_env"
                ;;
            2)
                tui_database_config "$dialog_cmd" "$temp_env"
                ;;
            3)
                tui_security_config "$dialog_cmd" "$temp_env"
                ;;
            4)
                tui_frontend_config "$dialog_cmd" "$temp_env"
                ;;
            5)
                ENV_FILE="$temp_env" show_env
                read -p "Press Enter to continue..."
                ;;
            6)
                ENV_FILE="$temp_env" validate_env || true
                read -p "Press Enter to continue..."
                ;;
            7)
                ENV_FILE="$temp_env" test_configuration || true
                read -p "Press Enter to continue..."
                ;;
            8)
                # Create backup before saving
                create_backup
                cp "$temp_env" "$ENV_FILE"
                print_success ".env file saved successfully!"
                rm "$temp_env"
                exit 0
                ;;
            9)
                print_info "Changes discarded."
                rm "$temp_env"
                exit 0
                ;;
        esac
    done
}

tui_backend_config() {
    local dialog_cmd="$1"
    local temp_env="$2"
    source "$temp_env"
    
    local new_port=$($dialog_cmd --title "Backend Port" --inputbox "Enter backend port:" 10 60 "$PORT" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_port" ] && sed -i "s|^PORT=.*|PORT=${new_port}|" "$temp_env"
    
    local new_host=$($dialog_cmd --title "Backend Host" --inputbox "Enter backend host:" 10 60 "$HOST" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_host" ] && sed -i "s|^HOST=.*|HOST=${new_host}|" "$temp_env"
    
    local new_env=$($dialog_cmd --title "Node Environment" --menu "Select environment:" 12 60 2 \
        "development" "Development mode" \
        "production" "Production mode" \
        3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_env" ] && sed -i "s|^NODE_ENV=.*|NODE_ENV=${new_env}|" "$temp_env"
}

tui_database_config() {
    local dialog_cmd="$1"
    local temp_env="$2"
    source "$temp_env"
    
    local new_host=$($dialog_cmd --title "Database Host" --inputbox "Enter database host:" 10 60 "$DB_HOST" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_host" ] && sed -i "s|^DB_HOST=.*|DB_HOST=${new_host}|" "$temp_env"
    
    local new_port=$($dialog_cmd --title "Database Port" --inputbox "Enter database port:" 10 60 "$DB_PORT" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_port" ] && sed -i "s|^DB_PORT=.*|DB_PORT=${new_port}|" "$temp_env"
    
    local new_name=$($dialog_cmd --title "Database Name" --inputbox "Enter database name:" 10 60 "$DB_NAME" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_name" ] && sed -i "s|^DB_NAME=.*|DB_NAME=${new_name}|" "$temp_env"
    
    local new_user=$($dialog_cmd --title "Database User" --inputbox "Enter database user:" 10 60 "$DB_USER" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_user" ] && sed -i "s|^DB_USER=.*|DB_USER=${new_user}|" "$temp_env"
    
    local new_pass=$($dialog_cmd --title "Database Password" --passwordbox "Enter database password:" 10 60 3>&1 1>&2 2>&3)
    if [ $? -eq 0 ] && [ -n "$new_pass" ]; then
        sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${new_pass}|" "$temp_env"
        # Update DATABASE_URL
        source "$temp_env"
        local db_url="postgresql://${DB_USER}:${new_pass}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${db_url}|" "$temp_env"
    fi
}

tui_security_config() {
    local dialog_cmd="$1"
    local temp_env="$2"
    
    if $dialog_cmd --title "Generate SESSION_SECRET" --yesno "Generate a new SESSION_SECRET?" 8 60; then
        local new_secret=$(generate_secret)
        sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=${new_secret}|" "$temp_env"
        $dialog_cmd --title "Success" --msgbox "New SESSION_SECRET generated!" 8 50
    fi
    
    if $dialog_cmd --title "Generate JWT_SECRET" --yesno "Generate a new JWT_SECRET?" 8 60; then
        local new_secret=$(generate_secret)
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${new_secret}|" "$temp_env"
        $dialog_cmd --title "Success" --msgbox "New JWT_SECRET generated!" 8 50
    fi
    
    local new_expiry=$($dialog_cmd --title "JWT Expiry" --inputbox "Enter JWT expiry (e.g., 7d, 24h):" 10 60 "7d" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_expiry" ] && sed -i "s|^JWT_EXPIRY=.*|JWT_EXPIRY=${new_expiry}|" "$temp_env"
}

tui_frontend_config() {
    local dialog_cmd="$1"
    local temp_env="$2"
    source "$temp_env"
    
    local new_api_url=$($dialog_cmd --title "Frontend API URL" --inputbox "Enter API base URL:" 10 60 "$VITE_API_BASE_URL" 3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_api_url" ] && sed -i "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${new_api_url}|" "$temp_env"
    
    local new_env=$($dialog_cmd --title "Frontend Environment" --menu "Select environment:" 12 60 2 \
        "development" "Development mode" \
        "production" "Production mode" \
        3>&1 1>&2 2>&3)
    [ $? -eq 0 ] && [ -n "$new_env" ] && sed -i "s|^VITE_ENVIRONMENT=.*|VITE_ENVIRONMENT=${new_env}|" "$temp_env"
}

show_usage() {
    echo -e "${BLUE}YektaYar .env Management Script${NC}"
    echo -e ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "    $0 [command]"
    echo -e ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "    ${GREEN}init${NC}              Create .env file from template"
    echo -e "    ${GREEN}show${NC}              Display current .env configuration (with masked secrets)"
    echo -e "    ${GREEN}validate${NC}          Validate that all required variables are set correctly"
    echo -e "    ${GREEN}test${NC}              Test configuration (validate + database connection)"
    echo -e "    ${GREEN}edit${NC}              Interactive TUI mode for editing .env values"
    echo -e "    ${GREEN}set${NC}               Set a specific environment variable"
    echo -e "    ${GREEN}generate-secret${NC}   Generate a secure random secret for use in .env"
    echo -e "    ${GREEN}help${NC}              Show this help message"
    echo -e ""
    echo -e "${CYAN}Set Command Usage:${NC}"
    echo -e "    $0 set --key=KEY --val=VALUE [--force]"
    echo -e "    $0 set KEY VALUE [--force]"
    echo -e ""
    echo -e "    ${CYAN}Options:${NC}"
    echo -e "      --key=KEY       Environment variable key to set"
    echo -e "      --val=VALUE     Value to set for the key"
    echo -e "      --force         Overwrite without confirmation (optional)"
    echo -e ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "    # Initial setup - create .env from template"
    echo -e "    $0 init"
    echo -e ""
    echo -e "    # Show current configuration"
    echo -e "    $0 show"
    echo -e ""
    echo -e "    # Validate configuration"
    echo -e "    $0 validate"
    echo -e ""
    echo -e "    # Test configuration (includes database connectivity test)"
    echo -e "    $0 test"
    echo -e ""
    echo -e "    # Interactive mode with TUI"
    echo -e "    $0 edit"
    echo -e ""
    echo -e "    # Set a specific environment variable"
    echo -e "    $0 set --key=DB_HOST --val=localhost"
    echo -e "    $0 set DB_USER myuser"
    echo -e "    $0 set --key=DB_PASSWORD --val=secret123 --force"
    echo -e ""
    echo -e "    # Generate a secure secret"
    echo -e "    $0 generate-secret"
    echo -e ""
    echo -e "${CYAN}Notes:${NC}"
    echo -e "    - The .env file is located at: ${PROJECT_ROOT}/.env"
    echo -e "    - All packages use this unified .env file"
    echo -e "    - Sensitive values are masked when displayed with 'show' command"
    echo -e "    - The 'test' command requires psql to be installed for database testing"
    echo -e "    - A backup is automatically created before any modification to .env"
    echo -e ""
}

# ==============================================================================
# Main Script Logic
# ==============================================================================

cd "$PROJECT_ROOT"

case "${1:-help}" in
    init)
        create_env_from_template
        ;;
    show)
        show_env
        ;;
    validate)
        validate_env
        ;;
    test)
        test_configuration
        ;;
    edit)
        interactive_setup
        ;;
    set)
        shift  # Remove 'set' from arguments
        set_env_value "$@"
        ;;
    generate-secret)
        echo "Generated secret: $(generate_secret)"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
