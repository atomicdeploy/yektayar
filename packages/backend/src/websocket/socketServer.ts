import { Server as SocketIOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import type { Socket } from 'socket.io'
import { validateSessionToken } from '../services/sessionService'
import { SOCKET_IO_PATH } from '@yektayar/shared'

// Conditionally import Bun engine only when running on Bun
let BunEngine: any
if (typeof Bun !== 'undefined') {
  BunEngine = await import('@socket.io/bun-engine').then(m => m.Server)
}

export interface AuthenticatedSocket {
  sessionToken: string
  userId: string | null
  isLoggedIn: boolean
}

/**
 * Create authentication middleware for Socket.IO
 */
function createAuthMiddleware() {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      // Get token from auth payload or handshake
      const token = socket.handshake.auth?.token || socket.handshake.query?.token

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // Validate the session token
      const session = await validateSessionToken(token as string)

      if (!session) {
        return next(new Error('Invalid or expired session token'))
      }

      // Attach session info to socket
      const socketData = socket as any
      socketData.sessionToken = session.token
      socketData.userId = session.userId
      socketData.isLoggedIn = session.isLoggedIn

      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  }
}

/**
 * Setup connection handlers for Socket.IO
 */
function setupConnectionHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    const socketData = socket as any
    console.log(`Socket connected: ${socket.id}`, {
      sessionToken: socketData.sessionToken,
      userId: socketData.userId,
      isLoggedIn: socketData.isLoggedIn
    })

    // Join a room for this session
    socket.join(`session:${socketData.sessionToken}`)

    // If user is logged in, join user-specific room
    if (socketData.userId) {
      socket.join(`user:${socketData.userId}`)
    }

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to YektaYar server',
      socketId: socket.id,
      isLoggedIn: socketData.isLoggedIn
    })

    // Handle ping for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() })
    })

    // Handle status command - returns server and connection status
    socket.on('status', () => {
      socket.emit('status_response', {
        server: {
          name: 'YektaYar API Server',
          version: '0.1.0',
          status: 'running',
          timestamp: new Date().toISOString()
        },
        connection: {
          socketId: socket.id,
          sessionToken: socketData.sessionToken,
          userId: socketData.userId,
          isLoggedIn: socketData.isLoggedIn,
          rooms: Array.from(socket.rooms)
        }
      })
    })

    // Handle echo command - echoes back the received message
    socket.on('echo', (data) => {
      socket.emit('echo_response', {
        received: data,
        timestamp: new Date().toISOString(),
        socketId: socket.id
      })
    })

    // Handle info command - returns detailed server information
    socket.on('info', () => {
      const connections = io.sockets.sockets.size
      socket.emit('info_response', {
        server: {
          name: 'YektaYar API',
          version: '0.1.0',
          description: 'Backend API with Socket.IO real-time communication',
          features: {
            rest: true,
            websocket: true,
            authentication: true,
            realtime: true
          }
        },
        websocket: {
          connected: true,
          transport: socket.conn.transport.name,
          protocol: socket.conn.protocol,
          activeConnections: connections
        },
        session: {
          authenticated: socketData.isLoggedIn,
          userId: socketData.userId || 'anonymous',
          sessionToken: socketData.sessionToken ? '***' + socketData.sessionToken.slice(-4) : null
        },
        timestamp: new Date().toISOString()
      })
    })

    // Handle custom message command
    socket.on('message', (data) => {
      console.log(`Message received from ${socket.id}:`, data)
      socket.emit('message_received', {
        success: true,
        message: 'Message received successfully',
        data: data,
        timestamp: new Date().toISOString()
      })
    })

    // Handle AI chat messages
    socket.on('ai:chat', async (data: { message: string; conversationHistory?: any[] }) => {
      try {
        const { message, conversationHistory } = data
        const messageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        console.log(`AI chat request from ${socket.id}:`, message)

        // Emit start event
        socket.emit('ai:response:start', { messageId })

        // Import AI service dynamically to avoid circular deps
        const { streamAIResponseChunks } = await import('../services/aiService')

        // Stream the response
        let fullResponse = ''
        for await (const chunk of streamAIResponseChunks(message, conversationHistory)) {
          fullResponse += chunk
          socket.emit('ai:response:chunk', { messageId, chunk })
        }

        // Emit completion event
        socket.emit('ai:response:complete', { messageId, fullResponse })

        console.log(`AI response completed for ${socket.id}`)
      } catch (error) {
        console.error('AI chat error:', error)
        socket.emit('ai:response:error', {
          error: 'Failed to generate response. Please try again.'
        })
      }
    })

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, { reason })
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  // Periodic cleanup (optional - for monitoring)
  setInterval(() => {
    const socketCount = io.sockets.sockets.size
    console.log(`Active socket connections: ${socketCount}`)
  }, 60000) // Every minute
}

/**
 * Setup and configure Socket.IO server
 */
export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Apply authentication middleware
  io.use(createAuthMiddleware())

  // Setup connection handlers
  setupConnectionHandlers(io)

  return io
}

/**
 * Emit event to a specific session
 */
export function emitToSession(io: SocketIOServer, sessionToken: string, event: string, data: any) {
  io.to(`session:${sessionToken}`).emit(event, data)
}

/**
 * Emit event to a specific user (all their sessions)
 */
export function emitToUser(io: SocketIOServer, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data)
}

/**
 * Broadcast event to all connected clients
 */
export function broadcastEvent(io: SocketIOServer, event: string, data: any) {
  io.emit(event, data)
}

/**
 * Setup Socket.IO with Bun engine
 * Bun natively supports Socket.IO via @socket.io/bun-engine
 */
export function setupBunSocketIO() {
  if (!BunEngine) {
    throw new Error('@socket.io/bun-engine not available')
  }

  const io = new SocketIOServer()

  const engine = new BunEngine({
    path: SOCKET_IO_PATH,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.bind(engine)

  // Apply authentication middleware
  io.use(createAuthMiddleware())

  // Setup connection handlers
  setupConnectionHandlers(io)

  return { engine, ioInstance: io }
}
