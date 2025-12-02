# Pollination AI TUI - Testing & Debugging Tool

## 🧠 Overview

The **Pollination AI TUI** is a comprehensive Text User Interface (TUI) tool designed for testing and debugging the Pollination AI integration in the YektaYar mental health platform. It provides a live, interactive environment with clear, concise, and helpful results for developers.

## ✨ Features

### Core Testing Capabilities
- **Direct Pollination AI API Testing**: Test the Pollination AI API directly, bypassing the backend
- **Backend REST API Testing**: Test the YektaYar backend AI endpoint via REST
- **WebSocket Streaming Testing**: Test real-time AI response streaming via Socket.IO
- **Automated Test Suite**: Run predefined test scenarios across all endpoints

### Developer Tools
- **Conversation History Management**: Maintain and view conversation context
- **Response Time Monitoring**: Track latency and performance metrics
- **Test Statistics**: View success rates, failure counts, and average response times
- **Health Checks**: Verify backend AI service status
- **Live Streaming Display**: See AI responses in real-time as they're generated

### User Experience
- **Colorized Output**: Easy-to-read colored terminal output
- **Emoji Indicators**: Visual feedback for different message types
- **Interactive Menu**: Simple command-driven interface
- **Helpful Error Messages**: Clear diagnostics when issues occur
- **Progress Indicators**: Real-time feedback during operations

## 🚀 Usage

### Basic Usage

```bash
# Use defaults from .env file
npm run ai:test

# Specify custom backend URL
npm run ai:test -- http://localhost:3000

# Run directly
node scripts/pollination-ai-tui.js

# With custom backend URL
node scripts/pollination-ai-tui.js http://your-backend-url:3000
```

### Prerequisites

1. **Required**: Node.js 18.x or higher
2. **Required**: `socket.io-client` package (installed via `npm install`)
3. **Optional**: Backend server running (for backend tests)

## 📖 Menu Options

Once the tool is running, you'll see an interactive menu with the following options:

### 1. Test Direct Pollination AI API
Tests the Pollination AI service directly without going through your backend. Useful for:
- Verifying Pollination AI availability
- Testing different prompts
- Debugging API-specific issues
- Comparing direct vs backend responses

**Example Flow:**
1. Select option `1`
2. Enter your message (e.g., "Hello, how are you?")
3. View the response time and AI output
4. Message is added to conversation history

### 2. Test Backend REST AI Endpoint
Tests your YektaYar backend's REST API endpoint for AI chat. Useful for:
- Verifying backend integration
- Testing with conversation history
- Debugging backend-specific issues
- Comparing REST vs WebSocket responses

**Example Flow:**
1. Select option `2`
2. Enter your message
3. View backend response time and output
4. Check for any backend errors

### 3. Test Backend WebSocket AI Streaming
Tests real-time AI response streaming via Socket.IO. Useful for:
- Testing live streaming functionality
- Debugging WebSocket issues
- Monitoring chunk delivery
- Testing real-time user experience

**Example Flow:**
1. First connect using option `6`
2. Select option `3`
3. Enter your message
4. Watch the response stream in real-time
5. View chunk statistics

### 4. Run Automated Test Suite
Runs a comprehensive automated test with predefined messages. Useful for:
- Quick smoke testing
- Regression testing
- Performance benchmarking
- Comparing all endpoint types

**Test Messages:**
- "Hello, how are you?"
- "I'm feeling anxious today."
- "Can you help me with stress management?"

### 5. Display Conversation History
Shows all messages exchanged during the current session. Useful for:
- Reviewing conversation context
- Debugging context-related issues
- Verifying history management

### 6. Connect to WebSocket
Establishes a Socket.IO connection to the backend. Required before using option 3.

### 7. Clear Conversation History
Resets the conversation history for fresh testing.

### 8. Display Test Statistics
Shows detailed statistics about all tests run in the current session:
- Success/failure counts
- Average response times
- Success rates
- Per-endpoint metrics

### 9. Check Backend AI Status
Queries the backend's AI status endpoint to verify service health.

### h. Show Menu
Displays the menu again if you need a reminder of available options.

### q. Quit
Cleanly exits the tool.

## 🎯 Common Use Cases

### 1. Quick Smoke Test
```bash
npm run ai:test
# Select option 4 to run automated test suite
```

### 2. Debug API Connectivity Issues
```bash
npm run ai:test
# Select option 1 to test direct API
# Then option 2 to test backend REST
# Compare results to identify where the issue is
```

### 3. Test Streaming Performance
```bash
npm run ai:test
# Select option 6 to connect
# Select option 3 to test streaming
# Monitor chunk delivery and timing
```

