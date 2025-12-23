#!/bin/bash

# post-clone-setup.sh
# This script is designed to be run after cloning the YektaYar repository
# It offers to install required tools and configure the development environment

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🎉 Welcome to YektaYar Development Environment Setup!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This script will help you set up your development environment."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to ask user
ask_user() {
    local question="$1"
    local default="${2:-y}"
    
    if [ "$default" = "y" ]; then
        read -p "$question [Y/n] " -n 1 -r
    else
        read -p "$question [y/N] " -n 1 -r
    fi
    echo
    
    if [ -z "$REPLY" ]; then
        [ "$default" = "y" ] && return 0 || return 1
    fi
    
    [[ $REPLY =~ ^[Yy]$ ]]
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Checking system requirements..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for essential tools
MISSING_TOOLS=""
MISSING_OPTIONAL=""

# Essential tools
if ! command_exists git; then
    MISSING_TOOLS="$MISSING_TOOLS git"
fi

if ! command_exists node; then
    MISSING_TOOLS="$MISSING_TOOLS node"
fi

if ! command_exists npm; then
    MISSING_TOOLS="$MISSING_TOOLS npm"
fi

if ! command_exists curl; then
    MISSING_TOOLS="$MISSING_TOOLS curl"
fi

# Optional but recommended tools
if ! command_exists bun; then
    MISSING_OPTIONAL="$MISSING_OPTIONAL bun"
fi

if ! command_exists psql; then
    MISSING_OPTIONAL="$MISSING_OPTIONAL postgresql-client"
fi

if ! command_exists nala; then
    MISSING_OPTIONAL="$MISSING_OPTIONAL nala"
fi

if ! command_exists aria2c; then
    MISSING_OPTIONAL="$MISSING_OPTIONAL aria2"
fi

if ! command_exists thefuck; then
    MISSING_OPTIONAL="$MISSING_OPTIONAL thefuck"
fi

# Report findings
if [ -z "$MISSING_TOOLS" ] && [ -z "$MISSING_OPTIONAL" ]; then
    echo -e "${GREEN}✅ All essential and optional tools are installed!${NC}"
    echo ""
else
    if [ -n "$MISSING_TOOLS" ]; then
        echo -e "${RED}❌ Missing essential tools:${NC} $MISSING_TOOLS"
        echo ""
        
        if ask_user "Would you like to install missing tools now?"; then
            echo ""
            echo "Running installation script..."
            if [ -f "./scripts/install-dev-tools.sh" ]; then
                bash ./scripts/install-dev-tools.sh --yes
            else
                echo -e "${RED}Error: Installation script not found${NC}"
                echo "Please run: sudo apt-get install $MISSING_TOOLS"
                exit 1
            fi
        else
            echo ""
            echo -e "${YELLOW}⚠️  To install manually, run:${NC}"
            echo "   sudo apt-get install $MISSING_TOOLS"
            echo ""
            echo "Or run the automated installer:"
            echo "   bash ./scripts/install-dev-tools.sh"
            echo ""
            exit 1
        fi
    elif [ -n "$MISSING_OPTIONAL" ]; then
        echo -e "${YELLOW}⚠️  Some optional tools are missing:${NC} $MISSING_OPTIONAL"
        echo ""
        
        if ask_user "Would you like to install optional tools?"; then
            echo ""
            echo "Running installation script..."
            if [ -f "./scripts/install-dev-tools.sh" ]; then
                bash ./scripts/install-dev-tools.sh
            else
                echo -e "${RED}Error: Installation script not found${NC}"
                exit 1
            fi
        else
            echo ""
            echo -e "${YELLOW}You can install them later by running:${NC}"
            echo "   bash ./scripts/install-dev-tools.sh"
            echo ""
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 Bash Configuration Enhancement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The project includes enhanced bash configuration scripts that add:"
echo "  • Colorful git-aware prompt"
echo "  • Useful aliases and functions"
echo "  • Development-specific shortcuts"
echo "  • Bash completion improvements"
echo ""

if ask_user "Would you like to enhance your bash configuration?"; then
    echo ""
    if [ -f "./scripts/enable-user-bashrc-features.sh" ]; then
        bash ./scripts/enable-user-bashrc-features.sh
    else
        echo -e "${RED}Error: Bash enhancement script not found${NC}"
    fi
    
    # Ask about system-wide configuration (requires sudo)
    echo ""
    if ask_user "Would you also like to enhance system-wide bash configuration? (requires sudo)" "n"; then
        if [ -f "./scripts/enable-system-bashrc-features.sh" ]; then
            sudo bash ./scripts/enable-system-bashrc-features.sh
        else
            echo -e "${RED}Error: System bash enhancement script not found${NC}"
        fi
    fi
else
    echo ""
    echo -e "${YELLOW}You can enhance your bash later by running:${NC}"
    echo "   bash ./scripts/enable-user-bashrc-features.sh"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Installing Project Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ask_user "Would you like to install project dependencies now?"; then
    echo ""
    echo "Installing dependencies..."
    npm install
else
    echo ""
    echo -e "${YELLOW}Remember to install dependencies later by running:${NC}"
    echo "   npm install"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✨ Setup Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. If you modified your bash configuration, restart your terminal or run:"
echo "   source ~/.bashrc"
echo ""
echo "2. Check the README.md and DEVELOPMENT.md for more information"
echo ""
echo "3. Start developing! Try these commands:"
echo "   npm run dev              # Start all services"
echo "   npm run dev:backend      # Start backend only"
echo "   npm run dev:admin        # Start admin panel only"
echo "   npm run dev:mobile       # Start mobile app only"
echo ""
echo "Happy coding! 🚀"
echo ""
