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

# Database
echo "Database Tools:"
check_version "psql" || INSTALL_PSQL=1
check_version "pg_config" || INSTALL_PSQL_DEV=1
echo ""

# Optional but recommended
echo "Optional Development Tools:"
check_version "gh" || INSTALL_GH=1
check_version "docker" || INSTALL_DOCKER=1
check_version "docker-compose" "version" || INSTALL_DOCKER_COMPOSE=1
check_version "pgcli" || INSTALL_PGCLI=1
echo ""

# Ask for confirmation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Installation Plan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

WILL_INSTALL=""
[[ -n "$INSTALL_GIT" ]] && WILL_INSTALL="$WILL_INSTALL git"
[[ -n "$INSTALL_CURL" ]] && WILL_INSTALL="$WILL_INSTALL curl"
[[ -n "$INSTALL_WGET" ]] && WILL_INSTALL="$WILL_INSTALL wget"
[[ -n "$INSTALL_JQ" ]] && WILL_INSTALL="$WILL_INSTALL jq"
[[ -n "$INSTALL_BUILD" ]] && WILL_INSTALL="$WILL_INSTALL build-essential"
[[ -n "$INSTALL_NODE" ]] && WILL_INSTALL="$WILL_INSTALL node"
[[ -n "$INSTALL_BUN" ]] && WILL_INSTALL="$WILL_INSTALL bun"
[[ -n "$INSTALL_PSQL" ]] && WILL_INSTALL="$WILL_INSTALL postgresql-client"
[[ -n "$INSTALL_PSQL_DEV" ]] && WILL_INSTALL="$WILL_INSTALL postgresql-dev"
[[ -n "$INSTALL_GH" ]] && WILL_INSTALL="$WILL_INSTALL gh"
[[ -n "$INSTALL_DOCKER" ]] && WILL_INSTALL="$WILL_INSTALL docker"
[[ -n "$INSTALL_DOCKER_COMPOSE" ]] && WILL_INSTALL="$WILL_INSTALL docker-compose"
[[ -n "$INSTALL_PGCLI" ]] && WILL_INSTALL="$WILL_INSTALL pgcli"

if [ -z "$WILL_INSTALL" ]; then
    echo -e "${GREEN}✓ All tools are already installed!${NC}"
    echo ""
    exit 0
fi

echo "The following tools will be installed:"
echo -e "${BLUE}$WILL_INSTALL${NC}"
echo ""
read -p "Continue with installation? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting installation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update package list
echo "📦 Updating package list..."
sudo apt-get update -qq

# Install core tools
if [[ -n "$INSTALL_GIT" ]]; then
    echo "📥 Installing Git..."
    sudo apt-get install -y git
fi

if [[ -n "$INSTALL_CURL" ]]; then
    echo "📥 Installing curl..."
    sudo apt-get install -y curl
fi

if [[ -n "$INSTALL_WGET" ]]; then
    echo "📥 Installing wget..."
    sudo apt-get install -y wget
fi

if [[ -n "$INSTALL_JQ" ]]; then
    echo "📥 Installing jq..."
    sudo apt-get install -y jq
fi

if [[ -n "$INSTALL_BUILD" ]]; then
    echo "📥 Installing build tools..."
    sudo apt-get install -y build-essential
fi

# Install Node.js
if [[ -n "$INSTALL_NODE" ]]; then
    echo "📥 Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Bun
if [[ -n "$INSTALL_BUN" ]]; then
    echo "📥 Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    # Add to PATH for current session
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

# Install PostgreSQL client
if [[ -n "$INSTALL_PSQL" ]]; then
    echo "📥 Installing PostgreSQL client..."
    sudo apt-get install -y postgresql-client
fi

if [[ -n "$INSTALL_PSQL_DEV" ]]; then
    echo "📥 Installing PostgreSQL development files..."
    sudo apt-get install -y libpq-dev
fi

# Install GitHub CLI
if [[ -n "$INSTALL_GH" ]]; then
    echo "📥 Installing GitHub CLI..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update -qq
    sudo apt-get install -y gh
fi

# Install Docker
if [[ -n "$INSTALL_DOCKER" ]]; then
    echo "📥 Installing Docker..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER"
    echo -e "${YELLOW}⚠️  Note: You need to log out and back in for Docker group membership to take effect${NC}"
fi

# Install Docker Compose
if [[ -n "$INSTALL_DOCKER_COMPOSE" ]]; then
    echo "📥 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install pgcli (requires Python)
if [[ -n "$INSTALL_PGCLI" ]]; then
    echo "📥 Installing pgcli..."
    if command_exists pip3; then
        pip3 install --user pgcli
    elif command_exists pip; then
        pip install --user pgcli
    else
        echo -e "${YELLOW}⚠️  pip not found. Installing python3-pip...${NC}"
        sudo apt-get install -y python3-pip
        pip3 install --user pgcli
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Installation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify installations
echo "📋 Verification:"
check_version "git"
check_version "curl"
check_version "jq"
check_version "node"
check_version "npm"
check_version "bun" || echo -e "${YELLOW}   Note: Bun may need a new shell session${NC}"
check_version "psql"
check_version "gh" || true
check_version "docker" || true

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

if [[ -n "$INSTALL_DOCKER" ]]; then
    echo -e "${YELLOW}⚠️  Docker: Log out and back in to use Docker without sudo${NC}"
    echo ""
fi
