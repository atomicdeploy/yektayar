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
import { setupSocketIO } from './websocket/socketServer'
import { swaggerAuth } from './middleware/swaggerAuth'

// Configure CORS based on environment
// When behind a reverse proxy (like Apache), disable application-level CORS
// to avoid duplicate headers
const corsEnabled = process.env.DISABLE_CORS !== 'true'
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8100']

const app = new Elysia()
  .use(cookie())
  .use(corsEnabled ? cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400 // 24 hours
  }) : (app) => app)
  // Even when CORS is disabled at app level, we need to handle OPTIONS for reverse proxy
  .options('/*', ({ set }) => {
    set.status = 204
    return ''
  })
  .use(swaggerAuth)
  .use(
    swagger({
      path: '/api-docs',
      documentation: {
        info: {
          title: 'YektaYar API',
          version: '0.1.0',
          description: 'Mental Health Care Platform API'
        },
        tags: [
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Users', description: 'User management endpoints' },
          { name: 'Messages', description: 'Messaging and chat endpoints' },
          { name: 'Appointments', description: 'Appointment booking endpoints' },
          { name: 'Courses', description: 'Educational content endpoints' },
          { name: 'Dashboard', description: 'Dashboard statistics endpoints' }
        ]
      }
    })
  )
  .get('/', () => ({
    message: 'YektaYar API Server',
    version: '0.1.0',
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
  .use(authRoutes)
  .use(userRoutes)
  .use(messageRoutes)
  .use(appointmentRoutes)
  .use(courseRoutes)
  .use(dashboardRoutes)

// Server configuration
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || 'localhost'

// Detect runtime automatically
const isBun = typeof Bun !== 'undefined'
const isNode = !isBun

let httpServer: any
let io: SocketIOServer | undefined

if (isBun) {
  // Bun runtime: Use Bun.serve with fetch handler
  console.log(`⚡ Detected runtime: Bun ${Bun.version}`)
  
  httpServer = Bun.serve({
    port,
    hostname,
    fetch: app.fetch,
    websocket: {
      message() {}, // Placeholder for potential future Bun WebSocket usage
      open() {},
      close() {}
    }
  })
  
  console.log(`🚀 YektaYar API Server running at http://${hostname}:${port}`)
  console.log(`📚 API Documentation available at http://${hostname}:${port}/api-docs`)
  console.log(`🔒 Documentation protected with Basic Auth`)
  console.log(`⚠️  Socket.IO not available with Bun runtime`)
  console.log(`💡 Tip: Use Node.js runtime for full Socket.IO support`)
  
} else if (isNode) {
  // Node.js runtime: Create HTTP server and initialize Socket.IO
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
    console.log(`📚 API Documentation available at http://${hostname}:${port}/api-docs`)
    console.log(`🔒 Documentation protected with Basic Auth`)
    console.log(`✅ Socket.IO enabled on same port (${port})`)
  })
}

// Export server and io for potential external use
export default httpServer
export { io }
