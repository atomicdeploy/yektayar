#!/bin/bash
# Self-Hosted GitHub Actions Runner Setup Script for YektaYar
# This script automates the setup of a GitHub Actions self-hosted runner on Ubuntu/Debian

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RUNNER_VERSION="2.311.0"
RUNNER_USER="github-runner"
RUNNER_NAME="${1:-yektayar-vps-runner-01}"
REPO_URL="https://github.com/atomicdeploy/yektayar"

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run as root or with sudo"
        exit 1
    fi
}

check_os() {
    if [ ! -f /etc/os-release ]; then
        print_error "Cannot detect OS. This script supports Ubuntu/Debian only."
        exit 1
    fi
    
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        print_error "This script supports Ubuntu/Debian only. Detected: $ID"
        exit 1
    fi
    
    print_success "OS detected: $PRETTY_NAME"
}

install_dependencies() {
    print_header "Installing System Dependencies"
    
    apt update
    apt install -y curl wget git build-essential unzip
    
    print_success "System dependencies installed"
}

install_nodejs() {
    print_header "Installing Node.js 18"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_info "Node.js is already installed: $NODE_VERSION"
        read -p "Do you want to reinstall? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js installed: $NODE_VERSION"
    print_success "npm installed: $NPM_VERSION"
}

install_java() {
    print_header "Installing OpenJDK 17"
    
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        print_info "Java is already installed: $JAVA_VERSION"
        read -p "Do you want to reinstall? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    apt install -y openjdk-17-jdk
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    print_success "Java installed: $JAVA_VERSION"
}

setup_android_sdk() {
    print_header "Setting up Android SDK"
    
    ANDROID_HOME="/home/$RUNNER_USER/android-sdk"
    
    if [ -d "$ANDROID_HOME" ]; then
        print_info "Android SDK directory already exists"
        read -p "Do you want to reinstall? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
        rm -rf "$ANDROID_HOME"
    fi
    
    # Switch to runner user for installation
    su - $RUNNER_USER << 'EOF'
set -e

ANDROID_HOME="$HOME/android-sdk"
mkdir -p "$ANDROID_HOME/cmdline-tools"
cd "$ANDROID_HOME/cmdline-tools"

echo "Downloading Android command line tools..."
wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip -q commandlinetools-linux-9477386_latest.zip
mv cmdline-tools latest
rm commandlinetools-linux-9477386_latest.zip

# Add to bashrc
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Android SDK" >> ~/.bashrc
    echo "export ANDROID_HOME=$HOME/android-sdk" >> ~/.bashrc
    echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
    echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
fi

# Source the new environment
export ANDROID_HOME="$HOME/android-sdk"
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Accept licenses and install required packages
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

echo "Android SDK setup complete"
EOF
    
    print_success "Android SDK installed"
}

create_runner_user() {
    print_header "Creating Runner User"
    
    if id "$RUNNER_USER" &>/dev/null; then
        print_info "User $RUNNER_USER already exists"
        return
    fi
    
    useradd -m -s /bin/bash "$RUNNER_USER"
    print_success "User $RUNNER_USER created"
}

setup_runner() {
    print_header "Setting up GitHub Actions Runner"
    
    # Check if token is provided
    if [ -z "$RUNNER_TOKEN" ]; then
        print_error "RUNNER_TOKEN environment variable is not set"
        echo ""
        print_info "To get a runner token:"
        print_info "1. Go to: https://github.com/atomicdeploy/yektayar/settings/actions/runners/new"
        print_info "2. Copy the token from the configuration command"
        print_info "3. Run this script with: RUNNER_TOKEN=your_token sudo -E ./setup-runner.sh"
        exit 1
    fi
    
    # Setup as runner user
    su - $RUNNER_USER << EOF
set -e

cd ~
mkdir -p actions-runner
cd actions-runner

# Download runner
echo "Downloading GitHub Actions Runner v${RUNNER_VERSION}..."
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract
echo "Extracting runner..."
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Configure
echo "Configuring runner..."
./config.sh --url $REPO_URL \
  --token $RUNNER_TOKEN \
  --name $RUNNER_NAME \
  --labels self-hosted,linux,yektayar-runners \
  --work _work \
  --unattended \
  --replace

echo "Runner configured successfully"
EOF
    
    print_success "Runner configured: $RUNNER_NAME"
}

install_runner_service() {
    print_header "Installing Runner as System Service"
    
    cd /home/$RUNNER_USER/actions-runner
    ./svc.sh install $RUNNER_USER
    ./svc.sh start
    
    print_success "Runner service installed and started"
    
    # Check status
    sleep 2
    ./svc.sh status
}

print_summary() {
    print_header "Setup Complete!"
    
    echo ""
    print_success "GitHub Actions self-hosted runner is now running"
    echo ""
    print_info "Runner Details:"
    echo "  Name: $RUNNER_NAME"
    echo "  Labels: self-hosted, linux, yektayar-runners"
    echo "  User: $RUNNER_USER"
    echo "  Directory: /home/$RUNNER_USER/actions-runner"
    echo ""
    print_info "Service Management:"
    echo "  Status: sudo /home/$RUNNER_USER/actions-runner/svc.sh status"
    echo "  Stop:   sudo /home/$RUNNER_USER/actions-runner/svc.sh stop"
    echo "  Start:  sudo /home/$RUNNER_USER/actions-runner/svc.sh start"
    echo ""
    print_info "View Logs:"
    echo "  sudo journalctl -u actions.runner.* -f"
    echo ""
    print_info "Verify in GitHub:"
    echo "  https://github.com/atomicdeploy/yektayar/settings/actions/runners"
    echo ""
}

main() {
    print_header "YektaYar Self-Hosted Runner Setup"
    
    check_root
    check_os
    
    print_info "This script will install:"
    print_info "  - System dependencies"
    print_info "  - Node.js 18"
    print_info "  - OpenJDK 17"
    print_info "  - Android SDK"
    print_info "  - GitHub Actions Runner"
    echo ""
    
    read -p "Continue with installation? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installation cancelled"
        exit 0
    fi
    
    install_dependencies
    install_nodejs
    install_java
    create_runner_user
    setup_android_sdk
    setup_runner
    install_runner_service
    
    print_summary
}

# Run main function
main
