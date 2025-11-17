# Web Server Setup - Quick Start Guide

This is a quick reference for setting up web server configurations for YektaYar platform.

## 🎯 Goal

Configure a reverse proxy to expose YektaYar services on separate subdomains:

- **api.yektayar.ir** → Backend API (port 3000)
- **panel.yektayar.ir** → Admin Panel (port 5173)
- **app.yektayar.ir** → Mobile App (port 8100)
- **static.yektayar.ir** → Static files (e.g., .apk files)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure DNS

Add these A records to your DNS provider:

```
A    api.yektayar.ir       →  YOUR_SERVER_IP
A    panel.yektayar.ir     →  YOUR_SERVER_IP
A    app.yektayar.ir       →  YOUR_SERVER_IP
A    static.yektayar.ir    →  YOUR_SERVER_IP
```

Or use a wildcard: `A  *.yektayar.ir  →  YOUR_SERVER_IP`

Wait 5-30 minutes for DNS propagation.

### Step 2: Choose Your Web Server

Pick ONE of the following:

| Web Server | Command | SSL Setup |
|------------|---------|-----------|
| **Apache** | `sudo ./scripts/install-apache.sh` | Manual (Certbot) |
| **Nginx** | `sudo ./scripts/install-nginx.sh` | Manual (Certbot) |
| **Caddy** | `sudo ./scripts/install-caddy.sh` | ✨ Automatic! |

**Recommended:** Caddy for simplest setup with automatic HTTPS.

### Step 3: Set Up SSL

#### For Caddy (Automatic)
✨ Nothing to do! Caddy automatically obtains SSL certificates once DNS is configured.

#### For Apache
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d api.yektayar.ir
sudo certbot --apache -d panel.yektayar.ir
sudo certbot --apache -d app.yektayar.ir
sudo certbot --apache -d static.yektayar.ir
```

#### For Nginx
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yektayar.ir
sudo certbot --nginx -d panel.yektayar.ir
sudo certbot --nginx -d app.yektayar.ir
sudo certbot --nginx -d static.yektayar.ir
```

---

## ✅ Verification

### Test DNS Resolution
```bash
nslookup api.yektayar.ir
nslookup panel.yektayar.ir
nslookup app.yektayar.ir
nslookup static.yektayar.ir
```

### Test Services (start them first)
```bash
# Start services
cd /var/www/yektayar
./scripts/dev-runner.sh all --detached

# Test HTTP (should redirect to HTTPS)
curl -I http://api.yektayar.ir

# Test HTTPS
curl -I https://api.yektayar.ir
curl -I https://panel.yektayar.ir
curl -I https://app.yektayar.ir
```

### Upload Static Files
```bash
# Create a test file
echo "Test" | sudo tee /var/www/yektayar/static/test.txt

# Access it
curl https://static.yektayar.ir/test.txt

# Upload APK file
sudo cp path/to/app.apk /var/www/yektayar/static/
```

---

## 📦 What Each Script Does

### install-apache.sh
- Installs Apache 2.4+
- Enables required modules (proxy, proxy_http, proxy_wstunnel, ssl, rewrite, headers)
- Copies configuration files
- Creates `/var/www/yektayar/static` directory
- Enables all virtual hosts
- Tests and restarts Apache

### install-nginx.sh
- Installs Nginx
- Copies configuration files
- Creates `/var/www/yektayar/static` directory
- Creates symlinks to enable sites
- Tests and restarts Nginx

### install-caddy.sh
- Installs Caddy
- Copies configuration files
- Creates `/var/www/yektayar/static` directory
- Prompts for Let's Encrypt email
- Tests and starts Caddy
- ✨ Automatic HTTPS included!

---

## 🔥 Firewall Configuration

Ensure ports 80 and 443 are open:

```bash
# Using UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 🔧 Configuration Files

All configuration files are located in `config/webserver/`:

```
config/webserver/
├── apache/
│   ├── api.yektayar.ir.conf
│   ├── panel.yektayar.ir.conf
│   ├── app.yektayar.ir.conf
│   └── static.yektayar.ir.conf
├── nginx/
│   ├── api.yektayar.ir.conf
│   ├── panel.yektayar.ir.conf
│   ├── app.yektayar.ir.conf
│   └── static.yektayar.ir.conf
└── caddy/
    ├── Caddyfile
    ├── api.yektayar.ir
    ├── panel.yektayar.ir
    ├── app.yektayar.ir
    └── static.yektayar.ir
