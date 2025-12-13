/**
 * Composable for Speech Recognition functionality
 * Handles Web Speech API with mobile/desktop detection and proper result handling
 * 
 * Mobile Fixes Applied:
 * - Results with confidence=0 are treated as interim, not final
 * - On mobile devices, final/interim transcripts are replaced instead of appended
 * - Proper detection of mobile/tablet devices
 */

import { ref, computed, onUnmounted } from 'vue'
import { logger } from '@yektayar/shared'

// Type definitions for Web Speech API (may not be in all TypeScript versions)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onaudiostart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onaudioend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => any) | null
  onnomatch: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => any) | null
  onsoundstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onsoundend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null
}

// Extend window type
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface
    webkitSpeechRecognition: new () => SpeechRecognitionInterface
  }
}

export interface SpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  autoRestart?: boolean
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  // Get SpeechRecognition constructor
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  // Check if speech recognition is supported
  const isSupported = computed(() => !!SpeechRecognition)

  // Detect mobile/tablet device
  const isMobileOrTablet = computed(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
  })

  // State
  const isListening = ref(false)
  const finalTranscript = ref('')
  const interimTranscript = ref('')
  const error = ref<string | null>(null)

  // Recognition instance
  let recognition: SpeechRecognitionInterface | null = null
  let restartTimer: number | null = null
  let userWantsListening = false

  /**
   * Initialize the speech recognition instance
   */
  const initRecognition = () => {
    if (!SpeechRecognition) {
      error.value = 'Speech recognition is not supported in this browser'
      return null
    }

    if (recognition) {
      return recognition
    }

    recognition = new SpeechRecognition()

    // Apply settings
    recognition.lang = options.lang || 'en-US'
    recognition.continuous = options.continuous !== undefined ? options.continuous : true
    recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true
    recognition.maxAlternatives = options.maxAlternatives || 1

    // Event handlers
    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onend = () => {
      isListening.value = false

      // Auto-restart if enabled and user still wants it
      if (userWantsListening && options.autoRestart) {
        if (restartTimer) clearTimeout(restartTimer)
        restartTimer = window.setTimeout(() => {
          if (!isListening.value && userWantsListening) {
            start()
          }
        }, 250)
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''

      // Process results with mobile-optimized handling
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const alternative = result[0]
        const transcript = alternative.transcript
        const confidence = alternative.confidence

        // Mobile fix: treat confidence=0 as interim
        const isTrulyFinal = result.isFinal && confidence !== 0

        if (isTrulyFinal) {
          // On mobile: replace instead of append
          if (isMobileOrTablet.value) {
            finalTranscript.value = transcript
          } else {
            finalTranscript.value += (finalTranscript.value ? ' ' : '') + transcript
          }
        } else {
          // Interim result
          if (isMobileOrTablet.value) {
            interim = transcript
          } else {
            interim += transcript
          }
        }
      }

      // Update interim transcript
      if (interim) {
        interimTranscript.value = interim
      } else {
        interimTranscript.value = ''
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      error.value = event.error
      
      // Handle transient errors with auto-restart
      const transientErrors = ['no-speech', 'aborted', 'network']
      if (userWantsListening && options.autoRestart && transientErrors.includes(event.error)) {
        if (restartTimer) clearTimeout(restartTimer)
        restartTimer = window.setTimeout(() => {
          if (!isListening.value && userWantsListening) {
            start()
          }
        }, 600)
      }
    }

    return recognition
  }

  /**
   * Start speech recognition
   */
  const start = () => {
    const rec = initRecognition()
    if (!rec) return

    if (isListening.value) {
      logger.warn('Speech recognition is already running')
      return
    }

    userWantsListening = true
    
    try {
      rec.start()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start speech recognition'
      logger.error('Error starting speech recognition:', err)
    }
  }

  /**
   * Stop speech recognition
   */
  const stop = () => {
    userWantsListening = false
    
    if (restartTimer) {
      clearTimeout(restartTimer)
      restartTimer = null
    }

    if (recognition && isListening.value) {
      try {
        recognition.stop()
      } catch (err) {
        logger.error('Error stopping speech recognition:', err)
      }
    }
  }

  /**
   * Abort speech recognition immediately
   */
  const abort = () => {
    userWantsListening = false
    
    if (restartTimer) {
      clearTimeout(restartTimer)
      restartTimer = null
    }

    if (recognition) {
      try {
        recognition.abort()
        isListening.value = false
      } catch (err) {
        logger.error('Error aborting speech recognition:', err)
      }
    }
  }

  /**
   * Reset transcripts
   */
  const reset = () => {
    finalTranscript.value = ''
    interimTranscript.value = ''
    error.value = null
  }

  /**
   * Get combined transcript (final + interim)
   */
  const fullTranscript = computed(() => {
    const final = finalTranscript.value
    const interim = interimTranscript.value
    
    if (final && interim) {
      return `${final} ${interim}`
    }
    return final || interim
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
    if (recognition) {
      recognition = null
    }
  })

  return {
    // State
    isSupported,
    isListening,
    isMobileOrTablet,
    finalTranscript,
    interimTranscript,
    fullTranscript,
    error,
    
    // Methods
    start,
    stop,
    abort,
    reset,
  }
}
