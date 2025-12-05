/**
 * Unified API Client for YektaYar
 * 
 * This client handles all HTTP communication with the backend API.
 * It supports browser, Node.js, and React Native environments.
 * 
 * Features:
 * - Automatic token management
 * - Request/response interceptors
 * - Proxy support (via axios)
 * - Error handling
 * - TypeScript support
 * - JSON request/response format (enforced)
 * 
 * Note: All requests use JSON format (Content-Type: application/json).
 * All responses are expected to be in JSON format with the ApiResponse wrapper.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiClientConfig, ApiResponse, ApiError, RequestOptions, TokenDeliveryMethod } from './types'
import { logger } from '../utils/logger'
import { TokenStorage } from './storage'
import packageJson from '../../package.json'

export class ApiClient {
  private axiosInstance: AxiosInstance
  private tokenStorage: TokenStorage
  private debug: boolean
  private tokenDeliveryMethod: TokenDeliveryMethod
  private baseURL: string
  private deviceInfoProvider?: () => Record<string, string> | Promise<Record<string, string>>

  constructor(config: ApiClientConfig) {
    this.debug = config.debug || false
    this.tokenStorage = new TokenStorage(config.storageKey)
    this.tokenDeliveryMethod = config.tokenDeliveryMethod || 'header'
    this.baseURL = config.baseURL
    this.deviceInfoProvider = config.deviceInfoProvider

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': `${packageJson.name}/${packageJson.version}`,
        ...config.headers,
      },
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add authorization based on delivery method
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add device info headers if provider is configured
        if (this.deviceInfoProvider) {
          try {
            const deviceHeaders = await this.deviceInfoProvider()
            if (deviceHeaders && typeof deviceHeaders === 'object') {
              Object.assign(config.headers, deviceHeaders)
            }
          } catch (error) {
            if (this.debug) {
              logger.warn('[ApiClient] Failed to get device info:', error)
            }
          }
        }

        // Skip auth for certain endpoints or if explicitly requested
        const skipAuth = (config as any).skipAuth
        if (skipAuth) {
          return config
        }

        // Get token from storage
        const token = await this.tokenStorage.getToken()
        if (token) {
          // Determine which delivery method to use
          const deliveryMethod = (config as any).tokenDeliveryMethod || this.tokenDeliveryMethod

          switch (deliveryMethod) {
            case 'header':
              config.headers.Authorization = `Bearer ${token}`
              break
            
            case 'cookie':
              // Set cookie header - note: in browser, cookies are automatically sent
              // This is for Node.js environments
              if (config.headers.Cookie) {
                config.headers.Cookie += `; token=${token}`
              } else {
                config.headers.Cookie = `token=${token}`
              }
              // For browser environments with credentials
              config.withCredentials = true
              break
            
            case 'query':
              // Add token to query parameters
              if (!config.params) {
                config.params = {}
              }
              config.params.token = token
              break
            
            case 'body':
              // Add token to request body (only for POST/PUT/PATCH)
              if (config.data && typeof config.data === 'object') {
                config.data = { ...config.data, token }
              }
              break
          }
        }

        if (this.debug) {
          logger.debug('[ApiClient] Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            deliveryMethod: (config as any).tokenDeliveryMethod || this.tokenDeliveryMethod,
          })
        }

        return config
      },
      (error) => {
        if (this.debug) {
          logger.error('[ApiClient] Request error:', error)
        }
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.debug) {
          logger.debug('[ApiClient] Response:', {
            status: response.status,
            data: response.data,
          })
        }
        return response
      },
      (error) => {
        if (this.debug) {
          logger.error('[ApiClient] Response error:', error)
        }

        // Handle different error scenarios
        if (error.response) {
          // Server responded with error status
          const apiError = new ApiError(
            error.response.data?.message || error.response.data?.error || error.message,
            error.response.status,
            error.response.data
          )
          return Promise.reject(apiError)
        } else if (error.request) {
          // Request made but no response received
          const apiError = new ApiError(
            'No response from server. Please check your connection.',
            undefined,
            undefined
          )
          return Promise.reject(apiError)
        } else {
          // Error setting up the request
          const apiError = new ApiError(error.message)
          return Promise.reject(apiError)
        }
      }
    )
  }

  /**
   * GET request
   * 
   * Makes a GET request to the specified URL.
   * The URL should be relative to the baseURL (without /api prefix if baseURL includes it).
   * 
   * @param url - Relative URL path (e.g., '/users', '/dashboard/stats') or absolute URL if absolutePath is true
   * @param options - Optional request configuration
   * @returns Promise resolving to ApiResponse<T>
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      params: options?.params,
      headers: options?.headers,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    // When using absolutePath, bypass axios baseURL by setting it to empty string
    if (options?.absolutePath) {
      config.baseURL = ''
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config)
    return response.data
  }

  /**
   * POST request
   * 
   * Makes a POST request to the specified URL with JSON data.
   * The URL should be relative to the baseURL (without /api prefix if baseURL includes it).
   * 
   * @param url - Relative URL path (e.g., '/auth/login', '/users') or absolute URL if absolutePath is true
   * @param data - Request body data (will be sent as JSON)
   * @param options - Optional request configuration
   * @returns Promise resolving to ApiResponse<T>
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    // When using absolutePath, bypass axios baseURL
    if (options?.absolutePath) {
      config.baseURL = ''
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(url, data, config)
    return response.data
  }

  /**
   * PUT request
   * 
   * Makes a PUT request to the specified URL with JSON data.
   * The URL should be relative to the baseURL (without /api prefix if baseURL includes it).
   * 
   * @param url - Relative URL path (e.g., '/users/123') or absolute URL if absolutePath is true
   * @param data - Request body data (will be sent as JSON)
   * @param options - Optional request configuration
   * @returns Promise resolving to ApiResponse<T>
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    // When using absolutePath, bypass axios baseURL
    if (options?.absolutePath) {
      config.baseURL = ''
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   * 
   * Makes a PATCH request to the specified URL with JSON data.
   * The URL should be relative to the baseURL (without /api prefix if baseURL includes it).
   * 
   * @param url - Relative URL path (e.g., '/users/123') or absolute URL if absolutePath is true
   * @param data - Request body data (will be sent as JSON)
   * @param options - Optional request configuration
   * @returns Promise resolving to ApiResponse<T>
   */
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    // When using absolutePath, bypass axios baseURL
    if (options?.absolutePath) {
      config.baseURL = ''
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   * 
   * Makes a DELETE request to the specified URL.
   * The URL should be relative to the baseURL (without /api prefix if baseURL includes it).
   * 
   * @param url - Relative URL path (e.g., '/users/123') or absolute URL if absolutePath is true
   * @param options - Optional request configuration
   * @returns Promise resolving to ApiResponse<T>
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    // When using absolutePath, bypass axios baseURL
    if (options?.absolutePath) {
      config.baseURL = ''
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.delete(url, config)
    return response.data
  }

  /**
   * Set the authentication token
   */
  async setToken(token: string): Promise<void> {
    await this.tokenStorage.setToken(token)
  }

  /**
   * Get the authentication token
   */
  async getToken(): Promise<string | null> {
    return await this.tokenStorage.getToken()
  }

  /**
   * Clear the authentication token
   */
  async clearToken(): Promise<void> {
    await this.tokenStorage.removeToken()
  }

  /**
   * Check if a token exists
   */
  async hasToken(): Promise<boolean> {
    return await this.tokenStorage.hasToken()
  }

  /**
   * Get the current base URL
   */
  getBaseURL(): string {
    return this.baseURL
  }

  /**
   * Get the axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

/**
 * Create an API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}
