# Development Tools Installation Guide

This guide covers the automated installation of development tools for the YektaYar platform.

## Quick Start

```bash
# Install all development tools automatically
./scripts/install-dev-tools.sh

# Enable enhanced bashrc features with development aliases
./scripts/enable-user-bashrc-features.sh

# (Optional) Enable system-wide features
sudo ./scripts/enable-system-bashrc-features.sh
```

## What Gets Installed

### Core Tools
- **Git** - Version control
- **curl/wget** - Download tools
- **jq** - JSON processor
- **build-essential** - C/C++ compilers for native modules

### Node.js Ecosystem
- **Node.js 24.x** - JavaScript runtime
- **npm** - Package manager (comes with Node.js)
- **Bun 1.x** - Fast JavaScript runtime (for backend)

### Database
- **PostgreSQL Client (psql)** - Database CLI
- **libpq-dev** - PostgreSQL development files
- **pgcli** (optional) - Enhanced PostgreSQL CLI

### Optional Tools
- **GitHub CLI (gh)** - Interact with GitHub from CLI
- **Docker** - Container runtime
- **Docker Compose** - Multi-container orchestration

## Development Aliases

After running `enable-user-bashrc-features.sh`, you'll have these YektaYar-specific aliases:

### Project Navigation
```bash
yekta          # Go to YektaYar root directory
yb             # Go to backend package
ya             # Go to admin-panel package
ym             # Go to mobile-app package
```

### Development Commands
```bash
ydev           # Start all services in dev mode
ydev-backend   # Start backend dev server (requires bun)
ydev-admin     # Start admin panel dev server
ydev-mobile    # Start mobile app dev server
ybuild         # Build all packages
ylint          # Lint all packages
```

### Git Shortcuts
```bash
gs             # git status
gp             # git pull
gc             # git commit
gd             # git diff
gl             # git log --oneline -10
gco            # git checkout
```

### Database
```bash
ydb            # Connect to yektayar database with psql
ydbcli         # Connect with pgcli (enhanced interface)
```

### JSON Tools
```bash
json           # Format JSON with jq
jsonc          # Format JSON with colors and pager
```

### Docker
```bash
dps            # docker ps
dpa            # docker ps -a
di             # docker images
dex            # docker exec -it
dlogs          # docker logs -f
```

### npm Shortcuts
```bash
ni             # npm install
nid            # npm install --save-dev
nig            # npm install -g
nr             # npm run
nt             # npm test
nls            # npm list --depth=0
```

## Fallback Behavior

All aliases and functions include fallback checks using `command -v`:

```bash
# Example: Only create alias if tool is installed
if command -v bun >/dev/null 2>&1; then
    alias ydev-backend="cd ~/Projects/YektaYar/packages/backend && bun run dev"
fi
```

This means:
- ✅ Bashrc **never breaks** if a tool is missing
- ✅ Aliases only created when tools are available
- ✅ Safe to use scripts even with partial installations

## Manual Installation

If you prefer to install tools manually:

### Node.js & npm
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

### PostgreSQL Client
```bash
sudo apt-get install -y postgresql-client libpq-dev
```

### Optional Tools
```bash
# GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list
sudo apt-get update
sudo apt-get install -y gh

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# pgcli
pip3 install --user pgcli
```

## Verifying Installation

After installation, verify all tools:

```bash
# Run the requirements checker
npm run check:requirements

# Or check manually
node --version     # Should be >= 20.19.0
npm --version      # Should be >= 9.0.0
bun --version      # Should be >= 1.0.0
psql --version     # Should be >= 15.0
git --version
jq --version
docker --version   # Optional
gh --version       # Optional
```

## Project Setup After Installation

1. **Install project dependencies:**
   ```bash
   cd ~/Projects/YektaYar
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   ./scripts/manage-env.sh init
   ./scripts/manage-env.sh edit
   ```

3. **Setup database:**
   ```bash
   sudo ./scripts/setup-postgresql.sh
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Bun not found after installation
```bash
# Add to your current session
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Or restart your terminal
```

### Docker permission denied
```bash
# Add user to docker group (requires re-login)
sudo usermod -aG docker $USER
# Then log out and back in
```

### npm/Node.js version too old
```bash
# Update Node.js
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Update npm
npm install -g npm@latest
```

### PostgreSQL connection issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l

# Setup database
sudo ./scripts/setup-postgresql.sh
```

## CI/CD Considerations

The installation script is designed for development environments. For CI/CD:

1. Use Docker containers with pre-installed tools
2. Cache `node_modules` between builds
3. Use `npm ci` instead of `npm install`
4. Set environment variables in CI configuration

## Additional Resources

- [YektaYar Development Guide](../DEVELOPMENT.md)
- [Environment Variables Guide](../ENV-GUIDE.md)
- [Quick Start Guide](../QUICK-START.md)
- [PostgreSQL Setup](setup-postgresql.sh)
