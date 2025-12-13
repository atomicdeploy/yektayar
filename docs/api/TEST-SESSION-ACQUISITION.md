# Test Session Acquisition

This document provides a quick verification that the session acquisition API is working correctly for both mobile-app and admin-panel.

## Prerequisites

1. Backend server running on http://localhost:3000
2. `.env` files configured in both mobile-app and admin-panel with `API_BASE_URL=http://localhost:3000`

## Backend Verification

### 1. Test Health Endpoint
```bash
curl http://localhost:3000/health
```
Expected response:
```json
{"status":"healthy","timestamp":"2025-11-12T..."}
```

### 2. Test Root Endpoint
```bash
curl http://localhost:3000/
```
Expected response:
```json
{
  "message":"YektaYar API Server",
  "version":"0.1.0",
  "status":"running",
  "features":{
    "rest":true,
    "websocket":true,
    "sessionAcquisition":true
  }
}
```

### 3. Test Session Acquisition Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json"
```
Expected response:
```json
{
  "success":true,
  "data":{
    "token":"<32-byte-base64url-token>",
    "expiresAt":"<ISO-8601-timestamp>"
  }
}
```

### 4. Test Session Validation Endpoint
```bash
# First acquire a token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/acquire-session | jq -r '.data.token')

# Then validate it
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/session
```
Expected response:
```json
{
  "success":true,
  "data":{
    "token":"<same-token>",
    "userId":null,
    "isLoggedIn":false,
    "expiresAt":"<ISO-8601-timestamp>"
  }
}
```

## Frontend Verification

### Mobile App (http://localhost:8100)

1. Start the mobile app: `cd packages/mobile-app && npm run dev`
2. Open browser to http://localhost:8100
3. Check browser console for logs:
   - "Acquiring new session..." or "Found stored session token, validating..."
   - "Session acquired successfully" 
   - "Connecting to Socket.IO..."
   - "Socket.IO connected: <socket-id>"
4. Verify no 404 errors in Network tab for `/api/auth/acquire-session`
5. Verify session token is stored in localStorage under key `yektayar_session_token`

### Admin Panel (http://localhost:5173)

1. Start the admin panel: `cd packages/admin-panel && npm run dev`
2. Open browser to http://localhost:5173
3. Check browser console for logs:
   - "Acquiring new session..." or "Found stored session token, validating..."
   - "Session acquired successfully"
   - "Connecting to Socket.IO..."
   - "Socket.IO connected: <socket-id>"
4. Verify no 404 errors in Network tab for `/api/auth/acquire-session`
5. Verify session token is stored in localStorage under key `yektayar_admin_session_token`

## CORS Testing

Test that CORS is properly configured for both frontend origins:

```bash
# Test from admin panel origin
curl -v -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  2>&1 | grep -E "Access-Control"

# Test from mobile app origin  
curl -v -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8100" \
  2>&1 | grep -E "Access-Control"
```

Both should return CORS headers allowing the origins.

## Common Issues

### Issue: 404 Not Found on /api/auth/acquire-session

**Cause**: Environment variable not properly configured or backend not running.

**Solution**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `.env` file exists in mobile-app/admin-panel
3. Verify `.env` contains `API_BASE_URL=http://localhost:3000`
4. Restart the dev server after changing `.env`

### Issue: Empty/undefined API URL in frontend

**Cause**: `.env` file is missing or `API_BASE_URL` is not set.

**Solution**:
- Create `.env` files from `.env.example` templates
- Verify `API_BASE_URL` is set in `.env` files
- The Vite config already exposes `API_BASE_URL` via the `define` option
- Restart the dev server after creating/modifying `.env` files

### Issue: CORS errors

**Cause**: Backend CORS configuration doesn't include frontend origin.

**Solution**:
- Check backend `.env` has `CORS_ORIGIN=http://localhost:5173,http://localhost:8100`
- Restart backend after changing CORS configuration

## Environment Variable Reference

### Backend (.env)
```env
PORT=3000
HOST=localhost
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
```

### Mobile App (.env)
```env
API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

### Admin Panel (.env)
```env
API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

## Notes

- The Vite configuration uses the `define` option to expose `API_BASE_URL` to client-side code (no `VITE_` prefix needed)
- `.env` files must be created from `.env.example` templates
- Session tokens are cryptographically secure (32 random bytes encoded as base64url)
- Sessions expire after 30 days
- Anonymous sessions can be linked to users after authentication
- Socket.IO connections require a valid session token
