import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { authRoutes } from './routes/auth.js'
import { userRoutes } from './routes/users.js'
import { messageRoutes } from './routes/messages.js'
import { appointmentRoutes } from './routes/appointments.js'
import { courseRoutes } from './routes/courses.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { setupSocketIO } from './websocket/socketServer.js'
import { initializeDatabase, verifyTables } from './db/index.js'

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

// Initialize database and verify connection
async function initializeApp() {
  console.log('🔄 Initializing YektaYar API Server...\n')
  
  try {
    // Step 1: Initialize database connection
    await initializeDatabase()
    
    // Step 2: Verify database tables
    const verificationResult = await verifyTables()
    
    if (verificationResult.success) {
      console.log(`${verificationResult.message}`)
    } else {
      console.warn(`⚠️  ${verificationResult.message}`)
      console.warn('⚠️  Some features may not work correctly until all required tables are created.')
    }
    
    // Display table summary
    if (verificationResult.existingTables.length > 0) {
      console.log(`📊 Found ${verificationResult.existingTables.length} existing tables`)
    }
    if (verificationResult.missingRequiredTables.length > 0) {
      console.log(`⚠️  Missing ${verificationResult.missingRequiredTables.length} required tables:`, 
        verificationResult.missingRequiredTables.join(', '))
    }
    
    console.log('') // Empty line for readability
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    console.error('⚠️  Server will start but database features will be unavailable.')
    console.error('   Please check your database configuration in .env file\n')
  }
}

// For Bun, we need to create an HTTP server manually to add Socket.IO
// Bun's fetch handler is used for the Elysia app
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || 'localhost'

// Initialize database before starting server
await initializeApp()

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

export default httpServer
