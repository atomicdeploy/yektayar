#!/bin/bash

# enable-user-bashrc-features.sh
# Script to enable interesting features from the custom ~/.bashrc
# This script modifies the user's ~/.bashrc to add custom features

set -e

echo "================================================"
echo "User Bashrc Feature Enhancement Script"
echo "================================================"
echo ""

# Backup existing bashrc
if [ -f ~/.bashrc ]; then
    echo "📋 Backing up existing ~/.bashrc to ~/.bashrc.backup.$(date +%Y%m%d_%H%M%S)"
    cp ~/.bashrc ~/.bashrc.backup.$(date +%Y%m%d_%H%M%S)
fi

# Function to add configuration if not already present
add_if_missing() {
    local marker="$1"
    local content="$2"
    
    if ! grep -q "$marker" ~/.bashrc 2>/dev/null; then
        echo "$content" >> ~/.bashrc
        return 0
    else
        return 1
    fi
}

echo ""
echo "🎨 Enabling colorful PS1 prompt..."
if add_if_missing "# Custom colorful prompt" "
# Custom colorful prompt
force_color_prompt=yes
if [ -n \"\$force_color_prompt\" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
        export PS1=\"\[\e]0;\u@\h: \w\a\]\n\[\e[01;31m\]\u\[\e[01;32m\]@\[\e[01;34m\]\h \[\e[01;33m\]\w\n\[\e[01;35m\]\\\\$\[\e[0m\] \"
    fi
fi"; then
    echo "  ✅ Colorful PS1 prompt enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📁 Enabling enhanced ls aliases..."
if add_if_missing "# Enhanced ls aliases" "
# Enhanced ls aliases
if [ -x /usr/bin/dircolors ]; then
    alias ls='ls -GNhp --color=auto'
    alias ll='ls -alh'     # use a long listing format
    alias l.='ls -d .*'    # show hidden files
    alias la='ls -A'
    alias l='ls -CFh'
    alias lsd=\"ls -alF | grep /$\"
fi"; then
    echo "  ✅ Enhanced ls aliases enabled"
else
    echo "  ⏭️  Already configured"
fi

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
echo "🛠️  Enabling utility aliases..."
if add_if_missing "# Utility aliases for disk space" "
# Utility aliases for disk space and folders
alias diskspace=\"du -S | sort -n -r | more\"
alias folders=\"find . -maxdepth 1 -type d -print | xargs du -sk | sort -rn\"

# Colored ip command
alias ip='ip -c'"; then
    echo "  ✅ Utility aliases enabled (diskspace, folders, ip)"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🌐 Enabling UTF-8 less charset..."
if add_if_missing "export LESSCHARSET=UTF-8" "
# Make less output UTF-8 to the terminal
export LESSCHARSET=UTF-8"; then
    echo "  ✅ UTF-8 less charset enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📜 Enabling bash history improvements..."
if add_if_missing "# Enhanced history" "
# Enhanced history settings
HISTCONTROL=ignoredups:ignorespace
shopt -s histappend
HISTSIZE=1000
HISTFILESIZE=2000"; then
    echo "  ✅ History improvements enabled"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "================================================"
echo "✨ User bashrc feature enhancement complete!"
echo "================================================"
echo ""
echo "⚠️  Note: Changes will take effect in new terminal sessions"
echo "    or run: source ~/.bashrc"
echo ""
