import { Elysia } from 'elysia'
import { createAnonymousSession, validateSessionToken, invalidateSession } from '../services/sessionService'
import { createOTP, verifyOTP } from '../services/otpService'
import { sendOTPSMS, validatePhoneNumber } from '../services/smsService'

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
    try {
      // Extract phone number from body
      const { phoneNumber } = body as { phoneNumber: string };

      // Validate phone number
      if (!phoneNumber) {
        return {
          success: false,
          error: 'Phone number is required',
          message: 'Please provide a valid phone number'
        };
      }

      if (!validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format',
          message: 'Phone number must be in Iranian format (09xxxxxxxxx)'
        };
      }

      // Create OTP
      const otp = createOTP(phoneNumber);

      // Send SMS
      await sendOTPSMS(phoneNumber, otp);

      return {
        success: true,
        message: 'OTP sent successfully to your phone number',
        data: {
          phoneNumber: phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2),
          expiresIn: 300 // 5 minutes in seconds
        }
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: 'Failed to send OTP',
        message: error.message || 'Could not send OTP. Please try again.'
      };
    }
  })
  .post('/otp/verify', async ({ body }) => {
    try {
      // Extract phone number and OTP from body
      const { phoneNumber, otp } = body as { phoneNumber: string; otp: string };

      // Validate inputs
      if (!phoneNumber || !otp) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Phone number and OTP code are required'
        };
      }

      if (!validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format',
          message: 'Phone number must be in Iranian format (09xxxxxxxxx)'
        };
      }

      // Verify OTP
      const result = verifyOTP(phoneNumber, otp);

      if (!result.success) {
        return {
          success: false,
          error: 'OTP verification failed',
          message: result.message
        };
      }

      return {
        success: true,
        message: result.message,
        data: {
          phoneNumber: phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2),
          verified: true
        }
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP',
        message: error.message || 'Could not verify OTP. Please try again.'
      };
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
