import { ref, onMounted, onUnmounted } from 'vue'
import { logger } from '@yektayar/shared'

/**
 * Composable for monitoring network connectivity status
 * Provides reactive online/offline state
 */
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const wasOffline = ref(false)

  const updateOnlineStatus = () => {
    const previousStatus = isOnline.value
    isOnline.value = navigator.onLine
    
    if (previousStatus !== isOnline.value) {
      if (isOnline.value) {
        logger.success('Network connection restored')
        wasOffline.value = true
        // Reset wasOffline flag after a short delay
        setTimeout(() => {
          wasOffline.value = false
        }, 3000)
      } else {
        logger.warn('Network connection lost - working offline')
      }
    }
  }

  const handleOnline = () => {
    updateOnlineStatus()
  }

  const handleOffline = () => {
    updateOnlineStatus()
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial status
    updateOnlineStatus()
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    wasOffline
  }
}
