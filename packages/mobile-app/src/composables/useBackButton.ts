import { onMounted, onBeforeUnmount } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import BackButton from '../plugins/backButton'
import { Toast } from '@capacitor/toast'
import { logger } from '@yektayar/shared'

/**
 * Hook to handle Android back button press
 * Allows custom handler or default exit behavior
 */
export function useBackButton(handler?: () => boolean | Promise<boolean>) {
  let listenerHandle: any = null

  onMounted(async () => {
    // Only handle back button on native platforms
    if (!Capacitor.isNativePlatform()) {
      logger.info('useBackButton: Not on native platform, skipping')
      return
    }

    try {
      // Listen for back button events
      listenerHandle = await App.addListener('backButton', async (event) => {
        logger.info('🔙 Back button pressed!', event)
        
        // Show toast for debugging
        try {
          await Toast.show({
            text: 'Back button detected!',
            duration: 'short',
            position: 'bottom'
          })
        } catch (toastError) {
          logger.warn('Toast not available:', toastError)
        }

        // If a custom handler is provided, use it
        if (handler) {
          try {
            const shouldExit = await handler()
            logger.info('Handler returned shouldExit:', shouldExit)
            if (shouldExit) {
              // Show exit confirmation toast
              try {
                await Toast.show({
                  text: 'Exiting app...',
                  duration: 'short',
                  position: 'bottom'
                })
              } catch (e) {
                // Ignore toast errors
              }
              // Exit the app
              await BackButton.exitApp()
            }
          } catch (error) {
            logger.error('Error in back button handler:', error)
          }
        } else {
          // Default behavior: exit the app
          logger.info('No handler provided, exiting app')
          try {
            await Toast.show({
              text: 'Exiting app...',
              duration: 'short',
              position: 'bottom'
            })
          } catch (e) {
            // Ignore toast errors
          }
          await BackButton.exitApp()
        }
      })

      logger.info('✅ Back button listener registered successfully')
    } catch (error) {
      logger.error('❌ Failed to register back button listener:', error)
    }
  })

  onBeforeUnmount(() => {
    // Clean up listener
    if (listenerHandle) {
      listenerHandle.remove()
      logger.info('Back button listener removed')
    }
  })
}

/**
 * Helper to check if running on native platform
 */
export function isNativePlatform() {
  return Capacitor.isNativePlatform()
}

/**
 * Helper to exit the app
 */
export async function exitApp() {
  if (Capacitor.isNativePlatform()) {
    try {
      await BackButton.exitApp()
    } catch (error) {
      logger.error('Failed to exit app:', error)
    }
  }
}
