import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'
import { createServer } from 'http'
import type { Server as _HTTPServer } from 'http'
import type { Server as SocketIOServer } from 'socket.io'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { messageRoutes } from './routes/messages'
import { appointmentRoutes } from './routes/appointments'
import { courseRoutes } from './routes/courses'
import { dashboardRoutes } from './routes/dashboard'
import { pageRoutes } from './routes/pages'
import { logger } from '@yektayar/shared'
import { settingsRoutes } from './routes/settings'
import { supportRoutes } from './routes/support'
import { aiRoutes } from './routes/ai'
import { assessmentRoutes } from './routes/assessments'
import { healthRoutes } from './routes/health'
import { setupSocketIO, setupBunSocketIO } from './websocket/socketServer'
import { setupNodeWebSocket } from './websocket/nodeWebSocketServer'
import { setupNativeWebSocket } from './websocket/nativeWebSocketServer'
import { swaggerAuth } from './middleware/swaggerAuth'
import { initializeDatabase } from './services/database'
import { getWebSocketPathFromEnv, getVersionFromPackageJson } from '@yektayar/shared'
import packageJson from '../package.json'

// Type declarations for Bun runtime
declare const Bun: any

// Get version from package.json
const APP_VERSION = getVersionFromPackageJson(packageJson)

// Get WebSocket path from environment or use default
const WEBSOCKET_PATH = getWebSocketPathFromEnv()

// Configure CORS based on environment
// When behind a reverse proxy (like Apache), disable application-level CORS
// to avoid duplicate headers
const corsEnabled = process.env.DISABLE_CORS !== 'true'
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8100']

// Create base app
const app = new Elysia()
  .use(cookie())
  // Prettify JSON responses
  .onAfterHandle(({ response }) => {
    // Only prettify JSON object responses
    if (typeof response === 'object' && response !== null && !(response instanceof Response)) {
      return new Response(
        JSON.stringify(response, null, 2),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    return response
  })

// Conditionally add CORS middleware
if (corsEnabled) {
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400 // 24 hours
  }))
}

// Continue with the rest of the middleware
app
  .use(
    swagger({
      path: '/api-docs',
      documentation: {
        info: {
          title: 'YektaYar API',
          version: APP_VERSION,
          description: 'Mental Health Care Platform API'
        },
        tags: [
          { name: 'Health', description: 'Health check and monitoring endpoints' },
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Users', description: 'User management endpoints' },
          { name: 'Messages', description: 'Messaging and chat endpoints' },
          { name: 'Appointments', description: 'Appointment booking endpoints' },
          { name: 'Courses', description: 'Educational content endpoints' },
          { name: 'Dashboard', description: 'Dashboard statistics endpoints' },
          { name: 'Pages', description: 'Content pages endpoints' },
          { name: 'Settings', description: 'Application settings endpoints' },
          { name: 'Support', description: 'Support tickets and messaging endpoints' },
          { name: 'AI', description: 'AI counselor chat endpoints' },
          { name: 'Assessments', description: 'Psychological assessments and surveys endpoints' },
          { name: 'WebSocket', description: 'Real-time communication via Socket.IO' }
        ],
        externalDocs: {
          description: `WebSocket endpoint (Socket.IO and native WebSocket) available at ${WEBSOCKET_PATH}`,
          url: 'https://socket.io/docs/v4/'
        }
      }
    })
  )
  .use(swaggerAuth)
  // Even when CORS is disabled at app level, handle OPTIONS for reverse proxy
  .options('/*', ({ set }) => {
    set.status = 204
    return ''
  })
  .get('/', () => ({
    message: 'YektaYar API Server',
    version: APP_VERSION,
    status: 'running',
    features: {
      rest: true,
      websocket: true,
      sessionAcquisition: true
    }
  }))
  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  .get('/websocket-info', () => ({
    path: WEBSOCKET_PATH,
    description: 'Unified WebSocket endpoint for Socket.IO and native WebSocket with auto-detection',
    documentation: 'https://socket.io/docs/v4/',
    authentication: 'Required - Pass session token in auth.token (Socket.IO) or query/header (native WebSocket)',
    protocols: ['Socket.IO', 'Native WebSocket (RFC 6455)'],
    transports: ['websocket', 'polling'],
    events: {
      client: ['ping', 'status', 'echo', 'info', 'message', 'ai:chat'],
      server: ['connected', 'pong', 'status_response', 'echo_response', 'info_response', 'message_received', 'ai:response:start', 'ai:response:chunk', 'ai:response:complete', 'ai:response:error']
    }
  }), {
    detail: {
      tags: ['WebSocket'],
      summary: 'Get Socket.IO WebSocket connection information',
      description: 'Returns information about the Socket.IO WebSocket endpoint including path, authentication requirements, and available events'
    }
  })
  .use(healthRoutes)
  .use(authRoutes)
  .use(userRoutes)
  .use(messageRoutes)
  .use(appointmentRoutes)
  .use(courseRoutes)
  .use(dashboardRoutes)
  .use(pageRoutes)
  .use(settingsRoutes)
  .use(supportRoutes)
  .use(aiRoutes)
  .use(assessmentRoutes)

