/**
 * API Types and Interfaces
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * API Client configuration options
 */
export interface ApiClientConfig {
  /**
   * Base URL for API requests
   */
  baseURL: string

  /**
   * Storage key for session token
   * Defaults to 'yektayar_session_token'
   */
  storageKey?: string

  /**
   * Timeout in milliseconds
   * Defaults to 30000 (30 seconds)
   */
  timeout?: number

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>

  /**
   * Enable debug logging
   */
  debug?: boolean
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  /**
   * Request headers
   */
  headers?: Record<string, string>

  /**
   * Query parameters
   */
  params?: Record<string, any>

  /**
   * Request timeout in milliseconds
   */
  timeout?: number

  /**
   * Skip automatic Authorization header
   */
  skipAuth?: boolean
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
