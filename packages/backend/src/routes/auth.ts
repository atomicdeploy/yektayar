import { Elysia } from 'elysia'
import { createAnonymousSession, validateSessionToken, invalidateSession } from '../services/sessionService'
import { logger } from '@yektayar/shared'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/acquire-session', async ({ headers, request }) => {
    try {
      // Extract metadata from request
      const userAgent = headers['user-agent'] || 'unknown'
      const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
      
      const metadata = {
        userAgent,
        ip,
        deviceInfo: {
          platform: headers['sec-ch-ua-platform'] || 'unknown',
          mobile: headers['sec-ch-ua-mobile'] === '?1'
        }
      }

      const session = await createAnonymousSession(metadata)
      
      return {
        success: true,
        data: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString()
        }
      }
    } catch (error) {
      logger.error('Error acquiring session:', error)
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
      logger.error('Error validating session:', error)
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
      logger.error('Error during logout:', error)
      return {
        success: false,
        error: 'Failed to logout'
      }
    }
  })
