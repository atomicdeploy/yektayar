/**
 * Advanced Speech Recognition Composable for Vue 3
 * 
 * A production-ready, highly configurable speech recognition composable that wraps
 * the Web Speech API with intelligent mobile/desktop handling, auto-restart capabilities,
 * and flexible result accumulation modes.
 * 
 * @packageDocumentation
 * 
 * Features:
 * - ✅ Separate mobile/desktop result handling modes
 * - ✅ Auto-restart on transient errors (network, no-speech, etc.)
 * - ✅ Mobile-optimized confidence checking (treats confidence=0 as interim)
 * - ✅ Real-time interim results with proper separation
 * - ✅ Persian (Farsi) and multi-language support
 * - ✅ Comprehensive error handling with logging
 * - ✅ Backward compatible with legacy options
 * - ✅ TypeScript support with full type definitions
 * - ✅ Automatic cleanup on component unmount
 * 
 * @example Basic Usage
 * ```typescript
 * import { useSpeechRecognition } from '@/composables/useSpeechRecognition'
 * 
 * const { isListening, fullTranscript, start, stop } = useSpeechRecognition({
 *   lang: 'fa-IR', // Persian
 *   continuous: true,
 *   interimResults: true,
 * })
 * ```
 * 
 * @example Advanced Configuration
 * ```typescript
 * const recognition = useSpeechRecognition({
 *   lang: 'fa-IR',
 *   continuous: true,
 *   interimResults: true,
 *   autoRestart: true,
 *   mobileResultMode: 'append',  // Accumulate words on mobile
 *   desktopResultMode: 'append', // Accumulate words on desktop
 *   initialText: 'Starting text...',
 * })
 * ```
 * 
 * @example Monitoring State
 * ```typescript
 * watch(fullTranscript, (newText) => {
 *   console.log('User said:', newText)
 * })
 * 
 * watch(error, (err) => {
 *   if (err) console.error('Recognition error:', err)
 * })
 * ```
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
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

/**
 * Result handling mode configuration
 * 
 * - 'append': Accumulate all final results (recommended for continuous dictation)
 *   Perfect for scenarios where users speak multiple words/sentences
 *   Works excellently with Persian voice dictation on mobile devices
 * 
 * - 'replace': Replace with latest result (legacy behavior)
 *   Assumes speech recognition engine sends complete phrases
 *   Useful when recognition returns full sentences rather than word-by-word
 * 
 * @public
 */
export type ResultMode = 'append' | 'replace'

/**
 * Configuration options for speech recognition
 * 
 * @public
 */
export interface SpeechRecognitionOptions {
  /**
   * Language code for recognition (BCP 47 format)
   * @default 'en-US'
   * @example 'fa-IR' // Persian (Farsi)
   * @example 'ar-SA' // Arabic
   * @example 'en-GB' // British English
   */
  lang?: string
  
  /**
   * Whether to keep recognition active continuously
   * When true, recognition won't stop after detecting silence
   * @default true
   */
  continuous?: boolean
  
  /**
   * Whether to return interim (partial) results during speech
   * Enables real-time word-by-word transcription
   * @default true
   */
  interimResults?: boolean
  
  /**
   * Maximum number of alternative recognition results to return
   * @default 1
   */
  maxAlternatives?: number
  
  /**
   * Automatically restart recognition after it stops
   * Handles transient errors like network issues or brief silence
   * @default false
   */
  autoRestart?: boolean
  
  /**
   * Initial text to start with (useful for continuing previous sessions)
   * @default ''
   */
  initialText?: string
  
  /**
   * How to handle final results (legacy option)
   * @deprecated Use mobileResultMode and desktopResultMode instead for separate control
   * @default true (equivalent to 'append' mode)
   */
  accumulateResults?: boolean
  
  /**
   * Result handling mode for mobile/tablet devices
   * 
   * Recommended: 'append' for continuous dictation
   * This has been tested and works great for Persian dictation on Android
   * 
   * @default 'append'
   */
  mobileResultMode?: ResultMode
  
  /**
   * Result handling mode for desktop devices
   * 
   * Recommended: 'append' for most use cases
   * 
   * @default 'append'
   */
  desktopResultMode?: ResultMode
}

/**
 * Advanced Speech Recognition Composable
 * 
 * Creates a speech recognition instance with intelligent mobile/desktop handling
 * and flexible configuration options.
 * 
 * @param options - Configuration options for speech recognition behavior
 * @returns Object containing reactive state and control methods
 * 
 * @example
 * ```typescript
 * const {
 *   isSupported,
 *   isListening,
 *   finalTranscript,
 *   interimTranscript,
 *   fullTranscript,
 *   error,
 *   start,
 *   stop,
 *   reset,
 * } = useSpeechRecognition({
 *   lang: 'fa-IR',
 *   continuous: true,
 *   mobileResultMode: 'append',
 * })
 * ```
 * 
 * @public
 */
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

        // Mobile fix: treat confidence=0 as interim (not truly final)
        // On mobile, results can have isFinal=true but confidence=0, which means they're still uncertain
        const isTrulyFinal = result.isFinal && confidence !== 0

        if (isTrulyFinal) {
          // Final results handling with separate mobile/desktop configuration
          // Determine the result mode based on device type
          let resultMode: ResultMode
          
          // Support legacy accumulateResults option for backward compatibility
          if (options.accumulateResults !== undefined) {
            resultMode = options.accumulateResults ? 'append' : 'replace'
          } else {
            // Use new separate configuration (defaults to 'append' for both)
            resultMode = isMobileOrTablet.value
              ? (options.mobileResultMode || 'append')
              : (options.desktopResultMode || 'append')
          }
          
          if (resultMode === 'append') {
            // APPEND mode: Accumulate all spoken words
            // Best for continuous dictation where users speak multiple words/sentences
            // Works great for Persian dictation on mobile
            finalTranscript.value += (finalTranscript.value ? ' ' : '') + transcript
          } else {
            // REPLACE mode: Replace with latest result
            // Assumes speech engine sends complete phrases (legacy mobile behavior)
            finalTranscript.value = transcript
          }
        } else {
          // Interim result: Show the current word being spoken
          // On mobile, we only keep the latest interim (no accumulation)
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
    
    // Initialize with provided initial text if any
    if (options.initialText) {
      finalTranscript.value = options.initialText
    }
    
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

  /**
   * Set the initial text for the transcript
   * Useful when resuming or continuing from existing text
   */
  const setInitialText = (text: string) => {
    finalTranscript.value = text
  }

  /**
   * Update the final transcript manually
   * Useful for manual text edits by the user
   */
  const setFinalTranscript = (text: string) => {
    finalTranscript.value = text
  }

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
    setInitialText,
    setFinalTranscript,
  }
}
