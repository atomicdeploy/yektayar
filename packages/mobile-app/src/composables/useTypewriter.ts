import { ref, onMounted, onUnmounted } from 'vue'
import { logger } from '@yektayar/shared'

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
  
  /**
   * Whether to auto-start on mount
   * @default false
   */
  autoStart?: boolean
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
    mode = 'character',
    autoStart = false
  } = options

  const displayText = ref('')
  const isTyping = ref(false)
  const isComplete = ref(false)
  
  let timeoutId: number | null = null
  let currentIndex = 0
  let words: string[] = []
  let segments: Array<{ content: string; isTag: boolean }> = []

  logger.debug(`[useTypewriter] Initialized with mode: ${mode}, autoStart: ${autoStart}`)

  // Parse text into segments (HTML tags and text content)
  const parseTextSegments = () => {
    const result: Array<{ content: string; isTag: boolean }> = []
    let buffer = ''
    let inTag = false
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      
      if (char === '<') {
        // Save previous text content if any
        if (buffer && !inTag) {
          result.push({ content: buffer, isTag: false })
          buffer = ''
        }
        inTag = true
        buffer += char
      } else if (char === '>') {
        buffer += char
        inTag = false
        // Save the complete tag
        result.push({ content: buffer, isTag: true })
        buffer = ''
      } else {
        buffer += char
      }
    }
    
    // Save remaining buffer
    if (buffer) {
      result.push({ content: buffer, isTag: inTag })
    }
    
    segments = result
    logger.debug(`[useTypewriter] Parsed ${segments.length} segments`)
  }

  // Type next character handling HTML tags properly
  const typeNextCharacter = () => {
    if (currentIndex < segments.length) {
      const segment = segments[currentIndex]
      
      if (segment.isTag) {
        // Add entire tag at once
        displayText.value += segment.content
        logger.debug(`[useTypewriter] Added tag: ${segment.content}`)
        currentIndex++
        timeoutId = window.setTimeout(typeNextCharacter, 0) // No delay for tags
      } else {
        // Type character by character for text content
        const textContent = segment.content
        const charIndex = displayText.value.length - segments.slice(0, currentIndex).reduce((sum, s) => sum + s.content.length, 0)
        
        if (charIndex < textContent.length) {
          displayText.value += textContent[charIndex]
          timeoutId = window.setTimeout(typeNextCharacter, speed)
        } else {
          currentIndex++
          timeoutId = window.setTimeout(typeNextCharacter, 0)
        }
      }
    } else {
      logger.info('[useTypewriter] Typing complete')
      isTyping.value = false
      isComplete.value = true
    }
  }
  
  // Split text into words while preserving HTML tags
  const prepareWords = () => {
    if (mode === 'word') {
      parseTextSegments()
      const parts: string[] = []
      
      for (const segment of segments) {
        if (segment.isTag) {
          parts.push(segment.content)
        } else {
          // Split text content by spaces
          const textWords = segment.content.split(' ')
          for (let i = 0; i < textWords.length; i++) {
            if (textWords[i]) {
              parts.push(textWords[i])
            }
            if (i < textWords.length - 1) {
              parts.push(' ')
            }
          }
        }
      }
      
      words = parts
      logger.debug(`[useTypewriter] Prepared ${words.length} words`)
    }
  }
  
  const typeNextWord = () => {
    if (currentIndex < words.length) {
      displayText.value += words[currentIndex]
      currentIndex++
      timeoutId = window.setTimeout(typeNextWord, speed)
    } else {
      logger.info('[useTypewriter] Typing complete')
      isTyping.value = false
      isComplete.value = true
    }
  }

  const start = () => {
    logger.info('[useTypewriter] Starting animation')
    isTyping.value = true
    currentIndex = 0
    displayText.value = ''
    isComplete.value = false
    
    if (mode === 'word') {
      prepareWords()
    } else {
      parseTextSegments()
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
    logger.debug('[useTypewriter] Resetting')
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
    if (autoStart) {
      logger.debug('[useTypewriter] Auto-starting on mount')
      start()
    }
  })

  onUnmounted(() => {
    logger.debug('[useTypewriter] Cleaning up')
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
