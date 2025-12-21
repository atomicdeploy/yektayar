# Bashrc Feature Enhancement Scripts

This directory contains scripts to enable interesting bash features based on custom configurations compared to vanilla Ubuntu defaults.

## Overview

These scripts analyze and implement enhancements found in customized bashrc files that improve the command-line experience. They add useful aliases, functions, and configurations while maintaining compatibility with existing setups.

## Scripts

### 1. `enable-user-bashrc-features.sh`

Enhances the user's `~/.bashrc` with productivity features.

**Features Added:**
- 🎨 **Colorful PS1 Prompt** - Multi-line colored prompt showing user@host and current directory
- 📁 **Enhanced ls Aliases** - Improved ls commands with human-readable sizes and colors
  - `ls` - Enhanced with `-GNhp --color=auto` flags
  - `ll` - Long listing with all files (`-alh`)
  - `l.` - Show only hidden files
  - `lsd` - Show only directories
- ⌨️ **Ctrl-Backspace Binding** - Delete word backward with Ctrl+Backspace
- 🛠️ **Utility Aliases**
  - `diskspace` - Show disk usage sorted by size
  - `folders` - Show folder sizes in current directory
  - `ip` - Colored IP command output
- 🌐 **UTF-8 Less** - Proper UTF-8 character display in less
- 📜 **History Improvements** - Better history management (ignoredups, ignorespace)

**Usage:**
```bash
# Run as regular user (no sudo needed)
bash ./enable-user-bashrc-features.sh

# Apply changes immediately
source ~/.bashrc
```

**Safety:**
- Automatically backs up existing `~/.bashrc` before modifications
- Only adds features that don't already exist (idempotent)
- Non-destructive - preserves all existing configurations

---

### 2. `enable-system-bashrc-features.sh`

Enhances the system-wide `/etc/bash.bashrc` with advanced features for all users.

**Features Added:**
- ⌨️ **Ctrl-Backspace Binding** - System-wide word deletion keybinding
- 📦 **Nala Wrapper** - Automatically use `nala` instead of `apt` (requires nala installation)
- 🛠️ **Global Aliases**
  - `ports` - Show open network ports (`netstat -tulnap`)
  - `df` - Human-readable disk free (`df -h`)
  - `du` - Human-readable disk usage (`du -h`)
  - `incognito` - Clear history and last login records
- 🔧 **settitle()** - Function to set terminal window title
- 📂 **take()** - Create directory and cd into it in one command
- ⬇️ **a2c** - Alias for aria2c with optimized download settings (requires aria2)
- 🚀 **thefuck** - Command correction tool integration (requires thefuck)
- 🎼 **Composer Superuser** - Allow Composer to run as root
- 📖 **Bash Completion** - Enable programmable completion features
- 🔗 **PATH Enhancement** - Add `/root/.local/bin` to PATH

**Usage:**
```bash
# Must run as root
sudo bash ./enable-system-bashrc-features.sh

# Apply changes immediately (as root)
source /etc/bash.bashrc
```

**Safety:**
- Automatically backs up existing `/etc/bash.bashrc` before modifications
- Checks for root privileges before running
- Only adds features that don't already exist (idempotent)
- Non-destructive - preserves all existing configurations

**Optional Dependencies:**
```bash
# Install optional tools for full functionality
sudo apt update
sudo apt install nala aria2 bash-completion

# Install thefuck
sudo apt install python3-pip
pip3 install thefuck
```

---

## Feature Comparison

### vs Vanilla Ubuntu ~/.bashrc

| Feature | Vanilla | Enhanced | Benefit |
|---------|---------|----------|---------|
| PS1 Prompt | Basic green/blue | Multi-line colorful | Better visual hierarchy |
| `ls` flags | `--color=auto` | `-GNhp --color=auto` | Human sizes, no groups, trailing slash |
| ls aliases | Basic (`ll`, `la`, `l`) | Extended (+ `l.`, `lsd`) | More specialized views |
| Ctrl-Backspace | Not configured | `stty werase '^H'` | Better editing experience |
| Utility aliases | Basic | + diskspace, folders, ip | Quick disk analysis |
| History | Basic | ignoredups + ignorespace | Cleaner history |

### vs Vanilla Ubuntu /etc/bash.bashrc

| Feature | Vanilla | Enhanced | Benefit |
|---------|---------|----------|---------|
| Bash Completion | Commented out | Enabled | Auto-complete commands |
| Package Manager | apt | nala (wrapper) | Better apt interface |
| Network Tools | - | `ports` alias | Quick port checking |
| Directory Tools | - | `take()` function | Faster workflow |
| Download Tools | - | `a2c` alias | Optimized downloads |
| Error Correction | - | thefuck integration | Fix typos easily |
| Terminal Title | - | `settitle()` function | Better organization |
| Privacy | - | `incognito` mode | Quick history clear |

---

## Examples

### User Features

```bash
# After running enable-user-bashrc-features.sh

# Beautiful multi-line colored prompt
user@hostname ~/projects/myapp
$ 

# Enhanced ls with human-readable sizes
$ ls
file1.txt  dir1/  file2.txt

# Show only directories
$ lsd
drwxr-xr-x dir1/
drwxr-xr-x dir2/

# Find what's taking disk space
$ diskspace
512000  ./node_modules
256000  ./build
128000  ./src
...

# Show folder sizes
$ folders
512M    ./node_modules
256M    ./build
128M    ./src
```

### System Features

```bash
# After running enable-system-bashrc-features.sh

# Use nala automatically instead of apt
$ apt update
# Actually runs: nala update (with better UI)

# Create and enter directory in one command
$ take test/new/directory
$ pwd
/current/path/test/new/directory

# Check open ports quickly
$ ports
tcp    0.0.0.0:22    0.0.0.0:*    LISTEN    1234/sshd
tcp    0.0.0.0:80    0.0.0.0:*    LISTEN    5678/nginx

# Set terminal title
$ settitle "Production Server"

# Download with optimized settings
$ a2c https://example.com/largefile.iso
# Uses aria2c with 16 connections, resume support, etc.

# Fix command typos
$ git sttaus
git sttaus - command not found
$ fuck
git status [enter]
```

---

## Rollback

If you need to restore the original configuration:

```bash
# User bashrc
cp ~/.bashrc.backup.YYYYMMDD_HHMMSS ~/.bashrc
source ~/.bashrc

# System bashrc (as root)
sudo cp /etc/bash.bashrc.backup.YYYYMMDD_HHMMSS /etc/bash.bashrc
source /etc/bash.bashrc
```

---

## Notes

1. **Idempotent**: Both scripts can be run multiple times safely - they won't duplicate configurations
2. **Backups**: Original files are always backed up with timestamps
3. **Dependencies**: Some features require additional packages (nala, aria2, thefuck) - scripts will note these
4. **Compatibility**: Designed for Ubuntu/Debian-based systems
5. **Non-destructive**: Scripts only add features, never remove existing ones

---

## Testing

The scripts have been designed to be safe and non-destructive:

1. They check for existing configurations before adding
2. They create timestamped backups
3. They use markers to avoid duplicate entries
4. They provide clear feedback on what was added/skipped

---

## Contributing

To add new features:

1. Identify the feature in a custom bashrc
2. Compare to vanilla Ubuntu default
3. Add detection logic to check if already present
4. Add the feature using `add_if_missing()` function
5. Document the feature in this README

---

## License

These scripts are part of the YektaYar project and follow the same license.
