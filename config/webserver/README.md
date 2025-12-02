# Web Server Configurations for YektaYar Platform

This directory contains reverse proxy configurations for Apache, Nginx, and Caddy web servers to proxy requests to YektaYar services.

## 📋 Overview

The YektaYar platform consists of multiple services running on different ports:

- **Backend API** (`api.yektayar.ir`) → `localhost:3000`
- **WebSocket Server** (`ws.yektayar.ir`) → `localhost:3500` (Socket.IO + Native WebSocket)
- **Admin Panel** (`panel.yektayar.ir`) → `localhost:5173`
- **Mobile App** (`app.yektayar.ir`) → `localhost:8100`
- **Static Files** (`static.yektayar.ir`) → `/var/www/yektayar/static`

Each web server configuration provides:
- ✅ HTTPS/SSL support (automatic with Caddy, manual with Apache/Nginx)
- ✅ HTTP to HTTPS redirection
- ✅ WebSocket support for real-time features and HMR (Hot Module Reload)
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Proper request forwarding and headers
- ✅ Access and error logging

---

## 🚀 Quick Start

### Choose Your Web Server

Pick one of the following web servers based on your preference:

| Web Server | Pros | Cons | Best For |
|------------|------|------|----------|
| **Apache** | Mature, widely supported, .htaccess | Slower than Nginx/Caddy | Traditional setups, shared hosting |
| **Nginx** | Fast, efficient, widely used | Manual SSL setup | High traffic, production servers |
| **Caddy** | Automatic HTTPS, simplest config | Newer, less widespread | Modern deployments, ease of use |

### Installation

Run the appropriate installation script from the `scripts` directory:

```bash
# For Apache
sudo ./scripts/install-apache.sh

# For Nginx
sudo ./scripts/install-nginx.sh

# For Caddy
sudo ./scripts/install-caddy.sh
```

---

## 📁 Directory Structure

```
config/webserver/
├── apache/
│   ├── api.yektayar.ir.conf
│   ├── ws.yektayar.ir.conf
│   ├── panel.yektayar.ir.conf
│   ├── app.yektayar.ir.conf
│   └── static.yektayar.ir.conf
├── nginx/
│   ├── api.yektayar.ir.conf
│   ├── ws.yektayar.ir.conf
│   ├── panel.yektayar.ir.conf
│   ├── app.yektayar.ir.conf
│   └── static.yektayar.ir.conf
├── caddy/
│   ├── Caddyfile
│   ├── api.yektayar.ir
│   ├── ws.yektayar.ir
│   ├── panel.yektayar.ir
│   ├── app.yektayar.ir
│   └── static.yektayar.ir
└── README.md (this file)
```

---

## 🔧 Manual Configuration

If you prefer to configure manually without using the installation scripts:

### Apache

1. **Install Apache and required modules:**
   ```bash
   sudo apt install apache2
   sudo a2enmod proxy proxy_http proxy_wstunnel ssl rewrite headers
   ```

2. **Copy configuration files:**
   ```bash
   sudo cp config/webserver/apache/*.conf /etc/apache2/sites-available/
   ```

3. **Enable sites:**
   ```bash
   sudo a2ensite api.yektayar.ir.conf
   sudo a2ensite ws.yektayar.ir.conf
   sudo a2ensite panel.yektayar.ir.conf
   sudo a2ensite app.yektayar.ir.conf
   sudo a2ensite static.yektayar.ir.conf
   ```

4. **Create static files directory:**
   ```bash
   sudo mkdir -p /var/www/yektayar/static
   sudo chown -R www-data:www-data /var/www/yektayar/static
   ```

5. **Test and restart:**
   ```bash
   sudo apache2ctl configtest
   sudo systemctl restart apache2
   ```

6. **Install SSL certificates:**
   ```bash
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d api.yektayar.ir
   sudo certbot --apache -d ws.yektayar.ir
   sudo certbot --apache -d panel.yektayar.ir
   sudo certbot --apache -d app.yektayar.ir
   sudo certbot --apache -d static.yektayar.ir
   ```

### Nginx

1. **Install Nginx:**
   ```bash
   sudo apt install nginx
   ```

