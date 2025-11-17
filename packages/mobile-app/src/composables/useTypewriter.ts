import { ref, onMounted, onUnmounted } from 'vue'

export type TypewriterMode = 'character' | 'word'

export interface TypewriterOptions {
  /**
   * Speed in milliseconds per character/word
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
   * @default true
   */
  showCursor?: boolean
  
  /**
   * Typing mode: character-by-character or word-by-word
   * @default 'character'
   */
  mode?: TypewriterMode
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
    showCursor = true,
    mode = 'character'
  } = options

  const displayText = ref('')
  const isTyping = ref(false)
  const isComplete = ref(false)
  
  let timeoutId: number | null = null
  let currentIndex = 0
  let words: string[] = []

  // Split text into words while preserving HTML tags
  const prepareWords = () => {
    if (mode === 'word') {
      // Split by spaces but keep HTML tags intact
      const parts: string[] = []
      let buffer = ''
      let inTag = false
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        
        if (char === '<') {
          inTag = true
          buffer += char
        } else if (char === '>') {
          inTag = false
          buffer += char
        } else if (char === ' ' && !inTag) {
          if (buffer) {
            parts.push(buffer)
            buffer = ''
          }
          parts.push(' ')
        } else {
          buffer += char
        }
      }
      
      if (buffer) {
        parts.push(buffer)
      }
      
      words = parts
    }
  }

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
  
  const typeNextWord = () => {
    if (currentIndex < words.length) {
      displayText.value = words.slice(0, currentIndex + 1).join('')
      currentIndex++
      timeoutId = window.setTimeout(typeNextWord, speed)
    } else {
      isTyping.value = false
      isComplete.value = true
    }
  }

  const start = () => {
    isTyping.value = true
    currentIndex = 0
    displayText.value = ''
    isComplete.value = false
    
    if (mode === 'word') {
      prepareWords()
    }
    
    timeoutId = window.setTimeout(() => {
      if (mode === 'word') {
        typeNextWord()
      } else {
        typeNextCharacter()
      }
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
