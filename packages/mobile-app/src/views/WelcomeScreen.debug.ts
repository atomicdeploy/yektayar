/**
 * WelcomeScreen Developer Configuration & Debug Utilities
 * 
 * This file contains all developer/debugging features for the WelcomeScreen.
 * It provides persistent configuration and skip functionality.
 */

import { ref } from 'vue'
import type { Ref } from 'vue'
import { logger } from '@/utils/logger'

// ==========================================
// CONFIGURATION TYPES
// ==========================================

export type ViewportWaitingMode = 'all' | 'first' | 'none'

export interface FeatureConfig {
  enableTypewriter: boolean
  enableDynamicHeight: boolean
  viewportWaitingMode: ViewportWaitingMode
  enableSkipHotkey: boolean
  enableSmoothAnimations: boolean
}

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================

const STORAGE_KEYS = {
  FEATURE_CONFIG: 'yektayar_welcome_feature_config',
  SKIP_TYPEWRITER: 'yektayar_welcome_skip_typewriter'
} as const

// ==========================================
// DEFAULT CONFIGURATION
// ==========================================

const DEFAULT_CONFIG: FeatureConfig = {
  enableTypewriter: true,
  enableDynamicHeight: true,
  viewportWaitingMode: 'all',
  enableSkipHotkey: true,
  enableSmoothAnimations: true
}

// ==========================================
// PERSISTENT STORAGE HELPERS
// ==========================================

function loadConfig(): FeatureConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_CONFIG)
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    }
  } catch (error) {
    logger.error('[WelcomeDebug] Failed to load config from localStorage:', error)
  }
  return { ...DEFAULT_CONFIG }
}

function saveConfig(config: FeatureConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FEATURE_CONFIG, JSON.stringify(config))
    logger.info('[WelcomeDebug] Config saved to localStorage')
  } catch (error) {
    logger.error('[WelcomeDebug] Failed to save config to localStorage:', error)
  }
}

function loadSkipTypewriter(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SKIP_TYPEWRITER)
    return stored === 'true'
  } catch (error) {
    logger.error('[WelcomeDebug] Failed to load skip typewriter flag:', error)
  }
  return false
}

function saveSkipTypewriter(skip: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SKIP_TYPEWRITER, String(skip))
    logger.info(`[WelcomeDebug] Skip typewriter set to: ${skip}`)
  } catch (error) {
    logger.error('[WelcomeDebug] Failed to save skip typewriter flag:', error)
  }
}

// ==========================================
// REACTIVE CONFIGURATION
// ==========================================

export const featureConfig: Ref<FeatureConfig> = ref(loadConfig())
export const skipTypewriter: Ref<boolean> = ref(loadSkipTypewriter())

// Watch and auto-save changes
import { watch } from 'vue'

watch(featureConfig, (newConfig) => {
  saveConfig(newConfig)
}, { deep: true })

watch(skipTypewriter, (newValue) => {
  saveSkipTypewriter(newValue)
})

// ==========================================
// CONSOLE API
// ==========================================

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).YektayarDebug = {
    // Get current config
    getConfig: () => {
      return { ...featureConfig.value }
    },
    
    // Update config
    setConfig: (updates: Partial<FeatureConfig>) => {
      featureConfig.value = { ...featureConfig.value, ...updates }
      logger.info('[WelcomeDebug] Config updated via console:', updates)
    },
    
    // Reset to defaults
    resetConfig: () => {
      featureConfig.value = { ...DEFAULT_CONFIG }
      logger.info('[WelcomeDebug] Config reset to defaults')
    },
    
    // Skip typewriter control
    getSkipTypewriter: () => skipTypewriter.value,
    setSkipTypewriter: (skip: boolean) => {
      skipTypewriter.value = skip
      logger.info(`[WelcomeDebug] Skip typewriter set to: ${skip}`)
    },
    
    // Clear all storage
    clearStorage: () => {
      localStorage.removeItem(STORAGE_KEYS.FEATURE_CONFIG)
      localStorage.removeItem(STORAGE_KEYS.SKIP_TYPEWRITER)
      featureConfig.value = { ...DEFAULT_CONFIG }
      skipTypewriter.value = false
      logger.info('[WelcomeDebug] All debug storage cleared')
    },
    
    // Help
    help: () => {
      console.log(`
%cYektayar Welcome Screen Debug Console API
%c
Available commands:

%cConfiguration Management:%c
  YektayarDebug.getConfig()
    → Get current feature configuration
    
  YektayarDebug.setConfig({ key: value })
    → Update configuration
    Example: YektayarDebug.setConfig({ enableTypewriter: false })
    
  YektayarDebug.resetConfig()
    → Reset to default configuration

%cTypewriter Skip Control:%c
  YektayarDebug.getSkipTypewriter()
    → Check if typewriter should be skipped
    
  YektayarDebug.setSkipTypewriter(true/false)
    → Enable/disable typewriter skip (persistent)

%cStorage Management:%c
  YektayarDebug.clearStorage()
    → Clear all debug storage and reset to defaults

%cAvailable Config Keys:%c
  - enableTypewriter: boolean
  - enableDynamicHeight: boolean
  - viewportWaitingMode: 'all' | 'first' | 'none'
  - enableSkipHotkey: boolean
  - enableSmoothAnimations: boolean

All changes are automatically saved to localStorage.
`,
        'color: #d4af37; font-size: 16px; font-weight: bold;',
        '',
        'color: #4a90e2; font-weight: bold;', '',
        'color: #4a90e2; font-weight: bold;', '',
        'color: #4a90e2; font-weight: bold;', '',
        'color: #4a90e2; font-weight: bold;', ''
      )
    }
  }
  
  // Log availability on load
  logger.info('[WelcomeDebug] Console API available via window.YektayarDebug. Type YektayarDebug.help() for usage.')
}

// ==========================================
// KEYBOARD SHORTCUT HANDLER
// ==========================================

export interface TypewriterInstance {
  isTyping: Ref<boolean>
  reset: () => void
  displayText: Ref<string>
  isComplete: Ref<boolean>
}

export function createSkipHandler(
  typewriters: TypewriterInstance[],
  paragraphs: string[]
) {
  return (event: KeyboardEvent) => {
    if (!featureConfig.value.enableSkipHotkey) return
    
    if (event.key === 'F6') {
      event.preventDefault()
      
      // Shift+F6: Disable typewriter completely and save to localStorage
      if (event.shiftKey) {
        skipTypewriter.value = true
        logger.info('[WelcomeDebug] Shift+F6: Typewriter disabled permanently (until cleared)')
        
        // Skip all remaining paragraphs
        typewriters.forEach((tw, index) => {
          if (!tw.isComplete.value) {
            tw.reset()
            tw.displayText.value = paragraphs[index]
            tw.isComplete.value = true
            tw.isTyping.value = false
          }
        })
        return
      }
      
      // F6: Skip current paragraph only
      const currentIndex = typewriters.findIndex(tw => tw.isTyping.value)
      if (currentIndex !== -1) {
        logger.info(`[WelcomeDebug] F6: Skipping paragraph ${currentIndex + 1}`)
        typewriters[currentIndex].reset()
        typewriters[currentIndex].displayText.value = paragraphs[currentIndex]
        typewriters[currentIndex].isComplete.value = true
        typewriters[currentIndex].isTyping.value = false
      }
    }
  }
}
