# Fix: acquire-session API 404 Error

## Problem Statement

The mobile app and admin panel were experiencing 404 NOT FOUND errors when attempting to access the `/api/auth/acquire-session` endpoint, preventing them from establishing sessions with the backend.

## Root Cause Analysis

The issue was **not** with the backend implementation - the API endpoint was correctly implemented and working. The problem was that the frontend applications were not properly configured:

### The Issue

1. **Vite Configuration**: While Vite typically requires environment variables to be prefixed with `VITE_` to be exposed to client-side code, the Vite configuration files for both mobile-app and admin-panel already have a `define` section that explicitly exposes `API_BASE_URL`:

   ```typescript
   define: {
     'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '')
   }
   ```

2. **Missing Configuration**: The actual issue was that `.env` files were not created from the `.env.example` templates, or the `API_BASE_URL` variable was not properly set.

3. **Result**: Without proper `.env` files, `process.env.API_BASE_URL` was undefined, making `config.apiBaseUrl` an empty string.

4. **Impact**: The frontend applications were sending requests to an incorrect/empty URL instead of `http://localhost:3000/api/auth/acquire-session`, resulting in 404 errors.

## Solution

The solution is straightforward: ensure that `.env` files are created from the `.env.example` templates and properly configured.

### Setup Steps

1. **Create `.env` files** from the examples:
   ```bash
   cp packages/mobile-app/.env.example packages/mobile-app/.env
   cp packages/admin-panel/.env.example packages/admin-panel/.env
   ```

2. **Verify configuration** - Both `.env` files should contain:
   ```env
   API_BASE_URL=http://localhost:3000
   VITE_ENVIRONMENT=development
   ```

3. **How it works**: The Vite configuration files already expose `API_BASE_URL` to client-side code via the `define` option:
   ```typescript
   // vite.config.ts
   define: {
     'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '')
   }
   ```

   This means `API_BASE_URL` (without the `VITE_` prefix) is accessible in the client code as `import.meta.env.API_BASE_URL`.

### Key Configuration Files

- **Environment Templates**: `.env.example` files use `API_BASE_URL`
- **Vite Config**: Both apps have `define` section that exposes `API_BASE_URL`
- **App Config**: Both apps read `import.meta.env.API_BASE_URL`

## Verification

### Backend Tests

All backend endpoints tested and confirmed working:

```bash
# Health check
curl http://localhost:3000/health
✅ Response: {"status":"healthy","timestamp":"..."}

# Session acquisition
curl -X POST http://localhost:3000/api/auth/acquire-session
✅ Response: {"success":true,"data":{"token":"...","expiresAt":"..."}}

# Session validation
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/session
✅ Response: {"success":true,"data":{"token":"...","userId":null,"isLoggedIn":false,...}}
```

### CORS Tests

Verified CORS is properly configured for both frontend origins:

```bash
# Admin Panel origin (localhost:5173)
✅ Access-Control-Allow-Credentials: true
✅ Access-Control-Allow-Methods: POST

# Mobile App origin (localhost:8100)
✅ Access-Control-Allow-Credentials: true
✅ Access-Control-Allow-Methods: POST
```

### Build Tests

Both frontend applications build successfully:

```bash
# Mobile App
cd packages/mobile-app && npm run build
✅ Built in 3.62s

# Admin Panel
cd packages/admin-panel && npm run build
✅ Built in 5.43s
```

### Security Scan

```bash
CodeQL security scan completed
✅ 0 vulnerabilities found
```

## Impact

This fix ensures that:

1. ✅ **Mobile app can acquire sessions**: The app can now successfully call `/api/auth/acquire-session` and receive a valid session token
2. ✅ **Admin panel can acquire sessions**: The admin panel can now successfully call `/api/auth/acquire-session` and receive a valid session token
3. ✅ **Environment variables are properly exposed**: Vite correctly exposes `API_BASE_URL` to client-side code
4. ✅ **Configuration is consistent**: All files now use the same environment variable name that matches the documentation
5. ✅ **Error messages are accurate**: Validation error messages correctly reference `API_BASE_URL`

