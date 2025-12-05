#!/usr/bin/env bash

# YektaYar Android APK Build Script
# This script builds a debug APK of the YektaYar mobile app

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MOBILE_APP_DIR="$ROOT_DIR/packages/mobile-app"
APK_OUTPUT="$MOBILE_APP_DIR/android/app/build/outputs/apk/debug/app-debug.apk"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}YektaYar Android APK Builder${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1/5: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✓ Java: $JAVA_VERSION${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2/5: Installing dependencies...${NC}"
cd "$ROOT_DIR"
# Using --legacy-peer-deps due to peer dependency conflicts in Capacitor/Ionic ecosystem
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build web assets
echo -e "${YELLOW}Step 3/5: Building web assets...${NC}"
cd "$MOBILE_APP_DIR"
npm run build:production
echo -e "${GREEN}✓ Web assets built${NC}"
echo ""

# Step 4: Sync Capacitor
echo -e "${YELLOW}Step 4/5: Syncing Capacitor...${NC}"
npm run cap:sync
echo -e "${GREEN}✓ Capacitor synced${NC}"
echo ""

# Step 5: Build APK
echo -e "${YELLOW}Step 5/5: Building Android APK...${NC}"
npm run android:build:debug
echo -e "${GREEN}✓ APK built successfully${NC}"
echo ""

# Check if APK was created
if [ -f "$APK_OUTPUT" ]; then
    APK_SIZE=$(ls -lh "$APK_OUTPUT" | awk '{print $5}')
    
    # Use md5sum on Linux or md5 on macOS
    if command -v md5sum &> /dev/null; then
        APK_MD5=$(md5sum "$APK_OUTPUT" | awk '{print $1}')
    elif command -v md5 &> /dev/null; then
        APK_MD5=$(md5 -q "$APK_OUTPUT")
    else
        APK_MD5="(md5 tool not available)"
    fi
    
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}APK Location:${NC} $APK_OUTPUT"
    echo -e "${GREEN}APK Size:${NC} $APK_SIZE"
    echo -e "${GREEN}MD5 Checksum:${NC} $APK_MD5"
    echo ""
    echo -e "${BLUE}To install on a device:${NC}"
    echo -e "  adb install $APK_OUTPUT"
    echo ""
    
    # Optional: Create password-protected ZIP
    if [ "${CREATE_SECURE_ZIP:-}" = "true" ]; then
        echo -e "${YELLOW}Creating password-protected ZIP...${NC}"
        
        # Get current datetime in ISO format for password
        DATETIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        
        # Copy APK to root without directory structure
        cd "$ROOT_DIR"
        cp "$APK_OUTPUT" ./app-debug.apk
        
        # Create password-protected ZIP
        zip -e -P "$DATETIME" yektayar-app-debug-secure.zip app-debug.apk
        
        echo -e "${GREEN}✓ Secure ZIP created${NC}"
        echo -e "${GREEN}ZIP Location:${NC} $ROOT_DIR/yektayar-app-debug-secure.zip"
        echo -e "${GREEN}Password:${NC} $DATETIME"
        echo ""
        
        # Clean up temporary APK copy
        rm ./app-debug.apk
    fi
    echo ""
else
    echo -e "${RED}Error: APK was not created${NC}"
    exit 1
fi