// Server configuration
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || 'localhost'

// Initialize database
initializeDatabase().catch(error => {
  logger.error('Failed to initialize database:', error)
  logger.warn('Server will continue running, but database features may not work')
})

// Detect runtime automatically
const isBun = typeof Bun !== 'undefined'
const isNode = !isBun

logger.custom('🚀', `YektaYar API Server running at http://${hostname}:${port}`, 'cyan')
logger.custom('📚', `API Documentation available at http://${hostname}:${port}/swagger`, 'cyan')
logger.custom('⚡', `Runtime: Bun ${Bun.version}`, 'cyan')

let httpServer: any
let io: SocketIOServer | undefined

if (isBun) {
  // Bun runtime: Bun natively supports Socket.IO via @socket.io/bun-engine
  logger.custom('⚡', `Detected runtime: Bun ${Bun.version}`, 'cyan')
  
  // Setup Socket.IO with Bun engine
  const { engine, ioInstance } = setupBunSocketIO(WEBSOCKET_PATH)
  io = ioInstance
  
  const handler = engine.handler()
  const nativeWSHandler = setupNativeWebSocket()
  
  httpServer = Bun.serve({
    port,
    hostname,
    idleTimeout: 30, // Increase timeout for slow database queries (default is 10s)
    fetch: async (req: any, server: any) => {
      const url = new URL(req.url)
      const upgradeHeader = req.headers.get('upgrade')?.toLowerCase()
      const isWebSocketUpgrade = upgradeHeader === 'websocket'
      
      // Handle WebSocket upgrade requests on /ws path
      if (isWebSocketUpgrade && url.pathname.startsWith(WEBSOCKET_PATH)) {
        // Check if this is a Socket.IO request (has EIO parameter)
        if (url.searchParams.has('EIO')) {
          return engine.handleRequest(req, server)
        }
        // Otherwise, handle as native WebSocket
        return nativeWSHandler.upgrade(req, server)
      }
      
      // Handle regular Elysia app requests
      return app.fetch(req)
    },
    websocket: {
      message(ws: any, message: string | Buffer) {
        // Route to appropriate protocol handler
        if (ws.data?.socketId?.startsWith('ws-')) {
          // Native WebSocket
          nativeWSHandler.websocket.message(ws, message)
        } else if (handler.websocket.message) {
          // Socket.IO
          handler.websocket.message(ws, message)
        }
      },
      open(ws: any) {
        if (ws.data?.socketId?.startsWith('ws-')) {
          nativeWSHandler.websocket.open(ws)
        } else if (handler.websocket.open) {
          handler.websocket.open(ws)
        }
      },
      close(ws: any, code: number, reason: string) {
        if (ws.data?.socketId?.startsWith('ws-')) {
          nativeWSHandler.websocket.close(ws, code, reason)
        } else if (handler.websocket.close) {
          handler.websocket.close(ws, code, reason)
        }
      },
      drain(ws: any) {
        if (ws.data?.socketId?.startsWith('ws-')) {
          nativeWSHandler.websocket.drain(ws)
        } else if (handler.websocket.drain) {
          handler.websocket.drain(ws)
        }
      }
    }
  })
  
  logger.custom('🚀', `YektaYar API Server running at http://${hostname}:${port}`, 'cyan')
  
  // Show authentication status based on environment
  const isProduction = Bun.env.NODE_ENV === 'production'
  if (isProduction) {
    logger.info('API Documentation is disabled in production mode')
  } else {
    logger.custom('📚', `API Documentation available at http://${hostname}:${port}/api-docs`, 'cyan')
    logger.custom('🔒', 'Documentation protected with Basic Auth (development mode)', 'cyan')
  }
  
  logger.success(`Socket.IO and Native WebSocket enabled on ${WEBSOCKET_PATH}`)
  logger.custom('📡', 'Both protocols auto-detected and authenticated', 'cyan')

  // check if development mode
  if (Bun.env.NODE_ENV === 'development') {
    logger.custom('🔧', 'Running in development mode', 'yellow')
  }

  // check if production mode
  if (Bun.env.NODE_ENV === 'production') {
    logger.custom('🚀', 'Running in production mode', 'green')
  }
  
} else if (isNode) {
  // Node.js runtime: Use traditional HTTP server with Socket.IO
  logger.custom('⚡', `Detected runtime: Node.js ${process.version}`, 'cyan')
  
  // Create HTTP server that wraps the Elysia app
  httpServer = createServer(async (req, res) => {
    try {
      // Convert Node.js IncomingMessage to Web Request
      const url = `http://${req.headers.host || hostname}${req.url || '/'}`
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          headers.set(key, Array.isArray(value) ? value[0] : value)
        }
      }
      
      // Handle request body for POST/PUT/PATCH
      let body: Buffer | undefined
      if (req.method && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        body = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = []
          req.on('data', (chunk) => chunks.push(chunk))
          req.on('end', () => resolve(Buffer.concat(chunks)))
          req.on('error', reject)
        })
      }
      
      const request = new Request(url, {
        method: req.method,
        headers,
        body: body || null
      })
      
      // Process request through Elysia app
      const response = await app.fetch(request)
      
      // Send response back to client
      res.writeHead(response.status, Object.fromEntries(response.headers))
      const responseBody = await response.text()
      res.end(responseBody)
    } catch (error) {
      logger.error('Request handling error:', error)
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })
  
  // Initialize Socket.IO with the HTTP server on /ws path
  io = setupSocketIO(httpServer, WEBSOCKET_PATH)
  
  // Initialize native WebSocket server on /ws path (auto-detection)
  setupNodeWebSocket(httpServer, WEBSOCKET_PATH)
  
  // Start the server
  httpServer.listen(port, hostname, () => {
    logger.custom('🚀', `YektaYar API Server running at http://${hostname}:${port}`, 'cyan')
    
    // Show authentication status based on environment
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      logger.info('API Documentation is disabled in production mode')
    } else {
      logger.custom('📚', `API Documentation available at http://${hostname}:${port}/api-docs`, 'cyan')
      logger.custom('🔒', 'Documentation protected with Basic Auth (development mode)', 'cyan')
    }
    
    logger.success(`Socket.IO and Native WebSocket enabled on ${WEBSOCKET_PATH}`)
    logger.custom('📡', 'Both protocols auto-detected and authenticated', 'cyan')
  })
}

// Export server and io for potential external use
export default httpServer
export { io }
