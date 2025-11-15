#!/bin/bash

# enable-user-bashrc-features.sh
# Script to enable interesting features from the custom ~/.bashrc
# This script modifies the user's ~/.bashrc to add custom features
# Features are inserted in the appropriate locations to match the organization
# of the original custom bashrc file.

set -e

echo "================================================"
echo "User Bashrc Feature Enhancement Script"
echo "================================================"
echo ""

# Backup existing bashrc
if [ -f ~/.bashrc ]; then
    BACKUP_NAME="$HOME/.bashrc.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📋 Backing up existing ~/.bashrc to $BACKUP_NAME"
    cp ~/.bashrc "$BACKUP_NAME"
fi

# Function to check if a pattern exists in bashrc
pattern_exists() {
    grep -q "$1" ~/.bashrc 2>/dev/null
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
    ' ~/.bashrc > "$temp_file"
    
    mv "$temp_file" ~/.bashrc
}

# Function to replace a line matching a pattern
replace_line() {
    local pattern="$1"
    local replacement="$2"
    sed -i "s|$pattern|$replacement|" ~/.bashrc
}

echo ""
echo "📜 Enabling bash history improvements..."
if ! pattern_exists "HISTCONTROL=ignoredups:ignorespace"; then
    if pattern_exists "HISTCONTROL=ignoreboth"; then
        # Replace ignoreboth with ignoredups:ignorespace
        replace_line "HISTCONTROL=ignoreboth" "HISTCONTROL=ignoredups:ignorespace"
        echo "  ✅ History control updated to ignoredups:ignorespace"
    elif pattern_exists "^HISTCONTROL="; then
        # Replace existing HISTCONTROL
        sed -i 's/^HISTCONTROL=.*/HISTCONTROL=ignoredups:ignorespace/' ~/.bashrc
        echo "  ✅ History control updated to ignoredups:ignorespace"
    else
        # Add after the return statement for non-interactive shells
        insert_after '^\[ -z "\$PS1" \] && return' "\n# don't put duplicate lines in the history. See bash(1) for more options\n# ... or force ignoredups and ignorespace\nHISTCONTROL=ignoredups:ignorespace"
        echo "  ✅ History control enabled"
    fi
else
    echo "  ⏭️  History settings already configured"
fi

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
echo "🎨 Enabling colorful PS1 prompt..."
# Check if custom PS1 is already set
if ! grep -q '\[\\e\[01;31m\]\\u\[\\e\[01;32m\]@' ~/.bashrc; then
    # Set force_color_prompt if not already set
    if ! pattern_exists "^force_color_prompt=yes"; then
        # Find and uncomment or add force_color_prompt=yes
        if pattern_exists "^#force_color_prompt=yes"; then
            sed -i 's/^#force_color_prompt=yes/force_color_prompt=yes/' ~/.bashrc
            echo "  ✅ Enabled force_color_prompt"
        else
            # Add after the xterm-color line
            sed -i '/xterm-color.*color_prompt=yes/a force_color_prompt=yes' ~/.bashrc
            echo "  ✅ Added force_color_prompt=yes"
        fi
    fi
    
    # Replace the colored PS1 line (line with \\033[01;32m])
    if grep -q "PS1='\${debian_chroot:+(\$debian_chroot)}.*033\[01;32m" ~/.bashrc; then
        # Use line-based replacement for the specific colored PS1
        sed -i "/PS1='\${debian_chroot:+(\$debian_chroot)}.*033\[01;32m.*033\[01;34m/c\    export PS1=\"\\\[\\\e]0;\\\u@\\\h: \\\w\\\a\\\]\\\\n\\\[\\\e[01;31m\\\]\\\u\\\[\\\e[01;32m\\\]@\\\[\\\e[01;34m\\\]\\\h \\\[\\\e[01;33m\\\]\\\w\\\\n\\\[\\\e[01;35m\\\]\\\\\\\\\$\\\[\\\e[0m\\\] \"" ~/.bashrc
        echo "  ✅ Colorful PS1 prompt enabled"
    else
        echo "  ⚠️  Could not find standard colored PS1 to replace"
    fi
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "📁 Enabling enhanced ls aliases..."
if ! pattern_exists "alias ls='ls -GNhp --color=auto'"; then
    # Replace ls alias in dircolors block
    if pattern_exists "alias ls='ls --color=auto'"; then
        sed -i "s|alias ls='ls --color=auto'|alias ls='ls -GNhp --color=auto'|" ~/.bashrc
        echo "  ✅ Enhanced ls alias (added -GNhp flags)"
    fi
    
    # Add dir alias if not present
    if ! pattern_exists "alias dir="; then
        insert_after "alias ls='ls" "\n    alias dir='dir --color=auto'"
    fi
    
    # Add ip alias in the dircolors block
    if ! pattern_exists "alias ip='ip -c'"; then
        insert_after "alias egrep='egrep --color=auto'" "\n\n    alias ip='ip -c'"
        echo "  ✅ Added colored ip alias"
    fi
else
    echo "  ⏭️  Already configured"
fi

# Update ls command aliases
if ! pattern_exists "alias ll='ls -alh'"; then
    if pattern_exists "alias ll="; then
        sed -i "s|alias ll=.*|alias ll='ls -alh'     # use a long listing format|" ~/.bashrc
        echo "  ✅ Updated ll alias"
    fi
fi

if ! pattern_exists "alias l.='ls -d"; then
    insert_after "^alias ll=" "alias l.='ls -d .*'    # show hidden files"
    echo "  ✅ Added l. alias for hidden files"
fi

if ! pattern_exists "alias l='ls -CFh'"; then
    if pattern_exists "alias l='ls -CF'"; then
        sed -i "s|alias l='ls -CF'|alias l='ls -CFh'|" ~/.bashrc
        echo "  ✅ Updated l alias with -h flag"
    fi
fi

if ! pattern_exists "alias lsd="; then
    insert_after "^alias l=" 'alias lsd="ls -alF | grep /$"'
    echo "  ✅ Added lsd alias for directories only"
fi

echo ""
echo "🛠️  Enabling utility aliases..."
if ! pattern_exists "alias diskspace="; then
    insert_after "alias alert=" '\n# This is GOLD for finding out what is taking so much space on your drives!\nalias diskspace="du -S | sort -n -r | more"\n\n# Show me the size (sorted) of only the folders in this directory\nalias folders="find . -maxdepth 1 -type d -print | xargs du -sk | sort -rn"'
    echo "  ✅ Added diskspace and folders aliases"
else
    echo "  ⏭️  Already configured"
fi

echo ""
echo "🌐 Enabling UTF-8 less charset..."
if ! pattern_exists "export LESSCHARSET="; then
    # Add before bash_aliases section
    insert_after "alias folders=" '\n# Make less output UTF-8 to the terminal\nexport LESSCHARSET=UTF-8'
    echo "  ✅ UTF-8 less charset enabled"
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
