# YektaYar Setup Guide

## 🎯 Overview

This guide covers setting up YektaYar for both the **prototype phase** (client-side only) and **future production** (full-stack).

---

## 📋 Prototype Setup (Current - Spark Environment)

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for initial load)
- That's it! No local installation needed.

### Access the Application
The Spark environment automatically handles everything:
- ✅ Dependencies installed automatically
- ✅ Development server running
- ✅ Hot reload enabled
- ✅ No build step required

### Making Changes
1. Edit files in the `src/` directory
2. Save your changes
3. Browser automatically refreshes
4. Changes are live immediately

### Data Persistence
- All data stored in browser using Spark's KV storage
- Data persists across page refreshes
- Clearing browser data will reset the app

### Testing on Mobile
1. Open the app URL on your mobile device
2. Use browser's "Add to Home Screen" feature
3. App works as PWA (Progressive Web App)

---

## 🚀 Production Setup (Future - Full-Stack)

### Server Requirements

#### Minimum VPS Specs
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 40 GB SSD
- **Bandwidth:** 1 TB/month
- **Estimated Cost:** $10-20/month (Hetzner, DigitalOcean, Linode)

#### Software Requirements
- Node.js 20.x LTS
- PostgreSQL 15+
- Apache 2.4+
- PM2 (process manager)
- Git

---

## 📦 Installation (Future Backend)

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Apache
sudo apt install -y apache2

# Enable Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod ssl
sudo a2enmod rewrite

# Install build essentials (for native modules)
sudo apt install -y build-essential
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql

# In PostgreSQL shell:
CREATE DATABASE yektayar;
CREATE USER yektayar_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE yektayar TO yektayar_user;

# Exit PostgreSQL shell
\q

# Exit postgres user
exit
```

### 3. Clone Repository

```bash
# Create application directory
sudo mkdir -p /home/deploy/Projects/YektaYar
sudo chown $USER:$USER /home/deploy/Projects/YektaYar

# Clone repository
cd /home/deploy/Projects/YektaYar
git clone https://github.com/your-org/yektayar.git .

# Install dependencies (in monorepo root)
npm install
```

### 4. Configure Environment

```bash
# Backend environment variables
cd /home/deploy/Projects/YektaYar/packages/backend
cp .env.example .env

# Edit .env file
nano .env
```

#### Example `.env` file:
```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://yektayar.ir

# Database
DATABASE_URL=postgresql://yektayar_user:your_secure_password_here@localhost:5432/yektayar

# Security
SESSION_SECRET=generate_a_long_random_string_here
JWT_SECRET=generate_another_long_random_string_here

# AI Service (Pollination AI or similar)
AI_API_KEY=your_api_key_here
AI_API_URL=https://api.pollinations.ai/

# Email (configure later)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yektayar.ir

# SMS (configure later - Iranian gateway)
SMS_GATEWAY_URL=
SMS_GATEWAY_API_KEY=

# Payment Gateway (configure later - Iranian IPG)
PAYMENT_GATEWAY_URL=
PAYMENT_MERCHANT_ID=

# File Storage
UPLOAD_DIR=/home/deploy/Projects/YektaYar/storage/uploads
MAX_FILE_SIZE=10485760  # 10MB

# Rate Limiting
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_LIFETIME=7  # days
```

### 5. Build Application

```bash
# Build backend
cd /home/deploy/Projects/YektaYar/packages/backend
npm run build

# Build frontend
cd /home/deploy/Projects/YektaYar/packages/web-app
npm run build

# Build admin panel
cd /home/deploy/Projects/YektaYar/packages/admin-panel
npm run build
```

### 6. Database Migration

```bash
cd /home/deploy/Projects/YektaYar/packages/backend

# Run migrations (when implemented)
npm run migrate

# Seed initial data (admin user, permissions, etc.)
npm run seed
```

### 7. Setup PM2

```bash
cd /home/deploy/Projects/YektaYar/packages/backend

