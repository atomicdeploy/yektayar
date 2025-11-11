# YektaYar Deployment Scripts

This directory contains scripts and service configurations for deploying and managing YektaYar services.

## Contents

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

## Nginx Reverse Proxy (Optional)

For production deployments, consider using Nginx as a reverse proxy:

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
