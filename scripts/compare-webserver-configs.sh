#!/bin/bash

# YektaYar - WebServer Configuration Comparison Script
# Compares installed webserver configurations with repository configs
# Alerts users about differences and provides guidance for updates

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory and repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="$REPO_ROOT/config/webserver"

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to print section headers
print_header() {
    echo ""
    print_color "$CYAN" "========================================="
    print_color "$CYAN" "$1"
    print_color "$CYAN" "========================================="
    echo ""
}

# Function to detect installed webservers
detect_webservers() {
    local detected=""
    
    if command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
        detected="${detected}apache "
    fi
    
    if command -v nginx &> /dev/null; then
        detected="${detected}nginx "
    fi
    
    if command -v caddy &> /dev/null; then
        detected="${detected}caddy "
    fi
    
    echo "$detected"
}

# Function to get config paths for a webserver
get_config_paths() {
    local server=$1
    
    case $server in
        apache)
            if [ -d "/etc/apache2/sites-available" ]; then
                echo "/etc/apache2/sites-available"
            elif [ -d "/etc/httpd/conf.d" ]; then
                echo "/etc/httpd/conf.d"
            else
                echo ""
            fi
            ;;
        nginx)
            if [ -d "/etc/nginx/sites-available" ]; then
                echo "/etc/nginx/sites-available"
            else
                echo ""
            fi
            ;;
        caddy)
            if [ -d "/etc/caddy" ]; then
                echo "/etc/caddy"
            else
                echo ""
            fi
            ;;
    esac
}

# Function to get list of config files for a webserver
get_config_files() {
    local server=$1
    
    case $server in
        apache)
            echo "api.yektayar.ir.conf panel.yektayar.ir.conf app.yektayar.ir.conf static.yektayar.ir.conf"
            ;;
        nginx)
            echo "api.yektayar.ir.conf panel.yektayar.ir.conf app.yektayar.ir.conf static.yektayar.ir.conf"
            ;;
        caddy)
            echo "api.yektayar.ir panel.yektayar.ir app.yektayar.ir static.yektayar.ir Caddyfile"
            ;;
    esac
}

# Function to compare a single config file
compare_config() {
    local server=$1
    local config_file=$2
    local installed_path=$3
    local repo_path="$CONFIG_DIR/$server/$config_file"
    local installed_file="$installed_path/$config_file"
    
    # Check if repository config exists
    if [ ! -f "$repo_path" ]; then
        print_color "$YELLOW" "  ⚠️  Repository config not found: $config_file"
        return 1
    fi
    
    # Check if installed config exists
    if [ ! -f "$installed_file" ]; then
        print_color "$YELLOW" "  ⚠️  Config not installed: $config_file"
        print_color "$BLUE" "      To install: sudo cp $repo_path $installed_file"
        return 1
    fi
    
    # Compare files
    if diff -q "$installed_file" "$repo_path" > /dev/null 2>&1; then
        print_color "$GREEN" "  ✅ $config_file - Up to date"
        return 0
    else
        print_color "$RED" "  ❌ $config_file - Differs from repository"
        return 1
    fi
}

# Function to show differences for a config file
show_differences() {
    local server=$1
    local config_file=$2
    local installed_path=$3
    local repo_path="$CONFIG_DIR/$server/$config_file"
    local installed_file="$installed_path/$config_file"
    
    if [ ! -f "$installed_file" ] || [ ! -f "$repo_path" ]; then
        return
    fi
    
    print_color "$YELLOW" "\nDifferences for $config_file:"
    print_color "$BLUE" "Legend: Lines starting with '-' are in the installed version"
    print_color "$BLUE" "        Lines starting with '+' are in the repository version"
    echo ""
    
    # Show unified diff with context
    diff -u "$installed_file" "$repo_path" | head -50 || true
    
    local line_count=$(diff -u "$installed_file" "$repo_path" | wc -l)
    if [ "$line_count" -gt 50 ]; then
        print_color "$YELLOW" "... (output truncated, showing first 50 lines of diff)"
    fi
}

