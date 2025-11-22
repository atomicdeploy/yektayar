/**
 * Shared constants for YektaYar platform
 */

/**
 * WebSocket path configuration
 * Used for both Socket.IO and native WebSocket connections
 * Both protocols are served on this path with auto-detection
 */
export const WEBSOCKET_PATH = '/ws'

/**
 * Socket.IO path configuration (legacy, for backward compatibility)
 * New implementations should use WEBSOCKET_PATH
 */
export const SOCKET_IO_PATH = '/socket.io/'
