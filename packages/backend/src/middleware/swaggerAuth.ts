import { Elysia } from 'elysia'

/**
 * Basic Authentication middleware for Swagger documentation
 * Protects API documentation endpoints with username/password authentication
 */
export const swaggerAuth = new Elysia()
  .derive(({ headers, path }) => {
    // Only protect swagger/api-docs routes
    if (!path.startsWith('/api-docs')) {
      return {}
    }

    const authHeader = headers['authorization']
    
    // Check if authorization header exists
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return {
        isSwaggerAuthorized: false
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

      return {
        isSwaggerAuthorized: isValid
      }
    } catch (error) {
      return {
        isSwaggerAuthorized: false
      }
    }
  })
  .onBeforeHandle(({ path, isSwaggerAuthorized, set }) => {
    // Only check authorization for swagger/api-docs routes
    if (!path.startsWith('/api-docs')) {
      return
    }

    if (isSwaggerAuthorized === false) {
      set.status = 401
      set.headers['WWW-Authenticate'] = 'Basic realm="Swagger Documentation"'
      return {
        error: 'Unauthorized',
        message: 'Authentication required to access API documentation'
      }
    }
  })
