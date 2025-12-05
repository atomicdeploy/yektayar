import { registerPlugin } from '@capacitor/core'
import { Capacitor } from '@capacitor/core'

export interface SecureModePlugin {
  /**
   * Enable secure mode - prevents screenshots and screen recording
   */
  enable(): Promise<void>

  /**
   * Disable secure mode - allows screenshots again
   */
  disable(): Promise<void>

  /**
   * Check if secure mode is currently enabled
   */
  isEnabled(): Promise<{ enabled: boolean }>
}

const SecureMode = registerPlugin<SecureModePlugin>('SecureMode', {
  web: () => ({
    enable: async () => {
      console.log('🔒 Secure mode enabled (web - no effect)')
    },
    disable: async () => {
      console.log('🔓 Secure mode disabled (web - no effect)')
    },
    isEnabled: async () => ({ enabled: false }),
  }),
})

/**
 * Enable secure mode to prevent screenshots
 * Only works on native platforms (Android/iOS)
 */
export async function enableSecureMode(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await SecureMode.enable()
      console.log('🔒 Secure mode enabled - screenshots blocked')
    } catch (error) {
      console.error('❌ Failed to enable secure mode:', error)
    }
  } else {
    console.log('ℹ️ Secure mode not available on web platform')
  }
}

/**
 * Disable secure mode to allow screenshots
 */
export async function disableSecureMode(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await SecureMode.disable()
      console.log('🔓 Secure mode disabled - screenshots allowed')
    } catch (error) {
      console.error('❌ Failed to disable secure mode:', error)
    }
  }
}

/**
 * Check if secure mode is currently enabled
 */
export async function isSecureModeEnabled(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await SecureMode.isEnabled()
      return result.enabled
    } catch (error) {
      console.error('❌ Failed to check secure mode status:', error)
      return false
    }
  }
  return false
}

export default SecureMode
