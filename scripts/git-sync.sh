#!/bin/bash

##############################################################################
# YektaYar Git Sync Script
# 
# This script automates the process of synchronizing your local repository
# with the remote, handling dependencies, builds, and ensuring everything
# is up to date and working.
#
# Features:
# - Stashes local changes before pulling
# - Fetches and pulls latest changes from current branch
# - Pushes any unpushed local commits
# - Installs/updates dependencies if needed
# - Runs builds if necessary
# - Restores stashed changes
# - Handles errors gracefully
#
# Usage:
#   ./scripts/git-sync.sh
#   git sync              (if git alias is configured)
#   npm run sync          (if npm script is added)
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
ROCKET="🚀"
PACKAGE="📦"
BUILD="🔨"
GIT="🔄"

# Track if we stashed changes
STASHED=0
STASH_NAME=""

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
    echo -e "${CYAN}${BOLD}  YektaYar Git Sync${RESET}"
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
# Main Sync Functions
##############################################################################

check_git_status() {
    print_step "Checking git status..."
    
    # Check if we're on a branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ $? -ne 0 ] || [ "$CURRENT_BRANCH" = "HEAD" ]; then
        print_error "Not on a branch (detached HEAD state)"
        exit 1
    fi
    
    print_success "On branch: ${BOLD}$CURRENT_BRANCH${RESET}"
    
    # Check if we have uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "You have uncommitted changes"
        return 1
    fi
    
    return 0
}

stash_changes() {
    print_step "Stashing local changes..."
    
    # Check if there are changes to stash
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        STASH_NAME="git-sync-$(date +%Y%m%d-%H%M%S)"
        git stash push -u -m "$STASH_NAME" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            STASHED=1
            print_success "Changes stashed as: $STASH_NAME"
        else
            print_error "Failed to stash changes"
            exit 1
        fi
    else
        print_info "No changes to stash"
    fi
}

fetch_from_remote() {
    print_step "Fetching from remote..."
    
    if git fetch --all --prune 2>&1; then
        print_success "Fetched from remote"
    else
        print_error "Failed to fetch from remote"
        restore_stash
        exit 1
    fi
}

check_remote_tracking() {
    # Check if current branch has a remote tracking branch
    UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
    if [ $? -ne 0 ]; then
        print_warning "Current branch has no upstream tracking branch"
        print_info "Skipping pull and push operations"
        return 1
    fi
    return 0
}

pull_changes() {
    print_step "Pulling latest changes..."
    
    if ! check_remote_tracking; then
        return 0
    fi
    
    # Check if we're behind remote
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    BASE=$(git merge-base @ @{u})
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        print_success "Already up to date"
    elif [ "$LOCAL" = "$BASE" ]; then
        # We're behind, need to pull
        git pull --rebase 2>&1
        if [ $? -eq 0 ]; then
            print_success "Pulled latest changes"
        else
            print_error "Failed to pull changes"
            print_warning "You may have merge conflicts to resolve"
            restore_stash
            exit 1
        fi
    elif [ "$REMOTE" = "$BASE" ]; then
        # We're ahead, no need to pull
        print_success "Local branch is ahead of remote"
    else
        # Branches have diverged
        print_warning "Local and remote branches have diverged"
        print_info "Attempting to rebase..."
        git pull --rebase 2>&1
        if [ $? -eq 0 ]; then
            print_success "Successfully rebased"
        else
            print_error "Failed to rebase - conflicts need manual resolution"
            restore_stash
            exit 1
        fi
    fi
}

push_changes() {
    print_step "Pushing local commits..."
    
    if ! check_remote_tracking; then
        return 0
    fi
    
    # Check if we have commits to push
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    BASE=$(git merge-base @ @{u})
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        print_info "No commits to push"
    elif [ "$REMOTE" = "$BASE" ]; then
        # We have commits to push
        git push 2>&1
        if [ $? -eq 0 ]; then
            print_success "Pushed local commits"
        else
            print_error "Failed to push commits"
            print_warning "You may need to pull first or resolve conflicts"
            restore_stash
            exit 1
        fi
    else
        print_info "No additional commits to push"
    fi
}

