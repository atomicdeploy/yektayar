# Session Acquisition Feature

## Overview

This implementation provides session acquisition functionality for both the mobile app and admin panel. Sessions can be created anonymously and later linked to authenticated users.

## Architecture

### Backend (Elysia.js + Bun)

#### Endpoints

**POST /api/auth/acquire-session**
- Creates a new anonymous session
- Returns a secure session token (32-byte base64url encoded)
- Token expires in 30 days
- No authentication required

**GET /api/auth/session**
- Validates an existing session token
- Requires `Authorization: Bearer <token>` header
- Returns session details (token, userId, isLoggedIn, expiresAt)

**POST /api/auth/logout**
- Invalidates the current session
- Requires `Authorization: Bearer <token>` header

#### Socket.IO

The backend includes a Socket.IO server that:
- Requires session token for authentication
- Accepts token via `auth.token` or `query.token`
- Creates room for each session (`session:<token>`)
- Creates room for authenticated users (`user:<userId>`)
- Emits `connected` event on successful connection
- Supports `ping`/`pong` for connection health checks

#### Session Service

Located in `src/services/sessionService.ts`, provides:
- `generateSessionToken()`: Creates cryptographically secure tokens
- `createAnonymousSession()`: Creates new session (ready for DB integration)
- `validateSessionToken()`: Validates existing sessions
- `linkUserToSession()`: Links user to session after authentication
- `invalidateSession()`: Removes session on logout

### Frontend (Mobile App & Admin Panel)

#### Session Store (Pinia)

Both apps include a session store with:

**State:**
- `session`: Current session object (token, userId, isLoggedIn, expiresAt)
- `isAcquiring`: Flag for session acquisition in progress
- `socket`: Socket.IO client instance
- `isSocketConnected`: Socket connection status

**Actions:**
- `acquireSession()`: Get new or restore existing session
- `validateStoredSession()`: Check if stored token is still valid
- `connectSocket()`: Establish Socket.IO connection with token
- `disconnectSocket()`: Close Socket.IO connection
- `logout()`: Clear session and disconnect
- `linkUserToSession()`: Update session with user info

#### Mobile App Flow

1. App starts → Shows splash screen
2. Splash screen triggers `acquireSession()`
3. Checks localStorage for existing token
4. If found, validates token with backend
5. If valid, uses existing session
6. If not valid or missing, requests new session
7. Stores token in localStorage
8. Connects Socket.IO with token
9. Navigates to main app (tabs)

#### Admin Panel Flow

1. App starts (main.ts)
2. Immediately calls `acquireSession()`
3. Checks localStorage for existing token
4. If found, validates token with backend
5. If valid, uses existing session
6. If not valid or missing, requests new session
7. Stores token in localStorage
8. Connects Socket.IO with token
9. App renders normally

## Usage

### Backend

```bash
cd packages/backend

# Development (requires Bun)
bun run dev

# Or with Node.js
npm run dev
```

### Mobile App

```bash
cd packages/mobile-app

# Development server
npm run dev

# Build for production
npm run build
```

### Admin Panel

```bash
cd packages/admin-panel

# Development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

### Backend (.env)
```env
PORT=3000
HOST=localhost
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
```

### Mobile App (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Admin Panel (.env)
```env
VITE_API_URL=http://localhost:3000
```

## API Examples

### Acquire Session

```bash
curl -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "abc123...",
    "expiresAt": "2024-12-11T11:30:00.000Z"
  }
}
```

### Validate Session

```bash
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer abc123..."
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "abc123...",
    "userId": null,
    "isLoggedIn": false,
    "expiresAt": "2024-12-11T11:30:00.000Z"
  }
}
```

### Socket.IO Connection (JavaScript)

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-session-token'
  }
})

socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.on('connected', (data) => {
  console.log('Server confirmed:', data)
})

// Ping/pong health check
socket.emit('ping')
socket.on('pong', (data) => {
  console.log('Pong received:', data)
})
```

## Database Integration (Future)

The session service is ready for database integration. When a database is connected:

1. Update `createAnonymousSession()` to insert into `sessions` table
2. Update `validateSessionToken()` to query `sessions` table
3. Update `linkUserToSession()` to update `user_id` field
4. Update `invalidateSession()` to delete from `sessions` table

### Sessions Table Schema

```sql
CREATE TABLE sessions (
  token VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_logged_in BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Security Considerations

- Tokens are cryptographically secure (32 random bytes)
- Sessions expire after 30 days
- Socket.IO connections require valid session token
- Tokens stored in localStorage (consider httpOnly cookies for production)
- CORS configured to allow specific origins only
- Session metadata tracks IP and user agent

## Testing

### Manual Testing

1. Start backend: `cd packages/backend && bun run dev`
2. Start mobile app: `cd packages/mobile-app && npm run dev`
3. Open mobile app in browser
4. Observe splash screen with Persian tagline
5. Check console for session acquisition logs
6. Check console for Socket.IO connection logs
7. Verify navigation to main app after session acquired

### Automated Testing (TODO)

- Unit tests for session service
- Integration tests for auth endpoints
- Socket.IO connection tests
- Session persistence tests
- Error handling tests

## Troubleshooting

### Session not acquired
- Check backend is running on correct port
- Check VITE_API_URL in frontend .env
- Check CORS settings in backend .env
- Check browser console for errors

### Socket.IO not connecting
- Verify session was acquired successfully
- Check Socket.IO server is running
- Check token is being sent in auth payload
- Check backend logs for connection errors

### Splash screen stuck
- Check network tab for failed requests
- Check console for JavaScript errors
- Verify API endpoint is reachable
- Check backend logs for errors

## Future Enhancements

1. Add database persistence for sessions
2. Add session refresh mechanism
3. Add session activity tracking
4. Add admin panel to view active sessions
5. Add session revocation capability
6. Add rate limiting for session acquisition
7. Add session analytics and monitoring
8. Consider httpOnly cookies for enhanced security
9. Add session fingerprinting for security
10. Add multi-device session management

## Related Files

### Backend
- `packages/backend/src/services/sessionService.ts`
- `packages/backend/src/routes/auth.ts`
- `packages/backend/src/websocket/socketServer.ts`
- `packages/backend/src/index.ts`

### Mobile App
- `packages/mobile-app/src/stores/session.ts`
- `packages/mobile-app/src/views/SplashScreen.vue`
- `packages/mobile-app/src/router/index.ts`

### Admin Panel
- `packages/admin-panel/src/stores/session.ts`
- `packages/admin-panel/src/main.ts`
