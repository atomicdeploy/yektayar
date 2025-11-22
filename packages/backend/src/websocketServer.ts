import { setupBunSocketIO } from './websocket/socketServer'
import { setupNativeWebSocket } from './websocket/nativeWebSocketServer'
import { getWebSocketPathFromEnv } from '@yektayar/shared'
import { initializeDatabase } from './services/database'

/**
 * Dedicated WebSocket server for ws.yektayar.ir
 * This server handles both Socket.IO and native WebSocket connections
 * on a separate port (default: 3500) to enable domain-specific routing
 */

// Server configuration
const wsPort = Number(process.env.WEBSOCKET_PORT) || 3500
const hostname = process.env.HOST || 'localhost'
const WEBSOCKET_PATH = getWebSocketPathFromEnv()

// Initialize database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error)
  console.log('⚠️  WebSocket server will continue running, but database features may not work')
})

// Detect runtime
const isBun = typeof Bun !== 'undefined'

if (!isBun) {
  console.error('❌ Dedicated WebSocket server requires Bun runtime')
  console.log('💡 Use Node.js with the main server (index.ts) for Socket.IO support')
  process.exit(1)
}

console.log(`⚡ Starting dedicated WebSocket server on Bun ${Bun.version}`)

// Setup Socket.IO with Bun engine
const { engine, ioInstance } = setupBunSocketIO()
const socketIOHandler = engine.handler()

// Setup native WebSocket handler
const nativeWSHandler = setupNativeWebSocket()

// Create unified server that handles both protocols
const wsServer = Bun.serve({
  port: wsPort,
  hostname,
  fetch: async (req, server) => {
    const url = new URL(req.url)
    
    // Check for WebSocket upgrade request
    const upgradeHeader = req.headers.get('upgrade')?.toLowerCase()
    const isWebSocketUpgrade = upgradeHeader === 'websocket'
    
    if (isWebSocketUpgrade) {
      // Check if this is a Socket.IO request (has EIO parameter)
      if (url.searchParams.has('EIO')) {
        return engine.handleRequest(req, server)
      }
      
      // Native WebSocket requests (WebSocket upgrade without EIO parameter)
      return nativeWSHandler.upgrade(req, server)
    }
    
    // Handle Socket.IO polling requests (non-upgrade HTTP requests with EIO parameter)
    if (url.searchParams.has('EIO')) {
      return engine.handleRequest(req, server)
    }
    
    // Non-WebSocket requests - return info
    return new Response(JSON.stringify({
      message: 'YektaYar WebSocket Server',
      version: '0.1.0',
      status: 'running',
      protocols: {
        socketio: {
          path: WEBSOCKET_PATH,
          description: 'Socket.IO endpoint with authentication (auto-detected via EIO parameter)',
          transports: ['websocket', 'polling']
        },
        websocket: {
          path: WEBSOCKET_PATH,
          description: 'Native WebSocket endpoint with authentication',
          authentication: 'Required - Pass token in query parameter or Authorization header'
        }
      },
      usage: {
        socketio: `Connect to ${url.origin}${WEBSOCKET_PATH} with Socket.IO client`,
        websocket: `Connect to ${url.origin}${WEBSOCKET_PATH}?token=YOUR_TOKEN with native WebSocket client (or use Authorization header)`
      }
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  websocket: {
    // This handler will route to appropriate protocol based on connection type
    message(ws: any, message: string | Buffer) {
      // Check if this is a Socket.IO connection or native WebSocket
      // Socket.IO connections are handled by the engine
      if (ws.data?.protocol === 'native') {
        nativeWSHandler.websocket.message(ws, message)
      }
      // Socket.IO messages are handled by socketIOHandler.websocket.message
      else if (socketIOHandler.websocket.message) {
        socketIOHandler.websocket.message(ws, message)
      }
    },
    
    open(ws: any) {
      // Determine protocol and route accordingly
      if (ws.data?.socketId?.startsWith('ws-')) {
        // Native WebSocket
        ws.data.protocol = 'native'
        nativeWSHandler.websocket.open(ws)
      } else {
        // Socket.IO
        if (socketIOHandler.websocket.open) {
          socketIOHandler.websocket.open(ws)
        }
      }
    },
    
    close(ws: any, code: number, reason: string) {
      if (ws.data?.protocol === 'native') {
        nativeWSHandler.websocket.close(ws, code, reason)
      } else if (socketIOHandler.websocket.close) {
        socketIOHandler.websocket.close(ws, code, reason)
      }
    },
    
    drain(ws: any) {
      if (ws.data?.protocol === 'native') {
        nativeWSHandler.websocket.drain(ws)
      } else if (socketIOHandler.websocket.drain) {
        socketIOHandler.websocket.drain(ws)
      }
    }
  }
})

console.log(`🚀 YektaYar WebSocket Server running at ws://${hostname}:${wsPort}`)
console.log(`✅ Unified WebSocket endpoint: ws://${hostname}:${wsPort}${WEBSOCKET_PATH}`)
console.log(`📡 Supports both Socket.IO and native WebSocket (auto-detected)`)
console.log(`🔐 Authentication required for all connections`)
console.log(`💡 Configure your reverse proxy to route ws.yektayar.ir to this port`)

// Check environment
if (Bun.env.NODE_ENV === 'development') {
  console.log(`🔧 Running in development mode`)
} else if (Bun.env.NODE_ENV === 'production') {
  console.log(`🚀 Running in production mode`)
}

export default wsServer
export { ioInstance as io }
