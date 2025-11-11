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
    "VITE_API_BASE_URL"
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
    print_info "Please edit .env and set appropriate values"
    print_info "Run '$0 validate' to check if all required values are set"
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
    
    read -p "Backend Port [${PORT}]: " input
    [ -n "$input" ] && sed -i "s|^PORT=.*|PORT=${input}|" "$temp_env"
    
    read -p "Backend Host [${HOST}]: " input
    [ -n "$input" ] && sed -i "s|^HOST=.*|HOST=${input}|" "$temp_env"
    
    read -p "Node Environment (development/production) [${NODE_ENV}]: " input
    [ -n "$input" ] && sed -i "s|^NODE_ENV=.*|NODE_ENV=${input}|" "$temp_env"
    
    echo -e "\n${CYAN}=== Database Configuration ===${NC}\n"
    
    read -p "Database Host [${DB_HOST}]: " input
    [ -n "$input" ] && sed -i "s|^DB_HOST=.*|DB_HOST=${input}|" "$temp_env"
    
    read -p "Database Port [${DB_PORT}]: " input
    [ -n "$input" ] && sed -i "s|^DB_PORT=.*|DB_PORT=${input}|" "$temp_env"
    
    read -p "Database Name [${DB_NAME}]: " input
    [ -n "$input" ] && sed -i "s|^DB_NAME=.*|DB_NAME=${input}|" "$temp_env"
    
    read -p "Database User [${DB_USER}]: " input
    [ -n "$input" ] && sed -i "s|^DB_USER=.*|DB_USER=${input}|" "$temp_env"
    
    read -sp "Database Password: " input
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
    
    read -p "Frontend API Base URL [${VITE_API_BASE_URL}]: " input
    [ -n "$input" ] && sed -i "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${input}|" "$temp_env"
    
    read -p "Frontend Environment (development/production) [${VITE_ENVIRONMENT}]: " input
    [ -n "$input" ] && sed -i "s|^VITE_ENVIRONMENT=.*|VITE_ENVIRONMENT=${input}|" "$temp_env"
    
    # Save changes
    echo ""
    read -p "Save changes? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
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
                ENV_FILE="$temp_env" validate_env
                read -p "Press Enter to continue..."
                ;;
            7)
                ENV_FILE="$temp_env" test_configuration
                read -p "Press Enter to continue..."
                ;;
            8)
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
    cat << EOF
${BLUE}YektaYar .env Management Script${NC}

${CYAN}Usage:${NC}
    $0 [command]

${CYAN}Commands:${NC}
    ${GREEN}init${NC}              Create .env file from template
    ${GREEN}show${NC}              Display current .env configuration (with masked secrets)
    ${GREEN}validate${NC}          Validate that all required variables are set correctly
    ${GREEN}test${NC}              Test configuration (validate + database connection)
    ${GREEN}edit${NC}              Interactive TUI mode for editing .env values
    ${GREEN}generate-secret${NC}   Generate a secure random secret for use in .env
    ${GREEN}help${NC}              Show this help message

${CYAN}Examples:${NC}
    # Initial setup - create .env from template
    $0 init

    # Show current configuration
    $0 show

    # Validate configuration
    $0 validate

    # Test configuration (includes database connectivity test)
    $0 test

    # Interactive mode with TUI
    $0 edit

    # Generate a secure secret
    $0 generate-secret

${CYAN}Notes:${NC}
    - The .env file is located at: ${PROJECT_ROOT}/.env
    - All packages use this unified .env file
    - Sensitive values are masked when displayed with 'show' command
    - The 'test' command requires psql to be installed for database testing

EOF
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
