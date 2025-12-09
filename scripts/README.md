# YektaYar Deployment Scripts

This directory contains scripts and service configurations for deploying and managing YektaYar services.

## Contents

### Telegram Bot Management

#### `manage-telegram-bot.sh`

Manages Telegram bot configuration and setup for YektaYar platform.

**Usage:**
```bash
./scripts/manage-telegram-bot.sh [command]
```

**Commands:**
- `setup` - Interactive setup for bot token and admin chat ID
- `config` - Show current configuration
- `test` - Test bot connection
- `test-message` - Send a test message to admin chat
- `help` - Show help message

**What it does:**
- Configures Telegram bot token from BotFather
- Sets up admin chat ID for notifications
- Tests bot connectivity
- Sends test notifications
- Updates `.env` file with bot configuration

**Features:**
- ✅ Interactive setup wizard
- ✅ Configuration validation
- ✅ Connection testing
- ✅ Test message sending
- ✅ Secure token handling

**Examples:**
```bash
# Interactive setup
./scripts/manage-telegram-bot.sh setup

# Show current configuration
./scripts/manage-telegram-bot.sh config

# Test bot connection
./scripts/manage-telegram-bot.sh test

# Send test notification
./scripts/manage-telegram-bot.sh test-message
```

**NPM Scripts:**
```bash
# Use via npm for convenience
npm run telegram:setup
npm run telegram:config
npm run telegram:test
npm run telegram:test-message
```

**Environment Variables Configured:**
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `TELEGRAM_ADMIN_CHAT_ID` - Admin chat for notifications
- `TELEGRAM_CHANNEL_ID` - Optional channel for broadcasts
- `TELEGRAM_WEBHOOK_URL` - Optional webhook for production

**Documentation:**
- [Telegram Bot Setup Guide](../docs/TELEGRAM-BOT.md) - Complete setup and usage documentation
### Route Management

#### `list-routes.mjs`

Lists all page URLs/routes for the mobile-app and admin-panel applications dynamically.

**Usage:**
```bash
npm run list-routes [app]
```

**Options:**
- `mobile-app` - List routes for the mobile app only
- `admin-panel` - List routes for the admin panel only
- `all` - List routes for all apps (default)
- `--help` or `-h` - Show help message

**Examples:**
```bash
# Show all routes for both applications
npm run list-routes

# Show routes for mobile app only
npm run list-routes mobile-app

# Show routes for admin panel only
npm run list-routes admin-panel

# Show help
npm run list-routes -- --help
```

**Features:**
- ✅ Dynamically parses TypeScript router configuration files
- ✅ Handles nested routes and children correctly
- ✅ Shows route path, name, title (meta), and redirects
- ✅ Filters out layout-only routes
- ✅ No hardcoded values - completely dynamic