# Start application with PM2
pm2 start dist/server.js --name yektayar-api -i 2

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 8. Configure Apache

```bash
# Create Apache configuration
sudo nano /etc/apache2/sites-available/yektayar.conf
```

#### Apache Configuration:
```apache
<VirtualHost *:80>
    ServerName yektayar.ir
    ServerAlias www.yektayar.ir
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName yektayar.ir
    ServerAlias www.yektayar.ir
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yektayar.ir/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yektayar.ir/privkey.pem
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # API Proxy
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/api/(.*)$ ws://localhost:3000/api/$1 [P,L]
    
    # Serve static files for web app
    DocumentRoot /home/deploy/Projects/YektaYar/packages/web-app/dist
    
    <Directory /home/deploy/Projects/YektaYar/packages/web-app/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Serve admin panel at /admin
    Alias /admin /home/deploy/Projects/YektaYar/packages/admin-panel/dist
    
    <Directory /home/deploy/Projects/YektaYar/packages/admin-panel/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /admin
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /admin/index.html [L]
    </Directory>
    
    # Error logs
    ErrorLog ${APACHE_LOG_DIR}/yektayar_error.log
    CustomLog ${APACHE_LOG_DIR}/yektayar_access.log combined
</VirtualHost>
```

```bash
# Enable site
sudo a2ensite yektayar.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

### 9. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-apache

# Obtain certificate
sudo certbot --apache -d yektayar.ir -d www.yektayar.ir

# Test auto-renewal
sudo certbot renew --dry-run
```

### 10. Firewall Setup

```bash
# Install UFW if not already installed
sudo apt install -y ufw

# Allow SSH (important! do this first)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🗄️ Database Management Tools

### pgAdmin (Web-based)

```bash
# Install pgAdmin
sudo apt install -y pgadmin4

# Or use Docker
docker run -p 5050:80 \
  -e 'PGADMIN_DEFAULT_EMAIL=info@yektayar.ir' \
  -e 'PGADMIN_DEFAULT_PASSWORD=admin' \
  -d dpage/pgadmin4
```

### DBeaver (Desktop)
- Download from https://dbeaver.io/
- Install on your local machine
- Connect via SSH tunnel for security

### Command Line

```bash
# Connect to database
psql -U yektayar_user -d yektayar

# Common commands
\dt              # List tables
\d table_name    # Describe table
\q               # Quit
```

---

## 🔧 Development Environment Setup (Local)

### 1. Install Prerequisites

```bash
# Install Node.js 20.x (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install PostgreSQL (or use Docker)
# macOS
brew install postgresql@15

# Ubuntu/Debian
sudo apt install postgresql-15

# Or use Docker
docker run --name yektayar-postgres \
  -e POSTGRES_DB=yektayar \
  -e POSTGRES_USER=yektayar \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/yektayar.git
cd yektayar

# Install dependencies
npm install

# Setup environment
cd packages/backend
cp .env.example .env.development

# Edit with local settings
nano .env.development
```

#### Example `.env.development`:
```bash
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

DATABASE_URL=postgresql://yektayar:password@localhost:5432/yektayar

SESSION_SECRET=dev_session_secret
JWT_SECRET=dev_jwt_secret

# Mock external services in development
MOCK_AI=true
MOCK_SMS=true
MOCK_EMAIL=true
MOCK_PAYMENT=true
```

### 3. Run Development Servers

```bash
# Terminal 1: Backend
cd packages/backend
npm run dev

# Terminal 2: Web App
cd packages/web-app
npm run dev

# Terminal 3: Admin Panel
cd packages/admin-panel
npm run dev
```

Access:
- Web App: http://localhost:5173
- Admin Panel: http://localhost:5174
- API: http://localhost:3000

---

## 📱 Mobile App Setup (Capacitor)

### 1. Install Capacitor Dependencies

```bash
# In mobile-app directory
cd packages/mobile-app

