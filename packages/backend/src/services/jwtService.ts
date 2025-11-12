import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_another_secure_random_string'

export interface SessionTokenPayload {
  sessionId: string
  type: 'session'
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token for a session (simplified implementation)
 * For production, consider using a proper JWT library
 */
export async function generateJWT(sessionId: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionTokenPayload = {
    sessionId,
    type: 'session',
    iat: now,
    exp: now + (30 * 24 * 60 * 60) // 30 days
  }
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null otherwise
 */
export async function verifyJWT(token: string): Promise<SessionTokenPayload | null> {
  try {
    if (!isValidJWTFormat(token)) {
      return null
    }
    
    const parts = token.split('.')
    const encodedHeader = parts[0]
    const encodedPayload = parts[1]
    const signature = parts[2]
    
    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
    if (signature !== expectedSignature) {
      return null
    }
    
    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    
    // Validate payload structure
    if (
      payload &&
      typeof payload === 'object' &&
      'sessionId' in payload &&
      'type' in payload &&
      payload.type === 'session'
    ) {
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null // Token expired
      }
      
      return payload as SessionTokenPayload
    }
    
    return null
  } catch (error) {
    // Token verification failed
    return null
  }
}

/**
 * Base64 URL encode a string
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64 URL decode a string
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf-8')
}

/**
 * Create HMAC signature
 */
function createSignature(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Validate JWT token format (syntax check without verification)
 * Returns true if the token has valid JWT structure
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }
  
  // Each part should be base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/
  
  for (const part of parts) {
    if (!part || !base64UrlRegex.test(part)) {
      return false
    }
  }
  
  return true
}

/**
 * Decode JWT token without verification (unsafe, use for inspection only)
 */
export function decodeJWT(token: string): SessionTokenPayload | null {
  try {
    if (!isValidJWTFormat(token)) {
      return null
    }
    
    const parts = token.split('.')
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )
    
    return payload
  } catch (error) {
    return null
  }
}
