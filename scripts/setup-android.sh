#!/bin/bash

# YektaYar Android Development Tooling Setup
# This script installs and configures Android development tools for building the mobile app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Default installation paths
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
JAVA_VERSION="17"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YektaYar Android Tooling Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Detect OS
OS="unknown"
if [ -f /etc/os-release ]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    OS=$ID
fi

echo -e "${CYAN}Detected OS: ${OS}${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to add environment variables to shell profile
add_to_profile() {
    local var_name=$1
    local var_value=$2
    local profile_file=""
    
    # Determine which profile file to use
    if [ -f "$HOME/.bashrc" ]; then
        profile_file="$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        profile_file="$HOME/.zshrc"
    elif [ -f "$HOME/.profile" ]; then
        profile_file="$HOME/.profile"
    fi
    
    if [ -n "$profile_file" ]; then
        # Check if variable already exists in profile
        if ! grep -q "export ${var_name}=" "$profile_file"; then
            {
                echo ""
                echo "# Android Development Environment (added by YektaYar setup)"
                echo "export ${var_name}=\"${var_value}\""
            } >> "$profile_file"
            echo -e "${GREEN}  ✓ Added ${var_name} to ${profile_file}${NC}"
        else
            echo -e "${YELLOW}  → ${var_name} already exists in ${profile_file}${NC}"
        fi
    fi
}

# Function to add to PATH in shell profile
add_to_path() {
    local path_dir=$1
    local profile_file=""
    
    # Determine which profile file to use
    if [ -f "$HOME/.bashrc" ]; then
        profile_file="$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        profile_file="$HOME/.zshrc"
    elif [ -f "$HOME/.profile" ]; then
        profile_file="$HOME/.profile"
    fi
    
    if [ -n "$profile_file" ]; then
        # Check if path already in PATH
        if ! grep -q "PATH.*${path_dir}" "$profile_file"; then
            echo "export PATH=\"${path_dir}:\$PATH\"" >> "$profile_file"
            echo -e "${GREEN}  ✓ Added ${path_dir} to PATH in ${profile_file}${NC}"
        else
            echo -e "${YELLOW}  → ${path_dir} already in PATH${NC}"
        fi
    fi
}

# Step 1: Install Java JDK 17
echo -e "${BLUE}Step 1: Checking Java JDK ${JAVA_VERSION}...${NC}"

if command_exists java; then
    JAVA_CURRENT_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | awk -F '.' '{print $1}')
    echo -e "${GREEN}✓ Java is installed (version: ${JAVA_CURRENT_VERSION})${NC}"
    
    if [ "$JAVA_CURRENT_VERSION" -ge "$JAVA_VERSION" ]; then
        echo -e "${GREEN}✓ Java version is sufficient (>= ${JAVA_VERSION})${NC}\n"
    else
        echo -e "${YELLOW}⚠ Java version is too old. Need version ${JAVA_VERSION} or higher${NC}"
        echo -e "${YELLOW}Installing OpenJDK ${JAVA_VERSION}...${NC}"
        
        if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            sudo apt update
            sudo apt install -y openjdk-${JAVA_VERSION}-jdk
            echo -e "${GREEN}✓ OpenJDK ${JAVA_VERSION} installed${NC}\n"
        else
            echo -e "${RED}✗ Automatic installation not supported for this OS${NC}"
            echo -e "${YELLOW}Please install OpenJDK ${JAVA_VERSION} manually${NC}\n"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}Java is not installed. Installing OpenJDK ${JAVA_VERSION}...${NC}"
    
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt update
        sudo apt install -y openjdk-${JAVA_VERSION}-jdk
        echo -e "${GREEN}✓ OpenJDK ${JAVA_VERSION} installed${NC}\n"
    else
        echo -e "${RED}✗ Automatic installation not supported for this OS${NC}"
        echo -e "${YELLOW}Please install OpenJDK ${JAVA_VERSION} manually from:${NC}"
        echo -e "${CYAN}  https://adoptium.net/${NC}\n"
        exit 1
    fi
fi

# Step 2: Set JAVA_HOME
echo -e "${BLUE}Step 2: Configuring JAVA_HOME...${NC}"

if [ -z "$JAVA_HOME" ]; then
    # Try to find JAVA_HOME
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        # Find the Java installation directory
        JAVA_PATH=$(update-alternatives --query java | grep 'Value:' | awk '{print $2}')
        if [ -n "$JAVA_PATH" ]; then
            # Remove /bin/java from the path to get JAVA_HOME
            JAVA_HOME_FOUND=$(dirname "$(dirname "$JAVA_PATH")")
            export JAVA_HOME="$JAVA_HOME_FOUND"
            echo -e "${GREEN}✓ Found JAVA_HOME: ${JAVA_HOME}${NC}"
            add_to_profile "JAVA_HOME" "$JAVA_HOME"
        else
            echo -e "${RED}✗ Could not automatically determine JAVA_HOME${NC}"
            echo -e "${YELLOW}Please set JAVA_HOME manually in your shell profile${NC}\n"
        fi
    else
        echo -e "${YELLOW}⚠ JAVA_HOME not set. Please set it manually${NC}\n"
    fi
