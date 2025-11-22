import { onMounted } from 'vue'
import { useErrorStore } from '@/stores/error'

/**
 * Validates that the current browser URL matches the expected base URL from config
 * Shows error toast if mismatch detected
 */
export function useUrlValidation() {
  const errorStore = useErrorStore()
  
  onMounted(() => {
    const expected = import.meta.env.EXPECTED_BASE_URL as string
    
    // Only validate if base URL is configured (for reverse proxy deployments)
    if (expected) {
      try {
        const expectedURL = new URL(expected)
        const actualURL = new URL(window.location.href)
        
        // Compare protocol, hostname, and port (ignoring path)
        const protocolMatch = expectedURL.protocol === actualURL.protocol
        const hostMatch = expectedURL.hostname === actualURL.hostname
        
        // Port comparison: handle default ports (80 for HTTP, 443 for HTTPS)
        const expectedPort = expectedURL.port || (expectedURL.protocol === 'https:' ? '443' : '80')
        const actualPort = actualURL.port || (actualURL.protocol === 'https:' ? '443' : '80')
        const portMatch = expectedPort === actualPort
        
        if (!protocolMatch || !hostMatch || !portMatch) {
          // Show error toast
          errorStore.addError(
            'Configuration Mismatch / پیکربندی نادرست',
            `Expected: ${expectedURL.origin} | Actual: ${actualURL.origin}`,
            'Update .env file or access from correct URL / فایل .env را بروزرسانی کنید'
          )
          
          // Log to console for debugging
          console.error('URL Configuration Mismatch:', {
            expected: expectedURL.origin,
            actual: actualURL.origin,
            protocolMatch,
            hostMatch,
            portMatch
          })
        }
      } catch (error) {
        console.error('URL validation error:', error)
      }
    }
  })
}
