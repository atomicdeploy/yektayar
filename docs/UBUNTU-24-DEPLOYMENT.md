# Ubuntu 24.04 VPS Deployment Guide

Complete guide for deploying YektaYar Platform on Ubuntu 24.04 LTS VPS.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Initial Server Setup](#initial-server-setup)
- [Install Required Software](#install-required-software)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Web Server Configuration](#web-server-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Process Management](#process-management)
- [Firewall Configuration](#firewall-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need

- Ubuntu 24.04 LTS VPS (DigitalOcean, Hetzner, Linode, etc.)
- Root or sudo access to the server
- Domain name (optional but recommended)
- SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- Basic command line knowledge

### Recommended VPS Specs

**Minimum (Development/Testing)**
- 2 CPU cores
- 4 GB RAM
- 40 GB SSD
- 1 TB bandwidth
- Cost: ~$10-20/month

**Recommended (Production)**
- 4 CPU cores
- 8 GB RAM
- 80 GB SSD
- 2 TB bandwidth
- Cost: ~$40-60/month

---

## Server Requirements

### Software Stack

- **OS**: Ubuntu 24.04 LTS
- **Runtime**: Node.js 18+ and Bun 1.0+
- **Database**: PostgreSQL 15+
- **Web Server**: Apache 2.4+ or Nginx
- **Process Manager**: PM2
- **Other**: Git, UFW (firewall)

---

## Initial Server Setup

### 1. Connect to Your VPS

```bash
# SSH into your server
ssh root@your_server_ip

# Or with a different user
ssh username@your_server_ip
```

### 2. Update System Packages

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### 3. Create Application User (Optional but Recommended)

```bash
# Create a dedicated user for the application
sudo adduser yektayar

# Add to sudo group
sudo usermod -aG sudo yektayar

# Switch to new user
su - yektayar
```

### 4. Configure SSH (Security Hardening)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended changes:
# PermitRootLogin no              # Disable root login
# PasswordAuthentication no        # Use SSH keys only (after setting up keys!)
# Port 2222                        # Change SSH port (optional)

# Restart SSH service
sudo systemctl restart sshd
```

### 5. Set Up SSH Keys (If Not Already Done)

```bash
# On your local machine, generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id yektayar@your_server_ip

# Test connection
ssh yektayar@your_server_ip
```

---

## Install Required Software

### 1. Install Node.js 18.x

```bash
# Install Node.js 18.x from NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version   # Should show v18.x.x
npm --version    # Should show 9.x.x or higher
```

### 2. Install Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH (add to ~/.bashrc or ~/.zshrc)
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
bun --version
```

### 3. Install PostgreSQL 15+

```bash
# PostgreSQL is available in Ubuntu 24.04 repos
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
psql --version
```

### 4. Install Apache Web Server

```bash
# Install Apache
sudo apt install -y apache2

# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# Verify installation
sudo systemctl status apache2
```

**Alternative: Install Nginx (If you prefer)**

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Database Setup

### 1. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -i -u postgres

# Access PostgreSQL prompt
psql
```

### 2. Create Database and User

```sql
-- Create database
CREATE DATABASE yektayar;

-- Create user with password
CREATE USER yektayar_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE yektayar TO yektayar_user;

-- Grant schema privileges (PostgreSQL 15+)
\c yektayar
GRANT ALL ON SCHEMA public TO yektayar_user;

-- Exit PostgreSQL
\q
```

```bash
# Exit postgres user
exit
```

### 3. Configure PostgreSQL for Remote Access (Optional)

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Find and modify:
listen_addresses = 'localhost'  # Keep as localhost for security

# Edit pg_hba.conf for local connections
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add this line (for local connections):
local   all             yektayar_user                           scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4. Test Database Connection

```bash
# Test connection
psql -U yektayar_user -d yektayar -h localhost

# If prompted for password, enter the password you created
# You should see the PostgreSQL prompt

# Exit
\q
```

---

## Application Deployment

### 1. Create Application Directory

```bash
# Create directory
sudo mkdir -p /home/deploy/Projects/YektaYar
sudo chown $USER:$USER /home/deploy/Projects/YektaYar
cd /home/deploy/Projects/YektaYar
```

### 2. Clone Repository

```bash
# Clone repository (replace with your repo URL)
git clone https://github.com/atomicdeploy/yektayar.git .

# Or if using SSH
git clone git@github.com:atomicdeploy/yektayar.git .
```

### 3. Install Dependencies

```bash
# Install all dependencies using npm
npm install

# This will install dependencies for all packages in the monorepo
```

### 4. Configure Environment Variables

```bash
# Navigate to backend
cd /home/deploy/Projects/YektaYar/packages/backend

# Copy example env file
cp .env.example .env

# Edit environment file
nano .env
```

#### Production .env Configuration

```bash
# Server Configuration
PORT=3000
HOST=127.0.0.1  # Bind to localhost only (Apache/Nginx will proxy)
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://yektayar_user:your_secure_password_here@localhost:5432/yektayar
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yektayar
DB_USER=yektayar_user
DB_PASSWORD=your_secure_password_here

# Session & Security
SESSION_SECRET=generate_a_long_random_string_minimum_32_characters
JWT_SECRET=generate_another_long_random_string_minimum_32_characters
JWT_EXPIRY=7d

# CORS Settings (update with your domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# WebSocket
WEBSOCKET_PORT=3001

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate Secure Secrets:**

```bash
# Generate random secrets
openssl rand -hex 32  # Run this twice for SESSION_SECRET and JWT_SECRET
```

### 5. Build Application

```bash
# Build backend
cd /home/deploy/Projects/YektaYar/packages/backend
npm run build

# Build admin panel
cd /home/deploy/Projects/YektaYar/packages/admin-panel
npm run build

# Build mobile app (if needed)
cd /home/deploy/Projects/YektaYar/packages/mobile-app
npm run build
```

### 6. Run Database Migrations (When Available)

```bash
cd /home/deploy/Projects/YektaYar/packages/backend

# Run migrations (implement this as needed)
# npm run migrate

# Seed initial data (implement this as needed)
# npm run seed
```

---

## Web Server Configuration

### Option A: Apache Configuration

#### 1. Create Apache Virtual Host

```bash
# Create configuration file
sudo nano /etc/apache2/sites-available/yektayar.conf
```

#### 2. Apache Configuration (HTTP - Will redirect to HTTPS)

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # SSL Configuration (will be configured by Certbot)
    # SSLEngine on
    # SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    # SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # API Proxy
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:3000/api
    ProxyPassReverse /api http://127.0.0.1:3000/api
    
    # WebSocket Support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/api/(.*)$ ws://127.0.0.1:3000/api/$1 [P,L]
    
    # Serve Admin Panel (main site)
    DocumentRoot /home/deploy/Projects/YektaYar/packages/admin-panel/dist
    
    <Directory /home/deploy/Projects/YektaYar/packages/admin-panel/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA Routing (Vue Router)
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Serve Mobile App at /mobile (optional)
    Alias /mobile /home/deploy/Projects/YektaYar/packages/mobile-app/dist
    
    <Directory /home/deploy/Projects/YektaYar/packages/mobile-app/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /mobile
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /mobile/index.html [L]
    </Directory>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/yektayar_error.log
    CustomLog ${APACHE_LOG_DIR}/yektayar_access.log combined
</VirtualHost>
```

#### 3. Enable Site and Restart Apache

```bash
# Enable site
sudo a2ensite yektayar.conf

# Disable default site (optional)
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# If OK, restart Apache
sudo systemctl restart apache2
```

### Option B: Nginx Configuration

#### 1. Create Nginx Configuration

```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/yektayar
```

#### 2. Nginx Configuration

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Root directory
    root /home/deploy/Projects/YektaYar/packages/admin-panel/dist;
    index index.html;
    
    # API Proxy
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Mobile App (optional)
    location /mobile {
        alias /home/deploy/Projects/YektaYar/packages/mobile-app/dist;
        try_files $uri $uri/ /mobile/index.html;
    }
    
    # Logging
    access_log /var/log/nginx/yektayar_access.log;
    error_log /var/log/nginx/yektayar_error.log;
}
```

#### 3. Enable Site and Restart Nginx

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/yektayar /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If OK, restart Nginx
sudo systemctl restart nginx
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot

# For Apache
sudo apt install -y python3-certbot-apache

# For Nginx
sudo apt install -y python3-certbot-nginx
```

### Obtain Certificate (Apache)

```bash
# Automatic configuration
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
```

### Obtain Certificate (Nginx)

```bash
# Automatic configuration
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
```

### Test Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is configured via systemd timer
sudo systemctl status certbot.timer
```

---

## Process Management

### 1. Start Backend with PM2

```bash
# Navigate to backend
cd /home/deploy/Projects/YektaYar/packages/backend

# Start with PM2 using Bun as interpreter
pm2 start dist/index.js --name yektayar-api --interpreter bun -i max

# Or specify number of instances
pm2 start dist/index.js --name yektayar-api --interpreter bun -i 2

# If bun doesn't work as interpreter, use Node.js
pm2 start dist/index.js --name yektayar-api -i 2
```

### 2. Save PM2 Configuration

```bash
# Save current process list
pm2 save

# Generate startup script
pm2 startup

# Follow the command it outputs (usually needs sudo)
```

### 3. PM2 Commands Reference

```bash
# View processes
pm2 list

# View logs
pm2 logs yektayar-api

# Restart
pm2 restart yektayar-api

# Stop
pm2 stop yektayar-api

# Delete
pm2 delete yektayar-api

# Monitor
pm2 monit

# View details
pm2 show yektayar-api
```

---

## Firewall Configuration

### Configure UFW (Uncomplicated Firewall)

```bash
# Install UFW (usually pre-installed on Ubuntu)
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp
# Or if you changed SSH port:
# sudo ufw allow 2222/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose

# Allow specific IP (optional)
sudo ufw allow from 192.168.1.100

# Delete rule
sudo ufw delete allow 80/tcp
```

---

## Monitoring and Maintenance

### 1. Set Up Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/yektayar
```

Add this configuration:

```
/home/deploy/Projects/YektaYar/packages/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 yektayar yektayar
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Database Backups

```bash
# Create backup directory
sudo mkdir -p /var/backups/yektayar
sudo chown $USER:$USER /var/backups/yektayar

# Create backup script
nano /usr/local/bin/backup-yektayar.sh
```

Backup script content:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/yektayar"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="yektayar"
DB_USER="yektayar_user"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD='your_db_password' pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-yektayar.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-yektayar.sh >> /var/log/yektayar-backup.log 2>&1
```

### 3. Monitoring Tools

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor system
htop

# Monitor PM2 processes
pm2 monit

# View resource usage
pm2 list
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs yektayar-api

# Check application directory permissions
ls -la /home/deploy/Projects/YektaYar

# Verify environment variables
cat /home/deploy/Projects/YektaYar/packages/backend/.env

# Try starting manually
cd /home/deploy/Projects/YektaYar/packages/backend
bun run dist/index.js
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U yektayar_user -d yektayar -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Apache/Nginx Issues

```bash
# Check Apache status
sudo systemctl status apache2

# Check Nginx status
sudo systemctl status nginx

# View error logs (Apache)
sudo tail -f /var/log/apache2/yektayar_error.log

# View error logs (Nginx)
sudo tail -f /var/log/nginx/yektayar_error.log

# Test configuration (Apache)
sudo apache2ctl configtest

# Test configuration (Nginx)
sudo nginx -t
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect yourdomain.com:443
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Or
sudo netstat -tulpn | grep 3000

# Kill process
sudo kill -9 <PID>
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Check PM2 processes
pm2 list

# Restart with fewer instances
pm2 delete yektayar-api
pm2 start dist/index.js --name yektayar-api --interpreter bun -i 1
```

---

## Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Generate strong SESSION_SECRET and JWT_SECRET
- [ ] Configure firewall (UFW)
- [ ] Enable SSL/HTTPS
- [ ] Set up automatic backups
- [ ] Configure rate limiting in backend
- [ ] Review security headers in web server config
- [ ] Set up monitoring/alerting
- [ ] Test all authentication flows
- [ ] Verify file upload restrictions
- [ ] Check CORS configuration
- [ ] Audit database permissions
- [ ] Review error messages (no sensitive data)
- [ ] Set up log rotation
- [ ] Disable root login via SSH
- [ ] Use SSH keys instead of passwords
- [ ] Keep system updated (apt update && apt upgrade)

---

## Updating the Application

```bash
# Navigate to application directory
cd /home/deploy/Projects/YektaYar

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
cd packages/backend && npm run build
cd ../admin-panel && npm run build

# Restart backend
pm2 restart yektayar-api

# Clear browser cache if frontend changes
```

---

## Additional Resources

- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Apache Documentation](https://httpd.apache.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [UFW Documentation](https://help.ubuntu.com/community/UFW)

---

**Last Updated**: 2025-11-10  
**Version**: 1.0  
**Target OS**: Ubuntu 24.04 LTS