else
    echo -e "${GREEN}✓ JAVA_HOME is already set: ${JAVA_HOME}${NC}\n"
fi

# Step 3: Install Android SDK Command-line Tools
echo -e "${BLUE}Step 3: Checking Android SDK...${NC}"

if [ -d "$ANDROID_SDK_ROOT" ] && [ -d "$ANDROID_SDK_ROOT/cmdline-tools" ]; then
    echo -e "${GREEN}✓ Android SDK found at: ${ANDROID_SDK_ROOT}${NC}\n"
else
    echo -e "${YELLOW}Android SDK not found. Installing...${NC}"
    
    # Create SDK directory
    mkdir -p "$ANDROID_SDK_ROOT"
    cd "$ANDROID_SDK_ROOT"
    
    # Download Android command-line tools
    echo -e "${CYAN}Downloading Android command-line tools...${NC}"
    
    # Determine OS-specific download URL
    CMDLINE_TOOLS_URL=""
    if [ "$(uname)" = "Linux" ]; then
        CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    elif [ "$(uname)" = "Darwin" ]; then
        CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
    else
        echo -e "${RED}✗ Unsupported OS for automatic installation${NC}\n"
        exit 1
    fi
    
    # Install wget or curl if needed
    if ! command_exists wget && ! command_exists curl; then
        if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            sudo apt update
            sudo apt install -y wget
        fi
    fi
    
    # Download using wget or curl
    if command_exists wget; then
        wget -q --show-progress "$CMDLINE_TOOLS_URL" -O cmdline-tools.zip
    elif command_exists curl; then
        curl -L "$CMDLINE_TOOLS_URL" -o cmdline-tools.zip
    fi
    
    # Extract command-line tools
    if ! command_exists unzip; then
        if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            sudo apt update
            sudo apt install -y unzip
        fi
    fi
    
    unzip -q cmdline-tools.zip
    mkdir -p cmdline-tools/latest
    mv cmdline-tools/bin cmdline-tools/lib cmdline-tools/source.properties cmdline-tools/NOTICE.txt cmdline-tools/latest/ 2>/dev/null || true
    rm cmdline-tools.zip
    
    echo -e "${GREEN}✓ Android command-line tools installed${NC}\n"
fi

# Step 4: Set Android environment variables
echo -e "${BLUE}Step 4: Configuring Android environment variables...${NC}"

# Set for current session
export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT"
export ANDROID_HOME="$ANDROID_SDK_ROOT"

# Add to shell profile
add_to_profile "ANDROID_SDK_ROOT" "$ANDROID_SDK_ROOT"
add_to_profile "ANDROID_HOME" "$ANDROID_SDK_ROOT"

# Add Android tools to PATH
add_to_path "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"
add_to_path "$ANDROID_SDK_ROOT/platform-tools"
add_to_path "$ANDROID_SDK_ROOT/build-tools/34.0.0"

# Update PATH for current session
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$PATH"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$PATH"

echo ""

# Step 5: Install Android SDK components
echo -e "${BLUE}Step 5: Installing required Android SDK components...${NC}"

# Accept licenses automatically
echo -e "${CYAN}Accepting Android SDK licenses...${NC}"
yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1 || true

# Install required components
echo -e "${CYAN}Installing SDK components (this may take a few minutes)...${NC}"

"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "cmdline-tools;latest" > /dev/null 2>&1

echo -e "${GREEN}✓ Android SDK components installed${NC}\n"

# Step 6: Verify installation
echo -e "${BLUE}Step 6: Verifying installation...${NC}"

echo -e "${CYAN}Java version:${NC}"
java -version 2>&1 | head -n 3

echo ""
echo -e "${CYAN}JAVA_HOME:${NC} ${JAVA_HOME}"
echo -e "${CYAN}ANDROID_SDK_ROOT:${NC} ${ANDROID_SDK_ROOT}"
echo -e "${CYAN}ANDROID_HOME:${NC} ${ANDROID_HOME}"
echo ""

# Check if gradlew can run
if [ -f "$PROJECT_ROOT/packages/mobile-app/android/gradlew" ]; then
    echo -e "${CYAN}Testing Gradle wrapper...${NC}"
    cd "$PROJECT_ROOT/packages/mobile-app/android"
    if ./gradlew --version > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Gradle wrapper is working${NC}\n"
    else
        echo -e "${YELLOW}⚠ Gradle wrapper test failed, but tools are installed${NC}\n"
    fi
fi

# Final instructions
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Android development tools setup complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Important: Reload your shell to apply environment changes:${NC}"
echo -e "${CYAN}  source ~/.bashrc${NC}"
echo -e "${CYAN}  # or${NC}"
echo -e "${CYAN}  source ~/.zshrc${NC}\n"

echo -e "${YELLOW}To build the Android app, run:${NC}"
echo -e "${CYAN}  npm run android:build${NC}\n"

echo -e "${YELLOW}To manually test gradle:${NC}"
echo -e "${CYAN}  cd packages/mobile-app/android${NC}"
echo -e "${CYAN}  ./gradlew assembleDebug${NC}\n"
