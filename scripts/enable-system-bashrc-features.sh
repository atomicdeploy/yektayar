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
echo "📦 Enabling nala wrapper for apt and adding development section..."
if ! pattern_exists "# use nala instead of apt"; then
    # Add after command_not_found_handle function - insert everything at once in correct order
    insert_after "^fi$" '\n# use nala instead of apt\napt() {\n  command nala "$@"\n}\n\nsudo() {\n  if [ "$1" = "apt" ]; then\n    shift\n      command sudo nala "$@"\n    else\n        command sudo "$@"\n  fi\n}\n\n###\n### Place global development bashrc\n###'
    echo "  ✅ Nala wrapper and development section enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🛠️  Adding global development features..."
if ! pattern_exists "alias ports="; then
    # Insert all development features at once after the section header to avoid ordering issues
    insert_after "### Place global development bashrc" '\n\n# aliases\nalias ports='"'"'netstat -tulnap'"'"' # show open ports\n\nsettitle ()\n{\n        echo -ne "\\e]2;$@\\a\\e]1;$@\\a";\n}\n\nalias incognito="unset HISTFILE; truncate -s 0 /var/log/lastlog"\n\n# human readable sizes\nalias df='"'"'df -h'"'"'\nalias du='"'"'du -h'"'"'\n\n# Create and then enter a directory\nfunction take () {\n        case "$1" in /*) :;; *) set -- "./$1";; esac\n        mkdir -p "$1"; cd "$1";\n}\n\nalias a2c="aria2c -R -c -s 16 -x 16 -k 1M -j 1 --no-file-allocation-limit=128M --check-certificate=true"\n\nexport PATH="$PATH:$HOME/.local/bin"\n\neval $(thefuck --alias fuck)\n\nexport COMPOSER_ALLOW_SUPERUSER=1'
    echo "  ✅ All development features enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "⌨️  Configuring system-wide inputrc..."
# Check if /etc/inputrc exists and configure it
if [ ! -f /etc/inputrc ]; then
    echo "# System-wide readline configuration" > /etc/inputrc
    echo "  ✅ Created /etc/inputrc"
fi

# Add Ctrl-Delete and Ctrl-Backspace if not already present
if ! grep -q "shell-kill-word" /etc/inputrc 2>/dev/null; then
    echo "" >> /etc/inputrc
    echo "# Ctrl-Delete: delete next word" >> /etc/inputrc
    echo '"\e[3;5~": shell-kill-word' >> /etc/inputrc
    echo "  ✅ Added Ctrl-Delete binding to /etc/inputrc"
else
    echo "  ⏭️  Ctrl-Delete already configured"
fi

if ! grep -q "shell-backward-kill-word" /etc/inputrc 2>/dev/null; then
    echo "" >> /etc/inputrc
    echo "# Ctrl-Backspace: delete previous word" >> /etc/inputrc
    echo '"\C-H": shell-backward-kill-word' >> /etc/inputrc
    echo "  ✅ Added Ctrl-Backspace binding to /etc/inputrc"
else
    echo "  ⏭️  Ctrl-Backspace already configured"
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
