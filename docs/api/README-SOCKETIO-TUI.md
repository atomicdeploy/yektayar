# Socket.IO TUI Testing Tool

A feature-rich Text User Interface (TUI) for testing and debugging Socket.IO connections to the YektaYar backend server.

## Features

- 🔍 **REST Health Check** - Verify Socket.IO feature availability via REST endpoint
- 🔗 **Real-time Connection** - Connect to Socket.IO server with authentication support
- 🏓 **Ping/Pong Tests** - Measure connection latency
- 🧠 **AI Chat Testing** - Test AI counselor chat functionality via WebSocket
- 🔥 **Custom Events** - Send custom Socket.IO events with JSON payloads
- 📊 **Connection Status** - Display detailed connection diagnostics
- 🌐 **Proxy Support** - Automatically detects and uses system HTTP/HTTPS proxies
- 🎨 **Rich Console UI** - Colorized output with emojis for better readability
- 🔄 **Reconnection Logic** - Automatic reconnection with exponential backoff

## Installation

The script requires the following dependencies which should be installed in the root package.json:

```bash
npm install
```

Dependencies installed:
- `socket.io-client` - Socket.IO client library
- `dotenv` - Environment variable management

## Usage

### Using npm script (recommended)

```bash
# Use API_BASE_URL from .env file
npm run socketio:test

# Or provide a custom URL
npm run socketio:test -- http://localhost:3000
```

### Direct execution

```bash
# Use API_BASE_URL from .env file
node scripts/socketio-tui.js

# Or provide a custom URL
node scripts/socketio-tui.js http://localhost:3000

# With authentication token
TEST_TOKEN=your_session_token node scripts/socketio-tui.js
```

### With system proxy

The script automatically detects and uses system proxies from environment variables:

```bash
HTTP_PROXY=http://proxy.example.com:8080 npm run socketio:test
HTTPS_PROXY=https://proxy.example.com:8443 npm run socketio:test
```

## Configuration

The script reads configuration from the root `.env` file:

```env
# Backend API base URL
API_BASE_URL=http://localhost:3000

# Optional: Session token for authenticated Socket.IO connections
TEST_TOKEN=your_session_token_here
```

## Interactive Menu

Once connected (or when connection fails), the script presents an interactive menu:

```
═══ Available Actions ═══
  1 - Display connection status
  2 - Send ping (test latency)
  3 - Send AI chat message
  4 - Send custom event
  5 - Reconnect
  6 - Disconnect
  7 - Health check (REST)
  h - Show this menu
  q - Quit
```

### Menu Options Explained

1. **Display connection status** - Shows:
   - Connection state (connected/disconnected)
   - Socket ID
   - Reconnection attempts
   - Last ping/pong latency
   - Server information (name, version, features)

2. **Send ping** - Sends a ping event and measures round-trip time

3. **Send AI chat message** - Interactive prompt to send a message to the AI counselor
   - Streams response chunks in real-time
   - Displays complete response when done

4. **Send custom event** - Send any custom Socket.IO event
   - Prompts for event name
   - Prompts for JSON data payload

5. **Reconnect** - Manually disconnect and reconnect to the server

6. **Disconnect** - Disconnect from the server (can reconnect with option 5)

7. **Health check (REST)** - Re-run the REST health check to verify server status

## Output Examples

### Connection Success
```
✅ Connected! Socket ID: abc123xyz
⚡ Connection established
✨ Server welcome message received:
{
  "message": "Connected to YektaYar server",
  "socketId": "abc123xyz",
  "isLoggedIn": false
}
```

### Ping/Pong Test
```
🏓 Sending ping...
✅ Pong received! Latency: 45ms
{
  "timestamp": "2025-11-13T21:12:26.307Z"
}
```

### AI Chat Response
```
🧠 AI response started
{
  "messageId": "ai-1234567890-abc123"
}
Hello! I'm here to help you with...
✅ AI response completed
```

