import crypto from 'crypto'
import { getDb } from '../db/connection'
import { generateJWT, verifyJWT, isValidJWTFormat } from './jwtService'

export interface Session {
  id: string
  token: string
  userId: string | null
  isLoggedIn: boolean
  metadata: Record<string, any>
  createdAt: Date
  expiresAt: Date
  lastActivityAt: Date
  ipAddress: string | null
  userAgent: string | null
}

export interface SessionCreationResult {
  token: string
  expiresAt: Date
}

export interface SessionCreationOptions {
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  providedToken?: string
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
 * Create a new session
 * If providedToken is given and has valid JWT format, it will be used
 * Otherwise, a new JWT token will be generated
 */
export async function createSession(options: SessionCreationOptions = {}): Promise<SessionCreationResult> {
  const { metadata = {}, ipAddress = null, userAgent = null, providedToken } = options
  const expiresAt = calculateExpirationDate()
  const now = new Date()
  const db = getDb()

  // Generate a unique session ID
  const sessionId = crypto.randomUUID()
  
  // Use provided token if it has valid JWT format, otherwise generate new one
  let token: string
  if (providedToken && isValidJWTFormat(providedToken)) {
    token = providedToken
  } else {
    token = await generateJWT(sessionId)
  }

  // Store in database
  await db`
    INSERT INTO sessions (id, token, user_id, is_logged_in, metadata, created_at, expires_at, last_activity_at, ip_address, user_agent)
    VALUES (${sessionId}, ${token}, NULL, false, ${JSON.stringify(metadata)}, ${now}, ${expiresAt}, ${now}, ${ipAddress}, ${userAgent})
  `
  
  return {
    token,
    expiresAt
  }
}

/**
 * Create a new anonymous session (backward compatibility)
 */
export async function createAnonymousSession(metadata: Record<string, any> = {}): Promise<SessionCreationResult> {
  return createSession({ metadata })
}

/**
 * Validate a session token
 * Returns the session if valid and not expired, null otherwise
 */
export async function validateSessionToken(token: string): Promise<Session | null> {
  if (!token || token.trim() === '') {
    return null
  }

  // First, validate JWT format
  if (!isValidJWTFormat(token)) {
    return null
  }

  // Verify JWT signature and expiration
  const payload = await verifyJWT(token)
  if (!payload) {
    return null
  }

  // Get session from database
  const db = getDb()
  const now = new Date()
  
  const sessions = await db`
    SELECT id, token, user_id, is_logged_in, metadata, created_at, expires_at, last_activity_at, ip_address, user_agent
    FROM sessions
    WHERE token = ${token} AND expires_at > ${now}
    LIMIT 1
  `

  if (sessions.length === 0) {
    return null
  }

  const session = sessions[0]
  return {
    id: session.id,
    token: session.token,
    userId: session.userId,
    isLoggedIn: session.isLoggedIn,
    metadata: session.metadata,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent
  }
}

/**
 * Get session by token without JWT verification (for internal use)
 */
export async function getSessionByToken(token: string): Promise<Session | null> {
  const db = getDb()
  const now = new Date()
  
  const sessions = await db`
    SELECT id, token, user_id, is_logged_in, metadata, created_at, expires_at, last_activity_at, ip_address, user_agent
    FROM sessions
    WHERE token = ${token} AND expires_at > ${now}
    LIMIT 1
  `

  if (sessions.length === 0) {
    return null
  }

  const session = sessions[0]
  return {
    id: session.id,
    token: session.token,
    userId: session.userId,
    isLoggedIn: session.isLoggedIn,
    metadata: session.metadata,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent
  }
}

/**
 * Update session last activity timestamp
 */
export async function updateSessionActivity(token: string): Promise<void> {
  const db = getDb()
  const now = new Date()
  
  await db`
    UPDATE sessions
    SET last_activity_at = ${now}
    WHERE token = ${token}
  `
}

/**
 * Link a user to an existing session (when user logs in)
 */
export async function linkUserToSession(token: string, userId: string): Promise<void> {
  const db = getDb()
  
  await db`
    UPDATE sessions
    SET user_id = ${userId}, is_logged_in = true
    WHERE token = ${token}
  `
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(token: string): Promise<void> {
  const db = getDb()
  
  await db`
    DELETE FROM sessions
    WHERE token = ${token}
  `
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const db = getDb()
  const now = new Date()
  
  const result = await db`
    DELETE FROM sessions
    WHERE expires_at < ${now}
    RETURNING id
  `
  
  return result.length
}
