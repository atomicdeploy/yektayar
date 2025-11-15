import { Elysia } from 'elysia'

/**
 * Basic Authentication middleware for Swagger documentation
 * Protects API documentation endpoints with username/password authentication
 * Only enabled in development environment - completely disabled in production
 */
export const swaggerAuth = new Elysia()
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
      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: 'API documentation is not available in production'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    // Check if authorization header exists
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      set.status = 401
      set.headers['WWW-Authenticate'] = 'Basic realm="Swagger Documentation"'
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required to access API documentation'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Basic realm="Swagger Documentation"'
          }
        }
      )
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
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid credentials'
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Basic realm="Swagger Documentation"'
            }
          }
        )
      }
    } catch (error) {
      set.status = 401
      set.headers['WWW-Authenticate'] = 'Basic realm="Swagger Documentation"'
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid authorization format'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Basic realm="Swagger Documentation"'
          }
        }
      )
    }
  })
