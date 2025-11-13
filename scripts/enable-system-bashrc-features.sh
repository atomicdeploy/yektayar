#!/bin/bash

# enable-system-bashrc-features.sh
# Script to enable interesting features from the custom /etc/bash.bashrc
# This script modifies the system-wide /etc/bash.bashrc (requires root)

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
    echo "📋 Backing up existing /etc/bash.bashrc to /etc/bash.bashrc.backup.$(date +%Y%m%d_%H%M%S)"
    cp /etc/bash.bashrc /etc/bash.bashrc.backup.$(date +%Y%m%d_%H%M%S)
fi

# Function to add configuration if not already present
add_if_missing() {
    local marker="$1"
    local content="$2"
    
    if ! grep -q "$marker" /etc/bash.bashrc 2>/dev/null; then
        echo "$content" >> /etc/bash.bashrc
        return 0
    else
        return 1
    fi
}

echo ""
echo "⌨️  Enabling Ctrl-Backspace word deletion..."
if add_if_missing "# Bind Ctrl-Backspace" "
# Bind Ctrl-Backspace to remove a word
stty werase '^H'"; then
    echo "  ✅ Ctrl-Backspace binding enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📦 Enabling nala wrapper for apt..."
echo "  ℹ️  Note: This requires 'nala' to be installed (apt install nala)"
if add_if_missing "# use nala instead of apt" "
# use nala instead of apt
apt() {
  command nala \"\$@\"
}

sudo() {
  if [ \"\$1\" = \"apt\" ]; then
    shift
      command sudo nala \"\$@\"
    else
        command sudo \"\$@\"
  fi
}"; then
    echo "  ✅ Nala wrapper enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🛠️  Enabling global utility aliases..."
if add_if_missing "# aliases - ports" "
# aliases
alias ports='netstat -tulnap' # show open ports"; then
    echo "  ✅ Ports alias enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🔧 Enabling settitle function..."
if add_if_missing "settitle ()" "
settitle ()
{
        echo -ne \"\e]2;\$@\a\e]1;\$@\a\";
}"; then
    echo "  ✅ settitle() function enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🕵️  Enabling incognito mode alias..."
if add_if_missing "alias incognito=" "
alias incognito=\"unset HISTFILE; truncate -s 0 /var/log/lastlog\""; then
    echo "  ✅ Incognito alias enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📊 Enabling human-readable df/du..."
if add_if_missing "# human readable sizes" "
# human readable sizes
alias df='df -h'
alias du='du -h'"; then
    echo "  ✅ Human-readable df/du enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📂 Enabling take() function (mkdir + cd)..."
if add_if_missing "function take ()" "
# Create and then enter a directory
function take () {
        case \"\$1\" in /*) :;; *) set -- \"./\$1\";; esac
        mkdir -p \"\$1\"; cd \"\$1\";
}"; then
    echo "  ✅ take() function enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "⬇️  Enabling aria2c download alias..."
echo "  ℹ️  Note: This requires 'aria2' to be installed (apt install aria2)"
if add_if_missing "alias a2c=" "
alias a2c=\"aria2c -R -c -s 16 -x 16 -k 1M -j 1 --no-file-allocation-limit=128M --check-certificate=true\""; then
    echo "  ✅ aria2c alias (a2c) enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🚀 Enabling thefuck integration..."
echo "  ℹ️  Note: This requires 'thefuck' to be installed (apt install thefuck)"
if add_if_missing "eval \$(thefuck --alias" "
eval \$(thefuck --alias fuck)"; then
    echo "  ✅ thefuck integration enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🎼 Enabling Composer superuser permission..."
if add_if_missing "COMPOSER_ALLOW_SUPERUSER" "
export COMPOSER_ALLOW_SUPERUSER=1"; then
    echo "  ✅ Composer superuser permission enabled"
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
echo "🔗 Adding /root/.local/bin to PATH..."
if add_if_missing "export PATH=\"\$PATH:/root/.local/bin\"" "
export PATH=\"\$PATH:/root/.local/bin\""; then
    echo "  ✅ PATH updated with /root/.local/bin"
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
