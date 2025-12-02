import crypto from 'crypto'
import { query } from './database-pg'
import { logger } from '@yektayar/shared'

export interface Session {
  token: string
  userId: string | null
  isLoggedIn: boolean
  metadata: Record<string, any>
  createdAt: Date
  expiresAt: Date
  lastActivityAt: Date
}

export interface SessionCreationResult {
  token: string
  expiresAt: Date
}

/**
 * Generate a cryptographically secure random token for session
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Calculate expiration date for session (30 days from now)
 */
export function calculateExpirationDate(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  return expiresAt
}

/**
 * Create a new anonymous session
 */
export async function createAnonymousSession(metadata: Record<string, any> = {}): Promise<SessionCreationResult> {
  const token = generateSessionToken()
  const expiresAt = calculateExpirationDate()
  const now = new Date()

  try {
    await query(`
      INSERT INTO sessions (token, user_id, is_logged_in, metadata, created_at, expires_at, last_activity_at)
      VALUES ($1, NULL, false, $2, $3, $4, $5)
    `, [token, JSON.stringify(metadata), now, expiresAt, now])
    
    return {
      token,
      expiresAt
    }
  } catch (error) {
    logger.error('Error creating session:', error)
    throw error
  }
}

/**
 * Validate a session token
 */
export async function validateSessionToken(token: string): Promise<Session | null> {
  try {
    const sessions = await query(`
      SELECT token, user_id, is_logged_in, metadata, created_at, expires_at, last_activity_at
      FROM sessions
      WHERE token = $1 AND expires_at > NOW()
    `, [token])
    
    if (sessions.length === 0) {
      return null
    }

    const session = sessions[0]
    
    // Update last activity
    await updateSessionActivity(token)

    return {
      token: session.token,
      userId: session.user_id ? session.user_id.toString() : null,
      isLoggedIn: session.is_logged_in,
      metadata: session.metadata || {},
      createdAt: new Date(session.created_at),
      expiresAt: new Date(session.expires_at),
      lastActivityAt: new Date(session.last_activity_at)
    }
  } catch (error) {
    logger.error('Error validating session:', error)
    return null
  }
}

/**
 * Update session last activity timestamp
 */
export async function updateSessionActivity(token: string): Promise<void> {
  try {
    await query(`
      UPDATE sessions 
      SET last_activity_at = NOW() 
      WHERE token = $1
    `, [token])
  } catch (error) {
    logger.error('Error updating session activity:', error)
  }
}

/**
 * Link a user to an existing session (when user logs in)
 */
export async function linkUserToSession(token: string, userId: string): Promise<void> {
  try {
    await query(`
      UPDATE sessions 
      SET user_id = $1, is_logged_in = true 
      WHERE token = $2
    `, [parseInt(userId), token])
  } catch (error) {
    logger.error('Error linking user to session:', error)
    throw error
  }
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(token: string): Promise<void> {
  try {
    await query(`
      DELETE FROM sessions 
      WHERE token = $1
    `, [token])
  } catch (error) {
    logger.error('Error invalidating session:', error)
    throw error
  }
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await query(`
      DELETE FROM sessions 
      WHERE expires_at < NOW()
      RETURNING id
    `)
    return result.length
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error)
    return 0
  }
}
