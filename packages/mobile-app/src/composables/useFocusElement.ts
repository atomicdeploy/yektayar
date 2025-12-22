import { nextTick } from 'vue'
import { logger } from '@yektayar/shared'

export interface FocusElementOptions {
  /**
   * CSS selector for the element to focus
   */
  selector: string

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number

  /**
   * Delay between retry attempts in milliseconds
   * @default 100
   */
  retryDelay?: number

  /**
   * Optional callback when focus succeeds
   */
  onSuccess?: () => void

  /**
   * Optional callback when focus fails after all retries
   */
  onError?: (error: Error) => void
}

/**
 * Global composable for focusing dynamically rendered elements with retry logic.
 * 
 * Use this utility everywhere you need to focus elements that may not be
 * immediately available in the DOM (e.g., conditionally rendered with v-if).
 * 
 * @example
 * ```typescript
 * import { useFocusElement } from '@/composables/useFocusElement'
 * 
 * const { focusElement } = useFocusElement()
 * 
 * // Focus an element with default settings
 * await focusElement({ selector: '.my-input' })
 * 
 * // Focus with custom retry settings
 * await focusElement({
 *   selector: '.my-textarea',
 *   maxRetries: 5,
 *   retryDelay: 150,
 *   onSuccess: () => console.log('Focused!'),
 *   onError: (error) => console.error('Failed to focus', error)
 * })
 * ```
 * 
 * TODO: Consider refactoring to use Vue template refs approach for better
 * type safety and reliability. This would require passing refs instead of
 * selectors, but would be more aligned with Vue best practices.
 */
export function useFocusElement() {
  /**
   * Attempts to focus an element with retry logic
   */
  async function focusElement(options: FocusElementOptions): Promise<boolean> {
    const {
      selector,
      maxRetries = 3,
      retryDelay = 100,
      onSuccess,
      onError,
    } = options

    let attempts = 0

    while (attempts < maxRetries) {
      try {
        // Wait for Vue to update the DOM
        await nextTick()

        // Additional delay to ensure element is rendered
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }

        const element = document.querySelector(selector)

        if (element && element instanceof HTMLElement) {
          element.focus()

          // Verify focus was successful
          if (document.activeElement === element) {
            logger.debug('Successfully focused element', { selector, attempts: attempts + 1 })
            onSuccess?.()
            return true
          }
        }

        attempts++

        if (attempts < maxRetries) {
          logger.debug('Retrying focus attempt', {
            selector,
            attempt: attempts + 1,
            maxRetries,
          })
        }
      } catch (error) {
        logger.error('Error during focus attempt', { selector, attempts: attempts + 1, error })
        attempts++
      }
    }

    // All retries exhausted
    const error = new Error(
      `Failed to focus element "${selector}" after ${maxRetries} attempts`
    )
    logger.warn('Failed to focus element after retries', { selector, maxRetries })
    onError?.(error)
    return false
  }

  /**
   * Convenience method for focusing with a single retry delay
   * (similar to the old setTimeout pattern)
   */
  async function focusElementWithDelay(
    selector: string,
    delay: number = 100
  ): Promise<boolean> {
    return focusElement({
      selector,
      maxRetries: 1,
      retryDelay: delay,
    })
  }

  return {
    focusElement,
    focusElementWithDelay,
  }
}
