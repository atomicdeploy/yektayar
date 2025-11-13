import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { messageRoutes } from './routes/messages'
import { appointmentRoutes } from './routes/appointments'
import { courseRoutes } from './routes/courses'
import { dashboardRoutes } from './routes/dashboard'
import { aiRoutes } from './routes/ai'
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
          { name: 'Dashboard', description: 'Dashboard statistics endpoints' },
          { name: 'AI', description: 'AI counselor chat endpoints' }
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
  .use(aiRoutes)

// For Bun, we need to create an HTTP server manually to add Socket.IO
// Bun's fetch handler is used for the Elysia app
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || 'localhost'

// Create HTTP server using Node's http module (works with Bun)
const httpServer = Bun.serve({
  port,
  hostname,
  fetch: app.fetch,
  // Enable websocket support
  websocket: {
    message() {}, // Handled by Socket.IO
    open() {},
    close() {}
  }
})

// Note: Socket.IO with Bun requires special handling
// For now, we'll note that Socket.IO should be initialized when running on Node.js
// In production, consider using Bun's native WebSocket or run Socket.IO on a separate Node.js process

console.log(`🚀 YektaYar API Server running at http://${hostname}:${port}`)
console.log(`📚 API Documentation available at http://${hostname}:${port}/api-docs`)
console.log(`🔒 Documentation protected with Basic Auth`)
console.log(`⚡ Runtime: Bun ${Bun.version}`)

// Socket.IO setup (for Node.js compatibility)
// When running with Node.js instead of Bun, uncomment the following:
// const httpServer = createServer((req, res) => app.fetch(req).then(response => {
//   res.writeHead(response.status, Object.fromEntries(response.headers))
//   res.end(await response.text())
// }))
// const io = setupSocketIO(httpServer)
// httpServer.listen(port, hostname)

export default httpServer
