/**
 * API Client instance for Mobile App
 */

import { createApiClient } from '@yektayar/shared'
import config from '@/config'

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient({
  baseURL: config.apiBaseUrl,
  storageKey: 'yektayar_session_token',
  timeout: 30000,
  debug: config.environment === 'development',
})

export default apiClient
