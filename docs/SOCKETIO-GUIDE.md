# Socket.IO Connection Guide

**YektaYar Platform - Real-time Communication**

This guide explains how to connect to and use Socket.IO with the YektaYar backend server.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Runtime Requirements](#runtime-requirements)
- [Connection Setup](#connection-setup)
- [Authentication](#authentication)
- [Available Commands](#available-commands)
- [Testing](#testing)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

YektaYar backend provides real-time communication capabilities using Socket.IO. The WebSocket server is integrated with the main HTTP server and shares the same port as the REST API.

### Key Features

- ✅ Session-based authentication
- ✅ Automatic runtime detection (Bun/Node.js)
- ✅ Real-time bidirectional communication
- ✅ Room-based messaging
- ✅ Built-in command handlers
- ✅ Connection health monitoring

---

## Prerequisites

1. **Backend server must be running**
   ```bash
   npm run dev:backend
   ```

2. **Valid session token required**
   - Acquire session via REST API first: `POST /api/session/acquire`

3. **Socket.IO client library**
   - Browser: Included automatically
   - Node.js: `npm install socket.io-client`

---

## Runtime Requirements

The backend automatically detects the runtime environment and configures Socket.IO accordingly:

### Node.js Runtime (Recommended for Socket.IO)

✅ **Full Socket.IO support**

When running with Node.js, Socket.IO is fully functional with all features:

```bash
# Build backend first
cd packages/backend
npm run build

# Run with Node.js
node dist/index.js
```

Expected output:
```
⚡ Detected runtime: Node.js v20.x.x
🚀 YektaYar API Server running at http://localhost:3000
📚 API Documentation available at http://localhost:3000/api-docs
🔒 Documentation protected with Basic Auth
✅ Socket.IO enabled on same port (3000)
```

### Bun Runtime

⚠️ **Limited Socket.IO support**

When running with Bun, Socket.IO is not available due to Bun's different server architecture:

```bash
cd packages/backend
bun run src/index.ts
```

Expected output:
```
⚡ Detected runtime: Bun 1.x.x
🚀 YektaYar API Server running at http://localhost:3000
📚 API Documentation available at http://localhost:3000/api-docs
🔒 Documentation protected with Basic Auth
⚠️  Socket.IO not available with Bun runtime
💡 Tip: Use Node.js runtime for full Socket.IO support
```

**Recommendation:** Use Node.js for production deployments requiring real-time features.

---

## Connection Setup

### Connection URL

Socket.IO connects to the same server as the REST API:

```
ws://localhost:3000        (development)
wss://your-domain.com      (production with SSL)
```

**Important:** Socket.IO runs on the same port as the HTTP server (default: 3000).

### Basic Connection (JavaScript/TypeScript)

```javascript
import { io } from 'socket.io-client'

const BACKEND_URL = 'http://localhost:3000'
const sessionToken = 'your-session-token-here' // Acquired from /api/session/acquire

const socket = io(BACKEND_URL, {
  auth: {
    token: sessionToken
  },
  transports: ['websocket', 'polling'],
  autoConnect: false // Recommended: manual connection control
})

// Set up event handlers
socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message)
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})

// Manually connect after setup
socket.connect()
```

### Vue.js Integration Example

```typescript
// stores/socket.ts
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'

const socket = ref<Socket | null>(null)
const isConnected = ref(false)

export function useSocket() {
  const connect = (sessionToken: string) => {
    if (!sessionToken) {
      console.error('Cannot connect: no session token')
      return
    }

    socket.value = io('http://localhost:3000', {
      auth: { token: sessionToken },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('Socket connected:', socket.value?.id)
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('Socket disconnected')
    })

    socket.value.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      if (error.message?.includes('Authentication')) {
        socket.value?.disconnect()
      }
    })

    socket.value.connect()
  }

  const disconnect = () => {
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
  }

  return {
    socket,
    isConnected,
    connect,
    disconnect
  }
}
```

---

## Authentication

Socket.IO connections require a valid session token for authentication.

### Authentication Flow

1. **Acquire Session Token**
   ```bash
   curl -X POST http://localhost:3000/api/session/acquire \
     -H "Content-Type: application/json" \
     -d '{"metadata":{"source":"my-app"}}'
   ```

   Response:
   ```json
   {
     "token": "SESSION_TOKEN_HERE",
     "expiresAt": "2024-12-13T07:14:32.047Z"
   }
   ```

2. **Connect with Token**
   ```javascript
   const socket = io('http://localhost:3000', {
     auth: {
       token: 'SESSION_TOKEN_HERE'
     }
   })
   ```

3. **Server Validates Token**
   - If valid: Connection established
   - If invalid: Connection rejected with error

### Authentication Middleware

The backend automatically validates tokens:

```typescript
// Backend: packages/backend/src/websocket/socketServer.ts
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token
  
  if (!token) {
    return next(new Error('Authentication token required'))
  }
  
  const session = await validateSessionToken(token)
  
  if (!session) {
    return next(new Error('Invalid or expired session token'))
  }
  
  // Attach session data to socket
  socket.data.sessionToken = session.token
  socket.data.userId = session.userId
  socket.data.isLoggedIn = session.isLoggedIn
  
  next()
})
```

---

## Available Commands

The backend provides several built-in Socket.IO commands:

### 1. Ping/Pong

**Purpose:** Test connection health

**Emit:**
```javascript
socket.emit('ping')
```

**Response:**
```javascript
socket.on('pong', (data) => {
  console.log(data)
  // { timestamp: "2024-11-13T07:14:32.047Z" }
})
```

---

### 2. Status

**Purpose:** Get connection and server status

**Emit:**
```javascript
socket.emit('status')
```

**Response:**
```javascript
socket.on('status_response', (data) => {
  console.log(data)
  /*
  {
    server: {
      name: "YektaYar API Server",
      version: "0.1.0",
      status: "running",
      timestamp: "2024-11-13T07:14:32.047Z"
    },
    connection: {
      socketId: "abc123...",
      sessionToken: "xyz789...",
      userId: null,
      isLoggedIn: false,
      rooms: ["room1", "room2"]
    }
  }
  */
})
```

---

### 3. Info

**Purpose:** Get detailed server information

**Emit:**
```javascript
socket.emit('info')
```

**Response:**
```javascript
socket.on('info_response', (data) => {
  console.log(data)
  /*
  {
    server: {
      name: "YektaYar Mental Health Platform API",
      version: "0.1.0",
      description: "Backend API with Socket.IO real-time communication",
      features: {
        rest: true,
        websocket: true,
        authentication: true,
        realtime: true
      }
    },
    websocket: {
      connected: true,
      transport: "websocket",
      protocol: 4,
      activeConnections: 5
    },
    session: {
      authenticated: false,
      userId: "anonymous",
      sessionToken: "***xyz789"
    },
    timestamp: "2024-11-13T07:14:32.047Z"
  }
  */
})
```

---

### 4. Echo

**Purpose:** Echo back a message (useful for testing)

**Emit:**
```javascript
socket.emit('echo', 'Hello, server!')
// or with an object
socket.emit('echo', { message: 'Hello!', data: [1, 2, 3] })
```

**Response:**
```javascript
socket.on('echo_response', (data) => {
  console.log(data)
  /*
  {
    received: "Hello, server!",
    timestamp: "2024-11-13T07:14:32.047Z",
    socketId: "abc123..."
  }
  */
})
```

---

### 5. Message

**Purpose:** Send a message to the server

**Emit:**
```javascript
socket.emit('message', { text: 'My custom message', type: 'chat' })
```

**Response:**
```javascript
socket.on('message_received', (data) => {
  console.log(data)
  /*
  {
    success: true,
    message: "Message received successfully",
    data: { text: "My custom message", type: "chat" },
    timestamp: "2024-11-13T07:14:32.047Z"
  }
  */
})
```

---

### 6. Connected (Auto)

**Purpose:** Welcome message on connection (sent automatically)

**Receive:**
```javascript
socket.on('connected', (data) => {
  console.log(data)
  /*
  {
    message: "Connected to YektaYar server",
    socketId: "abc123...",
    isLoggedIn: false
  }
  */
})
```

---

## Testing

### Automated Test Script

Use the provided test script to verify Socket.IO functionality:

```bash
# Run the test script
./scripts/test-socketio.sh

# Or specify custom backend URL
./scripts/test-socketio.sh http://localhost:3000
```

The script will:
1. ✅ Check backend health
2. ✅ Acquire a session token
3. ✅ Test Socket.IO connection
4. ✅ Execute all commands (ping, status, info, echo, message)
5. ✅ Display results in a beautiful TUI
6. ✅ Offer interactive mode

### Manual Testing with curl + Node.js

1. **Acquire session:**
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:3000/api/session/acquire \
     -H "Content-Type: application/json" \
     -d '{"metadata":{}}' | jq -r '.token')
   echo "Token: $TOKEN"
   ```

2. **Test with Node.js:**
   ```javascript
   const io = require('socket.io-client')
   const socket = io('http://localhost:3000', {
     auth: { token: process.env.TOKEN }
   })
   
   socket.on('connect', () => {
     console.log('Connected!')
     socket.emit('ping')
   })
   
   socket.on('pong', (data) => {
     console.log('Pong:', data)
     socket.close()
   })
   ```

---

## Examples

### Complete Connection Example

```typescript
import { io, Socket } from 'socket.io-client'

class YektaYarSocket {
  private socket: Socket | null = null
  private token: string

  constructor(token: string) {
    this.token = token
  }

  connect(url: string = 'http://localhost:3000') {
    this.socket = io(url, {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.setupListeners()
    this.socket.connect()
  }

  private setupListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Connection error:', error.message)
    })

    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data)
    })

    this.socket.on('status_response', (data) => {
      console.log('📊 Status:', data)
    })

    this.socket.on('info_response', (data) => {
      console.log('ℹ️ Info:', data)
    })

    this.socket.on('echo_response', (data) => {
      console.log('🔄 Echo:', data)
    })

    this.socket.on('message_received', (data) => {
      console.log('💬 Message:', data)
    })
  }

  ping() {
    this.socket?.emit('ping')
  }

  getStatus() {
    this.socket?.emit('status')
  }

  getInfo() {
    this.socket?.emit('info')
  }

  echo(message: any) {
    this.socket?.emit('echo', message)
  }

  sendMessage(data: any) {
    this.socket?.emit('message', data)
  }

  disconnect() {
    this.socket?.disconnect()
  }
}

