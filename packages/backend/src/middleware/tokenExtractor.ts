/**
 * Token Extractor Middleware
 * 
 * Extracts authentication tokens from multiple sources with priority:
 * 1. GET/POST parameters (highest priority)
 * 2. Authorization header
 * 3. Cookie (lowest priority)
 */

interface Cookie<T> {
  value: T
}

interface TokenExtractionContext {
  headers: Record<string, string | undefined>
  query?: Record<string, string | string[] | undefined>
  body?: any
  cookie?: Record<string, Cookie<any> | undefined>
}

/**
 * Extract token from various sources with priority ordering
 * Priority (highest to lowest):
 * 1. GET/POST parameter 'token'
 * 2. Authorization header (Bearer token)
 * 3. Cookie 'token'
 * 
 * @param context - Request context with headers, query, body, and cookies
 * @returns The extracted token or null if none found
 */
export function extractToken(context: TokenExtractionContext): string | null {
  // Priority 3 (lowest): Check cookie
  let token: string | null = null
  if (context.cookie?.token) {
    const cookieValue = context.cookie.token.value
    token = typeof cookieValue === 'string' ? cookieValue : null
  }

  // Priority 2 (medium): Check Authorization header
  const authHeader = context.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7) // Remove 'Bearer ' prefix
  }

  // Priority 1 (highest): Check GET query parameter
  if (context.query?.token) {
    const queryToken = context.query.token
    token = Array.isArray(queryToken) ? queryToken[0] : queryToken
  }

  // Priority 1 (highest): Check POST body parameter
  if (context.body && typeof context.body === 'object' && context.body.token) {
    token = context.body.token
  }

  return token
}
