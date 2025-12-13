# API Base URL Configuration Guide

## Overview

The `API_BASE_URL` environment variable configures the backend API endpoint for frontend applications (admin-panel and mobile-app). This guide explains how to view, update, and troubleshoot this configuration.

## Configuration Format

The API base URL should include the `/api` prefix if your backend routes are prefixed:

```bash
# Correct format (with /api prefix)
API_BASE_URL=http://localhost:3000/api

# Also valid (with trailing slash - automatically normalized)
API_BASE_URL=http://localhost:3000/api/
```

### Environment-Specific URLs

| Environment | API Base URL |
|------------|--------------|
| Local Development | `http://localhost:3000/api` |
| Staging | `https://staging-api.yektayar.ir/api` |
| Production | `https://api.yektayar.ir/api` |

## Viewing Current Configuration

### Option 1: Using grep
```bash
cat .env | grep API_BASE_URL
```

### Option 2: Using environment variables
```bash
# In the project root
source .env
echo $API_BASE_URL
```

### Option 3: From within the application
In browser console or Node.js REPL:
```javascript
// Admin Panel or Mobile App
import apiClient from '@/api'
console.log(apiClient.getBaseURL())
```

## Updating the API Base URL

### Step 1: Edit the .env file

```bash
# Using nano
nano .env

# Using vim
vim .env

# Using VS Code
code .env
```

### Step 2: Update the value

Find the line:
```bash
API_BASE_URL=http://localhost:3000/api
```

Change it to your desired URL:
```bash
API_BASE_URL=https://api.yektayar.ir/api
```

### Step 3: Restart applications

The change will only take effect after restarting the frontend applications:

```bash
# Restart admin panel
npm run dev:admin

# Restart mobile app
npm run dev:mobile
```

## Usage in Code

### Correct Usage (without /api prefix)

The apiClient automatically prepends the base URL, so your endpoint paths should NOT include `/api`:

```typescript
// ✅ CORRECT - path relative to base URL
await apiClient.get('/users')
// Calls: http://localhost:3000/api/users

await apiClient.post('/auth/login', credentials)
// Calls: http://localhost:3000/api/auth/login

await apiClient.get('/dashboard/stats')
// Calls: http://localhost:3000/api/dashboard/stats
```

### Incorrect Usage (with /api prefix)

```typescript
// ❌ WRONG - will result in duplicate /api
await apiClient.get('/api/users')
// Would call: http://localhost:3000/api/api/users (WRONG!)
```

### Using Absolute Paths

If you need to call an external API or bypass the base URL:

```typescript
// Using absolutePath option
await apiClient.get('https://external-api.com/data', {
  absolutePath: true,
  skipAuth: true  // Usually needed for external APIs
})
```

## Path Normalization

The apiClient automatically normalizes paths, handling edge cases:

```typescript
// All of these work correctly:
await apiClient.get('users')       // → /api/users
await apiClient.get('/users')      // → /api/users
await apiClient.get('/users/')     // → /api/users

// Base URL with trailing slash also works
// API_BASE_URL=http://localhost:3000/api/
await apiClient.get('/users')      // → http://localhost:3000/api/users (normalized)
```

## Troubleshooting

### Issue: 404 Not Found

**Symptoms:** API calls return 404 errors

**Solutions:**
1. Verify the base URL includes `/api`:
   ```bash
   cat .env | grep API_BASE_URL
   # Should show: API_BASE_URL=http://localhost:3000/api
   ```

2. Check that your code doesn't include `/api` prefix:
   ```typescript
   // Check for incorrect usage
   apiClient.get('/api/users')  // ❌ Remove /api
   apiClient.get('/users')      // ✅ Correct
   ```

3. Ensure backend is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Issue: CORS Errors

**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
1. Verify CORS_ORIGIN in backend .env includes your frontend URL:
   ```bash
   CORS_ORIGIN=http://localhost:5173,http://localhost:8100
   ```

2. Check that API_BASE_URL protocol (http/https) matches your environment

### Issue: Connection Refused

**Symptoms:** Network error, unable to connect

**Solutions:**
1. Verify backend server is running:
   ```bash
   npm run dev:backend
   ```

2. Check the port in API_BASE_URL matches backend PORT:
   ```bash
   cat .env | grep -E "(API_BASE_URL|PORT)"
   ```

3. For production, verify DNS and firewall settings

## Setup Scripts

The following setup scripts respect the API_BASE_URL configuration:

- `scripts/check-requirements.js` - Validates environment setup
- Frontend config files:
  - `packages/admin-panel/src/config/index.ts`
  - `packages/mobile-app/src/config/index.ts`

## Security Notes

1. **Never commit** `.env` file - it's in `.gitignore`
2. Use HTTPS in production: `https://api.yektayar.ir/api`
3. Validate SSL certificates in production
4. Keep API keys and tokens in environment variables, not in code

## Related Documentation

- [Environment Variables Guide](./ENVIRONMENT.md)
- [API Client Documentation](../packages/shared/src/api/README.md)
- [Backend API Documentation](../packages/backend/README.md)
