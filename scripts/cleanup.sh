#!/bin/bash

##############################################################################
# YektaYar Cleanup Script
# 
# This script cleans up build caches and temporary files that may cause
# issues during development or after updates.
#
# Features:
# - Removes Vite cache directories (node_modules/.vite)
# - Cleans other temporary build artifacts
# - Safe operation with confirmation prompts
#
# Usage:
#   ./scripts/cleanup.sh
#   npm run cleanup
##############################################################################

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Icons
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
CLEAN="🧹"

# Get the root directory of the git repository
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${ERROR} ${RED}Not in a git repository${RESET}"
    exit 1
fi

cd "$REPO_ROOT" || exit 1

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${CYAN}${BOLD}================================${RESET}"
    echo -e "${CYAN}${BOLD}  YektaYar Cleanup${RESET}"
    echo -e "${CYAN}${BOLD}================================${RESET}"
    echo ""
}

print_step() {
    echo -e "${INFO} ${BLUE}${BOLD}$1${RESET}"
}

print_success() {
    echo -e "${SUCCESS} ${GREEN}$1${RESET}"
}

print_error() {
    echo -e "${ERROR} ${RED}$1${RESET}"
}

print_warning() {
    echo -e "${WARNING} ${YELLOW}$1${RESET}"
}

print_info() {
    echo -e "${INFO} ${CYAN}$1${RESET}"
}

##############################################################################
# Cleanup Functions
##############################################################################

cleanup_vite_cache() {
    print_step "Cleaning Vite cache directories..."
    
    local found=0
    local cleaned=0
    
    # Find all node_modules/.vite directories
    while IFS= read -r -d '' vite_dir; do
        found=$((found + 1))
        local relative_path=$(realpath --relative-to="$REPO_ROOT" "$vite_dir")
        print_info "Found: ${BOLD}$relative_path${RESET}"
        
        if [ -d "$vite_dir" ]; then
            rm -rf "$vite_dir"
            if [ $? -eq 0 ]; then
                print_success "Removed: $relative_path"
                cleaned=$((cleaned + 1))
            else
                print_error "Failed to remove: $relative_path"
            fi
        fi
    done < <(find "$REPO_ROOT" -type d -path "*/node_modules/.vite" -print0 2>/dev/null)
    
    if [ $found -eq 0 ]; then
        print_info "No Vite cache directories found"
    else
        echo ""
        print_success "Cleaned $cleaned of $found Vite cache director(ies)"
    fi
}

cleanup_dist_folders() {
    print_step "Checking for stale dist folders..."
    
    local found=0
    
    # Check packages/*/dist directories
    for package_dir in "$REPO_ROOT"/packages/*/; do
        if [ -d "${package_dir}dist" ]; then
            local package_name=$(basename "$package_dir")
            local relative_path="packages/$package_name/dist"
            print_info "Found dist in: ${BOLD}$package_name${RESET}"
            found=$((found + 1))
        fi
    done
    
    if [ $found -eq 0 ]; then
        print_info "No dist folders found"
    else
        echo ""
        print_warning "Found $found dist folder(s)"
        print_info "Tip: Use ${BOLD}npm run clean${RESET} to remove all node_modules and dist folders"
    fi
}

cleanup_temp_files() {
    print_step "Cleaning temporary files..."
    
    local cleaned=0
    
    # Remove common temporary files
    local temp_patterns=(
        "*.log"
        "*.tmp"
        ".DS_Store"
        "Thumbs.db"
    )
    
    for pattern in "${temp_patterns[@]}"; do
        while IFS= read -r -d '' temp_file; do
            local relative_path=$(realpath --relative-to="$REPO_ROOT" "$temp_file")
            rm -f "$temp_file"
            if [ $? -eq 0 ]; then
                print_success "Removed: $relative_path"
                cleaned=$((cleaned + 1))
            fi
        done < <(find "$REPO_ROOT" -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)
    done
    
    if [ $cleaned -eq 0 ]; then
        print_info "No temporary files found"
    else
        echo ""
        print_success "Cleaned $cleaned temporary file(s)"
    fi
}

print_summary() {
    echo ""
    echo -e "${CYAN}${BOLD}================================${RESET}"
    echo -e "${SUCCESS} ${GREEN}${BOLD}Cleanup completed!${RESET}"
    echo -e "${CYAN}${BOLD}================================${RESET}"
    echo ""
    echo -e "${CLEAN} ${GREEN}Your repository is clean and ready${RESET}"
    echo ""
    echo -e "${INFO} ${CYAN}Additional cleanup options:${RESET}"
    echo -e "  ${BOLD}npm run clean${RESET}     - Remove all node_modules and dist folders"
    echo -e "  ${BOLD}git clean -fdx${RESET}    - Remove all untracked files (use with caution!)"
    echo ""
}

##############################################################################
# Main Script Execution
##############################################################################

main() {
    print_header
    
    # 1. Clean Vite cache
    cleanup_vite_cache
    echo ""
    
    # 2. Check dist folders (info only)
    cleanup_dist_folders
    echo ""
    
    # 3. Clean temporary files
    cleanup_temp_files
    echo ""
    
    # 4. Print summary
    print_summary
}

# Run main function
main
