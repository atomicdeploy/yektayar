#!/bin/bash

##############################################################################
# Setup Git Sync Alias
# 
# This script configures a git alias to enable the `git sync` command
# for the YektaYar repository.
#
# Usage:
#   ./scripts/setup-git-sync.sh
##############################################################################

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Icons
SUCCESS="✅"
INFO="ℹ️"

# Get the root directory of the git repository
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${ERROR} Not in a git repository"
    exit 1
fi

cd "$REPO_ROOT" || exit 1

echo ""
echo -e "${CYAN}${BOLD}================================${RESET}"
echo -e "${CYAN}${BOLD}  Setup Git Sync Alias${RESET}"
echo -e "${CYAN}${BOLD}================================${RESET}"
echo ""

# Configure the git alias
echo -e "${INFO} ${BLUE}Configuring git alias 'sync'...${RESET}"

# Use absolute path to the script
SCRIPT_PATH="${REPO_ROOT}/scripts/git-sync.sh"

git config alias.sync "!bash '${SCRIPT_PATH}'"

if [ $? -eq 0 ]; then
    echo -e "${SUCCESS} ${GREEN}Git alias 'sync' configured successfully!${RESET}"
    echo ""
    echo -e "${INFO} ${CYAN}You can now use:${RESET}"
    echo -e "  ${BOLD}git sync${RESET}      - Run the sync command"
    echo -e "  ${BOLD}npm run sync${RESET}  - Alternative way to run sync"
    echo ""
    echo -e "${INFO} ${CYAN}The alias is configured for this repository only.${RESET}"
    echo ""
else
    echo -e "${ERROR} Failed to configure git alias"
    exit 1
fi
