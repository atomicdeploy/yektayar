# WebSocket/Socket.IO Debugger

A standalone HTML debugging tool for testing WebSocket and Socket.IO connections with the YektaYar backend.

## Features

- **Dual Protocol Support**: Works with both native WebSocket (ws://, wss://) and Socket.IO (http://, https://)
- **Auto-detection**: Automatically detects connection type based on URL protocol
- **Session Authentication**: Supports optional session token authentication (auto-generates guest tokens if empty)
- **Auto-reconnect**: Configurable auto-reconnect with exponential backoff
- **Event Logging**: Comprehensive logging of all sent/received messages with timestamps
- **Quick Actions**: Pre-configured buttons for common backend events (ping, status, info, echo, message)
- **Custom Messages**: Send arbitrary events with JSON or string data
- **Real-time Stats**: Track connection type, state, socket ID, and message counts
- **Beautiful UI**: Matches the style of the existing speech-recognition-debugger.html

## Usage

### Opening the Debugger

Simply open `websocket-debugger.html` in a web browser. The file is self-contained with all dependencies inlined (except Socket.IO library which is loaded locally).

### Connecting to Backend

1. **Enter Server URL**: 
   - For Socket.IO (YektaYar backend): `http://localhost:3000` or `https://your-server.com`
   - For native WebSocket: `ws://localhost:3000/ws` or `wss://your-server.com/ws`

2. **Session Token (Optional)**:
   - Leave empty to auto-generate a guest session
   - Or enter an existing session token for authenticated connections

3. **Click Connect**: The debugger will auto-detect the connection type and establish the connection

### Quick Actions

The debugger includes pre-configured actions that match YektaYar backend events:

- **Ping**: Sends a `ping` event, expects `pong` response
- **Status**: Requests server and connection status
- **Info**: Requests detailed server information
- **Echo**: Sends an echo test with timestamp
- **Message**: Sends a test message event
- **Custom**: Triggers the custom message form

### Custom Messages

Use the custom message section to send arbitrary events:

1. **Event Name**: The Socket.IO event name (e.g., `message`, `ai:chat`, `custom-event`)
2. **Data**: The data to send (can be JSON object or plain string)
3. **Send**: Click "Send Custom Message" or press Ctrl+Enter in the data field

### Event Log

All events are logged with:
- Timestamp
- Direction (INFO/WARN/ERR/RX/TX)
- Message content

Colors indicate:
- **Green (RX)**: Received from server
- **Purple (TX)**: Sent to server
- **Red (ERR)**: Errors
- **Yellow (WARN)**: Warnings
- **Blue (INFO)**: Informational messages

### Log Management

- **Clear Logs**: Clears all log entries
- **Copy Logs**: Copies all logs to clipboard for sharing

## YektaYar Backend Events

The YektaYar backend supports the following Socket.IO events:

### Client → Server

- `ping`: Connection health check
- `status`: Request server and connection status
- `info`: Request detailed server information
- `echo`: Echo test with data
- `message`: Send a message
- `ai:chat`: Send AI chat message with conversation history

### Server → Client

- `connected`: Welcome message on connection
- `pong`: Response to ping with timestamp
- `status_response`: Server and connection status
- `info_response`: Detailed server information
- `echo_response`: Echo response
- `message_received`: Message acknowledgment
- `ai:response:start`: AI response started
- `ai:response:chunk`: AI response chunk (streaming)
- `ai:response:complete`: AI response completed
- `ai:response:error`: AI response error

## Technical Details

### Connection Type Detection

The debugger automatically detects the connection type:
- `http://` or `https://` → Socket.IO
- `ws://` or `wss://` → Native WebSocket

### Auto-reconnect

When enabled, the debugger will:
1. Automatically reconnect on disconnection
2. Use exponential backoff (1s, 2s, 4s, 8s, max 30s)
3. Reset attempt counter on successful connection

### Guest Session Generation

For Socket.IO connections without a token, the debugger attempts to:
1. Call `/api/auth/guest` endpoint to get a guest session token
2. Use the token for Socket.IO authentication
3. Fall back to no authentication if guest endpoint fails

## Files

- `websocket-debugger.html`: Main debugger file (self-contained)
- `socket.io.min.js`: Socket.IO client library (local copy)

## Comparison with Speech Debugger

Both debuggers share:
- Consistent visual styling and color scheme
- Similar layout with controls on left, logs on right
- Event logging with timestamps
- Clear/copy functionality
- Mobile-optimized responsive design

## Development Notes

The debugger is built as a single self-contained HTML file with:
- Inlined CSS for styling
- Inlined JavaScript for all functionality
- Local Socket.IO library reference
- No build step required
- No external dependencies (except Socket.IO)

## Browser Support

- Chrome/Edge: Full support (WebSocket + Socket.IO)
- Firefox: Full support (WebSocket + Socket.IO)
- Safari: Full support (WebSocket + Socket.IO)
- Mobile browsers: Full support with responsive design

## Troubleshooting

### Connection Fails

1. Verify server is running and accessible
2. Check server URL is correct
3. Check CORS settings on server allow connections
4. Check browser console for detailed errors

### Socket.IO Not Available

If you see "Socket.IO library not loaded":
1. Ensure `socket.io.min.js` is in the same directory
2. Check browser console for loading errors
3. Verify file path in HTML is correct

### Auto-reconnect Not Working

1. Ensure "Auto-reconnect" checkbox is enabled
2. Check that connection was not manually disconnected
3. Verify server is accepting reconnections

## Future Enhancements

Potential improvements:
- Save/load connection profiles
- Export logs to file
- Message templates for common operations
- WebSocket protocol inspection
- Latency measurement
- Connection quality metrics
