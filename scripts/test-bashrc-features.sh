#!/bin/bash
# Test script to verify bashrc feature enhancement scripts work correctly

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
USER_SCRIPT="${SCRIPT_DIR}/enable-user-bashrc-features.sh"
SYSTEM_SCRIPT="${SCRIPT_DIR}/enable-system-bashrc-features.sh"

echo "================================================"
echo "Testing Bashrc Feature Enhancement Scripts"
echo "================================================"
echo ""

# Test 1: Verify scripts exist and are executable
echo "Test 1: Checking script files..."
if [ -x "${USER_SCRIPT}" ]; then
    echo "✓ PASSED: enable-user-bashrc-features.sh exists and is executable"
else
    echo "❌ FAILED: enable-user-bashrc-features.sh not found or not executable"
    exit 1
fi

if [ -x "${SYSTEM_SCRIPT}" ]; then
    echo "✓ PASSED: enable-system-bashrc-features.sh exists and is executable"
else
    echo "❌ FAILED: enable-system-bashrc-features.sh not found or not executable"
    exit 1
fi

# Test 2: Verify system script requires root
echo ""
echo "Test 2: Checking root requirement for system script..."
if bash "${SYSTEM_SCRIPT}" 2>&1 | grep -q "must be run as root"; then
    echo "✓ PASSED: System script correctly requires root privileges"
else
    echo "❌ FAILED: System script should require root privileges"
    exit 1
fi

# Test 3: Test user script in isolated environment
echo ""
echo "Test 3: Testing user script functionality..."
TEST_HOME=$(mktemp -d)
export HOME="${TEST_HOME}"

# Create a bashrc from the system template (vanilla Ubuntu)
if [ -f /etc/skel/.bashrc ]; then
    cp /etc/skel/.bashrc "${TEST_HOME}/.bashrc"
else
    # Fallback to minimal bashrc if /etc/skel doesn't exist
    cat > "${TEST_HOME}/.bashrc" << 'EOF'
# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

HISTCONTROL=ignoreboth
shopt -s histappend
HISTSIZE=1000
HISTFILESIZE=2000
shopt -s checkwinsize

if [ -x /usr/bin/dircolors ]; then
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
fi

alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
EOF
fi

# Run the script
if bash "${USER_SCRIPT}" > /dev/null 2>&1; then
    echo "✓ PASSED: User script executed without errors"
else
    echo "❌ FAILED: User script execution failed"
    rm -rf "${TEST_HOME}"
    exit 1
fi

# Test 4: Verify features were added
echo ""
echo "Test 4: Verifying features were added to bashrc..."
FEATURES_TO_CHECK=(
    "HISTCONTROL=ignoredups:ignorespace"
    "stty werase"
    "force_color_prompt=yes"
    'export PS1=.*01;31m.*@.*01;34m'
    "alias ls='ls -GNhp --color=auto'"
    "alias ll='ls -alh'"
    "alias l\.=.*ls -d"
    "alias diskspace="
    "alias folders="
    "alias ip='ip -c'"
    "export LESSCHARSET"
)

FEATURE_NAMES=(
    "History control (ignoredups:ignorespace)"
    "Ctrl-Backspace binding"
    "force_color_prompt"
    "Colorful PS1 prompt"
    "Enhanced ls with -GNhp"
    "ll alias"
    "l. alias (hidden files)"
    "diskspace alias"
    "folders alias"
    "ip color alias"
    "LESSCHARSET"
)

for i in "${!FEATURES_TO_CHECK[@]}"; do
    if grep -qE "${FEATURES_TO_CHECK[$i]}" "${TEST_HOME}/.bashrc"; then
        echo "✓ Found: ${FEATURE_NAMES[$i]}"
    else
        echo "❌ FAILED: Missing feature: ${FEATURE_NAMES[$i]}"
        echo "   Pattern: ${FEATURES_TO_CHECK[$i]}"
        rm -rf "${TEST_HOME}"
        exit 1
    fi
done

# Test 5: Verify idempotency
echo ""
echo "Test 5: Testing idempotency (running script twice)..."
bash "${USER_SCRIPT}" > /tmp/test_output_2.txt 2>&1

if grep -qE "Already configured|⏭️" /tmp/test_output_2.txt; then
    echo "✓ PASSED: Script is idempotent (detects existing features)"
else
    echo "❌ FAILED: Script should detect already configured features"
    cat /tmp/test_output_2.txt
    rm -rf "${TEST_HOME}"
    exit 1
fi

# Test 6: Verify backup was created
echo ""
echo "Test 6: Checking backup creation..."
if ls "${TEST_HOME}"/.bashrc.backup.* 1> /dev/null 2>&1; then
    BACKUP_COUNT=$(ls "${TEST_HOME}"/.bashrc.backup.* 2>/dev/null | wc -l)
    echo "✓ PASSED: Backup files created (${BACKUP_COUNT} backups found)"
else
    echo "❌ FAILED: No backup files found"
    rm -rf "${TEST_HOME}"
    exit 1
fi

# Test 7: Verify no duplicate entries after multiple runs
echo ""
echo "Test 7: Verifying no duplicate entries..."
PS1_COUNT=$(grep -c 'export PS1=.*01;31m.*@.*01;34m' "${TEST_HOME}/.bashrc")
if [ "${PS1_COUNT}" -eq 1 ]; then
    echo "✓ PASSED: No duplicate entries (colorful PS1 appears once)"
else
    echo "❌ FAILED: Found ${PS1_COUNT} instances of colorful PS1 (should be 1)"
    rm -rf "${TEST_HOME}"
    exit 1
fi

# Test 8: Verify script output is user-friendly
echo ""
echo "Test 8: Checking script output format..."
OUTPUT=$(bash "${USER_SCRIPT}" 2>&1)
if echo "${OUTPUT}" | grep -q "User Bashrc Feature Enhancement Script" && \
   echo "${OUTPUT}" | grep -q "enhancement complete"; then
    echo "✓ PASSED: Script provides user-friendly output"
else
    echo "❌ FAILED: Script output should be user-friendly"
    rm -rf "${TEST_HOME}"
    exit 1
fi

# Cleanup
rm -rf "${TEST_HOME}"
rm -f /tmp/test_output_2.txt

echo ""
echo "================================================"
echo "✨ All tests passed successfully!"
echo "================================================"
echo ""
echo "Summary:"
echo "  ✓ Script files are valid and executable"
echo "  ✓ Root requirement check works"
echo "  ✓ User script executes successfully"
echo "  ✓ All features are added correctly"
echo "  ✓ Script is idempotent"
echo "  ✓ Backups are created"
echo "  ✓ No duplicate entries"
echo "  ✓ User-friendly output"
echo ""