// Usage
async function main() {
  // 1. Acquire session
  const response = await fetch('http://localhost:3000/api/session/acquire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: {} })
  })
  const { token } = await response.json()

  // 2. Connect Socket.IO
  const socket = new YektaYarSocket(token)
  socket.connect()

  // 3. Use commands
  setTimeout(() => socket.ping(), 1000)
  setTimeout(() => socket.getStatus(), 2000)
  setTimeout(() => socket.getInfo(), 3000)
  setTimeout(() => socket.echo('Hello!'), 4000)
  setTimeout(() => socket.sendMessage({ text: 'Test' }), 5000)
}

main()
```

---

## Troubleshooting

### Connection Refused

**Problem:** Cannot connect to Socket.IO

**Solutions:**
1. Check backend is running: `npm run dev:backend`
2. Verify backend is using Node.js (not Bun)
3. Check port is correct (default: 3000)
4. Check firewall settings

### Authentication Error

**Problem:** "Authentication token required" or "Invalid token"

**Solutions:**
1. Ensure you acquired a session token first
2. Check token is passed correctly in `auth.token`
3. Verify token hasn't expired (30 days)
4. Try acquiring a new token

### Transport Error

**Problem:** "WebSocket transport error"

**Solutions:**
1. Check if behind a proxy - configure proxy headers
2. Enable polling transport as fallback
3. Check CORS settings in `.env`

### Socket.IO Not Available with Bun

**Problem:** Backend shows "Socket.IO not available with Bun runtime"

**Solution:**
Run backend with Node.js instead:
```bash
cd packages/backend
npm run build
node dist/index.js
```

### Connection Timeout

**Problem:** Connection takes too long or times out

**Solutions:**
1. Increase `timeout` option in socket config
2. Check network connectivity
3. Try enabling both websocket and polling transports
4. Check server logs for errors

---

## Additional Resources

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Socket.IO Server Documentation](https://socket.io/docs/v4/server-api/)
- [YektaYar Session Guide](./SESSION-QUICK-START.md)
- [YektaYar Architecture](./ARCHITECTURE.md)

---

## Support

For issues or questions:
- Check backend logs for errors
- Run test script: `./scripts/test-socketio.sh`
- Review [troubleshooting](#troubleshooting) section
- Open an issue on GitHub

---

**Last Updated:** 2025-11-13  
**Version:** 0.1.0
