#!/usr/bin/env node

/**
 * Pollination AI TUI (Text User Interface) Testing and Debugging Tool
 * 
 * A comprehensive console application for testing and debugging the Pollination AI
 * integration in the YektaYar platform.
 * 
 * Features:
 * - Direct Pollination AI API testing (bypassing backend)
 * - Backend AI endpoint testing (via REST API)
 * - WebSocket/Socket.IO AI streaming testing
 * - Conversation history management
 * - Response time and latency monitoring
 * - Colorized output with emojis for better UX
 * - Interactive menu with various test scenarios
 * - Live streaming response display
 * - Error handling and diagnostics
 * - Support for environment variables and custom URLs
 * - Detailed logging for debugging
 * 
 * Usage:
 *   npm run ai:test                              # Use defaults from .env
 *   npm run ai:test -- http://localhost:3000     # Use custom backend URL
 *   node scripts/pollination-ai-tui.js           # Run directly
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

// Configuration
const POLLINATIONS_API_URL = 'https://text.pollinations.ai';
const DEFAULT_BACKEND_URL = 'http://localhost:3000';

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
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m'
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
  brain: '🧠',
  chat: '💬',
  robot: '🤖',
  heart: '❤️',
  lightning: '⚡',
  tools: '🔧',
  chart: '📊',
  clock: '⏱️',
  globe: '🌐',
  test: '🧪',
  book: '📖',
  search: '🔍',
  target: '🎯',
  wave: '👋',
  thought: '💭',
  writing: '✍️'
};

// Global state
let conversationHistory = [];
let socket = null;
let isConnected = false;
let testResults = {
  directAPI: { success: 0, failed: 0, totalTime: 0 },
  backendREST: { success: 0, failed: 0, totalTime: 0 },
  backendWebSocket: { success: 0, failed: 0, totalTime: 0 }
};

/**
 * Display styled header
 */
