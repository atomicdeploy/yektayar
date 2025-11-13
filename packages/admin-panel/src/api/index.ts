/**
 * API Client instance for Admin Panel
 */

import { createApiClient } from '@yektayar/shared'
import config from '@/config'

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient({
  baseURL: config.apiBaseUrl,
  storageKey: 'yektayar_admin_session_token',
  timeout: 30000,
  debug: config.environment === 'development',
})

export default apiClient
