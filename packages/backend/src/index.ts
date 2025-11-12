import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { messageRoutes } from './routes/messages'
import { appointmentRoutes } from './routes/appointments'
import { courseRoutes } from './routes/courses'
import { dashboardRoutes } from './routes/dashboard'
import { setupSocketIO } from './websocket/socketServer'
import { testConnection } from './db/connection'
import { initializeDatabase } from './db/migrate'

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
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

// Initialize database before starting server
async function startServer() {
  // Test database connection
  const isConnected = await testConnection()
  
  if (isConnected) {
    try {
      // Run migrations and seed database
      await initializeDatabase()
    } catch (error) {
      console.error('⚠️  Database initialization failed, but continuing...', error)
    }
  } else {
    console.warn('⚠️  Database not available, API will be limited')
  }

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
  console.log(`📚 API Documentation available at http://${hostname}:${port}/swagger`)
  console.log(`⚡ Runtime: Bun ${Bun.version}`)

  // Socket.IO setup (for Node.js compatibility)
  // When running with Node.js instead of Bun, uncomment the following:
  // const httpServer = createServer((req, res) => app.fetch(req).then(response => {
  //   res.writeHead(response.status, Object.fromEntries(response.headers))
  //   res.end(await response.text())
  // }))
  // const io = setupSocketIO(httpServer)
  // httpServer.listen(port, hostname)

  return httpServer
}

// Start the server
const httpServer = await startServer()

export default httpServer
