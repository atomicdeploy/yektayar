import { Server as SocketIOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import { validateSessionToken } from '../services/sessionService'
import { logger } from '@yektayar/shared'

export interface AuthenticatedSocket {
  sessionToken: string
  userId: string | null
  isLoggedIn: boolean
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

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
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
      logger.error('Socket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  // Handle connections
  io.on('connection', (socket) => {
    const socketData = socket as any
    logger.info(`Socket connected: ${socket.id}`, {
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

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}`, { reason })
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error)
    })
  })

  // Periodic cleanup (optional - for monitoring)
  setInterval(() => {
    const socketCount = io.sockets.sockets.size
    logger.debug(`Active socket connections: ${socketCount}`)
  }, 60000) // Every minute

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