```

---

## 🛠️ Useful Commands

### Apache
```bash
# Test configuration
sudo apache2ctl configtest

# Restart
sudo systemctl restart apache2

# View logs
sudo tail -f /var/log/apache2/api.yektayar.ir_error.log
```

### Nginx
```bash
# Test configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/api.yektayar.ir_error.log
```

### Caddy
```bash
# Validate configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload configuration
sudo caddy reload --config /etc/caddy/Caddyfile

# Restart
sudo systemctl restart caddy

# View logs
sudo journalctl -u caddy -f
```

---

## 🚨 Troubleshooting

### "Connection Refused"
**Problem:** Backend service not running  
**Solution:** Start the service
```bash
cd packages/backend
bun run --watch src/index.ts
```

### "502 Bad Gateway"
**Problem:** Service crashed or wrong port  
**Solution:** Check service logs and port numbers
```bash
curl http://localhost:3000  # Test backend directly
```

### "SSL Certificate Error"
**Problem:** Certificate not obtained or DNS not propagated  
**Solution:** 
- Wait for DNS propagation (5-30 minutes)
- Re-run certbot: `sudo certbot --apache` or `sudo certbot --nginx`
- For Caddy, check logs: `sudo journalctl -u caddy -f`

### "403 Forbidden" on Static Files
**Problem:** Incorrect permissions  
**Solution:** Fix permissions
```bash
# For Apache/Nginx
sudo chown -R www-data:www-data /var/www/yektayar/static
sudo chmod 755 /var/www/yektayar/static

# For Caddy
sudo chown -R caddy:caddy /var/www/yektayar/static
sudo chmod 755 /var/www/yektayar/static
```

### "Vite WebSocket/HMR Connection Failed"
**Problem:** Vite's Hot Module Replacement (HMR) WebSocket fails to connect when accessed through reverse proxy  

**Solution:** This has been fixed in the Vite configuration using the `VITE_HMR_CLIENT_PORT` environment variable. The configuration in both `packages/mobile-app/vite.config.ts` and `packages/admin-panel/vite.config.ts` now supports both HTTP and HTTPS connections.

**How to use:**
- **For HTTPS** (recommended): `VITE_HMR_CLIENT_PORT=443 npm run dev:mobile`
- **For HTTP**: `VITE_HMR_CLIENT_PORT=80 npm run dev:mobile`
- **For local development**: Just `npm run dev:mobile` (no env var needed)
- **For custom ports**: Set `VITE_HMR_CLIENT_PORT` to your custom port

**Example systemd service or PM2 config:**
```bash
# For HTTPS reverse proxy
VITE_HMR_CLIENT_PORT=443 npm run dev:mobile

# For HTTP reverse proxy
VITE_HMR_CLIENT_PORT=80 npm run dev:mobile
```

**Note:** The HMR WebSocket will automatically:
- Use the same protocol as the page (http/https)
- Use the same hostname as the page
- Use the port specified in `VITE_HMR_CLIENT_PORT` (or dev server port if not set)
- Support subpaths if configured with the `base` option in vite.config.ts

---

## 📚 Detailed Documentation

For more detailed information:

- **[config/webserver/README.md](config/webserver/README.md)** - Comprehensive guide with advanced configuration
- **[docs/UBUNTU-24-DEPLOYMENT.md](docs/UBUNTU-24-DEPLOYMENT.md)** - Full deployment guide
- **[scripts/README.md](scripts/README.md)** - Scripts documentation

---

## 💡 Tips

1. **Use Caddy** for the simplest setup with automatic HTTPS
2. **Configure DNS first** before installing SSL certificates
3. **Test locally** before exposing to the internet:
   ```bash
   curl -H "Host: api.yektayar.ir" http://localhost
   ```
4. **Upload .apk files** to `/var/www/yektayar/static/` for easy distribution
5. **Use wildcard DNS** to simplify DNS configuration

---

**Last Updated:** 2025-11-11  
**Maintainer:** YektaYar Team