install_dependencies() {
    print_step "Checking dependencies..."
    
    # Check if package.json or package-lock.json changed
    CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -E "package\.json|package-lock\.json|bun\.lock")
    
    if [ -n "$CHANGED_FILES" ] || [ ! -d "node_modules" ]; then
        print_warning "Dependencies may need updating"
        print_info "Running dependency installer..."
        
        if [ -f "scripts/install-dependencies.js" ]; then
            node scripts/install-dependencies.js
            if [ $? -eq 0 ]; then
                print_success "Dependencies updated"
            else
                print_warning "Dependency installation had warnings (check output above)"
            fi
        else
            # Fallback to npm install
            npm install --no-audit 2>&1
            if [ $? -eq 0 ]; then
                print_success "Dependencies installed"
            else
                print_warning "npm install completed with warnings"
            fi
        fi
    else
        print_success "Dependencies are up to date"
    fi
}

run_builds() {
    print_step "Checking if builds are needed..."
    
    # Check if shared package needs building
    if [ -d "packages/shared" ]; then
        if [ ! -d "packages/shared/dist" ] || [ "packages/shared/src" -nt "packages/shared/dist" ]; then
            print_info "Building shared package..."
            npm run build -w @yektayar/shared 2>&1
            if [ $? -eq 0 ]; then
                print_success "Shared package built"
            else
                print_warning "Shared package build had warnings"
            fi
        else
            print_success "Shared package is up to date"
        fi
    fi
}

restore_stash() {
    if [ $STASHED -eq 1 ]; then
        print_step "Restoring stashed changes..."
        
        # Find the stash we created
        STASH_INDEX=$(git stash list | grep "$STASH_NAME" | cut -d: -f1 | head -1)
        
        if [ -n "$STASH_INDEX" ]; then
            git stash pop "$STASH_INDEX" 2>&1
            if [ $? -eq 0 ]; then
                print_success "Restored stashed changes"
            else
                print_error "Failed to restore stashed changes"
                print_info "Your changes are still in stash: $STASH_NAME"
                print_info "Run: git stash list"
            fi
        else
            print_warning "Could not find stash: $STASH_NAME"
            print_info "Run: git stash list"
        fi
    fi
}

run_checks() {
    print_step "Running system checks..."
    
    if [ -f "scripts/check-requirements.js" ]; then
        node scripts/check-requirements.js 2>&1
        if [ $? -eq 0 ]; then
            print_success "All checks passed"
        else
            print_warning "Some checks failed (see output above)"
        fi
    else
        print_info "No check script found"
    fi
}

print_summary() {
    echo ""
    echo -e "${CYAN}${BOLD}================================${RESET}"
    echo -e "${SUCCESS} ${GREEN}${BOLD}Sync completed successfully!${RESET}"
    echo -e "${CYAN}${BOLD}================================${RESET}"
    echo ""
    echo -e "${INFO} ${CYAN}Repository: ${BOLD}$(basename "$REPO_ROOT")${RESET}"
    echo -e "${INFO} ${CYAN}Branch: ${BOLD}$CURRENT_BRANCH${RESET}"
    echo -e "${INFO} ${CYAN}Status: ${GREEN}${BOLD}Up to date${RESET}"
    echo ""
    echo -e "${ROCKET} ${GREEN}You're ready to work!${RESET}"
    echo ""
}

##############################################################################
# Main Script Execution
##############################################################################

main() {
    print_header
    
    # 1. Check git status
    check_git_status
    
    # 2. Stash changes if needed
    stash_changes
    
    # 3. Fetch from remote
    fetch_from_remote
    
    # 4. Pull latest changes
    pull_changes
    
    # 5. Push local commits
    push_changes
    
    # 6. Install/update dependencies
    install_dependencies
    
    # 7. Run necessary builds
    run_builds
    
    # 8. Restore stashed changes
    restore_stash
    
    # 9. Run system checks
    run_checks
    
    # 10. Print summary
    print_summary
}

# Run main function
main
