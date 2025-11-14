#!/usr/bin/env node

/**
 * Socket.IO TUI (Text User Interface) Testing and Debugging Tool
 * 
 * A feature-rich console application for testing and debugging Socket.IO connections
 * to the YektaYar backend server.
 * 
 * Features:
 * - REST health check for Socket.IO availability
 * - Real-time Socket.IO connection testing
 * - Interactive menu with various test options
 * - Colorized output with emojis for better UX
 * - Support for environment variables and custom URLs
 * - System proxy support
 * - Connection diagnostics and monitoring
 * 
 * Usage:
 *   npm run socketio:test                    # Use API_BASE_URL from .env
 *   npm run socketio:test -- http://localhost:3000  # Use custom URL
 *   node scripts/socketio-tui.js http://localhost:3000
 */

import { createInterface } from 'readline';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env
config({ path: join(__dirname, '..', '.env') });

// ANSI color codes and emojis for rich console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

const emojis = {
  rocket: '🚀',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  hourglass: '⏳',
  sparkles: '✨',
  fire: '🔥',
  heart: '❤️',
  lightning: '⚡',
  tools: '🔧',
  chart: '📊',
  link: '🔗',
  disconnect: '🔌',
  ping: '🏓',
  brain: '🧠',
  chat: '💬',
  search: '🔍',
  shield: '🛡️',
  globe: '🌐'
};

// Global state
let io = null;
let socket = null;
let isConnected = false;
let reconnectAttempts = 0;
let lastPingTime = null;
let lastPongTime = null;
let serverInfo = null;

/**
 * Display styled header
 */
