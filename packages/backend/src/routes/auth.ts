import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'
import bcrypt from 'bcrypt'
import { createAnonymousSession, validateSessionToken, invalidateSession, linkUserToSession } from '../services/sessionService'
import { extractToken } from '../middleware/tokenExtractor'
import { logger, getBestLanguageMatch, normalizeTimezone } from '@yektayar/shared'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/acquire-session', async ({ headers, request: _request }) => {
    try {
      // Extract metadata from request
      const userAgent = headers['user-agent'] || 'unknown'
      const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
      
      // Detect language from Accept-Language header
      const acceptLanguage = headers['accept-language'] || ''
      const detectedLanguage = acceptLanguage ? getBestLanguageMatch(acceptLanguage) : 'fa'
      
      // Client can send timezone in a custom header - validate it
      const clientTimezone = headers['x-timezone'] || 'UTC'
      const validatedTimezone = normalizeTimezone(clientTimezone)
      
      const metadata = {
        userAgent,
        ip,
        language: detectedLanguage,
        timezone: validatedTimezone,
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
          expiresAt: session.expiresAt.toISOString(),
          language: detectedLanguage,
          timezone: validatedTimezone
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
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Acquire anonymous session',
      description: 'Get a new anonymous session token for API access'
    }
  })
  .get('/session', async ({ headers, query, cookie }) => {
    try {
      // Extract token from multiple sources (cookie, header, query param)
      const token = extractToken({ headers, query, cookie })
      
      if (!token) {
        return {
          success: false,
          error: 'No token provided',
          message: 'Token must be provided via Authorization header, cookie, or query parameter'
        }
      }

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
          expiresAt: session.expiresAt.toISOString(),
          language: session.metadata?.language || 'fa',
          timezone: session.metadata?.timezone || 'UTC'
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
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Validate session',
      description: 'Check if the current session is valid'
    }
  })
  .post('/register', async ({ body }) => {
    try {
      const db = getDatabase()
      const { email, phone, name, password, type = 'patient' } = body as any

      // Validate required fields
      if (!name || (!email && !phone)) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Name and either email or phone is required'
        }
      }

      // Check if user already exists
      let existingUser
      if (email) {
        existingUser = await db`SELECT id FROM users WHERE email = ${email}`
      } else if (phone) {
        existingUser = await db`SELECT id FROM users WHERE phone = ${phone}`
      }

      if (existingUser && existingUser.length > 0) {
        return {
          success: false,
          error: 'User already exists',
          message: 'A user with this email or phone already exists'
        }
      }

      // Hash password if provided
      let passwordHash = null
      if (password) {
        passwordHash = await bcrypt.hash(password, 10)
      }

      // Create user
      const result = await db`
        INSERT INTO users (email, phone, name, password_hash, type)
        VALUES (${email || null}, ${phone || null}, ${name}, ${passwordHash}, ${type})
        RETURNING id, email, phone, name, type, created_at
      `

      return {
        success: true,
        data: result[0],
        message: 'User registered successfully'
      }
    } catch (error) {
      logger.error('Error during registration:', error)
      return {
        success: false,
        error: 'Registration failed',
        message: 'Could not register user. Please try again.'
      }
    }
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Register new user',
      description: 'Create a new user account'
    }
  })
  .post('/login', async ({ body, headers }) => {
    try {
      const db = getDatabase()
      const { identifier, password } = body as any

      if (!identifier || !password) {
        return {
          success: false,
          error: 'Missing credentials',
          message: 'Email/phone and password are required'
        }
      }

      // Find user by email or phone
      const users = await db`
        SELECT id, email, phone, name, type, password_hash, is_active
        FROM users
        WHERE (email = ${identifier} OR phone = ${identifier})
      `

      if (users.length === 0) {
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'No user found with this email or phone'
        }
      }

      const user = users[0]

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          error: 'Account disabled',
          message: 'This account has been disabled'
        }
      }

      // Verify password
      if (!user.password_hash) {
        return {
          success: false,
          error: 'Password not set',
          message: 'Please use OTP login or reset your password'
        }
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Incorrect password'
        }
      }

      // Create session for logged-in user
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
      await linkUserToSession(session.token, user.id.toString())

      return {
        success: true,
        data: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString(),
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            type: user.type
          }
        },
        message: 'Login successful'
      }
    } catch (error) {
      logger.error('Error during login:', error)
      return {
        success: false,
        error: 'Login failed',
        message: 'Could not log in. Please try again.'
      }
    }
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'User login',
      description: 'Authenticate user with email/phone and password'
    }
  })
  .post('/otp/send', async ({ body }) => {
    try {
      const db = getDatabase()
      const { identifier } = body as any // email or phone

      if (!identifier) {
        return {
          success: false,
          error: 'Missing identifier',
          message: 'Email or phone is required'
        }
      }

      // Check if user exists
      const users = await db`
        SELECT id, email, phone, name
        FROM users
        WHERE (email = ${identifier} OR phone = ${identifier})
      `

      if (users.length === 0) {
        return {
          success: false,
          error: 'User not found',
          message: 'No user found with this email or phone'
        }
      }

      // In production, generate and send OTP via SMS/email
      // For now, just return success
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      logger.info(`📱 Mock OTP for ${identifier}: ${mockOtp}`)

      return {
        success: true,
        message: 'OTP sent successfully',
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp: mockOtp })
      }
    } catch (error) {
      logger.error('Error sending OTP:', error)
      return {
        success: false,
        error: 'Failed to send OTP',
        message: 'Could not send OTP. Please try again.'
      }
    }
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Send OTP',
      description: 'Send one-time password to user email or phone'
    }
  })
  .post('/otp/verify', async ({ body, headers }) => {
    try {
      const db = getDatabase()
      const { identifier, otp } = body as any

      if (!identifier || !otp) {
        return {
          success: false,
          error: 'Missing data',
          message: 'Email/phone and OTP are required'
        }
      }

      // In production, verify OTP from database/cache
      // For now, accept any 6-digit OTP for testing
      if (otp.length !== 6) {
        return {
          success: false,
          error: 'Invalid OTP',
          message: 'OTP must be 6 digits'
        }
      }

      // Find user
      const users = await db`
        SELECT id, email, phone, name, type, is_active
        FROM users
        WHERE (email = ${identifier} OR phone = ${identifier})
      `

      if (users.length === 0) {
        return {
          success: false,
          error: 'User not found',
          message: 'No user found with this email or phone'
        }
      }

      const user = users[0]

      if (!user.is_active) {
        return {
          success: false,
          error: 'Account disabled',
          message: 'This account has been disabled'
        }
      }

      // Create session for logged-in user
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
      await linkUserToSession(session.token, user.id.toString())

      return {
        success: true,
        data: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString(),
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            type: user.type
          }
        },
        message: 'OTP verified successfully'
      }
    } catch (error) {
      logger.error('Error verifying OTP:', error)
      return {
        success: false,
        error: 'OTP verification failed',
        message: 'Could not verify OTP. Please try again.'
      }
    }
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Verify OTP',
      description: 'Verify one-time password and create session'
    }
  })
  .post('/logout', async ({ headers, body, cookie }) => {
    try {
      // Extract token from multiple sources (cookie, header, body param)
      const token = extractToken({ headers, body, cookie })
      
      if (!token) {
        return {
          success: false,
          error: 'No token provided'
        }
      }

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
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Logout',
      description: 'Invalidate current session'
    }
  })
