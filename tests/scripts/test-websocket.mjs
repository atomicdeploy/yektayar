#!/usr/bin/env node

/**
 * WebSocket Testing Script
 * Tests both Socket.IO and native WebSocket connections
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const API_PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WEBSOCKET_PORT || 3500;

console.log('🧪 WebSocket Server Test Suite\n');
console.log('Configuration:');
console.log(`  API Server Port: ${API_PORT}`);
console.log(`  WebSocket Server Port: ${WS_PORT}`);
console.log('');

console.log('📋 Test Plan:');
console.log('  1. Check main API server is running');
console.log('  2. Check dedicated WebSocket server is running');
console.log('  3. Verify Socket.IO endpoint on WebSocket server');
console.log('  4. Verify native WebSocket endpoint on WebSocket server');
console.log('');

console.log('⚠️  Prerequisites:');
console.log('  • Main API server must be running: npm run dev:backend');
console.log('  • WebSocket server must be running: npm run dev:ws -w @yektayar/backend');
console.log('  • Both should be started in separate terminals');
console.log('');

console.log('🔧 Manual Testing Instructions:');
console.log('');
console.log('1️⃣  Test Main API Server Socket.IO (port 3000):');
console.log(`   npm run socketio:test -- http://localhost:${API_PORT}`);
console.log('');

console.log('2️⃣  Test WebSocket Server Socket.IO (port 3500):');
console.log(`   npm run socketio:test -- http://localhost:${WS_PORT}`);
console.log('');

console.log('3️⃣  Test Native WebSocket with wscat:');
console.log('   npm install -g wscat');
console.log(`   wscat -c "ws://localhost:${WS_PORT}/?token=YOUR_SESSION_TOKEN"`);
console.log('   Then send: {"event":"ping"}');
console.log('   Expected: {"event":"pong","data":{"timestamp":"..."}}}');
console.log('');

console.log('4️⃣  Test WebSocket Server Info:');
console.log(`   curl http://localhost:${WS_PORT}`);
console.log('');

console.log('✅ If all tests pass, the WebSocket implementation is working correctly!');
console.log('');

// Check if servers are running
async function checkServer(port, name) {
  try {
    const response = await fetch(`http://localhost:${port}/health`).catch(() => null);
    if (response && response.ok) {
      console.log(`✅ ${name} is running on port ${port}`);
      return true;
    } else {
      console.log(`❌ ${name} is not responding on port ${port}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name} is not running on port ${port}`);
    return false;
  }
}

console.log('🔍 Checking server status...\n');

Promise.all([
  checkServer(API_PORT, 'API Server'),
  checkServer(WS_PORT, 'WebSocket Server')
]).then(([apiRunning, wsRunning]) => {
  console.log('');
  if (!apiRunning && !wsRunning) {
    console.log('⚠️  No servers are running. Start them with:');
    console.log('   Terminal 1: npm run dev:backend');
    console.log('   Terminal 2: npm run dev:ws -w @yektayar/backend');
  } else if (!apiRunning) {
    console.log('⚠️  API Server is not running. Start it with:');
    console.log('   npm run dev:backend');
  } else if (!wsRunning) {
    console.log('⚠️  WebSocket Server is not running. Start it with:');
    console.log('   npm run dev:ws -w @yektayar/backend');
  } else {
    console.log('✅ Both servers are running! You can now run the manual tests above.');
  }
});
