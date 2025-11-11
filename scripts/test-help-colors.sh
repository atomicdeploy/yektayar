#!/bin/bash
# Test script to verify that the help message displays colors correctly
# and does not contain literal escape sequences

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MANAGE_ENV_SCRIPT="${SCRIPT_DIR}/manage-env.sh"

echo "Testing manage-env.sh help output..."
echo ""

# Test 1: Verify help output doesn't contain literal \033 escape sequences
echo "Test 1: Checking for literal escape sequences..."
HELP_OUTPUT=$("${MANAGE_ENV_SCRIPT}" help 2>&1)
if echo "${HELP_OUTPUT}" | grep -q '\\033'; then
    echo "❌ FAILED: Found literal escape sequences in help output"
    exit 1
else
    echo "✓ PASSED: No literal escape sequences found"
fi

# Test 2: Verify help output contains actual ANSI escape codes (when piped through cat -A)
echo ""
echo "Test 2: Checking for ANSI escape codes..."
if "${MANAGE_ENV_SCRIPT}" help 2>&1 | cat -A | grep -q '\^\[\['; then
    echo "✓ PASSED: ANSI escape codes are present"
else
    echo "❌ FAILED: ANSI escape codes not found"
    exit 1
fi

# Test 3: Verify help output contains expected content
echo ""
echo "Test 3: Checking for expected content..."
EXPECTED_SECTIONS=(
    "YektaYar .env Management Script"
    "Usage:"
    "Commands:"
    "Examples:"
    "Notes:"
)

for section in "${EXPECTED_SECTIONS[@]}"; do
    if echo "${HELP_OUTPUT}" | grep -q "${section}"; then
        echo "✓ Found: ${section}"
    else
        echo "❌ FAILED: Missing section: ${section}"
        exit 1
    fi
done

# Test 4: Verify all help flags work
echo ""
echo "Test 4: Testing help command variations..."
for flag in "help" "--help" "-h" ""; do
    if [ -z "$flag" ]; then
        output=$("${MANAGE_ENV_SCRIPT}" 2>&1)
    else
        output=$("${MANAGE_ENV_SCRIPT}" "$flag" 2>&1)
    fi
    if echo "$output" | grep -q "YektaYar .env Management Script"; then
        echo "✓ Flag '${flag}' works correctly"
    else
        echo "❌ FAILED: Flag '${flag}' does not show help"
        exit 1
    fi
done

echo ""
echo "================================"
echo "All tests passed! ✓"
echo "================================"
