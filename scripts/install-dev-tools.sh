#!/bin/bash

# install-dev-tools.sh
# Automated installation script for YektaYar development tools
# This script installs all required and recommended tools for development

set -e

echo "════════════════════════════════════════════════════════════════"
echo "YektaYar Development Tools Installation Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
INSTALL_ALL_NO_PROMPT=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --yes|-y)
            INSTALL_ALL_NO_PROMPT=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--yes|-y]"
            exit 1
            ;;
    esac
done

# Check if running on Ubuntu/Debian
if [ ! -f /etc/os-release ]; then
    echo -e "${RED}❌ Cannot detect OS. This script is designed for Ubuntu/Debian.${NC}"
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
    echo -e "${YELLOW}⚠️  Warning: This script is optimized for Ubuntu/Debian.${NC}"
    echo -e "${YELLOW}   Your OS: $ID $VERSION_ID${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version
check_version() {
    local cmd="$1"
    local version_flag="${2:---version}"
    if command_exists "$cmd"; then
        echo -e "${GREEN}✓${NC} $cmd is installed: $($cmd $version_flag 2>&1 | head -n1)"
        return 0
    else
        echo -e "${RED}✗${NC} $cmd is not installed"
        return 1
    fi
}

# Function to ask user interactively
ask_install() {
    local tool_name="$1"
    if [ "$INSTALL_ALL_NO_PROMPT" = true ]; then
        return 0
    fi
    read -p "Install $tool_name? (Y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Nn]$ ]]
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Checking current installation status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Core tools
echo "Core Tools:"
check_version "git" || INSTALL_GIT=1
check_version "curl" || INSTALL_CURL=1
check_version "wget" || INSTALL_WGET=1
check_version "jq" || INSTALL_JQ=1
check_version "make" || INSTALL_BUILD=1
echo ""

# Node.js ecosystem
echo "Node.js Ecosystem:"
check_version "node" || INSTALL_NODE=1
check_version "npm" || INSTALL_NPM=1
check_version "bun" || INSTALL_BUN=1
echo ""

# Vue/Vite CLI
echo "Frontend Tools:"
check_version "vue" || INSTALL_VUE=1
check_version "vite" || INSTALL_VITE=1
echo ""

# Database
echo "Database Tools:"
check_version "psql" || INSTALL_PSQL=1
check_version "pg_config" || INSTALL_PSQL_DEV=1
echo ""

# Optional tools
echo "Optional Tools:"
check_version "nala" || CHECK_NALA=1
check_version "aria2c" || CHECK_ARIA2=1
check_version "gh" || CHECK_GH=1
check_version "pgcli" || CHECK_PGCLI=1
check_version "aptitude" || CHECK_APTITUDE=1
check_version "tasksel" || CHECK_TASKSEL=1
check_version "pipx" || CHECK_PIPX=1
check_version "thefuck" || CHECK_THEFUCK=1
echo ""

# Decide on package manager
USE_NALA=false
if command_exists "nala"; then
    echo -e "${GREEN}✓ nala is already installed, will use it for package installation${NC}"
    USE_NALA=true
elif [[ -n "$CHECK_NALA" ]]; then
    if ask_install "nala (better apt frontend)"; then
        INSTALL_NALA=1
        USE_NALA=true
    fi
fi

# Set package manager command
if [ "$USE_NALA" = true ]; then
    PKG_MGR="nala"
else
    PKG_MGR="apt-get"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Installation Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Package manager: $PKG_MGR"
echo ""

# Build installation plan
INSTALL_PKGS=""
[[ -n "$INSTALL_GIT" ]] && INSTALL_PKGS="$INSTALL_PKGS git"
[[ -n "$INSTALL_CURL" ]] && INSTALL_PKGS="$INSTALL_PKGS curl"
[[ -n "$INSTALL_WGET" ]] && INSTALL_PKGS="$INSTALL_WGET wget"
[[ -n "$INSTALL_JQ" ]] && INSTALL_PKGS="$INSTALL_PKGS jq"
[[ -n "$INSTALL_BUILD" ]] && INSTALL_PKGS="$INSTALL_PKGS build-essential"
[[ -n "$INSTALL_PSQL" ]] && INSTALL_PKGS="$INSTALL_PKGS postgresql-client"
[[ -n "$INSTALL_PSQL_DEV" ]] && INSTALL_PKGS="$INSTALL_PKGS libpq-dev"

# Ask for optional tools
if [[ -n "$CHECK_ARIA2" ]]; then
    if ask_install "aria2c (fast download tool)"; then
        INSTALL_PKGS="$INSTALL_PKGS aria2"
    fi
fi

if [[ -n "$CHECK_GH" ]]; then
    if ask_install "GitHub CLI (gh)"; then
        INSTALL_GH=1
    fi
fi

if [[ -n "$CHECK_APTITUDE" ]]; then
    if ask_install "aptitude (text-based package manager)"; then
        INSTALL_PKGS="$INSTALL_PKGS aptitude"
    fi
fi

if [[ -n "$CHECK_TASKSEL" ]]; then
    if ask_install "tasksel (task selection tool)"; then
        INSTALL_PKGS="$INSTALL_PKGS tasksel"
    fi
fi

if [[ -n "$CHECK_PIPX" ]]; then
    if ask_install "pipx (Python app installer)"; then
        INSTALL_PIPX=1
    fi
fi

if [[ -n "$CHECK_PGCLI" ]]; then
    if ask_install "pgcli (PostgreSQL CLI with auto-completion)"; then
        INSTALL_PGCLI=1
    fi
fi

if [[ -n "$CHECK_THEFUCK" ]]; then
    if ask_install "thefuck (command corrector)"; then
        INSTALL_THEFUCK=1
    fi
fi

# Check if there's anything to install
if [ -z "$INSTALL_PKGS" ] && [ -z "$INSTALL_NALA" ] && [ -z "$INSTALL_NODE" ] && [ -z "$INSTALL_BUN" ] && \
   [ -z "$INSTALL_VUE" ] && [ -z "$INSTALL_VITE" ] && [ -z "$INSTALL_GH" ] && [ -z "$INSTALL_PIPX" ] && \
   [ -z "$INSTALL_PGCLI" ] && [ -z "$INSTALL_THEFUCK" ]; then
    echo -e "${GREEN}✓ All selected tools are already installed!${NC}"
    echo ""
    exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting installation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update package list
echo "📦 Updating package list..."
sudo apt-get update -qq

# Install nala first if requested
if [[ -n "$INSTALL_NALA" ]]; then
    echo "📥 Installing nala..."
    sudo apt-get install -y nala
    PKG_MGR="nala"
fi

# Install core packages
if [[ -n "$INSTALL_PKGS" ]]; then
    echo "📥 Installing packages: $INSTALL_PKGS"
    sudo $PKG_MGR install -y $INSTALL_PKGS
fi

# Install Node.js
if [[ -n "$INSTALL_NODE" ]]; then
    echo "📥 Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo $PKG_MGR install -y nodejs
fi

# Install Bun
if [[ -n "$INSTALL_BUN" ]]; then
    echo "📥 Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

# Install GitHub CLI
if [[ -n "$INSTALL_GH" ]]; then
    echo "📥 Installing GitHub CLI..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update -qq
    sudo $PKG_MGR install -y gh
fi

# Install pipx
if [[ -n "$INSTALL_PIPX" ]]; then
    echo "📥 Installing pipx..."
    sudo $PKG_MGR install -y python3-pip python3-venv
    python3 -m pip install --user pipx
    python3 -m pipx ensurepath
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install pgcli
if [[ -n "$INSTALL_PGCLI" ]]; then
    echo "📥 Installing pgcli..."
    if command_exists pipx; then
        pipx install pgcli
    elif command_exists pip3; then
        pip3 install --user pgcli
    elif command_exists pip; then
        pip install --user pgcli
    else
        echo -e "${YELLOW}⚠️  pip not found. Installing python3-pip...${NC}"
        sudo $PKG_MGR install -y python3-pip
        pip3 install --user pgcli
    fi
fi

# Install thefuck with special treatment
if [[ -n "$INSTALL_THEFUCK" ]]; then
    echo "📥 Installing thefuck (with special setup)..."
    if ! command_exists pipx; then
        echo "Installing pipx first..."
        sudo $PKG_MGR install -y python3-pip python3-venv
        python3 -m pip install --user pipx
        python3 -m pipx ensurepath
        export PATH="$HOME/.local/bin:$PATH"
    fi
    
    echo "Installing thefuck via pipx..."
    pipx install thefuck
    
    echo "Injecting required dependencies..."
    pipx inject thefuck "setuptools>=80"
    pipx inject thefuck imp2importlib
fi

# Setup bash completion for npm
if command_exists npm; then
    echo "🔧 Setting up bash completion for npm..."
    if [ ! -d "$HOME/.npm-completion" ]; then
        mkdir -p "$HOME/.npm-completion"
        npm completion > "$HOME/.npm-completion/npm-completion.sh" 2>/dev/null || true
    fi
fi

# Install Vue CLI and Vite globally (at the end after pipx/thefuck)
if [[ -n "$INSTALL_VUE" ]] && command_exists npm; then
    echo "📥 Installing Vue CLI globally..."
    # Respect npm proxy environment variables
    npm install -g @vue/cli
fi

if [[ -n "$INSTALL_VITE" ]] && command_exists npm; then
    echo "📥 Installing Vite globally..."
    # Respect npm proxy environment variables
    npm install -g vite
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Installation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify installations
echo "�� Verification:"
check_version "git" || true
check_version "curl" || true
check_version "jq" || true
check_version "node" || true
check_version "npm" || true
check_version "bun" || echo -e "${YELLOW}   Note: Bun may need a new shell session${NC}"
check_version "psql" || true
check_version "nala" || true
check_version "aria2c" || true
check_version "gh" || true
check_version "pipx" || true
check_version "pgcli" || true
check_version "thefuck" || true
check_version "vue" || true
check_version "vite" || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Close and reopen your terminal (or run: source ~/.bashrc)"
echo "2. Verify all tools: ./scripts/check-requirements.js"
echo "3. Run bashrc enhancement: ./scripts/enable-user-bashrc-features.sh"
echo "4. Install project dependencies: npm install"
echo ""

if [[ -n "$INSTALL_BUN" ]] || [[ -n "$INSTALL_PIPX" ]] || [[ -n "$INSTALL_THEFUCK" ]]; then
    echo -e "${YELLOW}⚠️  Note: Some tools may require restarting your terminal to work properly${NC}"
    echo ""
fi
