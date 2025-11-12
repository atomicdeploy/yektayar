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
import { ApiClientConfig, ApiResponse, ApiError, RequestOptions } from './types'
import { TokenStorage } from './storage'

export class ApiClient {
  private axiosInstance: AxiosInstance
  private tokenStorage: TokenStorage
  private debug: boolean

  constructor(config: ApiClientConfig) {
    this.debug = config.debug || false
    this.tokenStorage = new TokenStorage(config.storageKey)

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
    // Request interceptor - add authorization header
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Skip auth for certain endpoints or if explicitly requested
        const skipAuth = (config as any).skipAuth
        if (skipAuth) {
          return config
        }

        // Get token from storage and add to headers
        const token = await this.tokenStorage.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        if (this.debug) {
          console.log('[ApiClient] Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
          })
        }

        return config
      },
      (error) => {
        if (this.debug) {
          console.error('[ApiClient] Request error:', error)
        }
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.debug) {
          console.log('[ApiClient] Response:', {
            status: response.status,
            data: response.data,
          })
        }
        return response
      },
      (error) => {
        if (this.debug) {
          console.error('[ApiClient] Response error:', error)
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
    const config: AxiosRequestConfig & { skipAuth?: boolean } = {
      params: options?.params,
      headers: options?.headers,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
    }

    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig & { skipAuth?: boolean } = {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
      skipAuth: options?.skipAuth,
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
