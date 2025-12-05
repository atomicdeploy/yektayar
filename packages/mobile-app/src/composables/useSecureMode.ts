import { onMounted, onUnmounted } from 'vue'
import { enableSecureMode, disableSecureMode } from '@/plugins/secureMode'

/**
 * Composable to automatically enable/disable secure mode for a component
 * 
 * Usage in Vue component:
 * ```typescript
 * import { useSecureMode } from '@/composables/useSecureMode'
 * 
 * export default {
 *   setup() {
 *     useSecureMode() // Automatically enables on mount, disables on unmount
 *   }
 * }
 * ```
 */
export function useSecureMode() {
  onMounted(async () => {
    await enableSecureMode()
  })

  onUnmounted(async () => {
    await disableSecureMode()
  })
}
