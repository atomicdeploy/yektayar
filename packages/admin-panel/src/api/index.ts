/**
 * API Client instance for Admin Panel
 * 
 * Note: The baseURL is configured via API_BASE_URL environment variable
 * which includes the '/api' prefix. Do NOT prepend '/api' to your endpoints.
 * 
 * ✅ Correct: apiClient.get('/assessments')
 * ❌ Wrong:   apiClient.get('/api/assessments')
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