# Function to provide update instructions
provide_update_instructions() {
    local server=$1
    local config_file=$2
    local installed_path=$3
    local repo_path="$CONFIG_DIR/$server/$config_file"
    local installed_file="$installed_path/$config_file"
    
    echo ""
    print_color "$CYAN" "To update $config_file:"
    print_color "$BLUE" "1. Backup current config:"
    echo "   sudo cp $installed_file ${installed_file}.backup"
    print_color "$BLUE" "2. Copy new config from repository:"
    echo "   sudo cp $repo_path $installed_file"
    
    case $server in
        apache)
            print_color "$BLUE" "3. Test configuration:"
            echo "   sudo apache2ctl configtest"
            print_color "$BLUE" "4. Reload Apache:"
            echo "   sudo systemctl reload apache2"
            ;;
        nginx)
            print_color "$BLUE" "3. Test configuration:"
            echo "   sudo nginx -t"
            print_color "$BLUE" "4. Reload Nginx:"
            echo "   sudo systemctl reload nginx"
            ;;
        caddy)
            print_color "$BLUE" "3. Validate configuration:"
            echo "   sudo caddy validate --config /etc/caddy/Caddyfile"
            print_color "$BLUE" "4. Reload Caddy:"
            echo "   sudo caddy reload --config /etc/caddy/Caddyfile"
            ;;
    esac
}

# Function to compare all configs for a webserver
compare_webserver() {
    local server=$1
    local installed_path=$(get_config_paths "$server")
    
    if [ -z "$installed_path" ]; then
        print_color "$RED" "❌ $server configuration directory not found"
        return 1
    fi
    
    print_header "Checking $server configurations"
    
    local config_files=$(get_config_files "$server")
    local has_differences=0
    local different_files=()
    
    for config_file in $config_files; do
        if ! compare_config "$server" "$config_file" "$installed_path"; then
            has_differences=1
            different_files+=("$config_file")
        fi
    done
    
    if [ $has_differences -eq 1 ]; then
        echo ""
        print_color "$YELLOW" "⚠️  Some configurations differ from the repository or are not installed."
        
        # Ask user if they want to see differences
        read -p "$(echo -e ${CYAN}Would you like to see the differences? [y/N]:${NC}) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for config_file in "${different_files[@]}"; do
                show_differences "$server" "$config_file" "$installed_path"
                echo ""
            done
            
            # Ask if user wants update instructions
            read -p "$(echo -e ${CYAN}Would you like to see update instructions? [y/N]:${NC}) " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                for config_file in "${different_files[@]}"; do
                    provide_update_instructions "$server" "$config_file" "$installed_path"
                    echo ""
                done
            fi
        fi
        
        return 1
    else
        echo ""
        print_color "$GREEN" "✅ All $server configurations are up to date!"
        return 0
    fi
}

# Main function
main() {
    print_header "YektaYar WebServer Configuration Checker"
    
    print_color "$BLUE" "Repository: $REPO_ROOT"
    print_color "$BLUE" "Config directory: $CONFIG_DIR"
    
    # Detect installed webservers
    local detected_servers=$(detect_webservers)
    
    if [ -z "$detected_servers" ]; then
        print_color "$YELLOW" "\n⚠️  No webservers detected (Apache, Nginx, or Caddy)"
        print_color "$BLUE" "If you plan to deploy, install a webserver first:"
        print_color "$BLUE" "  - For Apache: sudo $SCRIPT_DIR/install-apache.sh"
        print_color "$BLUE" "  - For Nginx:  sudo $SCRIPT_DIR/install-nginx.sh"
        print_color "$BLUE" "  - For Caddy:  sudo $SCRIPT_DIR/install-caddy.sh"
        exit 0
    fi
    
    print_color "$GREEN" "\n✅ Detected webservers: $detected_servers"
    
    # Check each detected webserver
    local all_ok=0
    for server in $detected_servers; do
        if ! compare_webserver "$server"; then
            all_ok=1
        fi
    done
    
    # Summary
    print_header "Summary"
    
    if [ $all_ok -eq 0 ]; then
        print_color "$GREEN" "✅ All webserver configurations are up to date!"
        print_color "$BLUE" "\nYour webserver configurations match the repository."
        print_color "$BLUE" "No action needed."
    else
        print_color "$YELLOW" "⚠️  Some configurations need attention"
        print_color "$BLUE" "\nWhat to do next:"
        print_color "$BLUE" "1. Review the differences shown above"
        print_color "$BLUE" "2. Backup your current configurations"
        print_color "$BLUE" "3. Update configurations using the provided commands"
        print_color "$BLUE" "4. Test and reload your webserver"
        print_color "$BLUE" "\nImportant: Recent changes include improved WebSocket support for Nginx."
        print_color "$BLUE" "If you're using Nginx, updating is recommended for better WebSocket handling."
    fi
    
    echo ""
}

# Check if running with proper permissions
if [[ $EUID -eq 0 ]]; then
    print_color "$YELLOW" "⚠️  This script is running as root."
    print_color "$YELLOW" "It's recommended to run it as a regular user for read-only checks."
fi

# Run main function
main
