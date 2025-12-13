# YektaYar Platform - Complete Installation Guide

This guide provides step-by-step instructions for installing and configuring the YektaYar platform on a fresh system.

## 📋 Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Quick Start (Automated)](#quick-start-automated)
- [Manual Installation](#manual-installation)
- [Post-Installation](#post-installation)
- [Troubleshooting](#troubleshooting)
- [Scripts Reference](#scripts-reference)

---

## 🎯 Overview

YektaYar is a mental health care platform built as a monorepo with:
- **Backend API** (Elysia.js with Bun runtime)
- **Admin Panel** (Vue.js 3)
- **Mobile App** (Ionic + Capacitor)
- **Shared Code** (TypeScript utilities and types)

This installation guide covers setting up the complete stack on Ubuntu/Debian systems.

---

## 💻 System Requirements

### Minimum Requirements
- **OS:** Ubuntu 20.04+ or Debian 11+
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 20 GB available
- **Network:** Internet connection

### Software Requirements (automatically installed)
- **Node.js** 20.19.0+ (required)
- **npm** 9.0.0+ (required)
- **Bun** 1.0.0+ (required for backend)
- **PostgreSQL** 15+ (required for database)

### Optional Tools
- **pgAdmin** or **Adminer** (database management UI)
- **Apache**, **Nginx**, or **Caddy** (web server/reverse proxy)

---

## 🚀 Quick Start (Automated)

The fastest way to install YektaYar is using our automated installation script:

```bash
# Clone the repository
git clone https://github.com/atomicdeploy/yektayar.git
cd yektayar

# Run the complete installation script
./scripts/install-complete.sh
```

This script will:
1. ✅ Check system requirements
2. ✅ Install Bun runtime
3. ✅ Initialize environment configuration
4. ✅ Install and configure PostgreSQL
5. ✅ Install all dependencies
6. ✅ Build all packages
7. ✅ Setup systemd services
8. ✅ Start all services

### Customizing the Installation

You can customize the installation by setting environment variables:

```bash
# Install with database management UI
INSTALL_DB_UI=true ./scripts/install-complete.sh

# Install with Nginx web server
INSTALL_WEBSERVER=true WEBSERVER_TYPE=nginx ./scripts/install-complete.sh

# Skip systemd setup (for development)
SETUP_SYSTEMD=false ./scripts/install-complete.sh

# Full installation with all optional components
INSTALL_DEV_TOOLS=true \
INSTALL_DB_UI=true \
INSTALL_WEBSERVER=true \
WEBSERVER_TYPE=nginx \
RUN_TESTS=true \
./scripts/install-complete.sh
```

After installation completes, your services will be running on:
- **Backend API:** http://localhost:3000
- **Admin Panel:** http://localhost:5173
- **Mobile App:** http://localhost:8100

---

## 🔧 Manual Installation

If you prefer to install components individually or need more control:

### Step 1: Install Prerequisites

```bash
cd yektayar

# Check system requirements
node scripts/check-requirements.js
```

### Step 2: Install Bun Runtime

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (for current session)
export PATH="$HOME/.bun/bin:$PATH"

# Verify installation
bun --version
```

### Step 3: Initialize Environment

```bash
# Create .env file from template
./scripts/manage-env.sh init

# Edit .env file with your settings
./scripts/manage-env.sh edit
# OR manually edit:
nano .env
```

### Step 4: Install PostgreSQL

```bash
# Install and configure PostgreSQL
sudo ./scripts/setup-postgresql.sh
```

This script will:
- Install PostgreSQL 15+ if not present
- Create database and user
- Generate secure credentials
- Update .env file automatically
- Save credentials to `postgresql-credentials.txt`

**Optional:** Install database management UI:

```bash
# Install pgAdmin (full-featured)
sudo ./scripts/setup-pgadmin.sh

# OR install Adminer (lightweight)
sudo ./scripts/setup-adminer.sh
```

### Step 5: Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Verify installation
node scripts/check-requirements.js
```

### Step 6: Build Applications

```bash
# Build all packages
npm run build

# OR build individually:
npm run build:backend
npm run build:admin
npm run build:mobile
```

### Step 7: Setup Systemd Services

```bash
# Install systemd service files
sudo DEPLOY_USER=$(whoami) DEPLOY_GROUP=$(whoami) \
  PROJECT_PATH=$(pwd) ./scripts/install-services.sh

# Enable services to start on boot
sudo ./scripts/manage-services.sh enable all

# Start all services
sudo ./scripts/manage-services.sh start all

# Check status
sudo ./scripts/manage-services.sh status all
```

### Step 8: Install Web Server (Optional)

Choose one:

```bash
# Apache
sudo ./scripts/install-apache.sh

# Nginx
sudo ./scripts/install-nginx.sh

# Caddy (with automatic HTTPS)
sudo ./scripts/install-caddy.sh
```

---

## ✅ Post-Installation

### Verify Installation

```bash
# Test backend API
curl http://localhost:3000

# Test admin panel
curl -I http://localhost:5173

# Test mobile app
curl -I http://localhost:8100

# View logs
sudo ./scripts/manage-services.sh logs backend
```

### Access Applications

- **Backend API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api-docs
  - Username: `admin` (check .env for SWAGGER_USERNAME)
  - Password: `change_this_secure_password` (check .env for SWAGGER_PASSWORD)
- **Admin Panel:** http://localhost:5173
- **Mobile App:** http://localhost:8100

### Default Credentials

Check `postgresql-credentials.txt` for database credentials.

Default admin user (created during first run):
- Email: `admin@yektayar.ir`
- Password: Check backend logs or database

### Service Management

```bash
# Start services
sudo ./scripts/manage-services.sh start all

# Stop services
sudo ./scripts/manage-services.sh stop all

# Restart services
sudo ./scripts/manage-services.sh restart all

# Check status
sudo ./scripts/manage-services.sh status

# View logs
sudo ./scripts/manage-services.sh logs backend
sudo ./scripts/manage-services.sh logs admin
sudo ./scripts/manage-services.sh logs mobile
```

### Environment Configuration

```bash
# Show current configuration (secrets masked)
./scripts/manage-env.sh show

# Validate configuration
./scripts/manage-env.sh validate

# Test database connection
./scripts/manage-env.sh test

# Generate secure secret
./scripts/manage-env.sh generate-secret
```

---

## 🔍 Troubleshooting

### Services Won't Start

```bash
# Check service logs
sudo journalctl -u yektayar-backend -n 50
sudo journalctl -u yektayar-admin-panel -n 50
sudo journalctl -u yektayar-mobile-app -n 50

# Check file logs
tail -f /var/log/yektayar/backend.log
tail -f /var/log/yektayar/backend-error.log
```

### Database Connection Issues

```bash
# Test database connection
./scripts/manage-env.sh test

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo journalctl -u postgresql -n 50

# Manual database connection test
psql -h localhost -U yektayar_user -d yektayar
```

### Permission Issues

```bash
# Fix log directory permissions
sudo chown -R $(whoami):$(whoami) /var/log/yektayar

# Fix project directory permissions (if needed)
sudo chown -R $(whoami):$(whoami) $(pwd)
```

### Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Check what's using port 5173
sudo lsof -i :5173

# Check what's using port 8100
sudo lsof -i :8100

# Kill process if needed
sudo kill -9 <PID>
```

### Build Failures

```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Rebuild individual packages
npm run build:backend
npm run build:admin
npm run build:mobile
```

### Bun Not Found

```bash
# Ensure Bun is in PATH
export PATH="$HOME/.bun/bin:$PATH"

# Verify Bun installation
which bun
bun --version

# Reinstall Bun if needed
curl -fsSL https://bun.sh/install | bash
```

---

## 📚 Scripts Reference

All scripts are located in the `scripts/` directory:

### Installation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `install-complete.sh` | Complete automated installation | `./scripts/install-complete.sh` |
| `install-dev-tools.sh` | Install development tools | `./scripts/install-dev-tools.sh --yes` |
| `install-services.sh` | Install systemd services | `sudo ./scripts/install-services.sh` |
| `install-apache.sh` | Install Apache config | `sudo ./scripts/install-apache.sh` |
| `install-nginx.sh` | Install Nginx config | `sudo ./scripts/install-nginx.sh` |
| `install-caddy.sh` | Install Caddy config | `sudo ./scripts/install-caddy.sh` |

### Setup Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-postgresql.sh` | Setup PostgreSQL database | `sudo ./scripts/setup-postgresql.sh` |
| `setup-pgadmin.sh` | Install pgAdmin | `sudo ./scripts/setup-pgadmin.sh` |
| `setup-adminer.sh` | Install Adminer | `sudo ./scripts/setup-adminer.sh` |
| `setup-android.sh` | Setup Android build env | `./scripts/setup-android.sh` |

### Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `manage-services.sh` | Manage systemd services | `sudo ./scripts/manage-services.sh [command] [service]` |
| `manage-env.sh` | Manage environment config | `./scripts/manage-env.sh [command]` |
| `dev-runner.sh` | Run services in dev mode | `./scripts/dev-runner.sh [service] [--detached]` |

### Utility Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-requirements.js` | Check system requirements | `node scripts/check-requirements.js` |
| `install-dependencies.js` | Install workspace deps | `node scripts/install-dependencies.js` |
| `db-cli.sh` | Connect to database | `./scripts/db-cli.sh` |
| `db-health.sh` | Check database health | `./scripts/db-health.sh check` |
| `list-routes.mjs` | List application routes | `npm run list-routes` |
| `validate-i18n-keys.mjs` | Validate translations | `npm run validate:i18n` |

### Testing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `socketio-tui.js` | Test Socket.IO connections | `npm run socketio:test` |
| `pollination-ai-tui.js` | Test AI integration | `npm run ai:test` |
| `verify-session-fix.sh` | Verify session handling | `./scripts/verify-session-fix.sh` |

---

## 📖 Additional Resources

- **Main README:** [README.md](README.md)
- **Setup Guide:** [docs/guides/SETUP.md](docs/guides/SETUP.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Development Guide:** [DEVELOPMENT.md](DEVELOPMENT.md)
- **Scripts Documentation:** [scripts/README.md](scripts/README.md)
- **Environment Guide:** [ENV-GUIDE.md](ENV-GUIDE.md)
- **Deployment Guide:** [docs/deployment/UBUNTU-24-DEPLOYMENT.md](docs/deployment/UBUNTU-24-DEPLOYMENT.md)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `sudo ./scripts/manage-services.sh logs backend`
3. Check service status: `sudo ./scripts/manage-services.sh status`
4. Review the [scripts/README.md](scripts/README.md) for detailed script documentation
5. Open an issue on GitHub

---

**Last Updated:** December 2025  
**Version:** 0.1.0