**Output includes:**
- Route path
- Route name (if defined)
- Page title from meta (if defined)
- Redirect target (if it's a redirect route)
- Total count of routes per application

### Environment Management

#### `manage-env.sh`

Unified environment configuration management script for the YektaYar platform.

**Usage:**
```bash
./scripts/manage-env.sh [command]
```

**Commands:**
- `init` - Create `.env` file from template (for initial setup)
- `show` - Display current `.env` configuration with masked secrets
- `validate` - Validate that all required variables are properly set
- `test` - Test configuration including database connectivity
- `edit` - Interactive TUI mode for editing environment values
- `generate-secret` - Generate a secure random secret for SESSION_SECRET or JWT_SECRET
- `help` - Show help message

**What it does:**
- Creates unified `.env` file at project root from `.env.example`
- Validates all required environment variables are set
- Detects placeholder/default values in secure variables
- Tests database connectivity (requires `psql`)
- Provides interactive TUI mode using `whiptail` or `dialog`
- Generates secure random secrets for authentication
- Masks sensitive values when displaying configuration

**Features:**
- ✅ Unified `.env` for all packages (backend, admin-panel, mobile-app)
- ✅ Interactive TUI mode for easy configuration
- ✅ Validation of required vs optional variables
- ✅ Security checks for placeholder values
- ✅ Database connectivity testing
- ✅ Secure secret generation
- ✅ Masked display of sensitive values

**Examples:**
```bash
# Initial setup - creates .env from template
./scripts/manage-env.sh init

# Show current configuration
./scripts/manage-env.sh show

# Validate configuration
./scripts/manage-env.sh validate

# Test configuration with database check
./scripts/manage-env.sh test

# Interactive mode (requires whiptail or dialog)
./scripts/manage-env.sh edit

# Generate a secure secret
./scripts/manage-env.sh generate-secret
```

**Environment Variables Managed:**
- Backend: `PORT`, `HOST`, `NODE_ENV`
- Database: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Security: `SESSION_SECRET`, `JWT_SECRET`, `JWT_EXPIRY`
- CORS: `CORS_ORIGIN`
- WebSocket: `WEBSOCKET_PORT`
- Rate Limiting: `RATE_LIMIT_WINDOW`, `RATE_LIMIT_MAX_REQUESTS`
- Frontend: `API_BASE_URL`, `VITE_ENVIRONMENT`

### Service Files (`services/`)

Systemd service unit files for running YektaYar services as system services:

- `yektayar-backend.service` - Backend API Server
- `yektayar-admin-panel.service` - Admin Panel Web Server
- `yektayar-mobile-app.service` - Mobile App Web Server

### Database Setup Scripts

#### `setup-postgresql.sh`

Installs and configures PostgreSQL database for YektaYar platform.

**Usage:**
```bash
sudo ./scripts/setup-postgresql.sh
```

**What it does:**
- Installs PostgreSQL 15+ (if not already installed)
- Creates YektaYar database and user
- Configures database permissions
- Generates secure password
- Updates `.env` file with database credentials
- Saves credentials to `postgresql-credentials.txt`

**Environment Variables:**
- `DB_NAME` - Database name (default: `yektayar`)
- `DB_USER` - Database user (default: `yektayar_user`)
- `DB_PASSWORD` - Database password (auto-generated if not provided)
- `PG_VERSION` - PostgreSQL version to install (default: `15`)
- `ALLOW_REMOTE_ACCESS` - Enable remote connections (default: `false`)

**Example with custom configuration:**
```bash
sudo DB_NAME=mydb DB_USER=myuser ALLOW_REMOTE_ACCESS=true ./scripts/setup-postgresql.sh
```

#### `setup-pgadmin.sh`

Installs pgAdmin 4 for PostgreSQL database management (similar to phpMyAdmin for MySQL).

**Usage:**
```bash
sudo ./scripts/setup-pgadmin.sh
```

**What it does:**
- Installs pgAdmin 4 (web or desktop mode)
- Configures web interface on Apache/Nginx
- Creates admin user account
- Saves access credentials to `pgadmin-credentials.txt`

**Environment Variables:**
- `PGADMIN_EMAIL` - Admin email (default: `admin@yektayar.local`)
- `PGADMIN_PASSWORD` - Admin password (auto-generated if not provided)
- `PGADMIN_PORT` - Web interface port (default: `5050`)
- `INSTALL_MODE` - Installation mode: `web` or `desktop` (default: `web`)

**Access:**
- Web Interface: `http://localhost/pgadmin4`
- Login with email and password from credentials file

#### `setup-adminer.sh`

Installs Adminer for lightweight database management (alternative to pgAdmin).

**Usage:**
```bash
sudo ./scripts/setup-adminer.sh
```

**What it does:**
- Downloads and installs Adminer (single-file PHP application)
- Configures web server (Apache, Nginx, or standalone)
- Sets up access on specified port
- Saves access information to `adminer-credentials.txt`

**Environment Variables:**
- `ADMINER_DIR` - Installation directory (default: `/var/www/adminer`)
- `ADMINER_PORT` - Web interface port (default: `8080`)
- `WEB_SERVER` - Web server to use: `apache2`, `nginx`, or `standalone` (auto-detected)

**Access:**
- Web Interface: `http://localhost:8080`
- Select PostgreSQL and login with database credentials

**Features:**
- Lightweight (single PHP file)
- Supports multiple database systems
- Similar interface to phpMyAdmin
- Export/Import data, execute SQL queries

### Application Scripts

#### `install-apache.sh`

Installs Apache web server configurations for all YektaYar services with separate subdomains.

**Usage:**
```bash
sudo ./scripts/install-apache.sh
```

**What it does:**
- Installs Apache if not already installed
- Enables required Apache modules (proxy, proxy_http, proxy_wstunnel, ssl, rewrite, headers)
- Copies configuration files for all subdomains:
  - `api.yektayar.ir` → Backend API (port 3000)
  - `panel.yektayar.ir` → Admin Panel (port 5173)
  - `app.yektayar.ir` → Mobile App (port 8100)
  - `static.yektayar.ir` → Static files hosting
- Creates static files directory at `/var/www/yektayar/static`
- Enables all sites
- Tests and restarts Apache

**Next steps after installation:**
1. Configure DNS records for your domains
2. Obtain SSL certificates using Certbot:
   ```bash
   sudo certbot --apache -d api.yektayar.ir
   sudo certbot --apache -d panel.yektayar.ir
   sudo certbot --apache -d app.yektayar.ir
   sudo certbot --apache -d static.yektayar.ir
   ```

#### `install-nginx.sh`

Installs Nginx web server configurations for all YektaYar services with separate subdomains.

**Usage:**
```bash
sudo ./scripts/install-nginx.sh
```

**What it does:**
- Installs Nginx if not already installed
- Copies configuration files for all subdomains:
  - `api.yektayar.ir` → Backend API (port 3000)
  - `panel.yektayar.ir` → Admin Panel (port 5173)
  - `app.yektayar.ir` → Mobile App (port 8100)
  - `static.yektayar.ir` → Static files hosting
- Creates static files directory at `/var/www/yektayar/static`
- Enables all sites (creates symlinks)
- Tests and restarts Nginx

**Next steps after installation:**
1. Configure DNS records for your domains
2. Obtain SSL certificates using Certbot:
   ```bash
   sudo certbot --nginx -d api.yektayar.ir
   sudo certbot --nginx -d panel.yektayar.ir
   sudo certbot --nginx -d app.yektayar.ir
   sudo certbot --nginx -d static.yektayar.ir
   ```

#### `install-caddy.sh`

Installs Caddy web server with automatic HTTPS for all YektaYar services.

**Usage:**
```bash
sudo ./scripts/install-caddy.sh
```

**What it does:**
- Installs Caddy if not already installed
- Copies configuration files for all subdomains:
  - `api.yektayar.ir` → Backend API (port 3000)
  - `panel.yektayar.ir` → Admin Panel (port 5173)
  - `app.yektayar.ir` → Mobile App (port 8100)
  - `static.yektayar.ir` → Static files hosting
- Creates static files directory at `/var/www/yektayar/static`
- Creates log directory at `/var/log/caddy`
- Prompts for Let's Encrypt notification email
- Tests and starts Caddy

**Features:**
- ✨ **Automatic HTTPS** - No manual SSL certificate setup required!
- 🔄 Automatic certificate renewal
- 🚀 HTTP/2 and HTTP/3 support
- 🔌 WebSocket support included

**Next steps after installation:**
1. Configure DNS records for your domains
2. Wait for DNS propagation (5-30 minutes)
3. Caddy will automatically obtain SSL certificates!

#### `compare-webserver-configs.sh`

Compares installed webserver configurations with repository versions and alerts users about differences.

**Usage:**
```bash
./scripts/compare-webserver-configs.sh
```

**What it does:**
- Detects which webservers are installed (Apache, Nginx, Caddy)
- Compares installed configuration files with repository versions
- Shows differences between configs in unified diff format
- Provides step-by-step instructions to update configurations
- Warns about outdated or missing configurations

**Features:**
- ✅ Automatic webserver detection
- ✅ Interactive diff viewing
- ✅ Color-coded output for easy reading
- ✅ Step-by-step update instructions
- ✅ Highlights important changes (e.g., WebSocket improvements)

**When to run:**
- After pulling updates from the repository
- Before and after system updates
- When troubleshooting configuration issues
- When migrating to a new server
- After modifying webserver configs

**Example output:**
```
✅ Detected webservers: nginx 
=========================================
Checking nginx configurations
=========================================
✅ api.yektayar.ir.conf - Up to date
❌ panel.yektayar.ir.conf - Differs from repository
  
Would you like to see the differences? [y/N]:
```

**Important notes:**
- The script is read-only and safe to run
- It does not modify any system files
- Update instructions are provided for manual review
- Recent updates include improved WebSocket support for Nginx

#### `install-services.sh`

Installs systemd service files and sets up logging infrastructure.

**Usage:**
```bash
sudo ./scripts/install-services.sh
```

**What it does:**
- Creates log directory at `/var/log/yektayar`
- Installs service files to `/etc/systemd/system/`
- Configures proper permissions
- Reloads systemd daemon

**Environment Variables:**
- `DEPLOY_USER` - User to run services as (default: `deploy`)
- `DEPLOY_GROUP` - Group to run services as (default: `deploy`)
- `PROJECT_PATH` - Full path to project root (default: current directory parent)

**Example with custom configuration:**
```bash
sudo DEPLOY_USER=www-data PROJECT_PATH=/opt/yektayar ./scripts/install-services.sh
```

#### `manage-services.sh`

Manages YektaYar systemd services with easy-to-use commands.

**Usage:**
```bash
sudo ./scripts/manage-services.sh {start|stop|restart|status|enable|disable|logs} [service]
```

**Commands:**
- `start` - Start service(s)
- `stop` - Stop service(s)
- `restart` - Restart service(s)
- `status` - Show service(s) status
- `enable` - Enable service(s) to start on boot
- `disable` - Disable service(s) from starting on boot
- `logs` - Show service logs (real-time with `-f`)

**Services:**
- `backend` - Backend API server (port 3000)
- `admin` - Admin Panel web server (port 5173)
- `mobile` - Mobile App web server (port 8100)
- `all` - All services (default)

**Examples:**
```bash
# Start all services
sudo ./scripts/manage-services.sh start

# Start only backend
sudo ./scripts/manage-services.sh start backend

# Restart all services
sudo ./scripts/manage-services.sh restart all

# Show status of all services
sudo ./scripts/manage-services.sh status

# Enable backend to start on boot
sudo ./scripts/manage-services.sh enable backend

# Show backend logs in real-time
sudo ./scripts/manage-services.sh logs backend
```

#### `dev-runner.sh`

Runs services in development mode (foreground or detached background processes).

**Usage:**
```bash
./scripts/dev-runner.sh {backend|admin|mobile|all|stop} [--detached]
```

**Services:**
- `backend` - Backend API server with hot-reload
- `admin` - Admin Panel dev server with HMR
- `mobile` - Mobile App dev server with HMR
- `all` - All services (requires `--detached`)
- `stop` - Stop all detached services

**Modes:**
- Foreground (default) - Run in current terminal
- Detached (`--detached`) - Run in background

**Examples:**
```bash
# Run backend in foreground with hot-reload
./scripts/dev-runner.sh backend

# Run all services in background
./scripts/dev-runner.sh all --detached

# Stop all detached services
./scripts/dev-runner.sh stop

# View logs of detached services
tail -f /tmp/yektayar-backend.log
tail -f /tmp/yektayar-admin.log
tail -f /tmp/yektayar-mobile.log
```

## Deployment Guide

### Database Setup (Required First)

Before deploying the application, set up PostgreSQL database:

1. **Install and configure PostgreSQL:**
   ```bash
   sudo ./scripts/setup-postgresql.sh
   ```
   
   This will:
   - Install PostgreSQL 15+
   - Create database and user
   - Generate secure credentials
   - Update `.env` file automatically

2. **Install database management UI (optional but recommended):**
   
   Choose one or both:
   
   **pgAdmin 4** (Full-featured, similar to phpMyAdmin):
   ```bash
   sudo ./scripts/setup-pgadmin.sh
   ```
   Access at: `http://localhost/pgadmin4`
   
   **Adminer** (Lightweight, single-file):
   ```bash
   sudo ./scripts/setup-adminer.sh
   ```
   Access at: `http://localhost:8080`

3. **Review database credentials:**
   ```bash
   cat postgresql-credentials.txt
   ```

### Application Setup

1. **Clone the repository:**
   ```bash
   cd /home/deploy/Projects
   git clone https://github.com/atomicdeploy/yektayar.git YektaYar
   cd YektaYar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   # Edit .env file with your configuration
   nano packages/backend/.env
   ```

4. **Build frontend packages:**
   ```bash
   npm run build:admin
   npm run build:mobile
   ```

5. **Install Bun (for backend):**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   ```

### Service Installation

1. **Install systemd services:**
   ```bash
   sudo ./scripts/install-services.sh
   ```

2. **Enable services to start on boot:**
   ```bash
   sudo ./scripts/manage-services.sh enable all
   ```

3. **Start services:**
   ```bash
   sudo ./scripts/manage-services.sh start all
   ```

4. **Check service status:**
   ```bash
   sudo ./scripts/manage-services.sh status
   ```

### Development Workflow

1. **Run backend in development mode:**
   ```bash
   ./scripts/dev-runner.sh backend
   ```

2. **Run all services in background:**
   ```bash
   ./scripts/dev-runner.sh all --detached
   ```

3. **Make changes to code** - Services will auto-reload

4. **View logs:**
   ```bash
   tail -f /tmp/yektayar-backend.log
   ```

5. **Stop services:**
   ```bash
   ./scripts/dev-runner.sh stop
   ```

## Service Configuration

### Ports

- Backend API: `3000` (configurable via `PORT` env var)
- Admin Panel: `5173` (Vite preview server)
- Mobile App: `8100` (Ionic dev server)

### Logs

**Production (systemd services):**
- Location: `/var/log/yektayar/`
- Files:
  - `backend.log` / `backend-error.log`
  - `admin-panel.log` / `admin-panel-error.log`
  - `mobile-app.log` / `mobile-app-error.log`

**Development (detached mode):**
- Location: `/tmp/`
- Files:
  - `yektayar-backend.log`
  - `yektayar-admin.log`
  - `yektayar-mobile.log`

### Systemd Journals

View service logs using journalctl:
```bash
# Backend logs
sudo journalctl -u yektayar-backend -f

# All services
sudo journalctl -u yektayar-backend -u yektayar-admin-panel -u yektayar-mobile-app -f

# Logs since last boot
sudo journalctl -u yektayar-backend --since "today"
```

## Troubleshooting

### Service won't start

1. Check service status:
   ```bash
   sudo systemctl status yektayar-backend
   ```

2. View detailed logs:
   ```bash
   sudo journalctl -u yektayar-backend -n 50
   ```

3. Check configuration:
   ```bash
   sudo systemctl cat yektayar-backend
   ```

4. Verify dependencies:
   ```bash
   # Check if Bun is installed
   which bun
   
   # Check if dependencies are installed
   cd packages/backend && ls -la node_modules/
   ```

### Port already in use

1. Check what's using the port:
   ```bash
   sudo lsof -i :3000
   ```

2. Stop conflicting service or change port in `.env`

### Permission issues

1. Ensure proper ownership:
   ```bash
   sudo chown -R deploy:deploy /home/deploy/Projects/YektaYar
   sudo chown -R deploy:deploy /var/log/yektayar
   ```

2. Check file permissions:
   ```bash
   ls -la /home/deploy/Projects/YektaYar/packages/backend
   ```

### Backend crashes on startup

1. Check environment variables:
   ```bash
   cat packages/backend/.env
   ```

2. Ensure database is running:
   ```bash
   sudo systemctl status postgresql
   ```

3. Test backend manually:
   ```bash
   cd packages/backend
   bun src/index.ts
   ```

## Security Notes

- Service files include security hardening options
- Services run as non-root user (default: `deploy`)
- Private temp directories for each service
- Read-only system directories
- Limited file access via `ProtectSystem` and `ReadWritePaths`

## Web Server Configuration (Recommended for Production)

For production deployments, use a reverse proxy web server (Apache, Nginx, or Caddy) instead of exposing services directly.

### Quick Installation

Use the provided installation scripts:

```bash
# For Apache (with manual SSL setup)
sudo ./scripts/install-apache.sh

# For Nginx (with manual SSL setup)
sudo ./scripts/install-nginx.sh

# For Caddy (with automatic HTTPS)
sudo ./scripts/install-caddy.sh
```

These scripts will configure:
- `api.yektayar.ir` → Backend API (port 3000)
- `panel.yektayar.ir` → Admin Panel (port 5173)
- `app.yektayar.ir` → Mobile App (port 8100)
- `static.yektayar.ir` → Static files hosting

### Features

All configurations include:
- ✅ HTTPS/SSL support (automatic with Caddy, manual with Apache/Nginx)
- ✅ HTTP to HTTPS redirection
- ✅ WebSocket support for real-time features and HMR
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Proper request forwarding and headers
- ✅ Access and error logging

### Detailed Documentation

For detailed configuration options, troubleshooting, and manual setup instructions, see:
- [**config/webserver/README.md**](../config/webserver/README.md) - Comprehensive web server configuration guide
- [**docs/UBUNTU-24-DEPLOYMENT.md**](../docs/UBUNTU-24-DEPLOYMENT.md) - Full deployment guide

### Manual Configuration (Legacy)

If you prefer manual configuration, here's a basic Nginx example:

```nginx
# /etc/nginx/sites-available/yektayar

# Backend API
server {
    listen 80;
    server_name api.yektayar.ir;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.yektayar.ir;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Mobile App
server {
    listen 80;
    server_name app.yektayar.ir;
    
    location / {
        proxy_pass http://localhost:8100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/yektayar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Additional Resources

- [Systemd Service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [Bun Documentation](https://bun.sh/docs)
- [Elysia.js Documentation](https://elysiajs.com/)
- [Vue.js Deployment Guide](https://vuejs.org/guide/best-practices/production-deployment.html)

## Android APK Analysis

### `analyze-apk.sh`

A comprehensive script to analyze Android APK files and extract detailed information about the application.

**Usage:**
```bash
./scripts/analyze-apk.sh <path-to-apk>
```

**Example:**
```bash
# Analyze the debug APK
./scripts/analyze-apk.sh packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk

# Using the npm script
npm run android:analyze packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

**What it analyzes:**

1. **File Information:**
   - File path and size
   - MD5 and SHA256 checksums for integrity verification

2. **Package Information:**
   - Package name (e.g., `com.yektayar.app`)
   - App name and version
   - Minimum and target SDK versions

3. **Application Details:**
   - App version name (user-visible)
   - App version code (internal)
   - Package identifier

4. **Permissions:**
   - List of all requested permissions
   - Helps identify potential privacy or security concerns

5. **Activities:**
   - List of all activities in the app
   - Useful for understanding app structure

6. **Native Libraries:**
   - Lists CPU architectures supported
   - Shows included native code (.so files)

7. **APK Structure:**
   - Total file count
   - Number of DEX files (compiled code)
   - Assets and resources count

8. **Signing Information:**
   - Certificate details (if available)
   - Signature validation status

**Requirements:**
- `aapt` (Android Asset Packaging Tool) - available in Android SDK build-tools
- `unzip` - for basic APK inspection
- `jarsigner` (optional) - for signature verification

**Example output:**
```
========================================
Android APK Analysis
========================================

📄 File Information:
  Path: app-debug.apk
  Size: 6.5M
  MD5: a1b2c3d4e5f6...
  SHA256: 1a2b3c4d5e6f...

📦 Package Information:
  package: name='com.yektayar.app' versionCode='1' versionName='0.1.0'
  sdkVersion:'24'
  targetSdkVersion:'34'

🏷️  Application Details:
  App Name: YektaYar
  Package Name: com.yektayar.app
  Version Name: 0.1.0
  Version Code: 1

🔐 Permissions:
  - android.permission.INTERNET
  - android.permission.ACCESS_NETWORK_STATE
  ...

🎯 Activities:
  - com.yektayar.app.MainActivity
  - com.getcapacitor.BridgeActivity
  ...
```

**Integration with CI/CD:**
The script is automatically used in the GitHub Actions workflow to analyze built APKs and post the analysis as a comment on pull requests.

## Testing Scripts

> **Note:** Test scripts have been moved to `tests/scripts/` directory. See [tests/scripts/](../tests/scripts/) for all testing utilities.

### `test-socketio.sh`

An interactive TUI script for testing Socket.IO connectivity and functionality with the YektaYar backend server.

**Location:** `tests/scripts/test-socketio.sh`

**Usage:**
```bash
./tests/scripts/test-socketio.sh [backend-url]
```

**Default backend URL:** `http://localhost:3000`

**What it does:**
- ✅ Checks backend health
- ✅ Acquires a session token
- ✅ Establishes Socket.IO connection
- ✅ Tests all Socket.IO commands (ping, status, info, echo, message)
- ✅ Provides interactive mode for manual testing
- ✅ Beautiful TUI with colors and progress indicators

**Requirements:**
- Backend must be running (supports both Bun and Node.js runtimes)
- `curl` for HTTP requests
- `node` for Socket.IO client
- `python3` for JSON formatting (optional)

**Example:**
```bash
# Test local backend
./tests/scripts/test-socketio.sh

# Test remote backend
./tests/scripts/test-socketio.sh https://api.yektayar.com
```

**Socket.IO Commands Tested:**
1. **ping/pong** - Connection health check
2. **status** - Server and connection status
3. **info** - Detailed server information
4. **echo** - Message echo for testing
5. **message** - Custom message handling

**Features:**
- Automated test suite with all commands
- Interactive mode for manual testing
- Clear visual feedback with emojis and colors
- Detailed JSON response display
- Automatic cleanup of temporary files

**See also:** [Socket.IO Guide](../docs/SOCKETIO-GUIDE.md) for complete documentation.

---

## Dependency Testing

### `test-dependencies.js`

A test script that verifies dependency compatibility across all workspaces to prevent version conflicts.

**Usage:**
```bash
npm run test:deps
```

**What it checks:**

1. **Version consistency**: Warns if the same dependency has different versions across workspaces
2. **Critical compatibility**: Ensures critical dependencies like `vite` and `@vitejs/plugin-vue` are compatible with each other

**Example output:**
```
⚠️  Version mismatch for "vue-tsc":
  packages/admin-panel: ^2.0.0
  packages/mobile-app: ^3.1.3
✅ All dependency compatibility checks passed!
```

**When to run:**
- Before committing changes to `package.json` files
- After resolving merge conflicts in dependencies
- As part of CI/CD pipeline to catch dependency issues early

**Exit codes:**
- `0`: All checks passed (warnings are non-blocking)
- `1`: Critical compatibility issues found (blocking)

### `install-dependencies.js`

A script that ensures all directories containing `package.json` files have their dependencies properly installed. This is particularly useful when:
- A new dependency is added to any package in the monorepo
- You've pulled changes that update `package.json` files
- Local dependencies are out of sync with the repository

**Usage:**
```bash
npm run install:deps
# or directly:
node scripts/install-dependencies.js
```

**What it does:**

1. **Scans for packages**: Recursively finds all directories containing `package.json` files
2. **Checks installation status**: Verifies if dependencies need to be installed by comparing:
   - Existence of `node_modules` directories
   - Timestamps of `package.json`, `package-lock.json`, and `node_modules`
3. **Workspace-aware**: Intelligently handles npm workspaces monorepos:
   - For workspace packages, checks the root `package-lock.json` vs root `node_modules`
   - Runs a single `npm install` at root level to update all workspaces
4. **Installs dependencies**: Runs `npm install` for packages that need updates

**Example output:**
```
YektaYar Dependency Installer
============================================================

ℹ️ Scanning for package.json files...
  ✅ Found 5 package(s)
  ℹ️ Detected npm workspaces monorepo

ℹ️ Checking dependency status...

  📦 yektayar (.)
    ✅ Up to date: up to date
  📦 @yektayar/admin-panel (packages/admin-panel)
    ✅ Up to date: workspace dependencies via root
  📦 @yektayar/backend (packages/backend)
    ⚠️ Needs installation: root package-lock.json is newer
  📦 @yektayar/mobile-app (packages/mobile-app)
    ✅ Up to date: workspace dependencies via root
  📦 @yektayar/shared (packages/shared)
    ✅ Up to date: workspace dependencies via root

============================================================

✅ All packages have up-to-date dependencies!
```

**Features:**
- ✅ Workspace-aware detection for npm monorepos
- ✅ Timestamp-based change detection
- ✅ Single command installation for all packages
- ✅ Colorful and informative output
- ✅ Handles both root and workspace packages

**When to run:**
- After pulling changes from the repository
- When you see "module not found" errors
- After adding new dependencies to any package
- As part of your development workflow setup

## Android Development Setup

### `setup-android.sh` (Ubuntu/Linux)

Automated setup script for Android development tooling on Ubuntu/Linux systems. This script installs and configures all required tools to build the YektaYar mobile app for Android.

**Usage:**
```bash
./scripts/setup-android.sh
```

**What it does:**

1. **Java JDK Installation:**
   - Checks for Java JDK 17 or higher
   - Automatically installs OpenJDK 17 if not present or version is too old
   - Uses system package manager (apt for Ubuntu/Debian)

2. **JAVA_HOME Configuration:**
   - Automatically detects Java installation path
   - Sets JAVA_HOME environment variable
   - Adds to shell profile (~/.bashrc, ~/.zshrc, or ~/.profile)

3. **Android SDK Installation:**
   - Downloads Android command-line tools
   - Installs to `~/Android/Sdk` (or $ANDROID_SDK_ROOT if set)
   - Properly organizes directory structure

4. **Android Environment Setup:**
   - Sets ANDROID_SDK_ROOT and ANDROID_HOME variables
   - Adds Android tools to PATH (sdkmanager, platform-tools, build-tools)
   - Persists environment variables to shell profile

5. **SDK Components Installation:**
   - Accepts Android SDK licenses automatically
   - Installs required components:
     - platform-tools (adb, fastboot)
     - platforms;android-34
     - build-tools;34.0.0
     - cmdline-tools;latest

6. **Verification:**
   - Tests Java installation and version
   - Verifies environment variables are set
   - Tests Gradle wrapper if available

**Requirements:**
- Ubuntu 18.04+ or Debian-based Linux distribution
- Internet connection for downloading packages
- ~2GB free disk space for Android SDK
- sudo privileges for package installation

**Environment Variables:**
The script sets the following environment variables:
- `JAVA_HOME` - Java JDK installation directory
- `ANDROID_SDK_ROOT` - Android SDK root directory
- `ANDROID_HOME` - Android SDK home (same as ANDROID_SDK_ROOT)
- `PATH` - Updated to include Android tools

**Custom Installation Path:**
```bash
# Install to custom location
ANDROID_SDK_ROOT=/opt/android-sdk ./scripts/setup-android.sh
```

**After Installation:**
```bash
# Reload shell to apply environment changes
source ~/.bashrc
# or
source ~/.zshrc

# Build the Android app
npm run android:build

# Or manually test gradle
cd packages/mobile-app/android
./gradlew assembleDebug
```

**Troubleshooting:**

If you get "JAVA_HOME is not set" error:
```bash
# Check if JAVA_HOME is set
echo $JAVA_HOME

# If not, reload your shell
source ~/.bashrc

# Or set it manually
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

If you get Android SDK errors:
```bash
# Check environment variables
echo $ANDROID_SDK_ROOT
echo $ANDROID_HOME

# Check if SDK is installed
ls -la ~/Android/Sdk

# Re-run the setup script
./scripts/setup-android.sh
```

### `setup-android.ps1` (Windows)

Automated setup script for Android development tooling on Windows systems using PowerShell.

**Usage:**
```powershell
# Run from PowerShell (may need to run as Administrator for some operations)
.\scripts\setup-android.ps1

# Skip specific package managers
.\scripts\setup-android.ps1 -SkipChocolatey
.\scripts\setup-android.ps1 -SkipWinget
```

**What it does:**

1. **Java JDK Installation:**
   - Checks for Java JDK 17 or higher
   - Attempts installation using winget (Windows 10 1809+/Windows 11)
   - Falls back to Chocolatey if winget fails or is unavailable
   - Provides manual installation instructions if automation fails

2. **JAVA_HOME Configuration:**
   - Automatically detects Java installation path
   - Sets JAVA_HOME environment variable (user-level)
   - Updates current PowerShell session

3. **Android SDK Installation:**
   - Downloads Android command-line tools for Windows
   - Installs to `%LOCALAPPDATA%\Android\Sdk` (or $env:ANDROID_SDK_ROOT if set)
   - Properly organizes directory structure

4. **Android Environment Setup:**
   - Sets ANDROID_SDK_ROOT and ANDROID_HOME variables (user-level)
   - Adds Android tools to PATH (sdkmanager, platform-tools, build-tools)
   - Updates current PowerShell session

5. **SDK Components Installation:**
   - Accepts Android SDK licenses automatically
   - Installs required components:
     - platform-tools (adb, fastboot)
     - platforms;android-34
     - build-tools;34.0.0
     - cmdline-tools;latest

6. **Verification:**
   - Tests Java installation and version
   - Verifies environment variables are set
   - Tests Gradle wrapper if available

**Requirements:**
- Windows 10 (1809+) or Windows 11
- PowerShell 5.1 or later
- Internet connection for downloading packages
- ~2GB free disk space for Android SDK
- Administrator privileges (for package manager installations)

**Package Managers:**
The script supports two package managers:
- **winget** - Built into modern Windows (preferred)
- **Chocolatey** - Third-party package manager (fallback)

**Environment Variables:**
The script sets the following environment variables (user-level):
- `JAVA_HOME` - Java JDK installation directory
- `ANDROID_SDK_ROOT` - Android SDK root directory
- `ANDROID_HOME` - Android SDK home (same as ANDROID_SDK_ROOT)
- `PATH` - Updated to include Android tools

**Custom Installation Path:**
```powershell
# Install to custom location
$env:ANDROID_SDK_ROOT = "C:\Android\Sdk"
.\scripts\setup-android.ps1
```

**After Installation:**
```powershell
# Restart your terminal or IDE to apply environment changes

# Build the Android app
npm run android:build

# Or manually test gradle
cd packages\mobile-app\android
.\gradlew.bat assembleDebug
```

**Troubleshooting:**

If you get "JAVA_HOME is not set" error:
```powershell
# Check if JAVA_HOME is set
echo $env:JAVA_HOME

# Restart your terminal/IDE to load new environment variables

# Or set it manually for current session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.8.7-hotspot"
```

If you get Android SDK errors:
```powershell
# Check environment variables
echo $env:ANDROID_SDK_ROOT
echo $env:ANDROID_HOME

# Check if SDK is installed
dir $env:LOCALAPPDATA\Android\Sdk

# Re-run the setup script
.\scripts\setup-android.ps1
```

If package manager installation fails:
```powershell
# For winget issues, update Windows or App Installer from Microsoft Store

# For Chocolatey, install it manually:
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Notes:**
- Environment variables are set at user-level (not system-level) to avoid requiring administrator privileges
- Some operations (like Chocolatey package installation) may require administrator privileges
- After installation, restart your terminal/IDE to load new environment variables
- The script is idempotent - safe to run multiple times

### Building Android APK

After setting up Android development tools, you can build the Android APK:

**From Project Root:**
```bash
# Build debug APK (includes full build pipeline)
npm run android:build

# The APK will be located at:
# packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

**Manual Build Process:**
```bash
# 1. Build the web app
npm run build:mobile

# 2. Sync Capacitor (copies web assets to Android)
cd packages/mobile-app
npm run cap:sync

# 3. Build Android APK
npm run android:build:debug

# Or for release build
npm run android:build:release
```

**Gradle Commands:**
```bash
cd packages/mobile-app/android

# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Clean build artifacts
./gradlew clean

# View all tasks
./gradlew tasks
```

**Common Build Issues:**

1. **"JAVA_HOME is not set"**
   - Solution: Run the setup script or set JAVA_HOME manually
   - Verify: `echo $JAVA_HOME` (Linux/Mac) or `echo %JAVA_HOME%` (Windows)

2. **"SDK location not found"**
   - Solution: Set ANDROID_SDK_ROOT or create local.properties
   - Verify: `echo $ANDROID_SDK_ROOT`

3. **Gradle daemon issues**
   - Solution: Stop and restart gradle daemon
   ```bash
   cd packages/mobile-app/android
   ./gradlew --stop
   ./gradlew assembleDebug
   ```

4. **Out of memory during build**
   - Solution: Increase gradle memory in gradle.properties
   ```properties
   org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
   ```

For more details, see [APK-BUILD-SUMMARY.md](../APK-BUILD-SUMMARY.md)

---

## Shell Configuration Enhancement

### Development Tools Installation

#### `install-dev-tools.sh`

Automated installation script for all YektaYar development tools.

**Usage:**
```bash
# Install all development tools (interactive)
./scripts/install-dev-tools.sh
```

**What it installs:**
- **Core Tools**: git, curl, wget, jq, build-essential
- **Node.js Ecosystem**: Node.js 24.x, npm, Bun 1.x
- **Database**: PostgreSQL client, libpq-dev, pgcli
- **Optional**: GitHub CLI (gh), Docker, Docker Compose

**Features:**
- ✅ Checks current installation status
- ✅ Shows installation plan before proceeding
- ✅ Interactive confirmation
- ✅ Verifies installations after completion
- ✅ Provides next steps guidance

**Documentation:**
See [DEV-TOOLS-GUIDE.md](DEV-TOOLS-GUIDE.md) for detailed information about installed tools and usage.

---

### Bashrc Feature Enhancement Scripts

Scripts to enable useful bash features based on custom configurations compared to vanilla Ubuntu defaults.

#### `enable-user-bashrc-features.sh`

Enhances user's `~/.bashrc` with productivity features and YektaYar-specific development aliases.

**Usage:**
```bash
# Run as regular user (no sudo needed)
./scripts/enable-user-bashrc-features.sh

# Apply changes immediately
source ~/.bashrc
```

**Features Added:**
- 🎨 Colorful multi-line PS1 prompt
- 📁 Enhanced ls aliases (ll, l., lsd with -GNhp flags)
- ⌨️ Ctrl-Backspace word deletion binding
- 🛠️ Utility aliases (diskspace, folders, ip -c)
- 🌐 UTF-8 less charset
- 📜 History improvements (ignoredups, ignorespace)
- 💻 **YektaYar Development Aliases**:
  - Project navigation: `yekta`, `yb`, `ya`, `ym`
  - Dev commands: `ydev`, `ydev-backend`, `ybuild`, `ylint`
  - Git shortcuts: `gs`, `gp`, `gc`, `gd`, `gl`, `gco`
  - Database: `ydb`, `ydbcli`
  - JSON tools: `json`, `jsonc`
  - Docker: `dps`, `dpa`, `di`, `dex`, `dlogs`
  - npm shortcuts: `ni`, `nid`, `nr`, `nt`

**Fallback Behavior:**
All aliases include `command -v` checks - bashrc **never breaks** if tools are missing.

```bash
# Example: Only creates alias if bun is installed
if command -v bun >/dev/null 2>&1; then
    alias ydev-backend="..."
fi
```

#### `enable-system-bashrc-features.sh`

Enhances system-wide `/etc/bash.bashrc` for all users (requires root).

**Usage:**
```bash
# Must run as root
sudo ./scripts/enable-system-bashrc-features.sh

# Apply changes immediately
source /etc/bash.bashrc
```

**Features Added:**
- 📦 Nala wrapper for apt commands (with fallback to apt if nala not installed)
- 🔧 settitle() - Set terminal window title
- 📂 take() - Create directory and cd into it
- 🛠️ Global aliases (ports, df -h, du -h, incognito)
- ⬇️ a2c - Optimized aria2c downloads (with fallback check)
- 🚀 thefuck integration (with fallback check)
- 🎼 Composer superuser permission
- 📖 Bash completion enablement
- 🔗 PATH enhancement (/root/.local/bin)

**Fallback Behavior:**
All optional tools wrapped in `command -v` checks for safe fallback.

**Optional Dependencies:**
```bash
sudo apt update
sudo apt install nala aria2 bash-completion
pip3 install thefuck
```

#### `test-bashrc-features.sh`

Automated test suite for bashrc enhancement scripts.

**Location:** `tests/scripts/test-bashrc-features.sh`

**Usage:**
```bash
./tests/scripts/test-bashrc-features.sh
```

**Tests:**
- ✓ Script files exist and are executable
- ✓ Root requirement check
- ✓ Functionality in isolated environment
- ✓ All features added correctly (including fallback checks)
- ✓ Idempotency (no duplicates on re-run)
- ✓ Backup creation
- ✓ User-friendly output

**Safety Features:**
- Automatic timestamped backups before modifications
- Idempotent (safe to run multiple times)
- Non-destructive (only adds, never removes)
- Clear feedback on what's added vs already configured

**Documentation:**

For detailed information about all features, comparison to vanilla Ubuntu, and usage examples, see:
- [**BASHRC-FEATURES.md**](BASHRC-FEATURES.md) - Comprehensive bashrc enhancement documentation

---