### 4. Verify Conversation Context
```bash
npm run ai:test
# Send multiple messages using option 1 or 2
# Select option 5 to view history
# Verify context is maintained in responses
```

### 5. Performance Benchmarking
```bash
npm run ai:test
# Run automated test suite (option 4)
# Select option 8 to view statistics
# Compare response times across endpoints
```

## 🔍 Understanding the Output

### Color Coding
- **🟢 Green**: Success messages and confirmations
- **🔴 Red**: Errors and failures
- **🟡 Yellow**: Warnings and informational messages
- **🔵 Cyan**: Informational headers and prompts
- **🟣 Magenta**: AI-related messages
- **⚪ White**: Standard text and responses
- **Gray (dim)**: Supplementary information

### Emoji Indicators
- 🧠 Brain: AI-related operations
- 🤖 Robot: AI assistant messages
- 💬 Chat: Message sending
- ⚡ Lightning: Real-time/streaming operations
- 🌐 Globe: Network/API operations
- ✅ Check: Success
- ❌ Cross: Error
- ⚠️ Warning: Warning
- ℹ️ Info: Information
- ⏱️ Clock: Timing information
- 🎯 Target: Test operations
- 📊 Chart: Statistics
- 🔧 Tools: System operations

### Response Display
AI responses are displayed in a formatted box with word wrapping:
```
┌─────────────────────────────────────────────────────────┐
│ AI Response (Direct API)                                │
└─────────────────────────────────────────────────────────┘

  [AI response text here, properly wrapped]

───────────────────────────────────────────────────────────
```

## 🐛 Troubleshooting

### "socket.io-client not available"
**Solution**: Run `npm install` in the project root to install dependencies.

### "Connection timeout" or "Failed to connect"
**Possible causes**:
1. Backend server is not running
2. Wrong URL specified
3. Network/firewall issues

**Solutions**:
1. Start the backend: `npm run dev:backend`
2. Check the URL and port
3. Try direct API tests (option 1) which don't require the backend

### "Backend returned status 500"
**Possible causes**:
1. Backend configuration issue
2. Pollination AI service down
3. Missing environment variables

**Solutions**:
1. Check backend logs
2. Test direct API (option 1) to verify Pollination AI is accessible
3. Verify backend configuration

### "Not connected to WebSocket"
**Solution**: Use option 6 to connect before trying WebSocket operations (option 3).

### Slow Response Times
**Possible causes**:
1. Network latency
2. Pollination AI service load
3. Large conversation history

**Solutions**:
1. Test direct API to isolate network issues
2. Clear conversation history (option 7)
3. Try again later if service is overloaded

## 📝 Configuration

### Environment Variables
The tool respects the following environment variables from `.env`:

```bash
# Backend API base URL
API_BASE_URL=http://localhost:3000

# Optional: Test authentication token
TEST_TOKEN=your_test_token_here
```

### Command Line Arguments
You can override the backend URL via command line:

```bash
npm run ai:test -- http://production-server:3000
```

## 🔒 Security Notes

- The tool connects to external services (Pollination AI)
- Conversation history is stored in memory only
- No data is persisted to disk
- Be cautious when testing with sensitive information
- Use appropriate test data only

## 🎓 Tips for Developers

1. **Start with Direct API**: Always test the direct Pollination API first to verify external service availability
2. **Use Automated Tests**: Run option 4 regularly for regression testing
3. **Monitor Statistics**: Check option 8 to identify performance patterns
4. **Test Incrementally**: Test each endpoint type separately before comparing
5. **Clear History**: Use option 7 when switching test scenarios
6. **Check Status First**: Use option 9 to verify backend health before debugging
7. **Compare Endpoints**: Test the same message across all three endpoint types to identify issues

## 🤝 Integration with Development Workflow

### During Development
```bash
# Terminal 1: Run backend
npm run dev:backend

# Terminal 2: Run TUI tool
npm run ai:test
```

### For CI/CD Testing
The automated test suite (option 4) can be integrated into automated testing:
```bash
# Future: Could be extended to support non-interactive mode
npm run ai:test -- --automated --exit-on-complete
```

## 📚 Related Documentation

- [Socket.IO TUI Tool](./README-SOCKETIO-TUI.md)
- [Backend AI Service](../packages/backend/src/services/aiService.ts)
- [AI Routes](../packages/backend/src/routes/ai.ts)
- [Pollination AI Documentation](https://pollinations.ai)

## 🎉 Conclusion

The Pollination AI TUI is a powerful developer tool that provides comprehensive testing and debugging capabilities for the YektaYar AI integration. Its live, interactive interface with clear visual feedback makes it easy to diagnose issues, test functionality, and ensure quality AI interactions.

Happy testing! 🚀
