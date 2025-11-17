import { ref, onMounted, onUnmounted } from 'vue'

export interface TypewriterOptions {
  /**
   * Speed in milliseconds per character
   * @default 30
   */
  speed?: number
  
  /**
   * Delay before starting the typewriter effect (ms)
   * @default 0
   */
  startDelay?: number
  
  /**
   * Whether to show a cursor during typing
   * @default false
   */
  showCursor?: boolean
}

/**
 * Typewriter effect composable
 * Creates a typing animation effect for text content
 */
export function useTypewriter(
  text: string,
  options: TypewriterOptions = {}
) {
  const {
    speed = 30,
    startDelay = 0,
    showCursor = false
  } = options

  const displayText = ref('')
  const isTyping = ref(false)
  const isComplete = ref(false)
  
  let timeoutId: number | null = null
  let currentIndex = 0

  const typeNextCharacter = () => {
    if (currentIndex < text.length) {
      displayText.value = text.substring(0, currentIndex + 1)
      currentIndex++
      timeoutId = window.setTimeout(typeNextCharacter, speed)
    } else {
      isTyping.value = false
      isComplete.value = true
    }
  }

  const start = () => {
    isTyping.value = true
    currentIndex = 0
    displayText.value = ''
    
    timeoutId = window.setTimeout(() => {
      typeNextCharacter()
    }, startDelay)
  }

  const reset = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    currentIndex = 0
    displayText.value = ''
    isTyping.value = false
    isComplete.value = false
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    displayText,
    isTyping,
    isComplete,
    showCursor: ref(showCursor),
    start,
    reset
  }
}
