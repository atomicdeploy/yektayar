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

# Create a minimal bashrc
cat > "${TEST_HOME}/.bashrc" << 'EOF'
# Test bashrc
[ -z "$PS1" ] && return
EOF

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
    "Custom colorful prompt"
    "Enhanced ls aliases"
    "Ctrl-Backspace"
    "diskspace"
    "LESSCHARSET"
    "HISTCONTROL"
)

for feature in "${FEATURES_TO_CHECK[@]}"; do
    if grep -q "${feature}" "${TEST_HOME}/.bashrc"; then
        echo "✓ Found: ${feature}"
    else
        echo "❌ FAILED: Missing feature: ${feature}"
        rm -rf "${TEST_HOME}"
        exit 1
    fi
done

# Test 5: Verify idempotency
echo ""
echo "Test 5: Testing idempotency (running script twice)..."
bash "${USER_SCRIPT}" > /tmp/test_output_2.txt 2>&1

if grep -q "Already configured" /tmp/test_output_2.txt; then
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
PROMPT_COUNT=$(grep -c "Custom colorful prompt" "${TEST_HOME}/.bashrc")
if [ "${PROMPT_COUNT}" -eq 1 ]; then
    echo "✓ PASSED: No duplicate entries (prompt marker appears once)"
else
    echo "❌ FAILED: Found ${PROMPT_COUNT} instances of prompt marker (should be 1)"
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
