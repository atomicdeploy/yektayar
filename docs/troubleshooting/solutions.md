# Error Solutions

This file contains solutions for various errors that may occur in the YektaYar application.
These solutions are only included in development builds.

## CONFIG_ERROR

### Problem
The application cannot start because the API_BASE_URL environment variable is not configured correctly.

### Solution

You can fix this by running the environment setup script:

```bash
./scripts/manage-env.sh
```

Or manually create/update your `.env` file with:

```bash
API_BASE_URL=http://localhost:3000
```

**Note:** After updating the environment variables, you need to restart the development server for changes to take effect.

## NETWORK_ERROR

### Problem
Cannot connect to the API server. The server may be offline or blocked by a firewall.

### Solution

Check the following:

```bash
# 1. Verify the backend server is running
ps aux | grep node

# 2. Check if the port is listening
netstat -tuln | grep 3000

# 3. Try starting the backend
npm run dev:backend

# 4. Check firewall settings
sudo ufw status
```

**Note:** Ensure the backend server is started before running the frontend applications.

## CORS_ERROR

### Problem
The API server is not configured to accept requests from this origin due to CORS (Cross-Origin Resource Sharing) restrictions.

### Solution

Update the backend CORS configuration in your `.env` file:

```bash
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
```

**Note:** After updating CORS settings, restart the backend server for changes to take effect.

## TIMEOUT_ERROR

### Problem
API health check timed out. The server may be slow to respond or unreachable.

### Solution

Check the following:

```bash
# 1. Verify server is responding
curl http://localhost:3000/health

# 2. Check server logs for errors
npm run dev:backend

# 3. Check network connectivity
ping localhost
```

**Note:** If the server is under heavy load, consider increasing the timeout value.

## DNS_ERROR

### Problem
Cannot resolve the API server hostname. There may be a DNS configuration issue.

### Solution

Check your DNS settings and API URL:

```bash
# 1. Verify the hostname in .env
cat .env | grep API_BASE_URL

# 2. Test DNS resolution
nslookup api.yektayar.ir

# 3. Use IP address as workaround
API_BASE_URL=http://127.0.0.1:3000
```

**Note:** If using a custom domain, ensure DNS records are properly configured.

## SSL_ERROR

### Problem
There is a problem with the API server's SSL/TLS security certificate.

### Solution

For development, you may need to accept self-signed certificates:

```bash
# Update .env to use HTTP instead of HTTPS for local dev
API_BASE_URL=http://localhost:3000
```

**Note:** For production, ensure valid SSL certificates are installed on the server.

## SERVER_ERROR

### Problem
The API server responded with an error status code, indicating a server-side issue.

### Solution

Check the backend logs and server status:

```bash
# 1. View backend logs
npm run dev:backend

# 2. Check for error messages
journalctl -u backend-service -n 50

# 3. Restart the backend
npm run dev:backend
```

**Note:** Contact the system administrator if the problem persists.
