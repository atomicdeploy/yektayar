#!/bin/bash

# enable-system-bashrc-features.sh
# Script to enable interesting features from the custom /etc/bash.bashrc
# This script modifies the system-wide /etc/bash.bashrc (requires root)
# Features are inserted in the appropriate locations to match the organization
# of the original custom bashrc file.

set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

echo "================================================"
echo "System-Wide Bashrc Feature Enhancement Script"
echo "================================================"
echo ""

# Backup existing system bashrc
if [ -f /etc/bash.bashrc ]; then
    BACKUP_NAME="/etc/bash.bashrc.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📋 Backing up existing /etc/bash.bashrc to $BACKUP_NAME"
    cp /etc/bash.bashrc "$BACKUP_NAME"
fi

# Function to check if a pattern exists in bashrc
pattern_exists() {
    grep -q "$1" /etc/bash.bashrc 2>/dev/null
}

# Function to insert content after a specific pattern
insert_after() {
    local pattern="$1"
    local content="$2"
    local temp_file
    temp_file=$(mktemp)
    
    awk -v pat="$pattern" -v cont="$content" '
        {print}
        $0 ~ pat && !found {print cont; found=1}
    ' /etc/bash.bashrc > "$temp_file"
    
    mv "$temp_file" /etc/bash.bashrc
}

echo ""
echo "⌨️  Enabling Ctrl-Backspace word deletion..."
if ! pattern_exists "stty werase"; then
    # Add after checkwinsize
    insert_after "shopt -s checkwinsize" "\n# Bind Ctrl-Backspace to remove a word\nstty werase '^H'"
    echo "  ✅ Ctrl-Backspace binding enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📖 Enabling bash completion..."
if grep -q "^#if ! shopt -oq posix; then" /etc/bash.bashrc 2>/dev/null; then
    sed -i 's/^#if ! shopt -oq posix; then/if ! shopt -oq posix; then/' /etc/bash.bashrc
    sed -i 's/^#  if \[ -f \/usr\/share\/bash-completion\/bash_completion \]; then/  if [ -f \/usr\/share\/bash-completion\/bash_completion ]; then/' /etc/bash.bashrc
    sed -i 's/^#    \. \/usr\/share\/bash-completion\/bash_completion/    . \/usr\/share\/bash-completion\/bash_completion/' /etc/bash.bashrc
    sed -i 's/^#  elif \[ -f \/etc\/bash_completion \]; then/  elif [ -f \/etc\/bash_completion ]; then/' /etc/bash.bashrc
    sed -i 's/^#    \. \/etc\/bash_completion/    . \/etc\/bash_completion/' /etc/bash.bashrc
    sed -i 's/^#  fi/  fi/' /etc/bash.bashrc
    sed -i 's/^#fi/fi/' /etc/bash.bashrc
    echo "  ✅ Bash completion enabled"
else
    echo "  ⏭️  Already configured or not found"
fi

echo ""
echo "📦 Enabling nala wrapper for apt (with fallback)..."
if ! pattern_exists "# use nala instead of apt"; then
    # Add after command_not_found_handle function with fallback
    insert_after "^fi$" '\n# use nala instead of apt (fallback to apt if nala not installed)\napt() {\n  if command -v nala >/dev/null 2>&1; then\n    command nala "$@"\n  else\n    command apt "$@"\n  fi\n}\n\nsudo() {\n  if [ "$1" = "apt" ]; then\n    shift\n    if command -v nala >/dev/null 2>&1; then\n      command sudo nala "$@"\n    else\n      command sudo apt "$@"\n    fi\n  else\n    command sudo "$@"\n  fi\n}'
    echo "  ✅ Nala wrapper enabled with fallback to apt"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📝 Adding global development section header..."
if ! pattern_exists "### Place global development bashrc"; then
    # Add section header
    insert_after "^sudo()" '\n###\n### Place global development bashrc\n###'
    echo "  ✅ Section header added"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🛠️  Enabling global utility aliases..."
if ! pattern_exists "alias ports="; then
    insert_after "### Place global development bashrc" '\n# aliases\nalias ports='"'"'netstat -tulnap'"'"' # show open ports'
    echo "  ✅ Ports alias enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🔧 Enabling settitle function..."
if ! pattern_exists "settitle ()"; then
    insert_after "alias ports=" '\n\nsettitle ()\n{\n        echo -ne "\\e]2;$@\\a\\e]1;$@\\a";\n}'
    echo "  ✅ settitle() function enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🕵️  Enabling incognito mode alias..."
if ! pattern_exists "alias incognito="; then
    insert_after "settitle ()" '\n\nalias incognito="unset HISTFILE; truncate -s 0 /var/log/lastlog"'
    echo "  ✅ Incognito alias enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📊 Enabling human-readable df/du..."
if ! pattern_exists "# human readable sizes"; then
    insert_after "alias incognito=" '\n\n# human readable sizes\nalias df='"'"'df -h'"'"'\nalias du='"'"'du -h'"'"
    echo "  ✅ Human-readable df/du enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📂 Enabling take() function (mkdir + cd)..."
if ! pattern_exists "function take ()"; then
    insert_after "alias du=" '\n\n# Create and then enter a directory\nfunction take () {\n        case "$1" in /*) :;; *) set -- "./$1";; esac\n        mkdir -p "$1"; cd "$1";\n}'
    echo "  ✅ take() function enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "⬇️  Enabling aria2c download alias (with fallback)..."
if ! pattern_exists "# aria2c download alias"; then
    insert_after "function take ()" '\n\n# aria2c download alias (only if aria2 is installed)\nif command -v aria2c >/dev/null 2>&1; then\n    alias a2c="aria2c -R -c -s 16 -x 16 -k 1M -j 1 --no-file-allocation-limit=128M --check-certificate=true"\nfi'
    echo "  ✅ aria2c alias (a2c) enabled with fallback"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🔗 Adding /root/.local/bin to PATH..."
if ! pattern_exists 'export PATH=.*:/root/.local/bin'; then
    insert_after "# aria2c download alias" '\n\nexport PATH="$PATH:/root/.local/bin"'
    echo "  ✅ PATH updated with /root/.local/bin"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🚀 Enabling thefuck integration (with fallback)..."
if ! pattern_exists "# thefuck integration"; then
    insert_after 'export PATH=.*:/root/.local/bin' '\n\n# thefuck integration (only if installed)\nif command -v thefuck >/dev/null 2>&1; then\n    eval $(thefuck --alias fuck)\nfi'
    echo "  ✅ thefuck integration enabled with fallback"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🎼 Enabling Composer superuser permission..."
if ! pattern_exists "COMPOSER_ALLOW_SUPERUSER"; then
    insert_after "# thefuck integration" '\n\nexport COMPOSER_ALLOW_SUPERUSER=1'
    echo "  ✅ Composer superuser permission enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "================================================"
echo "✨ System-wide bashrc feature enhancement complete!"
echo "================================================"
echo ""
echo "⚠️  Note: Changes will take effect in new terminal sessions"
echo "    or run: source /etc/bash.bashrc"
echo ""
echo "📝 Optional dependencies to install:"
echo "    - nala: sudo apt install nala"
echo "    - aria2: sudo apt install aria2"
echo "    - thefuck: sudo apt install thefuck (or pip3 install thefuck)"
echo ""
