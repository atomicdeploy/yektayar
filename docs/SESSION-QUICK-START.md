# Quick Start Guide - Session Acquisition Testing

This guide helps you quickly test the session acquisition functionality.

## Prerequisites

- Node.js >= 20.19.0
- npm >= 9.0.0
- Bun >= 1.0.0 (for backend, or use Node.js)

## Setup

### 1. Install Dependencies

```bash
# From root directory
npm install
```

### 2. Configure Environment

The environment files should already be created. If not:

**Backend** (`packages/backend/.env`):
```env
PORT=3000
HOST=localhost
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
```

**Mobile App** (`packages/mobile-app/.env`):
```env
API_BASE_URL=http://localhost:3000
```

**Admin Panel** (`packages/admin-panel/.env`):
```env
API_BASE_URL=http://localhost:3000
```

## Running the System

### Option 1: Start All Services (Recommended)

```bash
# From root directory
npm run dev
```

This starts:
- Backend on http://localhost:3000
- Admin Panel on http://localhost:5173
- Mobile App on http://localhost:8100

### Option 2: Start Services Individually

**Terminal 1 - Backend:**
```bash
cd packages/backend
bun run dev
# or if bun not available:
# npm run dev
```

**Terminal 2 - Mobile App:**
```bash
cd packages/mobile-app
npm run dev
```

**Terminal 3 - Admin Panel:**
```bash
cd packages/admin-panel
npm run dev
```

## Testing the Implementation

### 1. Test Backend API

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected output:
# {"status":"healthy","timestamp":"2024-11-11T..."}

# Test session acquisition
curl -X POST http://localhost:3000/api/auth/acquire-session

# Expected output:
# {
#   "success": true,
#   "data": {
#     "token": "some-long-token-here",
#     "expiresAt": "2024-12-11T..."
#   }
# }

# Save the token from above and test session validation
TOKEN="paste-token-here"
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $TOKEN"

# Expected output:
# {
#   "success": true,
#   "data": {
#     "token": "...",
#     "userId": null,
#     "isLoggedIn": false,
#     "expiresAt": "..."
#   }
# }
```

### 2. Test Mobile App

1. Open http://localhost:8100 in your browser
2. You should see the splash screen with:
   - YektaYar logo (heart icon)
   - Persian title: "یکتایار"
   - Persian tagline: "همراه شما در مسیر سلامت روان"
   - Loading spinner
   - Message: "در حال آماده‌سازی..."
3. Open browser DevTools Console
4. Check for logs:
   - "Acquiring new session..." or "Found stored session token, validating..."
   - "Session acquired successfully"
   - "Connecting to Socket.IO..."
   - "Socket.IO connected: [socket-id]"
   - "Server confirmed connection: {...}"
5. After ~1.5 seconds, should navigate to main app (Home tab)

**Expected Console Output:**
```
Found stored session token, validating...
Stored session is valid
Connecting to Socket.IO...
Socket.IO connected: abc123
Server confirmed connection: {message: "Connected to YektaYar server", ...}
```

### 3. Test Admin Panel

1. Open http://localhost:5173 in your browser
2. Open browser DevTools Console
3. Check for logs:
   - "Acquiring new session..." or "Found stored session token, validating..."
   - "Session acquired successfully"
   - "Connecting to Socket.IO..."
   - "Socket.IO connected: [socket-id]"
   - "Server confirmed connection: {...}"
4. The app should load normally

### 4. Test Socket.IO Connection

Open browser DevTools Console on either mobile app or admin panel:

```javascript
// Access the session store
const sessionStore = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0].$pinia.state.value.session

// Check socket status
console.log('Socket connected:', sessionStore.isSocketConnected)
console.log('Socket instance:', sessionStore.socket)

// Send a ping
sessionStore.socket.emit('ping')

// You should see a pong response in console:
// Received pong: {timestamp: "..."}
```

### 5. Test Session Persistence

1. In mobile app or admin panel, open browser DevTools
2. Go to Application > Local Storage
3. Look for keys:
   - Mobile: `yektayar_session_token`
   - Admin: `yektayar_admin_session_token`
4. Refresh the page
5. App should restore session without re-acquiring
6. Check console logs: "Found stored session token, validating..." → "Stored session is valid"

### 6. Test Error Handling

**Test Network Failure:**

1. Stop the backend server
2. Reload mobile app or admin panel
3. Should see error message (mobile app shows in Persian)
4. Start backend server again
5. Mobile app should auto-retry and succeed

**Test Invalid Token:**

1. Open browser DevTools > Application > Local Storage
2. Edit the session token value to something invalid
3. Reload the page
4. Should acquire a new session automatically
5. Check console: "Stored session is invalid, acquiring new one"

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Backend /health endpoint responds
- [ ] Backend /api/auth/acquire-session creates sessions
- [ ] Backend /api/auth/session validates tokens
- [ ] Mobile app shows splash screen
- [ ] Mobile app acquires session successfully
- [ ] Mobile app connects to Socket.IO
- [ ] Mobile app navigates to main app after session
- [ ] Mobile app persists session in localStorage
- [ ] Mobile app restores session on reload
- [ ] Admin panel acquires session on startup
- [ ] Admin panel connects to Socket.IO
- [ ] Admin panel persists session in localStorage
- [ ] Admin panel restores session on reload
- [ ] Socket.IO ping/pong works
- [ ] Error handling works (network failure)
- [ ] Error handling works (invalid token)
- [ ] Multiple tabs can connect simultaneously
- [ ] Sessions don't interfere between mobile/admin

## Common Issues

### Backend won't start
- **Issue**: `bun: command not found`
- **Solution**: Install Bun or use `npm run dev` instead

### CORS errors
- **Issue**: Browser console shows CORS error
- **Solution**: Check `CORS_ORIGIN` in backend `.env` matches frontend URL

### Socket.IO won't connect
- **Issue**: Console shows "Socket.IO connection error"
- **Solution**: 
  - Verify backend is running
  - Check session was acquired (token exists)
  - Check browser console for specific error

### Splash screen stuck
- **Issue**: Mobile app stays on splash screen
- **Solution**:
  - Check backend is running and reachable
  - Check browser console for errors
  - Check Network tab for failed requests
  - Verify API_BASE_URL is correct

### Session not persisting
- **Issue**: Session re-acquired on every page reload
- **Solution**:
  - Check browser allows localStorage
  - Check for errors in console
  - Verify token is being saved (check Application > Local Storage)

## API Documentation

Full API documentation available at: http://localhost:3000/swagger

## Next Steps

After verifying the session acquisition works:

1. Implement user registration/login
2. Link authenticated users to sessions
3. Add database persistence for sessions
4. Implement real-time messaging features
5. Add session management UI in admin panel

## Need Help?

- Check `docs/SESSION-ACQUISITION.md` for detailed documentation
- Check backend logs for server-side errors
- Check browser console for client-side errors
- Use browser DevTools Network tab to inspect requests
- Use Vue DevTools to inspect Pinia stores

## Tips

- Keep browser DevTools Console open while testing
- Use Network tab to see actual HTTP requests
- Use Vue DevTools to inspect Pinia session store state
- Test with both mobile app and admin panel open simultaneously
- Try refreshing pages to test session persistence
- Try stopping/starting backend to test error handling