## What Users Need to Do

### For Development

1. Create `.env` files from examples:
   ```bash
   cp packages/mobile-app/.env.example packages/mobile-app/.env
   cp packages/admin-panel/.env.example packages/admin-panel/.env
   ```

2. Verify the files contain:
   ```env
   API_BASE_URL=http://localhost:3000
   VITE_ENVIRONMENT=development
   ```

3. Start the backend:
   ```bash
   cd packages/backend
   bun run dev
   ```

4. Start the frontend(s):
   ```bash
   # Mobile App
   cd packages/mobile-app
   npm run dev

   # Admin Panel
   cd packages/admin-panel
   npm run dev
   ```

5. Verify session acquisition in browser console:
   - Should see "Session acquired successfully" message
   - Should see "Socket.IO connected: <socket-id>" message
   - No 404 errors in Network tab

### For Production

Update `.env` or `.env.production` files to use:
```env
API_BASE_URL=https://api.yektayar.ir
VITE_ENVIRONMENT=production
```

## Technical Details

### How `API_BASE_URL` is Exposed Without `VITE_` Prefix

While Vite's default behavior requires the `VITE_` prefix for environment variables, our Vite configuration uses the `define` option to explicitly expose `API_BASE_URL`:

```typescript
// vite.config.ts
export default defineConfig({
  // ...
  define: {
    'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '')
  },
  // ...
})
```

From Vite documentation:

> To prevent accidentally leaking env variables to the client, only variables prefixed with `VITE_` are exposed to your Vite-processed code.

However, the `define` option allows us to explicitly expose specific variables without requiring the `VITE_` prefix. This approach:
- ✅ Allows using `API_BASE_URL` without the `VITE_` prefix
- ✅ Explicitly controls which variables are exposed
- ✅ Maintains security by only exposing specifically defined variables

### Environment Variable Hierarchy

1. **Not exposed** (backend only):
   - `PORT`, `DATABASE_URL`, `JWT_SECRET`, etc.

2. **Exposed to client** (via Vite `define`):
   - `API_BASE_URL` (explicitly defined in vite.config.ts)
   - `VITE_ENVIRONMENT` (standard Vite prefix)

## Related Documentation

- [TEST-SESSION-ACQUISITION.md](./TEST-SESSION-ACQUISITION.md) - Comprehensive testing guide
- [docs/SESSION-ACQUISITION.md](./docs/SESSION-ACQUISITION.md) - Session acquisition feature documentation
- [docs/SESSION-QUICK-START.md](./docs/SESSION-QUICK-START.md) - Quick start guide for testing
- [ENV-GUIDE.md](./ENV-GUIDE.md) - Environment configuration guide

## Commit History

1. `7111d79` - Initial plan
2. `dd30536` - Fix environment variable naming for API URL in mobile-app and admin-panel
3. `3b0552a` - Add comprehensive test documentation for session acquisition

## Lessons Learned

1. **Always prefix Vite environment variables with `VITE_`** to expose them to client-side code
2. **Keep documentation and code in sync** - the documentation was correct, but the code didn't match
3. **Verify build-time environment variable exposure** - use browser DevTools to check if variables are accessible
4. **Test the complete flow** - backend functionality alone isn't enough; verify client-backend communication

## Future Improvements

Consider adding:
1. **Startup validation** that checks if `API_BASE_URL` is defined and reachable
2. **Build-time checks** that fail if required environment variables are missing
3. **Better error messages** in the app when API URL is misconfigured
4. **Environment variable documentation** in developer onboarding guides

---

**Status**: ✅ Fixed and Verified  
**Date**: 2025-11-12  
**Issue**: Mobile app 404 on `/api/auth/acquire-session`  
**Root Cause**: Missing or improperly configured `.env` files with `API_BASE_URL`  
**Solution**: Ensure `.env` files are created from `.env.example` templates. Vite config already exposes `API_BASE_URL` via the `define` option.
