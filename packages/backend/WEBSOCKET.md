# WebSocket Implementation Guide

This document explains the WebSocket and Socket.IO implementation in the YektaYar backend.

## Overview

The YektaYar backend supports **two WebSocket protocols**:

1. **Socket.IO** - Feature-rich, production-ready protocol with automatic reconnection and fallback
2. **Native WebSocket** - Standard RFC 6455 WebSocket protocol for lightweight connections

Both protocols share the same **events and authentication** mechanism, ensuring consistency across clients.

## Architecture

### Two-Server Setup

The backend runs two separate servers to enable flexible deployment:

#### 1. Main API Server (Port 3000)
- **Purpose**: REST API + Socket.IO
- **Path**: `/socket.io/`
- **Features**: 
  - Full REST API endpoints
  - Socket.IO with Bun engine (Bun) or traditional HTTP server (Node.js)
  - Swagger documentation
  - Health checks

#### 2. Dedicated WebSocket Server (Port 3500)
- **Purpose**: WebSocket + Socket.IO gateway
- **Paths**: 
  - `/socket.io/` for Socket.IO
  - `/` for native WebSocket
- **Features**:
  - Both Socket.IO and native WebSocket on same port
  - Protocol auto-detection
  - Shared authentication and events
  - Minimal overhead for real-time connections

### Benefits of Dual-Server Architecture

1. **Separation of Concerns**: REST API and real-time communication can be scaled independently
2. **Domain Routing**: Use `ws.yektayar.ir` exclusively for WebSocket traffic
3. **Load Balancing**: Route WebSocket connections separately from API calls
4. **Monitoring**: Track WebSocket metrics independently
5. **Backwards Compatibility**: Existing clients using `:3000/socket.io` continue to work

## Running the Servers

### Development Mode

```bash
# Terminal 1: Start main API server
npm run dev:backend

# Terminal 2: Start dedicated WebSocket server
npm run dev:ws -w @yektayar/backend
```

### Production Mode

```bash
# Build first
npm run build:backend

# Terminal 1: Start main API server
npm run start -w @yektayar/backend

# Terminal 2: Start dedicated WebSocket server  
npm run start:ws -w @yektayar/backend
```

### Using Process Manager (PM2)

```bash
# Start both servers with PM2
pm2 start ecosystem.config.js
```

## Supported Events

Both Socket.IO and native WebSocket support the same events:

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `ping` | `{}` | Health check |
| `status` | `{}` | Get connection status |
| `echo` | `{ message: string }` | Echo back a message |
| `info` | `{}` | Get detailed server info |
| `message` | `{ content: string }` | Send a message |
| `ai:chat` | `{ message: string, conversationHistory?: [] }` | AI chat request |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{ message, socketId, isLoggedIn }` | Welcome message |
| `pong` | `{ timestamp }` | Ping response |
| `status_response` | `{ server, connection }` | Status information |
| `echo_response` | `{ received, timestamp, socketId }` | Echo response |
| `info_response` | `{ server, websocket, session }` | Server information |
| `message_received` | `{ success, message, data }` | Message confirmation |
| `ai:response:start` | `{ messageId }` | AI response started |
| `ai:response:chunk` | `{ messageId, chunk }` | AI response chunk |
| `ai:response:complete` | `{ messageId, fullResponse }` | AI response complete |
| `ai:response:error` | `{ error }` | AI error |

## Client Examples

### Socket.IO Client

```javascript
import { io } from 'socket.io-client';

// Connect to main API server
const socket1 = io('http://localhost:3000/socket.io/', {
  auth: { token: 'YOUR_SESSION_TOKEN' },
  transports: ['websocket', 'polling']
});

// Or connect to dedicated WebSocket server
const socket2 = io('http://localhost:3500/socket.io/', {
  auth: { token: 'YOUR_SESSION_TOKEN' },
  transports: ['websocket', 'polling']
});

// Listen for events
socket1.on('connected', (data) => {
  console.log('Connected:', data);
});

socket1.on('pong', (data) => {
  console.log('Pong:', data);
});

// Send events
socket1.emit('ping');
socket1.emit('status');
socket1.emit('ai:chat', {
  message: 'Hello, AI!',
  conversationHistory: []
});
```

### Native WebSocket Client

```javascript
// Connect to dedicated WebSocket server
const ws = new WebSocket('ws://localhost:3500/ws?token=YOUR_SESSION_TOKEN');

// Or use Authorization header
const ws2 = new WebSocket('ws://localhost:3500/', {
  headers: {
    'Authorization': 'Bearer YOUR_SESSION_TOKEN'
  }
});

