/**
 * Shared constants for YektaYar platform
 */

/**
 * Default WebSocket path configuration
 * Used for both Socket.IO and native WebSocket connections
 * Both protocols are served on this path with auto-detection
 */
const DEFAULT_WEBSOCKET_PATH = '/ws'

/**
 * WebSocket path configuration
 * Can be overridden via WEBSOCKET_PATH environment variable (server-side only)
 * Falls back to default if not set or in browser environment
 */
export const WEBSOCKET_PATH = DEFAULT_WEBSOCKET_PATH

/**
 * Get the WebSocket path from environment or use default
 * This function checks for environment variable on server-side
 * @returns WebSocket path
 */
export function getWebSocketPathFromEnv(): string {
  // Check if we're in a Node/Bun environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env.WEBSOCKET_PATH || DEFAULT_WEBSOCKET_PATH
  }
  return DEFAULT_WEBSOCKET_PATH
}

/**
 * Get the WebSocket path with optional token parameter
 * @param token - Session token (optional)
 * @param useBearer - If true, don't append token as query param (use Authorization header instead)
 * @param customPath - Custom WebSocket path (optional, defaults to WEBSOCKET_PATH)
 * @returns WebSocket path with or without token query parameter
 */
export function getWebSocketPath(token?: string, useBearer: boolean = false, customPath?: string): string {
  const path = customPath || getWebSocketPathFromEnv()
  if (!token || useBearer) {
    return path
  }
  return `${path}?token=${encodeURIComponent(token)}`
}
