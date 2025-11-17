import { Elysia } from 'elysia'

/**
 * Basic Authentication middleware for Swagger documentation
 * Protects API documentation endpoints with username/password authentication
 * Only enabled in development environment - completely disabled in production
 */
export const swaggerAuth = new Elysia({ name: 'swagger-auth' })
  .onRequest(({ request, set }) => {
    // Get path from request URL
    const url = new URL(request.url)
    const path = url.pathname

    // Only protect swagger/api-docs routes
    if (!path.startsWith('/api-docs')) {
      return
    }

    // Disable API documentation completely in production environment
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      set.status = 404
      set.headers['Content-Type'] = 'application/json'
      return {
        error: 'Not Found',
        message: 'API documentation is not available in production'
      }
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    // Check if authorization header exists
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      set.status = 401
      set.headers['WWW-Authenticate'] = 'Basic realm="Swagger Documentation"'
      set.headers['Content-Type'] = 'application/json'
      return {
        error: 'Unauthorized',
        message: 'Authentication required to access API documentation'
      }
    }

    try {
      // Decode Basic Auth credentials
      const base64Credentials = authHeader.substring(6)
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
      const [username, password] = credentials.split(':')

      // Get credentials from environment variables
      const expectedUsername = process.env.SWAGGER_USERNAME || 'admin'
      const expectedPassword = process.env.SWAGGER_PASSWORD || ''

      // Verify credentials
      const isValid = username === expectedUsername && password === expectedPassword

      if (!isValid) {
        set.status = 401
        set.headers['WWW-Authenticate'] = 'Basic realm="Swagger Documentation"'
        set.headers['Content-Type'] = 'application/json'
        return {
          error: 'Unauthorized',
          message: 'Invalid credentials'
        }
      }
    } catch (error) {
      set.status = 401
      set.headers['WWW-Authenticate'] = 'Basic realm="Swagger Documentation"'
      set.headers['Content-Type'] = 'application/json'
      return {
        error: 'Unauthorized',
        message: 'Invalid authorization format'
      }
    }
  })