# Add platforms
npx cap add android
npx cap add ios  # macOS only
```

### 2. Android Setup

```bash
# Install Android Studio
# Download from https://developer.android.com/studio

# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

### 3. Build for Android

```bash
# Development build
npm run build
npx cap sync android
npx cap run android

# Production build (in Android Studio)
# Build > Generate Signed Bundle / APK
```

### 4. iOS Setup (macOS only)

```bash
# Install CocoaPods
sudo gem install cocoapods

# Sync Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

---

## 🔍 Troubleshooting

### Prototype Issues

**Problem:** Changes not reflecting in browser
```bash
# Hard refresh
# Chrome/Edge: Ctrl+Shift+R (Cmd+Shift+R on Mac)
# Firefox: Ctrl+F5 (Cmd+Shift+R on Mac)
```

**Problem:** Data lost after closing browser
```bash
# This is expected behavior if browser data is cleared
# Check browser settings for "Cookies and other site data"
```

### Production Issues

**Problem:** Application not starting
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs yektayar-api

# Restart application
pm2 restart yektayar-api
```

**Problem:** Database connection failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U yektayar_user -d yektayar -h localhost

# Check DATABASE_URL in .env
```

**Problem:** Apache not proxying correctly
```bash
# Check Apache status
sudo systemctl status apache2

# View error logs
sudo tail -f /var/log/apache2/yektayar_error.log

# Test proxy manually
curl http://localhost:3000/api/health
```

**Problem:** SSL certificate issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect yektayar.ir:443
```

---

## 🔐 Security Checklist

### Before Going Live

- [ ] Change all default passwords
- [ ] Generate strong SESSION_SECRET and JWT_SECRET
- [ ] Configure firewall (UFW)
- [ ] Enable SSL/HTTPS
- [ ] Setup automatic backups
- [ ] Configure rate limiting
- [ ] Review Apache security headers
- [ ] Setup monitoring/alerting
- [ ] Test all authentication flows
- [ ] Verify file upload restrictions
- [ ] Check CORS configuration
- [ ] Audit database permissions
- [ ] Review error messages (no sensitive data)
- [ ] Setup log rotation
- [ ] Configure fail2ban (optional)

---

## 📊 Monitoring Setup (Future)

### Application Monitoring

```bash
# PM2 Plus (formerly Keymetrics)
pm2 plus

# Or self-hosted monitoring
pm2 install pm2-server-monit
```

### Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/yektayar

# Add:
/home/deploy/Projects/YektaYar/packages/backend/logs/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 www-data www-data
  sharedscripts
  postrotate
    pm2 reloadLogs
  endscript
}
```

---

## 🔄 Backup Strategy

### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-yektayar.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/yektayar"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U yektayar_user yektayar | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /home/deploy/Projects/YektaYar/storage/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-yektayar.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e

# Add line:
0 2 * * * /usr/local/bin/backup-yektayar.sh >> /var/log/yektayar-backup.log 2>&1
```

### Restore from Backup

```bash
# Restore database
gunzip < /var/backups/yektayar/db_YYYYMMDD_HHMMSS.sql.gz | psql -U yektayar_user yektayar

# Restore uploads
tar -xzf /var/backups/yektayar/uploads_YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## 📚 Additional Resources

### Documentation
- Node.js: https://nodejs.org/docs
- PostgreSQL: https://www.postgresql.org/docs
- Apache: https://httpd.apache.org/docs
- PM2: https://pm2.keymetrics.io/docs

### Tools
- pgAdmin: https://www.pgadmin.org/
- DBeaver: https://dbeaver.io/
- Postman: https://www.postman.com/ (API testing)

---

## 🆘 Getting Help

- **Issues:** https://github.com/your-org/yektayar/issues
- **Discussions:** GitHub Discussions
- **Email:** (Future)

---

**Last Updated:** Initial version  
**Maintained By:** Development Team