ws.onopen = () => {
  console.log('Connected');
  
  // Send ping
  ws.send(JSON.stringify({
    event: 'ping'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  // Example: { event: 'pong', data: { timestamp: '...' } }
};

ws.onerror = (error) => {
  console.error('Error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

### Command Line Testing

```bash
# Install wscat globally
npm install -g wscat

# Connect with token
wscat -c "ws://localhost:3500/ws?token=YOUR_SESSION_TOKEN"

# Or use header (requires wscat with header support)
wscat -c "ws://localhost:3500/" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Send messages (type these after connecting)
> {"event":"ping"}
< {"event":"pong","data":{"timestamp":"2024-11-15T..."}}

> {"event":"status"}
< {"event":"status_response","data":{...}}

> {"event":"echo","data":"Hello World"}
< {"event":"echo_response","data":{...}}
```

## Authentication

Both protocols require authentication via session token:

### Socket.IO
- **Preferred**: Pass token in `auth.token` option when connecting (uses Socket.IO's authentication mechanism)
- Alternative: Pass as query parameter: `/socket.io/?token=YOUR_TOKEN`

```javascript
// Preferred method - uses Socket.IO auth
const socket = io('http://localhost:3500', {
  auth: { token: sessionToken }
});

// Alternative - query parameter
const socket = io('http://localhost:3500?token=' + sessionToken);
```

### Native WebSocket
- **Browser**: Pass token as query parameter: `/?token=YOUR_TOKEN` (WebSocket API doesn't support custom headers)
- **Server-side/CLI tools**: Use Authorization header: `Authorization: Bearer YOUR_TOKEN`

```javascript
// Browser - must use query parameter
const ws = new WebSocket('ws://localhost:3500/ws?token=' + sessionToken);

// Node.js with ws library - can use headers
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3500', {
  headers: { 'Authorization': '******' }
});
```

**Note**: While the backend supports both query parameters and Authorization headers for native WebSocket, browser implementations can only use query parameters due to WebSocket API limitations.

### Getting a Session Token

```bash
# 1. Acquire anonymous session
curl -X POST http://localhost:3000/api/auth/acquire-session

# Response: { "success": true, "data": { "token": "...", "expiresAt": "..." } }

# 2. Use the token for WebSocket connection
```

## Testing

### Run Test Suite

```bash
# Check server status and show testing instructions
npm run test:websocket
```

### Manual Testing

```bash
# 1. Start servers
npm run dev:backend
npm run dev:ws -w @yektayar/backend

# 2. Test Socket.IO on main server
npm run socketio:test -- http://localhost:3000

# 3. Test Socket.IO on WebSocket server
npm run socketio:test -- http://localhost:3500

# 4. Test native WebSocket
wscat -c "ws://localhost:3500/ws?token=YOUR_TOKEN"
```

## Reverse Proxy Configuration

The repository includes reverse proxy configurations for all major web servers to route `ws.yektayar.ir` to port 3500:

- **Nginx**: `config/webserver/nginx/ws.yektayar.ir.conf`
- **Apache**: `config/webserver/apache/ws.yektayar.ir.conf`
- **Caddy**: `config/webserver/caddy/ws.yektayar.ir`

See `config/webserver/README.md` for detailed setup instructions.

## Environment Variables

```env
# Main API port
PORT=3000

# Dedicated WebSocket server port
WEBSOCKET_PORT=3500

# CORS origins
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
```

## Troubleshooting

### Connection Refused
- Check if servers are running
- Verify ports are not in use by other processes
- Check firewall settings

### Authentication Failed
- Ensure session token is valid
- Check token format (no extra spaces or quotes)
- Verify token is not expired

### Socket.IO Not Working
- Check CORS settings
- Verify Socket.IO client version compatibility
- Enable transports: `['websocket', 'polling']`

### Native WebSocket Not Working
- Check WebSocket upgrade headers
- Verify token is passed correctly
- Check message format (must be valid JSON)

## Protocol Auto-Detection

The dedicated WebSocket server automatically detects the protocol:

1. **Socket.IO Detection**: Checks if path starts with `/socket.io/`
2. **Native WebSocket Detection**: Any other path with WebSocket upgrade header
3. **Non-WebSocket Requests**: Returns server information JSON

This allows both protocols to coexist on the same port without conflicts.

## Implementation Files

- `packages/backend/src/websocketServer.ts` - Dedicated WebSocket server
- `packages/backend/src/websocket/socketServer.ts` - Socket.IO implementation
- `packages/backend/src/websocket/nativeWebSocketServer.ts` - Native WebSocket implementation
- `scripts/test-websocket.js` - Testing utility

## Future Enhancements

- [ ] WebSocket clustering for horizontal scaling
- [ ] Redis adapter for multi-server Socket.IO
- [ ] Message persistence and replay
- [ ] Rate limiting per connection
- [ ] Connection pooling and management
- [ ] Metrics and monitoring dashboard

## Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [Bun WebSocket API](https://bun.sh/docs/api/websockets)
- [YektaYar WebServer Config](../../config/webserver/README.md)
