# WebSocket Testing Guide

This guide explains how to test the WebSocket implementation with both Socket.IO and native WebSocket protocols.

## Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL Database

The session management requires PostgreSQL. Start it with Docker:

```bash
docker run --name yektayar-postgres \
  -e POSTGRES_USER=yektayar_user \
  -e POSTGRES_PASSWORD=your_secure_password_here \
  -e POSTGRES_DB=yektayar \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Run Database Migrations

```bash
cd packages/backend
# Initialize database schema (if migrations exist)
# npm run db:migrate
```

## Starting the Servers

### Option 1: With Bun (Recommended)

```bash
# Start main API server (includes WebSocket support)
cd packages/backend
bun run src/index.ts
```

The server will start on:
- REST API: `http://localhost:3000`
- WebSocket endpoint: `ws://localhost:3000/ws`
- Socket.IO endpoint: `http://localhost:3000/ws`

### Option 2: With Node.js

```bash
# Build first
cd packages/backend
npm run build

# Start server
node dist/index.js
```

## Testing WebSocket Connections

### Method 1: Using the HTML Debugger (Recommended)

1. **Serve the debugger HTML files**:
   ```bash
   cd packages/mobile-app/public
   python3 -m http.server 8080
   ```

2. **Acquire a session token**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/acquire-session | jq .
   ```
   
   Response:
   ```json
   {
     "success": true,
     "data": {
       "token": "sess_abc123...",
       "expiresAt": "2025-11-23T08:00:00.000Z"
     }
   }
   ```

3. **Open the debugger**:
   - Navigate to: `http://localhost:8080/websocket-debugger.html`
   
4. **Configure connection**:
   - **Server Address**: `http://localhost:3000/ws` (for Socket.IO)
   - **Session Token**: Paste the token from step 2
   - Click **Connect**

5. **Test events**:
   - Click **Ping** → Should receive `pong` response
   - Click **Status** → Should receive server status
   - Click **Info** → Should receive server info
   - Click **Echo** → Should echo back a message
   - Click **Message** → Should confirm message received

### Method 2: Using wscat (Native WebSocket)

1. **Install wscat**:
   ```bash
   npm install -g wscat
   ```

2. **Get a session token** (same as above)

3. **Connect**:
   ```bash
   wscat -c "ws://localhost:3000/ws?token=YOUR_SESSION_TOKEN"
   ```

4. **Send messages**:
   ```json
   > {"event":"ping"}
   < {"event":"pong","data":{"timestamp":"2025-11-22T..."}}
   
   > {"event":"status"}
   < {"event":"status_response","data":{...}}
   
   > {"event":"echo","data":"Hello World"}
   < {"event":"echo_response","data":{"received":"Hello World",...}}
   ```

### Method 3: Using Socket.IO Client (Node.js)

Create a test file `test-socketio.js`:

```javascript
import { io } from 'socket.io-client';

// Get token first via curl or fetch

const token = 'YOUR_SESSION_TOKEN';

const socket = io('http://localhost:3000/ws', {
  auth: { token },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Test ping
  socket.emit('ping');
});

socket.on('connected', (data) => {
  console.log('Welcome:', data);
});

socket.on('pong', (data) => {
  console.log('Pong received:', data);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

Run with:
```bash
node test-socketio.js
```

## Protocol Auto-Detection

Both Socket.IO and native WebSocket work on the same `/ws` path:

- **Socket.IO**: Detected by `EIO` query parameter
  - URL: `http://localhost:3000/ws` (Socket.IO client adds `?EIO=4` automatically)
  
- **Native WebSocket**: Any WebSocket upgrade without `EIO` parameter
  - URL: `ws://localhost:3000/ws?token=YOUR_TOKEN`

## Authentication

All connections require a valid session token:

### Socket.IO
```javascript
// Preferred: via auth option
io('http://localhost:3000/ws', { auth: { token: 'YOUR_TOKEN' } })

// Alternative: via query parameter
io('http://localhost:3000/ws?token=YOUR_TOKEN')
```

### Native WebSocket
```javascript
// Browser: must use query parameter
new WebSocket('ws://localhost:3000/ws?token=YOUR_TOKEN')

// Node.js with 'ws' library: can use headers
const ws = new WebSocket('ws://localhost:3000/ws', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

## Troubleshooting

### Connection Refused
- Ensure the backend server is running
- Check the port (default: 3000)
- Verify firewall settings

### Authentication Failed
- Database must be running for session management
- Session token must be valid and not expired
- Token format: no extra spaces or quotes

### Socket.IO Not Connecting
- Check CORS settings in `.env` file
- Ensure Socket.IO client version is compatible (4.x)
- Try enabling polling transport: `transports: ['websocket', 'polling']`

### Native WebSocket Not Connecting
- Verify WebSocket upgrade headers are sent
- Check token is in query parameter (browser limitation)
- Ensure message format is valid JSON with `event` field

## Expected Behavior

### Successful Connection (Socket.IO)
```
✅ Connected via Socket.IO (id: abc123)
✅ Received: connected
✅ Protocol: Socket.IO
✅ Authenticated: true
```

### Successful Connection (Native WebSocket)
```
✅ Native WebSocket connected: ws-1234567890-abc
✅ Received: {"event":"connected","data":{...}}
✅ Protocol: native-websocket
✅ Authenticated: true
```

### All Events Working
- `ping` → `pong`
- `status` → `status_response`
- `echo` → `echo_response`
- `info` → `info_response`
- `message` → `message_received`
- `ai:chat` → `ai:response:start`, `ai:response:chunk`, `ai:response:complete`

## Next Steps

- Test with production deployment
- Monitor WebSocket connections in production
- Set up load balancing for WebSocket traffic
- Configure `ws.yektayar.ir` domain with reverse proxy
- Enable Redis adapter for multi-server Socket.IO (optional)
