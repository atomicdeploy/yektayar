/**
 * Developer/Debug Configuration Store (Pinia)
 * 
 * Manages persistent configuration for developer and debugging features
 * across the entire application. This store provides a centralized place
 * for feature flags, debugging options, and developer tools.
 * 
 * Originally moved from WelcomeScreen.debug.ts and refactored to be general purpose.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { logger } from '@yektayar/shared'

// ==========================================
// CONFIGURATION TYPES
// ==========================================

export type ViewportWaitingMode = 'all' | 'first' | 'none'

// Welcome screen specific config
export interface WelcomeScreenConfig {
  enableTypewriter: boolean
  enableDynamicHeight: boolean
  viewportWaitingMode: ViewportWaitingMode
  enableSkipHotkey: boolean
  enableSmoothAnimations: boolean
  skipTypewriter: boolean
  showCursorInitially: boolean
}

// General debug config (can be extended for other pages/features)
export interface DebugConfig {
  welcome: WelcomeScreenConfig
  // Future: Add other page configs here
  // chat: ChatConfig
  // settings: SettingsConfig
}

// ==========================================
// DEFAULT CONFIGURATION
// ==========================================

const DEFAULT_WELCOME_CONFIG: WelcomeScreenConfig = {
  enableTypewriter: true,
  enableDynamicHeight: true,
  viewportWaitingMode: 'all',
  enableSkipHotkey: true,
  enableSmoothAnimations: true,
  skipTypewriter: false,
  showCursorInitially: true
}

const DEFAULT_CONFIG: DebugConfig = {
  welcome: { ...DEFAULT_WELCOME_CONFIG }
}

// ==========================================
// PINIA STORE
// ==========================================

export const useDebugConfigStore = defineStore('debugConfig', () => {
  // State
  const config = ref<DebugConfig>({ ...DEFAULT_CONFIG })
  
  // Load from localStorage on initialization
  const loadFromStorage = () => {
    try {
      // Load main config
      const storedConfig = localStorage.getItem('yektayar_debug_config')
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig)
        config.value = {
          ...DEFAULT_CONFIG,
          ...parsed,
          welcome: { ...DEFAULT_WELCOME_CONFIG, ...parsed.welcome }
        }
      }
      
      // For backward compatibility, check old keys
      const oldWelcomeConfig = localStorage.getItem('yektayar_welcome_feature_config')
      const oldSkipTypewriter = localStorage.getItem('yektayar_welcome_skip_typewriter')
      
      if (oldWelcomeConfig || oldSkipTypewriter) {
        logger.info('[DebugConfig] Migrating old welcome config to new structure')
        
        if (oldWelcomeConfig) {
          const parsed = JSON.parse(oldWelcomeConfig)
          config.value.welcome = { ...config.value.welcome, ...parsed }
          localStorage.removeItem('yektayar_welcome_feature_config')
        }
        
        if (oldSkipTypewriter) {
          config.value.welcome.skipTypewriter = oldSkipTypewriter === 'true'
          localStorage.removeItem('yektayar_welcome_skip_typewriter')
        }
        
        // Save migrated config
        saveToStorage()
      }
    } catch (error) {
      logger.error('[DebugConfig] Failed to load from localStorage:', error)
    }
  }
  
  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('yektayar_debug_config', JSON.stringify(config.value))
    } catch (error) {
      logger.error('[DebugConfig] Failed to save to localStorage:', error)
    }
  }
  
  // Auto-save when config changes
  watch(config, () => {
    saveToStorage()
  }, { deep: true })
  
  // Actions - Welcome Screen
  const setWelcomeConfig = (updates: Partial<WelcomeScreenConfig>) => {
    config.value.welcome = { ...config.value.welcome, ...updates }
    logger.info('[DebugConfig] Welcome config updated:', updates)
  }
  
  const setSkipTypewriter = (skip: boolean) => {
    config.value.welcome.skipTypewriter = skip
    logger.info(`[DebugConfig] Skip typewriter set to: ${skip}`)
  }
  
  // Actions - General
  const resetConfig = () => {
    config.value = { ...DEFAULT_CONFIG }
    logger.info('[DebugConfig] Config reset to defaults')
  }
  
  const clearStorage = () => {
    localStorage.removeItem('yektayar_debug_config')
    // Also clear old keys if they exist
    localStorage.removeItem('yektayar_welcome_feature_config')
    localStorage.removeItem('yektayar_welcome_skip_typewriter')
    config.value = { ...DEFAULT_CONFIG }
    logger.info('[DebugConfig] Storage cleared')
  }
  
  // Load config on store initialization
  loadFromStorage()
  
  return {
    // State
    config,
    // Convenience getters
    welcomeConfig: computed(() => config.value.welcome),
    // Actions
    setWelcomeConfig,
    setSkipTypewriter,
    resetConfig,
    clearStorage
  }
})

// ==========================================
// CONSOLE API
// ==========================================

// Expose to window for console access
if (typeof window !== 'undefined') {
  // Use a getter to always access the current store instance
  Object.defineProperty(window, 'yektayarDebug', {
    get() {
      const store = useDebugConfigStore()
      return {
        // Get entire config
        getConfig: () => {
          return JSON.parse(JSON.stringify(store.config))
        },
        
        // Welcome screen controls
        welcome: {
          getConfig: () => {
            return { ...store.welcomeConfig }
          },
          
          setConfig: (updates: Partial<WelcomeScreenConfig>) => {
            store.setWelcomeConfig(updates)
            return { ...store.welcomeConfig }
          },
          
          getSkipAll: () => store.welcomeConfig.skipTypewriter,
          
          setSkipAll: (skip: boolean) => {
            store.setSkipTypewriter(skip)
            return store.welcomeConfig.skipTypewriter
          },
          
          reset: () => {
            store.config.welcome = { ...DEFAULT_WELCOME_CONFIG }
            return { ...store.welcomeConfig }
          }
        },
        
        // Global controls
        reset: () => {
          store.resetConfig()
          return JSON.parse(JSON.stringify(store.config))
        },
        
        clearStorage: () => {
          store.clearStorage()
          return 'All storage cleared'
        },
        
        // Help
        help: () => {
          console.log(`
%c🔧 Yektayar Developer Debug API
%c
%cGlobal Commands:%c
  yektayarDebug.getConfig()
    → Get entire debug configuration
    
  yektayarDebug.reset()
    → Reset all configurations to defaults
    
  yektayarDebug.clearStorage()
    → Clear all debug storage

%cWelcome Screen Controls:%c
  yektayarDebug.welcome.getConfig()
    → Get welcome screen configuration
    
  yektayarDebug.welcome.setConfig({ key: value })
    → Update welcome screen configuration
    Example: yektayarDebug.welcome.setConfig({ enableTypewriter: false })
    
  yektayarDebug.welcome.reset()
    → Reset welcome screen config to defaults
    
  yektayarDebug.welcome.getSkipAll()
    → Check if typewriter should be skipped permanently
    
  yektayarDebug.welcome.setSkipAll(true/false)
    → Enable/disable permanent typewriter skip (same as Shift+F6)

%cWelcome Screen Config Keys:%c
  - enableTypewriter: boolean (enable/disable typewriter effect)
  - enableDynamicHeight: boolean (enable/disable dynamic height adjustment)
  - viewportWaitingMode: 'all' | 'first' | 'none' (viewport waiting behavior)
  - enableSkipHotkey: boolean (enable/disable F6/Shift+F6 hotkeys)
  - enableSmoothAnimations: boolean (enable/disable slide animations)
  - skipTypewriter: boolean (permanently skip typewriter effect)
  - showCursorInitially: boolean (show cursor before first paragraph typing starts)

%cKeyboard Shortcuts (Welcome Screen):%c
  F6 → Skip current paragraph
  Shift+F6 → Skip all typewriters and persist preference

%cNote:%c This API is extensible. Future page controls will be added under:
  yektayarDebug.chat.*
  yektayarDebug.settings.*
  etc.

All changes are automatically saved to localStorage via Pinia.
`,
            'color: #d4af37; font-size: 16px; font-weight: bold;',
            '',
            'color: #4a90e2; font-weight: bold;', '',
            'color: #4a90e2; font-weight: bold;', '',
            'color: #4a90e2; font-weight: bold;', '',
            'color: #4a90e2; font-weight: bold;', '',
            'color: #4a90e2; font-weight: bold;', ''
          )
        }
      }
    },
    configurable: true
  })
  
  // Log availability on load
  logger.info('[DebugConfig] Developer console API available via window.yektayarDebug. Type yektayarDebug.help() for usage.')
}

// Add computed import
import { computed } from 'vue'