function displayHeader() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        Socket.IO Testing & Debugging Tool                    ║');
  console.log('║        YektaYar Platform                                      ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

/**
 * Print colored and styled message
 */
function print(message, color = 'white', emoji = '') {
  const colorCode = colors[color] || colors.white;
  const emojiStr = emoji ? `${emoji} ` : '';
  console.log(`${colorCode}${emojiStr}${message}${colors.reset}`);
}

/**
 * Print error message
 */
function printError(message, details = null) {
  print(`ERROR: ${message}`, 'red', emojis.cross);
  if (details) {
    console.log(`${colors.dim}${details}${colors.reset}`);
  }
}

/**
 * Print success message
 */
function printSuccess(message) {
  print(message, 'green', emojis.check);
}

/**
 * Print info message
 */
function printInfo(message) {
  print(message, 'cyan', emojis.info);
}

/**
 * Print warning message
 */
function printWarning(message) {
  print(message, 'yellow', emojis.warning);
}

/**
 * Make HTTP/HTTPS request (with proxy support)
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    // Support system proxy
    const proxyUrl = process.env.HTTP_PROXY || process.env.http_proxy || 
                     process.env.HTTPS_PROXY || process.env.https_proxy;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'YektaYar-SocketIO-TUI/1.0',
        ...options.headers
      },
      timeout: options.timeout || 10000
    };

    if (proxyUrl) {
      const proxy = new URL(proxyUrl);
      requestOptions.hostname = proxy.hostname;
      requestOptions.port = proxy.port;
      requestOptions.path = url;
      requestOptions.headers['Host'] = urlObj.hostname;
      print(`Using proxy: ${proxyUrl}`, 'dim', emojis.globe);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Check if backend has Socket.IO feature available via REST
 */
async function checkSocketIOAvailability(baseUrl) {
  print(`Checking Socket.IO availability at ${baseUrl}...`, 'cyan', emojis.search);
  
  try {
    const response = await makeRequest(baseUrl);
    
    if (response.status !== 200) {
      printError(`Server responded with status ${response.status}`);
      return false;
    }

    serverInfo = response.data;
    
    if (serverInfo.features && serverInfo.features.websocket) {
      printSuccess('Socket.IO feature is available!');
      print(`Server: ${serverInfo.message || 'YektaYar API'}`, 'dim');
      print(`Version: ${serverInfo.version || 'unknown'}`, 'dim');
      print(`Status: ${serverInfo.status || 'unknown'}`, 'dim');
      return true;
    } else {
      printWarning('Socket.IO feature not advertised by server');
      print('Server response:', 'dim');
      console.log(JSON.stringify(serverInfo, null, 2));
      return false;
    }
  } catch (error) {
    printError('Failed to check Socket.IO availability', error.message);
    return false;
  }
}

/**
 * Connect to Socket.IO server
 */
async function connectToSocketIO(baseUrl) {
  try {
    // Dynamic import of socket.io-client
    const { io: socketIO } = await import('socket.io-client');
    
    print(`Connecting to Socket.IO at ${baseUrl}...`, 'cyan', emojis.link);
    
    const socketUrl = baseUrl;
    const options = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      auth: {
        // For testing purposes, we'll try to connect without auth first
        // In production, you would provide a valid token
        token: process.env.TEST_TOKEN || null
      }
    };

    // Support proxy for Socket.IO
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      print('Proxy detected - Socket.IO will use it for connection', 'dim', emojis.globe);
    }

    socket = socketIO(socketUrl, options);

    // Connection event handlers
    socket.on('connect', () => {
      isConnected = true;
      reconnectAttempts = 0;
      printSuccess(`Connected! Socket ID: ${socket.id}`);
      print(`${emojis.lightning} Connection established`, 'green');
    });

    socket.on('connect_error', (error) => {
      isConnected = false;
      printError('Connection error', error.message);
      
      if (error.message.includes('Authentication')) {
        printInfo('Authentication required. Set TEST_TOKEN environment variable with a valid token.');
      }
    });

    socket.on('disconnect', (reason) => {
      isConnected = false;
      print(`Disconnected: ${reason}`, 'yellow', emojis.disconnect);
    });

    socket.on('reconnect_attempt', (attempt) => {
      reconnectAttempts = attempt;
      print(`Reconnection attempt ${attempt}...`, 'yellow', emojis.hourglass);
    });

    socket.on('reconnect', (attemptNumber) => {
      printSuccess(`Reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_failed', () => {
      printError('Reconnection failed after all attempts');
    });

    // Custom event handlers
    socket.on('connected', (data) => {
      print('Server welcome message received:', 'cyan', emojis.sparkles);
      console.log(JSON.stringify(data, null, 2));
    });

    socket.on('pong', (data) => {
      lastPongTime = Date.now();
      const latency = lastPongTime - lastPingTime;
      printSuccess(`Pong received! Latency: ${latency}ms`);
      console.log(JSON.stringify(data, null, 2));
    });

    socket.on('ai:response:start', (data) => {
      print('AI response started', 'magenta', emojis.brain);
      console.log(JSON.stringify(data, null, 2));
    });

    socket.on('ai:response:chunk', (data) => {
      process.stdout.write(`${colors.dim}${data.chunk}${colors.reset}`);
    });

    socket.on('ai:response:complete', (data) => {
      console.log('');
      printSuccess('AI response completed');
    });

    socket.on('ai:response:error', (data) => {
      printError('AI response error', data.error);
    });

    // Wait for connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

  } catch (error) {
    printError('Failed to connect to Socket.IO', error.message);
    throw error;
  }
}

/**
 * Display connection status
 */
function displayStatus() {
  console.log('');
  print('═══ Connection Status ═══', 'cyan', emojis.chart);
  
  const status = isConnected ? 
    `${colors.green}${emojis.check} Connected${colors.reset}` : 
    `${colors.red}${emojis.cross} Disconnected${colors.reset}`;
  
  console.log(`Status: ${status}`);
  
  if (socket) {
    console.log(`Socket ID: ${socket.id || 'N/A'}`);
    console.log(`Connected: ${socket.connected}`);
    console.log(`Reconnect Attempts: ${reconnectAttempts}`);
  }
  
  if (lastPingTime && lastPongTime) {
    const latency = lastPongTime - lastPingTime;
    console.log(`Last Latency: ${latency}ms`);
  }
  
  if (serverInfo) {
    console.log('');
    print('═══ Server Info ═══', 'cyan', emojis.info);
    console.log(`Name: ${serverInfo.message || 'N/A'}`);
    console.log(`Version: ${serverInfo.version || 'N/A'}`);
    console.log(`Status: ${serverInfo.status || 'N/A'}`);
    if (serverInfo.features) {
      console.log(`Features: REST=${serverInfo.features.rest}, WebSocket=${serverInfo.features.websocket}`);
    }
  }
  
  console.log('');
}

/**
 * Send ping to server
 */
function sendPing() {
  if (!isConnected || !socket) {
    printError('Not connected to server');
    return;
  }
  
  lastPingTime = Date.now();
  print('Sending ping...', 'cyan', emojis.ping);
  socket.emit('ping');
}

/**
 * Send AI chat message
 */
function sendAIChat(message) {
  if (!isConnected || !socket) {
    printError('Not connected to server');
    return;
  }
  
  print(`Sending AI chat message...`, 'magenta', emojis.brain);
  socket.emit('ai:chat', {
    message: message,
    conversationHistory: []
  });
}

/**
 * Send custom event
 */
function sendCustomEvent(eventName, data) {
  if (!isConnected || !socket) {
    printError('Not connected to server');
    return;
  }
  
  print(`Sending custom event: ${eventName}`, 'cyan', emojis.fire);
  try {
    const parsedData = JSON.parse(data);
    socket.emit(eventName, parsedData);
    printSuccess('Event sent successfully');
  } catch (error) {
    printError('Invalid JSON data', error.message);
  }
}

/**
 * Display interactive menu
 */
function displayMenu() {
  console.log('');
  print('═══ Available Actions ═══', 'cyan', emojis.tools);
  console.log(`  ${colors.bright}1${colors.reset} - Display connection status`);
  console.log(`  ${colors.bright}2${colors.reset} - Send ping (test latency)`);
  console.log(`  ${colors.bright}3${colors.reset} - Send AI chat message`);
  console.log(`  ${colors.bright}4${colors.reset} - Send custom event`);
  console.log(`  ${colors.bright}5${colors.reset} - Reconnect`);
  console.log(`  ${colors.bright}6${colors.reset} - Disconnect`);
  console.log(`  ${colors.bright}7${colors.reset} - Health check (REST)`);
  console.log(`  ${colors.bright}h${colors.reset} - Show this menu`);
  console.log(`  ${colors.bright}q${colors.reset} - Quit`);
  console.log('');
}

/**
 * Get user input
 */
function getUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Process user command
 */
async function processCommand(command, baseUrl) {
  switch (command) {
    case '1':
      displayStatus();
      break;
      
    case '2':
      sendPing();
      break;
      
    case '3':
      const aiMessage = await getUserInput('Enter AI chat message: ');
      if (aiMessage) {
        sendAIChat(aiMessage);
      }
      break;
      
    case '4':
      const eventName = await getUserInput('Enter event name: ');
      if (eventName) {
        const eventData = await getUserInput('Enter event data (JSON): ');
        if (eventData) {
          sendCustomEvent(eventName, eventData);
        }
      }
      break;
      
    case '5':
      if (socket) {
        print('Reconnecting...', 'cyan', emojis.link);
        socket.disconnect();
        socket.connect();
      }
      break;
      
    case '6':
      if (socket) {
        print('Disconnecting...', 'yellow', emojis.disconnect);
        socket.disconnect();
      }
      break;
      
    case '7':
      await checkSocketIOAvailability(baseUrl);
      break;
      
    case 'h':
      displayMenu();
      break;
      
    case 'q':
      return false;
      
    default:
      printWarning('Unknown command. Type "h" for help.');
  }
  
  return true;
}

/**
 * Main interactive loop
 */
async function interactiveLoop(baseUrl) {
  displayMenu();
  
  let running = true;
  while (running) {
    const command = await getUserInput('Enter command (h for help):');
    running = await processCommand(command, baseUrl);
  }
}

/**
 * Cleanup and exit
 */
function cleanup() {
  print('Cleaning up...', 'yellow', emojis.tools);
  
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  printSuccess('Goodbye!');
  process.exit(0);
}

/**
 * Main function
 */
async function main() {
  // Handle graceful shutdown
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  displayHeader();
  
  // Get API base URL
  const customUrl = process.argv[2];
  const envUrl = process.env.API_BASE_URL;
  const baseUrl = customUrl || envUrl || 'http://localhost:3000';
  
  print(`Target URL: ${baseUrl}`, 'cyan', emojis.globe);
  
  if (customUrl) {
    print('Using custom URL from command line', 'dim');
  } else if (envUrl) {
    print('Using API_BASE_URL from .env file', 'dim');
  } else {
    print('Using default URL (localhost:3000)', 'dim');
  }
  
  console.log('');
  
  // Check dependencies
  print('Checking dependencies...', 'cyan', emojis.hourglass);
  try {
    await import('socket.io-client');
    printSuccess('socket.io-client is available');
  } catch (error) {
    printError('socket.io-client is not installed');
    printInfo('Install it with: npm install socket.io-client');
    print('You can still use REST health check (option 7)', 'yellow');
  }
  
  console.log('');
  
  // Step 1: Check Socket.IO availability via REST
  const socketIOAvailable = await checkSocketIOAvailability(baseUrl);
  
  if (!socketIOAvailable) {
    printWarning('Socket.IO might not be available or server is not responding');
    const continueAnyway = await getUserInput('Continue anyway? (y/n): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      cleanup();
      return;
    }
  }
  
  console.log('');
  
  // Step 2: Try to connect to Socket.IO
  try {
    await connectToSocketIO(baseUrl);
  } catch (error) {
    printError('Failed to establish Socket.IO connection');
    print('You can still use health check and other REST features', 'yellow');
  }
  
  console.log('');
  
  // Step 3: Enter interactive mode
  await interactiveLoop(baseUrl);
  
  // Cleanup
  cleanup();
}

// Run the application
main().catch((error) => {
  printError('Fatal error', error.message);
  console.error(error);
  process.exit(1);
});
