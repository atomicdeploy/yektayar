/**
 * WelcomeScreen Utility Functions
 * 
 * Contains keyboard handlers and helper functions for the welcome screen.
 */

import type { Ref } from 'vue'
import { logger } from '@yektayar/shared'
import { useDebugConfigStore } from '@/stores/debugConfig'

export interface TypewriterInstance {
  isTyping: Ref<boolean>
  reset: () => void
  displayText: Ref<string>
  isComplete: Ref<boolean>
}

/**
 * Skip the currently typing paragraph
 */
export function skipCurrentParagraph(
  typewriters: TypewriterInstance[],
  paragraphs: string[]
): void {
  const currentIndex = typewriters.findIndex(tw => tw.isTyping.value)
  
  if (currentIndex !== -1) {
    logger.info(`[WelcomeScreen] F6: Skipping paragraph ${currentIndex + 1}`)
    typewriters[currentIndex].reset()
    typewriters[currentIndex].displayText.value = paragraphs[currentIndex]
    typewriters[currentIndex].isComplete.value = true
    typewriters[currentIndex].isTyping.value = false
  }
}

/**
 * Skip all remaining typewriter paragraphs and persist preference
 */
export function skipAllTypewriters(
  typewriters: TypewriterInstance[],
  paragraphs: string[]
): void {
  const configStore = useDebugConfigStore()
  
  logger.info('[WelcomeScreen] Shift+F6: Skipping all typewriters and persisting preference')
  
  // Set persistent skip flag
  configStore.setSkipTypewriter(true)
  
  // Skip all remaining paragraphs
  typewriters.forEach((tw, index) => {
    if (!tw.isComplete.value) {
      tw.reset()
      tw.displayText.value = paragraphs[index]
      tw.isComplete.value = true
      tw.isTyping.value = false
    }
  })
}

/**
 * Create keyboard event handler for F6/Shift+F6
 */
export function createKeyboardHandler(
  typewriters: TypewriterInstance[],
  paragraphs: string[]
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    const configStore = useDebugConfigStore()
    
    if (!configStore.welcomeConfig.enableSkipHotkey) return
    
    if (event.key === 'F6') {
      event.preventDefault()
      
      // Shift+F6: Skip all and persist
      if (event.shiftKey) {
        skipAllTypewriters(typewriters, paragraphs)
      } else {
        // F6: Skip current paragraph
        skipCurrentParagraph(typewriters, paragraphs)
      }
    }
  }
}