### Connection Status
```
═══ Connection Status ═══
Status: ✅ Connected
Socket ID: abc123xyz
Connected: true
Reconnect Attempts: 0
Last Latency: 45ms

═══ Server Info ═══
Name: YektaYar API Server
Version: 0.1.0
Status: running
Features: REST=true, WebSocket=true
```

## Error Handling

The script handles various error scenarios gracefully:

### Server Not Running
```
❌ ERROR: Failed to check Socket.IO availability
connect ECONNREFUSED 127.0.0.1:3000
⚠️ Socket.IO might not be available or server is not responding
Continue anyway? (y/n):
```

### Authentication Required
```
❌ ERROR: Connection error
Authentication token required
ℹ️ Authentication required. Set TEST_TOKEN environment variable with a valid token.
```

### Network Issues
```
❌ ERROR: Failed to check Socket.IO availability
getaddrinfo ENOTFOUND invalid-hostname
```

## Diagnostics

The script provides detailed diagnostics for troubleshooting:

- **REST Health Check** - Verifies the server advertises Socket.IO support
- **Connection Attempts** - Shows reconnection attempts and reasons
- **Latency Measurement** - Ping/pong tests measure round-trip time
- **Event Tracing** - All incoming events are logged with full data
- **Error Messages** - Detailed error messages with suggestions

## Backend Requirements

The backend must:

1. Expose a REST endpoint at `/` (or root path) that returns:
```json
{
  "message": "YektaYar API Server",
  "version": "0.1.0",
  "status": "running",
  "features": {
    "rest": true,
    "websocket": true
  }
}
```

2. Support Socket.IO with these events:
   - `connect` - Connection established
   - `disconnect` - Connection closed
   - `ping` - Health check (responds with `pong`)
   - `pong` - Response to ping with timestamp
   - `connected` - Welcome message from server
   - `ai:chat` - AI chat request
   - `ai:response:start` - AI response started
   - `ai:response:chunk` - AI response chunk
   - `ai:response:complete` - AI response completed
   - `ai:response:error` - AI response error

3. Optional authentication via:
   - `auth.token` in handshake
   - `query.token` in connection URL

## Troubleshooting

### Module Type Warning

If you see:
```
Warning: Module type of file:///path/to/socketio-tui.js is not specified
```

Ensure the root `package.json` has `"type": "module"` set.

### Socket.IO Client Not Found

If you see:
```
❌ socket.io-client is not installed
```

Install dependencies:
```bash
npm install
```

### Connection Refused

- Ensure the backend server is running
- Check the URL is correct (default: http://localhost:3000)
- Verify no firewall is blocking the connection

### Authentication Errors

- Set `TEST_TOKEN` environment variable with a valid session token
- Check backend logs for authentication errors
- Verify token format and expiration

## Development

### Running in Development

```bash
# With live backend
npm run dev:backend

# In another terminal
npm run socketio:test
```

### Testing Custom Events

```bash
# Start the tool
npm run socketio:test

# When prompted, choose option 4
# Enter event name: test:custom
# Enter JSON data: {"message":"Hello","timestamp":1234567890}
```

## Advanced Usage

### Automated Testing Script

```bash
#!/bin/bash
# Test Socket.IO connection automatically
echo "n" | npm run socketio:test > /tmp/socketio-test.log 2>&1
if grep -q "Connected! Socket ID" /tmp/socketio-test.log; then
  echo "✅ Socket.IO is working"
else
  echo "❌ Socket.IO connection failed"
  cat /tmp/socketio-test.log
fi
```

### CI/CD Integration

```yaml
# .github/workflows/test-socketio.yml
name: Test Socket.IO
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start backend
        run: npm run dev:backend &
      - name: Wait for backend
        run: sleep 10
      - name: Test Socket.IO
        run: echo "n" | npm run socketio:test
```

## Security Notes

- Never commit `.env` files with real tokens
- Use `TEST_TOKEN` only for development/testing
- In production, implement proper authentication
- Rotate tokens regularly
- Monitor connection attempts

## License

PROPRIETARY - YektaYar Team
