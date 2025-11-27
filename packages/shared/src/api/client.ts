/**
 * Unified API Client for YektaYar
 * 
 * This client handles all HTTP communication with the backend API.
 * It supports browser, Node.js, and React Native environments.
 * Features:
 * - Automatic token management
 * - Request/response interceptors
 * - Proxy support (via axios)
 * - Error handling
 * - TypeScript support
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiClientConfig, ApiResponse, ApiError, RequestOptions, TokenDeliveryMethod } from './types'
import { logger } from '../utils/logger'
import { TokenStorage } from './storage'

export class ApiClient {
  private axiosInstance: AxiosInstance
  private tokenStorage: TokenStorage
  private debug: boolean
  private tokenDeliveryMethod: TokenDeliveryMethod

  constructor(config: ApiClientConfig) {
    this.debug = config.debug || false
    this.tokenStorage = new TokenStorage(config.storageKey)
    this.tokenDeliveryMethod = config.tokenDeliveryMethod || 'header'

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
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
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      params: options?.params,
      headers: options?.headers,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean; tokenDeliveryMethod?: TokenDeliveryMethod } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
      tokenDeliveryMethod: options?.tokenDeliveryMethod,
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
