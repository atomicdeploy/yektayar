import { Elysia } from 'elysia'
import { createSession, validateSessionToken, invalidateSession, getSessionByToken } from '../services/sessionService'
import { isValidJWTFormat } from '../services/jwtService'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/acquire-session', async ({ headers, request }) => {
    try {
      // Extract metadata from request
      const userAgent = headers['user-agent'] || 'unknown'
      const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
      
      // Check if user agent is present (qualification check)
      if (!headers['user-agent'] || headers['user-agent'] === 'unknown') {
        return {
          success: false,
          error: 'User agent required',
          message: 'A valid user agent is required to create a session'
        }
      }
      
      const metadata = {
        userAgent,
        ip,
        deviceInfo: {
          platform: headers['sec-ch-ua-platform'] || 'unknown',
          mobile: headers['sec-ch-ua-mobile'] === '?1'
        }
      }

      // Extract token from Authorization header (optional)
      const authHeader = headers['authorization']
      let providedToken: string | undefined
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        providedToken = authHeader.substring(7)
        
        // If token is provided, validate its format
        if (providedToken && !isValidJWTFormat(providedToken)) {
          return {
            success: false,
            error: 'Invalid token format',
            message: 'The provided token has an invalid format'
          }
        }
        
        // Check if a session already exists for this token
        const existingSession = await getSessionByToken(providedToken)
        if (existingSession) {
          // Session exists, verify JWT is valid
          const validSession = await validateSessionToken(providedToken)
          if (validSession) {
            return {
              success: true,
              data: {
                token: validSession.token,
                expiresAt: validSession.expiresAt.toISOString()
              }
            }
          }
        }
      }

      // Create a new session
      // If providedToken has valid format but no existing session, reuse it
      // Otherwise generate a new token
      const session = await createSession({
        metadata,
        ipAddress: ip,
        userAgent,
        providedToken
      })
      
      return {
        success: true,
        data: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString()
        }
      }
    } catch (error) {
      console.error('Error acquiring session:', error)
      return {
        success: false,
        error: 'Failed to acquire session',
        message: 'Could not create a new session. Please try again.'
      }
    }
  })
  .get('/session', async ({ headers }) => {
    try {
      // Extract token from Authorization header
      const authHeader = headers['authorization']
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'No token provided',
          message: 'Authorization header missing or invalid'
        }
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      const session = await validateSessionToken(token)

      if (!session) {
        return {
          success: false,
          error: 'Invalid or expired session',
          message: 'Please acquire a new session'
        }
      }

      return {
        success: true,
        data: {
          token: session.token,
          userId: session.userId,
          isLoggedIn: session.isLoggedIn,
          expiresAt: session.expiresAt.toISOString()
        }
      }
    } catch (error) {
      console.error('Error validating session:', error)
      return {
        success: false,
        error: 'Failed to validate session',
        message: 'Could not validate session. Please try again.'
      }
    }
  })
  .post('/register', async ({ body }) => {
    // TODO: Implement user registration
    return {
      success: true,
      message: 'Registration endpoint - to be implemented'
    }
  })
  .post('/login', async ({ body }) => {
    // TODO: Implement user login
    return {
      success: true,
      message: 'Login endpoint - to be implemented'
    }
  })
  .post('/otp/send', async ({ body }) => {
    // TODO: Implement OTP sending
    return {
      success: true,
      message: 'OTP send endpoint - to be implemented'
    }
  })
  .post('/otp/verify', async ({ body }) => {
    // TODO: Implement OTP verification
    return {
      success: true,
      message: 'OTP verify endpoint - to be implemented'
    }
  })
  .post('/logout', async ({ headers }) => {
    try {
      const authHeader = headers['authorization']
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'No token provided'
        }
      }

      const token = authHeader.substring(7)
      await invalidateSession(token)

      return {
        success: true,
        message: 'Logged out successfully'
      }
    } catch (error) {
      console.error('Error during logout:', error)
      return {
        success: false,
        error: 'Failed to logout'
      }
    }
  })
