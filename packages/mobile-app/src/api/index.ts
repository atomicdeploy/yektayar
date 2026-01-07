/**
 * API Client instance for Mobile App
 * 
 * Note: The baseURL is configured via API_BASE_URL environment variable
 * which includes the '/api' prefix. Do NOT prepend '/api' to your endpoints.
 * 
 * ✅ Correct: apiClient.get('/assessments')
 * ❌ Wrong:   apiClient.get('/api/assessments')
 */

import { createApiClient } from '@yektayar/shared'
import { formatDeviceInfoForHeaders } from '@yektayar/shared'
import config from '@/config'
import { getCapacitorDeviceInfo } from '@/utils/deviceInfo'

// Cache device info to avoid repeated collection
let cachedDeviceInfo: Record<string, string> | null = null

/**
 * Device info provider for API client
 * Collects device information once and caches it
 */
async function getDeviceInfoHeaders(): Promise<Record<string, string>> {
  if (cachedDeviceInfo) {
    return cachedDeviceInfo
  }
  
  try {
    const deviceInfo = await getCapacitorDeviceInfo()
    cachedDeviceInfo = formatDeviceInfoForHeaders(deviceInfo)
    return cachedDeviceInfo
  } catch (error) {
    // Return empty object on error, don't block API requests
    return {}
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient({
  baseURL: config.apiBaseUrl,
  storageKey: 'yektayar_session_token',
  timeout: 30000,
  debug: config.environment === 'development',
  deviceInfoProvider: getDeviceInfoHeaders,
})

export default apiClient
