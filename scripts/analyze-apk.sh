#!/bin/bash

# Script to analyze an Android APK file and extract information
# Usage: ./analyze-apk.sh <path-to-apk>

set -e

APK_PATH="$1"

if [ -z "$APK_PATH" ]; then
    echo "Usage: $0 <path-to-apk>"
    exit 1
fi

if [ ! -f "$APK_PATH" ]; then
    echo "Error: APK file not found at: $APK_PATH"
    exit 1
fi

echo "========================================"
echo "Android APK Analysis"
echo "========================================"
echo ""

# Basic file information
echo "📄 File Information:"
echo "  Path: $APK_PATH"
echo "  Size: $(du -h "$APK_PATH" | cut -f1)"
echo "  MD5: $(md5sum "$APK_PATH" | cut -d' ' -f1)"
echo "  SHA256: $(sha256sum "$APK_PATH" | cut -d' ' -f1)"
echo ""

# Check if aapt is available
AAPT=""
if command -v aapt &> /dev/null; then
    AAPT="aapt"
elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/build-tools/34.0.0/aapt" ]; then
    AAPT="$ANDROID_HOME/build-tools/34.0.0/aapt"
elif [ -n "$ANDROID_HOME" ]; then
    # Find any aapt version
    AAPT=$(find "$ANDROID_HOME/build-tools" -name "aapt" | head -1)
fi

if [ -z "$AAPT" ]; then
    echo "⚠️  aapt tool not found. Skipping detailed APK analysis."
    echo "   Install Android SDK build-tools to enable detailed analysis."
    echo ""
    
    # Basic unzip-based analysis
    echo "📦 APK Contents (limited):"
    unzip -l "$APK_PATH" | head -20
    echo "   ... (use 'unzip -l $APK_PATH' to see all files)"
    echo ""
    
    exit 0
fi

# Extract APK information using aapt
echo "📦 Package Information:"
$AAPT dump badging "$APK_PATH" | grep -E "^package:|^application:|^sdkVersion:|^targetSdkVersion:|^uses-permission:" | while read line; do
    echo "  $line"
done
echo ""

# Application details
echo "🏷️  Application Details:"
APP_NAME=$($AAPT dump badging "$APK_PATH" | grep "application-label:" | sed "s/application-label://g" | tr -d "'")
VERSION_NAME=$($AAPT dump badging "$APK_PATH" | grep "versionName" | sed "s/.*versionName='\([^']*\)'.*/\1/")
VERSION_CODE=$($AAPT dump badging "$APK_PATH" | grep "versionCode" | sed "s/.*versionCode='\([^']*\)'.*/\1/")
PACKAGE_NAME=$($AAPT dump badging "$APK_PATH" | grep "package: name" | sed "s/.*name='\([^']*\)'.*/\1/")

echo "  App Name: $APP_NAME"
echo "  Package Name: $PACKAGE_NAME"
echo "  Version Name: $VERSION_NAME"
echo "  Version Code: $VERSION_CODE"
echo ""

# Permissions
echo "🔐 Permissions:"
$AAPT dump permissions "$APK_PATH" | grep "uses-permission:" | sed 's/uses-permission: name=/  - /' | head -15
PERM_COUNT=$($AAPT dump permissions "$APK_PATH" | grep -c "uses-permission:" || echo "0")
if [ "$PERM_COUNT" -gt 15 ]; then
    echo "  ... and $((PERM_COUNT - 15)) more permissions"
fi
echo ""

# Activities
echo "🎯 Activities:"
$AAPT dump xmltree "$APK_PATH" AndroidManifest.xml | grep "activity" | grep "android:name" | sed 's/.*android:name.*="\([^"]*\)".*/  - \1/' | head -10
ACT_COUNT=$($AAPT dump xmltree "$APK_PATH" AndroidManifest.xml | grep "activity" | grep -c "android:name" || echo "0")
if [ "$ACT_COUNT" -gt 10 ]; then
    echo "  ... and $((ACT_COUNT - 10)) more activities"
fi
echo ""

# Native libraries
echo "💻 Native Libraries:"
NATIVE_LIBS=$(unzip -l "$APK_PATH" | grep "lib/" | awk '{print $4}' | grep -o "lib/[^/]*/" | sort -u)
if [ -n "$NATIVE_LIBS" ]; then
    echo "$NATIVE_LIBS" | sed 's/^/  - /'
else
    echo "  No native libraries found"
fi
echo ""

# APK structure
echo "📁 APK Structure:"
echo "  Total files: $(unzip -l "$APK_PATH" | tail -1 | awk '{print $2}')"
echo "  Classes.dex: $(unzip -l "$APK_PATH" | grep "classes.*\.dex" | wc -l) file(s)"
echo "  Assets: $(unzip -l "$APK_PATH" | grep "assets/" | wc -l) file(s)"
echo "  Resources: $(unzip -l "$APK_PATH" | grep "res/" | wc -l) file(s)"
echo ""

# Signing information
echo "🔏 Signing Information:"
if command -v jarsigner &> /dev/null; then
    jarsigner -verify -verbose -certs "$APK_PATH" 2>&1 | grep -E "Signed by|Certificate|Valid from" | head -10 || echo "  Not signed or signature verification failed"
else
    echo "  jarsigner not available - cannot verify signature"
fi
echo ""

echo "========================================"
echo "Analysis Complete"
echo "========================================"