function displayHeader() {
  console.clear();
  console.log(`${colors.magenta}${colors.bright}`);
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║     🧠 Pollination AI Testing & Debugging Tool 🤖            ║');
  console.log('║        YektaYar Mental Health Platform                        ║');
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
 * Print error message with details
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
 * Print section header
 */
function printSection(title) {
  console.log('');
  print(`═══ ${title} ═══`, 'cyan', emojis.sparkles);
}

/**
 * Print AI response in a formatted way
 */
function printAIResponse(response, type = 'response') {
  console.log('');
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│ ${colors.bright}${colors.magenta}AI Response (${type})${colors.reset}${colors.dim}                                    │${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
  
  // Word wrap the response
  const maxWidth = 60;
  const words = response.split(' ');
  let line = '';
  
  for (const word of words) {
    if ((line + word).length > maxWidth) {
      console.log(`  ${colors.white}${line.trim()}${colors.reset}`);
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line.trim()) {
    console.log(`  ${colors.white}${line.trim()}${colors.reset}`);
  }
  
  console.log('');
  console.log(`${colors.dim}───────────────────────────────────────────────────────────${colors.reset}`);
  console.log('');
}

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'YektaYar-AI-TUI/1.0',
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 30000
    };

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
 * Test direct Pollination AI API
 */
async function testDirectPollinationAPI(message, showDetails = true) {
  if (showDetails) {
    printSection('Testing Direct Pollination AI API');
    print(`Sending message: "${message}"`, 'cyan', emojis.chat);
  }
  
  const startTime = Date.now();
  
  try {
    // Build the system prompt
    const systemPrompt = `You are a compassionate mental health AI counselor. Provide empathetic, helpful guidance.`;
    
    // Format conversation history
    let prompt = systemPrompt + '\n\n';
    if (conversationHistory.length > 0) {
      prompt += 'Previous conversation:\n';
      conversationHistory.slice(-3).forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    prompt += `User: ${message}\nAssistant:`;
    
    if (showDetails) {
      print('Making request to Pollination AI...', 'dim', emojis.hourglass);
    }
    
    // Try POST request first (structured API)
    const response = await makeRequest(POLLINATIONS_API_URL, {
      method: 'POST',
      body: {
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-5),
          { role: 'user', content: message }
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 1000000),
        jsonMode: false
      },
      timeout: 30000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    let aiResponse = '';
    
    if (response.status === 200) {
      // Parse response
      if (typeof response.data === 'string') {
        aiResponse = response.data;
      } else if (response.data.choices && response.data.choices[0]?.message?.content) {
        aiResponse = response.data.choices[0].message.content;
      } else if (response.data.response) {
        aiResponse = response.data.response;
      } else if (response.data.text) {
        aiResponse = response.data.text;
      } else {
        aiResponse = JSON.stringify(response.data);
      }
      
      testResults.directAPI.success++;
      testResults.directAPI.totalTime += responseTime;
      
      if (showDetails) {
        printSuccess(`Response received in ${responseTime}ms`);
        printAIResponse(aiResponse.trim(), 'Direct API');
      }
      
      return { success: true, response: aiResponse.trim(), responseTime };
    } else {
      // Try simple GET fallback
      if (showDetails) {
        printWarning('POST failed, trying simple GET...');
      }
      
      const simpleUrl = `${POLLINATIONS_API_URL}?prompt=${encodeURIComponent(prompt)}`;
      const simpleResponse = await makeRequest(simpleUrl, { timeout: 30000 });
      
      const fallbackEndTime = Date.now();
      const fallbackResponseTime = fallbackEndTime - startTime;
      
      if (simpleResponse.status === 200) {
        aiResponse = typeof simpleResponse.data === 'string' ? 
          simpleResponse.data : JSON.stringify(simpleResponse.data);
        
        testResults.directAPI.success++;
        testResults.directAPI.totalTime += fallbackResponseTime;
        
        if (showDetails) {
          printSuccess(`Response received in ${fallbackResponseTime}ms (fallback)`);
          printAIResponse(aiResponse.trim(), 'Direct API - Fallback');
        }
        
        return { success: true, response: aiResponse.trim(), responseTime: fallbackResponseTime };
      } else {
        throw new Error(`API returned status ${simpleResponse.status}`);
      }
    }
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    testResults.directAPI.failed++;
    
    if (showDetails) {
      printError('Direct API test failed', error.message);
      print(`Time taken: ${responseTime}ms`, 'dim');
    }
    
    return { success: false, error: error.message, responseTime };
  }
}

/**
 * Test backend REST AI endpoint
 */
async function testBackendRESTAPI(message, backendUrl, showDetails = true) {
  if (showDetails) {
    printSection('Testing Backend REST AI Endpoint');
    print(`Sending message: "${message}"`, 'cyan', emojis.chat);
  }
  
  const startTime = Date.now();
  
  try {
    const url = `${backendUrl}/api/ai/chat`;
    
    if (showDetails) {
      print(`Making request to ${url}...`, 'dim', emojis.hourglass);
    }
    
    const response = await makeRequest(url, {
      method: 'POST',
      body: {
        message: message,
        conversationHistory: conversationHistory.slice(-5)
      },
      timeout: 30000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status === 200 && response.data.success) {
      testResults.backendREST.success++;
      testResults.backendREST.totalTime += responseTime;
      
      if (showDetails) {
        printSuccess(`Response received in ${responseTime}ms`);
        printAIResponse(response.data.response, 'Backend REST');
        print(`Timestamp: ${response.data.timestamp}`, 'dim');
      }
      
      return { 
        success: true, 
        response: response.data.response, 
        responseTime,
        timestamp: response.data.timestamp 
      };
    } else {
      throw new Error(response.data.error || `Backend returned status ${response.status}`);
    }
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    testResults.backendREST.failed++;
    
    if (showDetails) {
      printError('Backend REST test failed', error.message);
      print(`Time taken: ${responseTime}ms`, 'dim');
    }
    
    return { success: false, error: error.message, responseTime };
  }
}

/**
 * Test backend WebSocket AI streaming
 */
async function testBackendWebSocket(message, backendUrl) {
  printSection('Testing Backend WebSocket AI Streaming');
  print(`Sending message: "${message}"`, 'cyan', emojis.chat);
  
  if (!socket || !isConnected) {
    printError('Not connected to WebSocket. Please connect first (option 6).');
    return { success: false, error: 'Not connected' };
  }
  
  const startTime = Date.now();
  let fullResponse = '';
  let chunkCount = 0;
  
  return new Promise((resolve) => {
    // Set up event listeners
    const responseStartHandler = (data) => {
      print('AI response streaming started...', 'cyan', emojis.writing);
      console.log(`${colors.dim}┌─────────────────────────────────────────────────────────┐${colors.reset}`);
      console.log(`${colors.dim}│ ${colors.bright}${colors.magenta}AI Response (Streaming)${colors.reset}${colors.dim}                              │${colors.reset}`);
      console.log(`${colors.dim}└─────────────────────────────────────────────────────────┘${colors.reset}`);
      console.log('');
      process.stdout.write('  ');
    };
    
    const responseChunkHandler = (data) => {
      process.stdout.write(`${colors.white}${data.chunk}${colors.reset}`);
      fullResponse += data.chunk;
      chunkCount++;
    };
    
    const responseCompleteHandler = (data) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('\n');
      console.log(`${colors.dim}───────────────────────────────────────────────────────────${colors.reset}`);
      console.log('');
      
      testResults.backendWebSocket.success++;
      testResults.backendWebSocket.totalTime += responseTime;
      
      printSuccess(`Response completed in ${responseTime}ms`);
      print(`Chunks received: ${chunkCount}`, 'dim');
      print(`Average chunk time: ${(responseTime / chunkCount).toFixed(2)}ms`, 'dim');
      
      // Clean up listeners
      socket.off('ai:response:start', responseStartHandler);
      socket.off('ai:response:chunk', responseChunkHandler);
      socket.off('ai:response:complete', responseCompleteHandler);
      socket.off('ai:response:error', responseErrorHandler);
      
      resolve({ success: true, response: fullResponse, responseTime, chunkCount });
    };
    
    const responseErrorHandler = (data) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      testResults.backendWebSocket.failed++;
      
      printError('AI response error', data.error);
      
      // Clean up listeners
      socket.off('ai:response:start', responseStartHandler);
      socket.off('ai:response:chunk', responseChunkHandler);
      socket.off('ai:response:complete', responseCompleteHandler);
      socket.off('ai:response:error', responseErrorHandler);
      
      resolve({ success: false, error: data.error, responseTime });
    };
    
    // Register event listeners
    socket.on('ai:response:start', responseStartHandler);
    socket.on('ai:response:chunk', responseChunkHandler);
    socket.on('ai:response:complete', responseCompleteHandler);
    socket.on('ai:response:error', responseErrorHandler);
    
    // Send the message
    print('Emitting ai:chat event...', 'dim', emojis.lightning);
    socket.emit('ai:chat', {
      message: message,
      conversationHistory: conversationHistory.slice(-5)
    });
  });
}

/**
 * Connect to backend WebSocket
 */
async function connectToWebSocket(backendUrl) {
  try {
    print('Loading Socket.IO client...', 'cyan', emojis.hourglass);
    const { io: socketIO } = await import('socket.io-client');
    
    print(`Connecting to ${backendUrl}...`, 'cyan', emojis.globe);
    
    socket = socketIO(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      isConnected = true;
      printSuccess(`Connected! Socket ID: ${socket.id}`);
    });

    socket.on('connect_error', (error) => {
      isConnected = false;
      printError('Connection error', error.message);
    });

    socket.on('disconnect', (reason) => {
      isConnected = false;
      print(`Disconnected: ${reason}`, 'yellow', emojis.warning);
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

    return true;
  } catch (error) {
    printError('Failed to connect to WebSocket', error.message);
    return false;
  }
}

/**
 * Display conversation history
 */
function displayConversationHistory() {
  printSection('Conversation History');
  
  if (conversationHistory.length === 0) {
    print('No conversation history yet.', 'dim');
    console.log('');
    return;
  }
  
  conversationHistory.forEach((msg, index) => {
    const role = msg.role === 'user' ? `${emojis.wave} User` : `${emojis.robot} AI`;
    const color = msg.role === 'user' ? 'cyan' : 'magenta';
    
    console.log(`${colors[color]}${colors.bright}${index + 1}. ${role}:${colors.reset}`);
    console.log(`   ${colors.dim}${msg.content.substring(0, 80)}${msg.content.length > 80 ? '...' : ''}${colors.reset}`);
    console.log('');
  });
}

/**
 * Display test statistics
 */
function displayTestStatistics() {
  printSection('Test Statistics');
  
  const displayStats = (name, stats, emoji) => {
    const total = stats.success + stats.failed;
    const avgTime = total > 0 ? (stats.totalTime / stats.success).toFixed(2) : 0;
    const successRate = total > 0 ? ((stats.success / total) * 100).toFixed(1) : 0;
    
    console.log(`${emoji} ${colors.bright}${name}${colors.reset}`);
    console.log(`   Total: ${total} | Success: ${colors.green}${stats.success}${colors.reset} | Failed: ${colors.red}${stats.failed}${colors.reset}`);
    console.log(`   Success Rate: ${successRate}% | Avg Time: ${avgTime}ms`);
    console.log('');
  };
  
  displayStats('Direct Pollination API', testResults.directAPI, emojis.globe);
  displayStats('Backend REST API', testResults.backendREST, emojis.rocket);
  displayStats('Backend WebSocket', testResults.backendWebSocket, emojis.lightning);
}

/**
 * Run automated test suite
 */
async function runAutomatedTests(backendUrl) {
  printSection('Running Automated Test Suite');
  print('This will test all AI endpoints with predefined messages...', 'cyan', emojis.test);
  console.log('');
  
  const testMessages = [
    "Hello, how are you?",
    "I'm feeling anxious today.",
    "Can you help me with stress management?"
  ];
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    print(`\nTest ${i + 1}/${testMessages.length}: "${message}"`, 'bright', emojis.target);
    
    // Test direct API
    print('→ Testing Direct API...', 'dim');
    const directResult = await testDirectPollinationAPI(message, false);
    if (directResult.success) {
      print(`  ✓ Direct API: ${directResult.responseTime}ms`, 'green');
      testsPassed++;
    } else {
      print(`  ✗ Direct API failed: ${directResult.error}`, 'red');
      testsFailed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test backend REST
    print('→ Testing Backend REST...', 'dim');
    const backendResult = await testBackendRESTAPI(message, backendUrl, false);
    if (backendResult.success) {
      print(`  ✓ Backend REST: ${backendResult.responseTime}ms`, 'green');
      testsPassed++;
    } else {
      print(`  ✗ Backend REST failed: ${backendResult.error}`, 'red');
      testsFailed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('');
  print('═══ Test Suite Complete ═══', 'cyan', emojis.sparkles);
  print(`Passed: ${testsPassed} | Failed: ${testsFailed}`, testsPassed > testsFailed ? 'green' : 'red');
  console.log('');
}

/**
 * Display interactive menu
 */
function displayMenu() {
  console.log('');
  print('═══ Available Actions ═══', 'cyan', emojis.tools);
  console.log(`  ${colors.bright}1${colors.reset} - Test Direct Pollination AI API`);
  console.log(`  ${colors.bright}2${colors.reset} - Test Backend REST AI Endpoint`);
  console.log(`  ${colors.bright}3${colors.reset} - Test Backend WebSocket AI Streaming`);
  console.log(`  ${colors.bright}4${colors.reset} - Run Automated Test Suite`);
  console.log(`  ${colors.bright}5${colors.reset} - Display Conversation History`);
  console.log(`  ${colors.bright}6${colors.reset} - Connect to WebSocket`);
  console.log(`  ${colors.bright}7${colors.reset} - Clear Conversation History`);
  console.log(`  ${colors.bright}8${colors.reset} - Display Test Statistics`);
  console.log(`  ${colors.bright}9${colors.reset} - Check Backend AI Status`);
  console.log(`  ${colors.bright}h${colors.reset} - Show this menu`);
  console.log(`  ${colors.bright}q${colors.reset} - Quit`);
  console.log('');
}

/**
 * Check backend AI status
 */
async function checkBackendAIStatus(backendUrl) {
  printSection('Checking Backend AI Status');
  
  try {
    const url = `${backendUrl}/api/ai/status`;
    print(`Checking ${url}...`, 'cyan', emojis.search);
    
    const response = await makeRequest(url, { timeout: 10000 });
    
    if (response.status === 200 && response.data.success) {
      printSuccess('AI service is operational');
      print(`Provider: ${response.data.provider}`, 'dim');
      print(`Status: ${response.data.status}`, 'dim');
      print(`Timestamp: ${response.data.timestamp}`, 'dim');
    } else {
      printWarning('AI service status unclear');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    printError('Failed to check AI status', error.message);
  }
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
async function processCommand(command, backendUrl) {
  switch (command) {
    case '1': {
      const message = await getUserInput('Enter your message:');
      if (message) {
        const result = await testDirectPollinationAPI(message);
        if (result.success) {
          conversationHistory.push({ role: 'user', content: message });
          conversationHistory.push({ role: 'assistant', content: result.response });
        }
      }
      break;
    }
    
    case '2': {
      const message = await getUserInput('Enter your message:');
      if (message) {
        const result = await testBackendRESTAPI(message, backendUrl);
        if (result.success) {
          conversationHistory.push({ role: 'user', content: message });
          conversationHistory.push({ role: 'assistant', content: result.response });
        }
      }
      break;
    }
    
    case '3': {
      const message = await getUserInput('Enter your message:');
      if (message) {
        const result = await testBackendWebSocket(message, backendUrl);
        if (result.success) {
          conversationHistory.push({ role: 'user', content: message });
          conversationHistory.push({ role: 'assistant', content: result.response });
        }
      }
      break;
    }
    
    case '4':
      await runAutomatedTests(backendUrl);
      break;
    
    case '5':
      displayConversationHistory();
      break;
    
    case '6':
      await connectToWebSocket(backendUrl);
      break;
    
    case '7':
      conversationHistory = [];
      printSuccess('Conversation history cleared');
      break;
    
    case '8':
      displayTestStatistics();
      break;
    
    case '9':
      await checkBackendAIStatus(backendUrl);
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
async function interactiveLoop(backendUrl) {
  displayMenu();
  
  let running = true;
  while (running) {
    const command = await getUserInput('Enter command (h for help):');
    running = await processCommand(command, backendUrl);
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
  
  printSuccess('Goodbye! Happy debugging! 👋');
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
  
  // Get backend URL
  const customUrl = process.argv[2];
  const envUrl = process.env.API_BASE_URL;
  const backendUrl = customUrl || envUrl || DEFAULT_BACKEND_URL;
  
  print(`Backend URL: ${backendUrl}`, 'cyan', emojis.globe);
  print(`Pollination API: ${POLLINATIONS_API_URL}`, 'cyan', emojis.globe);
  
  if (customUrl) {
    print('Using custom URL from command line', 'dim');
  } else if (envUrl) {
    print('Using API_BASE_URL from .env file', 'dim');
  } else {
    print('Using default URL (localhost:3000)', 'dim');
  }
  
  console.log('');
  
  // Display info
  printInfo('This tool tests the Pollination AI integration in YektaYar');
  printInfo('You can test direct API calls, backend endpoints, and WebSocket streaming');
  printInfo('All interactions maintain conversation history for context');
  
  console.log('');
  
  // Check socket.io-client availability
  try {
    await import('socket.io-client');
    print('socket.io-client is available for WebSocket testing', 'dim', emojis.check);
  } catch (error) {
    printWarning('socket.io-client not available - WebSocket testing disabled');
    print('Install with: npm install socket.io-client', 'dim');
  }
  
  console.log('');
  
  // Enter interactive mode
  await interactiveLoop(backendUrl);
  
  // Cleanup
  cleanup();
}

// Run the application
main().catch((error) => {
  printError('Fatal error', error.message);
  console.error(error);
  process.exit(1);
});
