import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { Duplex } from 'stream'
import { validateSessionToken } from '../services/sessionService'
import { URL } from 'url'
import { 
  WebSocketSessionData, 
  routeEvent, 
  createWelcomeMessage 
} from './eventHandlers'

/**
 * Handle native WebSocket connections for Node.js
 * This implements the same event handlers as Socket.IO for compatibility
 */
export function setupNodeWebSocket(server: any, path: string = '/ws') {
  const wss = new WebSocketServer({ noServer: true })

  // Handle upgrade requests
  server.on('upgrade', async (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`)
    
    // Only handle our WebSocket path
    if (!url.pathname.startsWith(path)) {
      return
    }

    // Check if this is a Socket.IO request (has EIO parameter)
    if (url.searchParams.has('EIO') || url.pathname.includes('/socket.io/')) {
      // Let Socket.IO handle it
      return
    }

    try {
      // Extract token from query params or headers
      const token = url.searchParams.get('token') || 
                   request.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\nAuthentication token required')
        socket.destroy()
        return
      }

      // Validate the session token
      const session = await validateSessionToken(token)

      if (!session) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\nInvalid or expired session token')
        socket.destroy()
        return
      }

      // Prepare WebSocket data
      const wsData: WebSocketSessionData = {
        sessionToken: session.token,
        userId: session.userId,
        isLoggedIn: session.isLoggedIn,
        socketId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Accept the WebSocket connection
      wss.handleUpgrade(request, socket, head, (ws) => {
        // Attach session data to WebSocket
        (ws as any).sessionData = wsData
        wss.emit('connection', ws, request, wsData)
      })
    } catch (error) {
      console.error('WebSocket authentication error:', error)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\nAuthentication failed')
      socket.destroy()
    }
  })

  // Setup connection handlers
  wss.on('connection', (ws: WebSocket, request: IncomingMessage, wsData: WebSocketSessionData) => {
    console.log(`Native WebSocket connected: ${wsData.socketId}`, {
      sessionToken: wsData.sessionToken,
      userId: wsData.userId,
      isLoggedIn: wsData.isLoggedIn
    })

    // Send welcome message
    ws.send(JSON.stringify(createWelcomeMessage(wsData, 'native-websocket')))

    // Handle messages
    ws.on('message', (data) => {
      try {
        const messageStr = data.toString()
        const parsed = JSON.parse(messageStr)

        // Route event to shared handler
        const send = (msg: any) => ws.send(JSON.stringify(msg))
        routeEvent(parsed.event, parsed.data, send, wsData, 'native-websocket')
      } catch (error) {
        console.error('WebSocket message handling error:', error)
        ws.send(JSON.stringify({
          event: 'error',
          data: { error: 'Failed to process message' }
        }))
      }
    })

    // Handle close
    ws.on('close', (code, reason) => {
      console.log(`Native WebSocket disconnected: ${wsData.socketId}`, { code, reason: reason.toString() })
    })

    // Handle errors
    ws.on('error', (error) => {
      console.error(`Native WebSocket error for ${wsData.socketId}:`, error)
    })
  })

  return wss
}
