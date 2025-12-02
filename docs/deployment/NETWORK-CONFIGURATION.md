# Interface and Port Configuration Guide

This document explains how to configure network interfaces (localhost vs all interfaces) and change ports for all services in the YektaYar platform.

---

## Table of Contents

- [Overview](#overview)
- [Backend Configuration](#backend-configuration)
- [Admin Panel Configuration](#admin-panel-configuration)
- [Mobile App Configuration](#mobile-app-configuration)
- [Common Scenarios](#common-scenarios)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Default Ports

| Service | Default Port | Interface | URL |
|---------|-------------|-----------|-----|
| Backend API | 3000 | localhost | http://localhost:3000 |
| Admin Panel | 5173 | localhost | http://localhost:5173 |
| Mobile App | 8100 | localhost | http://localhost:8100 |

### Interface Types

- **localhost** (`127.0.0.1` or `localhost`): Only accessible from the same machine
- **All interfaces** (`0.0.0.0`): Accessible from any network interface (LAN, internet)

---

## Backend Configuration

The backend server is built with Elysia.js running on Bun runtime.

### Method 1: Environment Variables (Recommended)

Edit `packages/backend/.env`:

```bash
# Default: localhost on port 3000
PORT=3000
HOST=localhost

# To bind to all interfaces (accessible from other machines)
PORT=3000
HOST=0.0.0.0

# To use a different port
PORT=4000
HOST=0.0.0.0
```

### Method 2: Update Code Directly

Edit `packages/backend/src/index.ts`:

```typescript
// Current code:
.listen(process.env.PORT || 3000)

// Change to specify both port and hostname:
.listen({
  port: process.env.PORT || 3000,
  hostname: process.env.HOST || 'localhost'
})

// Or hardcode values:
.listen({
  port: 4000,
  hostname: '0.0.0.0'
})
```

### Method 3: Command Line Override

```bash
# Run with custom port and host
cd packages/backend
PORT=4000 HOST=0.0.0.0 npm run dev

# Or with bun directly
PORT=4000 HOST=0.0.0.0 bun --watch src/index.ts
```

### Updating the .env.example

Update `packages/backend/.env.example` to include HOST:

```bash
# Server Configuration
PORT=3000
HOST=localhost  # Use 0.0.0.0 to bind to all interfaces
NODE_ENV=development
```

---

## Admin Panel Configuration

The admin panel uses Vite dev server.

### Method 1: Update vite.config.ts (Recommended)

Edit `packages/admin-panel/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: 'localhost', // Change to '0.0.0.0' for all interfaces
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Update if backend port changes
        changeOrigin: true
      }
    }
  }
})
```

### Bind to All Interfaces

```typescript
server: {
  port: 5173,
  host: '0.0.0.0', // Accessible from other machines
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### Change Port

```typescript
server: {
  port: 8080, // Change to your desired port
  host: 'localhost',
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### Method 2: Command Line Override

```bash
cd packages/admin-panel

# Custom port
npm run dev -- --port 8080

# Custom host (all interfaces)
npm run dev -- --host 0.0.0.0

# Both
npm run dev -- --port 8080 --host 0.0.0.0
```

---

## Mobile App Configuration

The mobile app also uses Vite dev server.

### Method 1: Update vite.config.ts

Edit `packages/mobile-app/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8100,
    host: 'localhost', // Change to '0.0.0.0' for all interfaces
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Method 2: Command Line Override

```bash
cd packages/mobile-app

# Custom port
npm run dev -- --port 9000

# Custom host
npm run dev -- --host 0.0.0.0

# Both
npm run dev -- --port 9000 --host 0.0.0.0
```

### For Testing on Mobile Devices

When testing on actual mobile devices, you need to:

1. Bind to all interfaces (`0.0.0.0`)
2. Use your computer's LAN IP address
3. Update the API endpoint in the mobile app

```typescript
// Example: Update capacitor.config.json for mobile testing
{
  "appId": "com.yektayar.app",
  "appName": "YektaYar",
  "webDir": "dist",
  "server": {
    "url": "http://192.168.1.100:8100", // Your computer's LAN IP
    "cleartext": true
  }
}
```

---

## Common Scenarios

### Scenario 1: Local Development Only

**Use Case**: Developing on your machine, no external access needed.

```bash
# Backend: packages/backend/.env
PORT=3000
HOST=localhost

# Admin Panel: packages/admin-panel/vite.config.ts
server: {
  port: 5173,
  host: 'localhost'
}

# Mobile App: packages/mobile-app/vite.config.ts
server: {
  port: 8100,
  host: 'localhost'
}
```

### Scenario 2: Testing on Mobile Devices (Same Network)

**Use Case**: Testing mobile app on actual device connected to same WiFi.

```bash
# Backend: packages/backend/.env
PORT=3000
HOST=0.0.0.0

# Admin Panel: packages/admin-panel/vite.config.ts
server: {
  port: 5173,
  host: '0.0.0.0'
}

# Mobile App: packages/mobile-app/vite.config.ts
server: {
  port: 8100,
  host: '0.0.0.0'
}

# Find your IP address:
# Linux/Mac: ifconfig | grep "inet "
# Windows: ipconfig

# Access from mobile:
# http://192.168.1.100:8100 (replace with your IP)
```

### Scenario 3: Avoid Port Conflicts

**Use Case**: Default ports already in use by other applications.

```bash
# Backend: packages/backend/.env
PORT=4000
HOST=localhost

# Admin Panel: packages/admin-panel/vite.config.ts
server: {
  port: 5180,
  host: 'localhost',
  proxy: {
    '/api': {
      target: 'http://localhost:4000', // Updated backend port
      changeOrigin: true
    }
  }
}

# Mobile App: packages/mobile-app/vite.config.ts
server: {
  port: 8200,
  host: 'localhost',
  proxy: {
    '/api': {
      target: 'http://localhost:4000', // Updated backend port
      changeOrigin: true
    }
  }
}
```

### Scenario 4: Production Deployment

**Use Case**: Deploying to VPS with reverse proxy.

```bash
# Backend: packages/backend/.env
PORT=3000
HOST=127.0.0.1  # Only accessible to reverse proxy
NODE_ENV=production

# Nginx/Apache handles external access
# Binds to 0.0.0.0:80 and 0.0.0.0:443
# Proxies to backend at 127.0.0.1:3000
```

### Scenario 5: Multiple Developers on Same Network

**Use Case**: Team development with shared backend.

```bash
# Developer 1 (Backend host):
# Backend: packages/backend/.env
PORT=3000
HOST=0.0.0.0

# Developer 2, 3, etc:
# Update API endpoints to point to Developer 1's IP
# packages/admin-panel/vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.1.100:3000', // Developer 1's IP
      changeOrigin: true
    }
  }
}
```

---

## Security Considerations

### Development Environment

#### Bind to Localhost (Default)
- ✅ Secure: Only accessible from your machine
- ✅ Fast: No network overhead
- ❌ Cannot test from other devices

#### Bind to All Interfaces (0.0.0.0)
- ⚠️ **Security Risk**: Accessible from any network
- ✅ Useful: Can test from mobile devices
- ⚠️ **Only use on trusted networks**

### Security Best Practices

1. **Always use localhost in production** (behind reverse proxy)
   ```bash
   # Production backend .env
   HOST=127.0.0.1  # Not 0.0.0.0
   ```

2. **Use firewall rules**
   ```bash
   # Allow only specific IPs
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   ```

3. **Enable authentication** - Never expose unauthenticated APIs on 0.0.0.0

4. **Use HTTPS in production** - Let reverse proxy handle SSL

5. **Don't expose admin panel publicly**
   ```bash
   # In production, admin panel should be:
   # - Behind VPN, or
   # - IP-restricted, or
   # - On separate subdomain with extra auth
   ```

### Warning Signs

🚨 **Never do this in production:**
```bash
# BAD - Backend exposed to internet
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
# Without reverse proxy, firewall, or authentication
```

✅ **Do this instead:**
```bash
# GOOD - Backend behind reverse proxy
PORT=3000
HOST=127.0.0.1
NODE_ENV=production
# Nginx/Apache on 0.0.0.0:443 proxies to 127.0.0.1:3000
```

---

## Troubleshooting

### Issue: Port Already in Use

**Symptom**: Error: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find what's using the port
lsof -i :3000
netstat -tulpn | grep 3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=4000 npm run dev
```

### Issue: Cannot Access from Other Devices

**Symptom**: Service works on localhost but not from mobile device

**Solution**:
```bash
# 1. Make sure host is set to 0.0.0.0
HOST=0.0.0.0

# 2. Check firewall
sudo ufw status
sudo ufw allow 3000/tcp

# 3. Find your IP address
ip addr show  # Linux
ifconfig      # Mac
ipconfig      # Windows

# 4. Access using IP, not localhost
http://192.168.1.100:3000
```

### Issue: CORS Errors When Changing Ports

**Symptom**: Frontend can't access backend due to CORS

**Solution**:
```bash
# Update CORS_ORIGIN in backend .env
CORS_ORIGIN=http://localhost:5173,http://localhost:8100,http://192.168.1.100:5173

# Or in code (packages/backend/src/index.ts):
.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8100', 'http://192.168.1.100:5173']
}))
```

### Issue: Proxy Not Working After Port Change

**Symptom**: API calls fail after changing backend port

**Solution**:
```typescript
// Update proxy target in vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000', // Match new backend port
      changeOrigin: true
    }
  }
}
```

### Issue: Permission Denied on Port < 1024

**Symptom**: Cannot bind to port 80 or 443

**Solution**:
```bash
# Don't run as root - use ports > 1024
PORT=8080 npm run dev

# In production, use reverse proxy
# Nginx/Apache run as root and handle ports 80/443
```

---

## Quick Reference Commands

```bash
# Check current port usage
lsof -i :3000
netstat -tulpn | grep 3000

# Find your IP address
hostname -I                    # Linux
ipconfig getifaddr en0         # Mac
ipconfig                       # Windows

# Test connectivity
curl http://localhost:3000/health
curl http://192.168.1.100:3000/health

# Start services with custom config
PORT=4000 HOST=0.0.0.0 npm run dev:backend
npm run dev:admin -- --port 5180 --host 0.0.0.0
npm run dev:mobile -- --port 8200 --host 0.0.0.0

# Check which process is using a port
lsof -i :3000
kill -9 $(lsof -t -i:3000)  # Kill process
```

---

## Configuration File Reference

### Backend .env Template

```bash
# Network Configuration
PORT=3000              # Backend port
HOST=localhost         # Use 'localhost' or '127.0.0.1' for local only
                      # Use '0.0.0.0' for all interfaces (testing on mobile)
NODE_ENV=development

# CORS (update when changing frontend ports)
CORS_ORIGIN=http://localhost:5173,http://localhost:8100

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/yektayar
```

### Admin Panel vite.config.ts Template

```typescript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,              // Admin panel port
    host: 'localhost',       // Use 'localhost' or '0.0.0.0'
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend URL
        changeOrigin: true
      }
    }
  }
})
```

### Mobile App vite.config.ts Template

```typescript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8100,              // Mobile app port
    host: 'localhost',       // Use 'localhost' or '0.0.0.0'
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend URL
        changeOrigin: true
      }
    }
  }
})
```

---

## Additional Resources

- [Elysia.js Server Configuration](https://elysiajs.com/concept/deployment.html)
- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [Understanding 0.0.0.0 vs 127.0.0.1](https://stackoverflow.com/questions/20778771/what-is-the-difference-between-0-0-0-0-127-0-0-1-and-localhost)

---

**Last Updated**: 2025-11-10  
**Version**: 1.0
