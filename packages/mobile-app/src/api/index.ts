/**
 * API Client instance for Mobile App
 * 
 * Note: The baseURL already includes '/api', so when making requests,
 * do NOT prepend '/api' to your endpoints.
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
  baseURL: `${config.apiBaseUrl}/api`,
  storageKey: 'yektayar_session_token',
  timeout: 30000,
  debug: config.environment === 'development',
})

export default apiClient
