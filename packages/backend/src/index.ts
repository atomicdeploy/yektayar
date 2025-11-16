import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'
import { createServer } from 'http'
import type { Server as HTTPServer } from 'http'
import type { Server as SocketIOServer } from 'socket.io'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { messageRoutes } from './routes/messages'
import { appointmentRoutes } from './routes/appointments'
import { courseRoutes } from './routes/courses'
import { dashboardRoutes } from './routes/dashboard'
import { pageRoutes } from './routes/pages'
import { settingsRoutes } from './routes/settings'
import { supportRoutes } from './routes/support'
import { aiRoutes } from './routes/ai'
import { setupSocketIO, setupBunSocketIO } from './websocket/socketServer'
import { swaggerAuth } from './middleware/swaggerAuth'
import { initializeDatabase } from './services/database'
import { SOCKET_IO_PATH, APP_VERSION } from '@yektayar/shared'

// Configure CORS based on environment
// When behind a reverse proxy (like Apache), disable application-level CORS
// to avoid duplicate headers
const corsEnabled = process.env.DISABLE_CORS !== 'true'
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8100']

// Create base app
const app = new Elysia()
  .use(cookie())

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
          { name: 'WebSocket', description: 'Real-time communication via Socket.IO' }
        ],
        externalDocs: {
          description: `Socket.IO WebSocket endpoint available at ${SOCKET_IO_PATH}`,
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
    path: SOCKET_IO_PATH,
    description: 'Socket.IO WebSocket endpoint for real-time communication',
    documentation: 'https://socket.io/docs/v4/',
    authentication: 'Required - Pass session token in auth.token',
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

// Server configuration
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || 'localhost'

// Initialize database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error)
  console.log('⚠️  Server will continue running, but database features may not work')
})

// Detect runtime automatically
const isBun = typeof Bun !== 'undefined'
const isNode = !isBun

let httpServer: any
let io: SocketIOServer | undefined

if (isBun) {
  // Bun runtime: Bun natively supports Socket.IO via @socket.io/bun-engine
  console.log(`⚡ Detected runtime: Bun ${Bun.version}`)
  
  // Setup Socket.IO with Bun engine
  const { engine, ioInstance } = setupBunSocketIO()
  io = ioInstance
  
  const handler = engine.handler()
  
  httpServer = Bun.serve({
    port,
    hostname,
    fetch: async (req, server) => {
      const url = new URL(req.url)
      // Handle Socket.IO requests
      if (url.pathname.startsWith(SOCKET_IO_PATH)) {
        return engine.handleRequest(req, server)
      }
      // Handle regular Elysia app requests
      return app.fetch(req)
    },
    websocket: handler.websocket
  })
  
  console.log(`🚀 YektaYar API Server running at http://${hostname}:${port}`)
  
  // Show authentication status based on environment
  const isProduction = Bun.env.NODE_ENV === 'production'
  if (isProduction) {
    console.log(`🚫 API Documentation is disabled in production mode`)
  } else {
    console.log(`📚 API Documentation available at http://${hostname}:${port}/api-docs`)
    console.log(`🔒 Documentation protected with Basic Auth (development mode)`)
  }
  
  // TODO: these are also duplicated below, refactor later
  console.log(`✅ Socket.IO enabled`)

  // TODO: complete custom startup logs
  // console.log(`⚠️ WARNING: `)
  // console.log(`💡 Tip: `)

  // check if development mode
  if (Bun.env.NODE_ENV === 'development') {
    console.log(`🔧 Running in development mode`)
  }

  // check if production mode
  if (Bun.env.NODE_ENV === 'production') {
    console.log(`🚀 Running in production mode`)
  }
  
} else if (isNode) {
  // Node.js runtime: Use traditional HTTP server with Socket.IO
  console.log(`⚡ Detected runtime: Node.js ${process.version}`)
  
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
      console.error('Request handling error:', error)
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })
  
  // Initialize Socket.IO with the HTTP server
  io = setupSocketIO(httpServer)
  
  // Start the server
  httpServer.listen(port, hostname, () => {
    console.log(`🚀 YektaYar API Server running at http://${hostname}:${port}`)
    
    // Show authentication status based on environment
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      console.log(`🚫 API Documentation is disabled in production mode`)
    } else {
      console.log(`📚 API Documentation available at http://${hostname}:${port}/api-docs`)
      console.log(`🔒 Documentation protected with Basic Auth (development mode)`)
    }
    
    // TODO: these are duplicate logs from above, refactor later
    console.log(`✅ Socket.IO enabled`)
    // TODO: complete custom startup logs
  })
}

// Export server and io for potential external use
export default httpServer
export { io }