2. **Copy configuration files:**
   ```bash
   sudo cp config/webserver/nginx/*.conf /etc/nginx/sites-available/
   ```

3. **Enable sites:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/api.yektayar.ir.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/ws.yektayar.ir.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/panel.yektayar.ir.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/app.yektayar.ir.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/static.yektayar.ir.conf /etc/nginx/sites-enabled/
   ```

4. **Create static files directory:**
   ```bash
   sudo mkdir -p /var/www/yektayar/static
   sudo chown -R www-data:www-data /var/www/yektayar/static
   ```

5. **Test and restart:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Install SSL certificates:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yektayar.ir
   sudo certbot --nginx -d ws.yektayar.ir
   sudo certbot --nginx -d panel.yektayar.ir
   sudo certbot --nginx -d app.yektayar.ir
   sudo certbot --nginx -d static.yektayar.ir
   ```

### Caddy

1. **Install Caddy:**
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy
   ```

2. **Create config directory:**
   ```bash
   sudo mkdir -p /etc/caddy/conf.d
   ```

3. **Copy configuration files:**
   ```bash
   sudo cp config/webserver/caddy/* /etc/caddy/
   sudo cp config/webserver/caddy/Caddyfile /etc/caddy/Caddyfile
   ```

4. **Update email in Caddyfile:**
   ```bash
   sudo nano /etc/caddy/Caddyfile
   # Change admin@yektayar.ir to your email
   ```

5. **Create static files directory:**
   ```bash
   sudo mkdir -p /var/www/yektayar/static
   sudo chown -R caddy:caddy /var/www/yektayar/static
   ```

6. **Create log directory:**
   ```bash
   sudo mkdir -p /var/log/caddy
   sudo chown -R caddy:caddy /var/log/caddy
   ```

7. **Test and start:**
   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl enable caddy
   sudo systemctl restart caddy
   ```

**Note:** Caddy automatically obtains and renews SSL certificates from Let's Encrypt. No additional SSL setup required!

---

## 🌐 DNS Configuration

Before SSL certificates can be obtained, you need to configure DNS records:

```
A    api.yektayar.ir      → YOUR_SERVER_IP
A    ws.yektayar.ir       → YOUR_SERVER_IP
A    panel.yektayar.ir    → YOUR_SERVER_IP
A    app.yektayar.ir      → YOUR_SERVER_IP
A    static.yektayar.ir   → YOUR_SERVER_IP
```

Or use a wildcard:
```
A    *.yektayar.ir        → YOUR_SERVER_IP
```

Wait for DNS propagation (5-30 minutes) before requesting SSL certificates.

---

## 🔒 SSL/HTTPS Setup

### Apache & Nginx (Let's Encrypt)

Both Apache and Nginx use Certbot for SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache  # For Apache
sudo apt install certbot python3-certbot-nginx   # For Nginx

# Obtain certificates (interactive)
sudo certbot --apache  # For Apache
sudo certbot --nginx   # For Nginx

# Test auto-renewal
sudo certbot renew --dry-run

# Auto-renewal is configured via systemd timer
sudo systemctl status certbot.timer
```

### Caddy (Automatic)

Caddy automatically obtains SSL certificates from Let's Encrypt when:
1. DNS is properly configured
2. Ports 80 and 443 are accessible
3. Valid email is configured in Caddyfile

No manual intervention required!

---

## 🔌 WebSocket Domain Configuration

The platform provides a dedicated domain (`ws.yektayar.ir`) for WebSocket and Socket.IO connections. This allows for:
- Separate scaling and load balancing of WebSocket traffic
- Better monitoring and logging of real-time connections
- Cleaner architecture separating REST API from WebSocket traffic

### Backend Setup

The backend runs two servers:
1. **Main API Server** (default port 3000) - Handles REST API + Socket.IO on `/socket.io/` path
2. **Dedicated WebSocket Server** (default port 3500) - Handles both Socket.IO and native WebSocket

To start the dedicated WebSocket server:
```bash
cd packages/backend

# Development mode
npm run dev:ws

# Production mode
npm run start:ws
```

### Supported Protocols

The `ws.yektayar.ir` domain supports both protocols simultaneously:

#### Socket.IO
Connect to: `wss://ws.yektayar.ir/socket.io/`
- Full Socket.IO client support
- Automatic reconnection
- Fallback to polling if WebSocket fails
- Same authentication and events as main server

#### Native WebSocket
Connect to: `wss://ws.yektayar.ir/ws?token=YOUR_TOKEN`
- Standard WebSocket protocol (RFC 6455)
- Authentication via query parameter or Authorization header
- JSON message format: `{"event": "eventName", "data": {...}}`
- Same events as Socket.IO for compatibility

### Testing WebSocket Connection

```bash
# Test Socket.IO endpoint
curl https://ws.yektayar.ir/socket.io/

# Test native WebSocket (requires wscat)
npm install -g wscat
wscat -c "wss://ws.yektayar.ir/ws?token=YOUR_TOKEN"

# Send a ping message (native WebSocket)
> {"event":"ping"}

# You should receive a pong response
< {"event":"pong","data":{"timestamp":"2024-..."}}
```

### Configuration

Set the WebSocket port in your `.env` file:
```env
WEBSOCKET_PORT=3500
```

The reverse proxy configurations for Apache, Nginx, and Caddy are already set up to route `ws.yektayar.ir` to this port.

---

## 🧪 Testing Your Configuration

### 1. Test DNS Resolution
```bash
nslookup api.yektayar.ir
nslookup ws.yektayar.ir
nslookup panel.yektayar.ir
nslookup app.yektayar.ir
nslookup static.yektayar.ir
```

### 2. Test Web Server Config
```bash
# Apache
sudo apache2ctl configtest

# Nginx
sudo nginx -t

# Caddy
sudo caddy validate --config /etc/caddy/Caddyfile
```

### 3. Test HTTP/HTTPS Access
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://api.yektayar.ir

# Test HTTPS
curl -I https://api.yektayar.ir

# Test WebSocket upgrade (if backend supports it)
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://api.yektayar.ir/ws
```

### 4. Test Static Files
```bash
# Upload a test file
echo "Test file" | sudo tee /var/www/yektayar/static/test.txt

# Access via browser or curl
curl https://static.yektayar.ir/test.txt
```

### 5. Compare Installed Configs with Repository

Use the configuration comparison script to check if your installed webserver configurations match the repository:

```bash
./scripts/compare-webserver-configs.sh
```

**What it does:**
- Detects installed webservers (Apache, Nginx, Caddy)
- Compares installed configurations with repository versions
- Shows differences between configs
- Provides step-by-step update instructions
- Warns about outdated configurations

**When to use:**
- After pulling updates from the repository
- Before and after webserver updates
- When troubleshooting configuration issues
- When migrating to a new server

**Example output:**
```
✅ Detected webservers: nginx 
========================================
Checking nginx configurations
========================================
✅ api.yektayar.ir.conf - Up to date
❌ panel.yektayar.ir.conf - Differs from repository
```

The script will interactively ask if you want to see differences and update instructions.

---

## 📊 Monitoring and Logs

### Apache
```bash
# View access logs
sudo tail -f /var/log/apache2/api.yektayar.ir_access.log

# View error logs
sudo tail -f /var/log/apache2/api.yektayar.ir_error.log

# View all logs
sudo tail -f /var/log/apache2/*.log
```

### Nginx
```bash
# View access logs
sudo tail -f /var/log/nginx/api.yektayar.ir_access.log

# View error logs
sudo tail -f /var/log/nginx/api.yektayar.ir_error.log

# View all logs
sudo tail -f /var/log/nginx/*.log
```

### Caddy
```bash
# View logs via journalctl
sudo journalctl -u caddy -f

# View access logs (if file logging is enabled)
sudo tail -f /var/log/caddy/api.yektayar.ir_access.log
```

---

## 🔥 Firewall Configuration

Ensure ports 80 and 443 are open:

```bash
# Using UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status

# Using firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "Connection Refused"
- **Cause:** Backend service is not running
- **Solution:** Start the backend service on the correct port
  ```bash
  cd packages/backend
  bun run --watch src/index.ts
  ```

#### 2. "502 Bad Gateway"
- **Cause:** Backend service crashed or port mismatch
- **Solution:** Check backend logs and verify port numbers
  ```bash
  sudo systemctl status apache2  # or nginx/caddy
  curl http://localhost:3000     # Test backend directly
  ```

#### 3. "SSL Certificate Error"
- **Cause:** Certificate not obtained or expired
- **Solution:** Re-run certbot or check Caddy logs
  ```bash
  sudo certbot certificates       # Check certificate status
  sudo certbot renew             # Renew certificates
  ```

#### 4. "WebSocket Connection Failed"
- **Cause:** WebSocket upgrade not properly configured
- **Solution:** Verify WebSocket configuration in web server config
  ```bash
  # For Apache, ensure proxy_wstunnel is enabled
  sudo a2enmod proxy_wstunnel
  sudo systemctl restart apache2
  ```

##### Vite HMR WebSocket Issue
If you see errors in the browser console about Vite HMR WebSocket failing to connect when accessing through a reverse proxy (e.g., `https://app.yektayar.ir` or `https://panel.yektayar.ir`), this has been fixed using environment-based configuration:

**Configuration:**
- **Mobile App:** `packages/mobile-app/vite.config.ts` uses `VITE_HMR_CLIENT_PORT` env var
- **Admin Panel:** `packages/admin-panel/vite.config.ts` uses `VITE_HMR_CLIENT_PORT` env var

**Usage:**
```bash
# For HTTPS (port 443)
VITE_HMR_CLIENT_PORT=443 npm run dev:mobile

# For HTTP (port 80)
VITE_HMR_CLIENT_PORT=80 npm run dev:mobile

# For local development (no proxy)
npm run dev:mobile  # Uses dev server port automatically
```

**How it works:**
- The HMR client uses the page's protocol (http/https) automatically
- The HMR client uses the page's hostname automatically
- The `VITE_HMR_CLIENT_PORT` specifies which port to connect to
- This supports HTTP, HTTPS, custom ports, and subpaths

**For production deployment with PM2 or systemd:**
Set the environment variable in your process manager configuration to match your reverse proxy setup (typically 443 for HTTPS or 80 for HTTP).


#### 5. Static Files 403 Forbidden
- **Cause:** Incorrect permissions on static directory
- **Solution:** Fix permissions
  ```bash
  sudo chown -R www-data:www-data /var/www/yektayar/static  # Apache/Nginx
  sudo chown -R caddy:caddy /var/www/yektayar/static        # Caddy
  sudo chmod 755 /var/www/yektayar/static
  ```

---

## 📝 Advanced Configuration

### Custom Ports

If your services run on different ports, edit the configuration files:

```bash
# Apache
sudo nano /etc/apache2/sites-available/api.yektayar.ir.conf
# Change: ProxyPass / http://127.0.0.1:3000/

# Nginx
sudo nano /etc/nginx/sites-available/api.yektayar.ir.conf
# Change: proxy_pass http://127.0.0.1:3000;

# Caddy
sudo nano /etc/caddy/conf.d/api.yektayar.ir
# Change: reverse_proxy localhost:3000
```

### Rate Limiting

Add rate limiting to prevent abuse:

#### Nginx Example
```nginx
# In /etc/nginx/nginx.conf
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    # In site config
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### IP Whitelisting

Restrict access to admin panel by IP:

#### Apache Example
```apache
<Location />
    Require ip 192.168.1.0/24
    Require ip 10.0.0.1
</Location>
```

#### Nginx Example
```nginx
location / {
    allow 192.168.1.0/24;
    allow 10.0.0.1;
    deny all;
    proxy_pass http://127.0.0.1:5173;
}
```

---

## 🔄 Updating Configurations

After modifying configuration files:

```bash
# Apache
sudo apache2ctl configtest
sudo systemctl reload apache2

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo caddy reload --config /etc/caddy/Caddyfile
```

---

## 📚 Additional Resources

- [Apache Documentation](https://httpd.apache.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [YektaYar Deployment Guide](../../docs/UBUNTU-24-DEPLOYMENT.md)

---

## 🤝 Support

For issues or questions:
- Check the [main README](../../README.md)
- Review the [deployment guide](../../docs/UBUNTU-24-DEPLOYMENT.md)
- Open an issue on GitHub

---

**Last Updated:** 2025-11-11  
**Maintainer:** YektaYar Team
