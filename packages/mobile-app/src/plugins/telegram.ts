/// <reference path="../types/telegram-webapp.d.ts" />

import { App, reactive } from 'vue'
import { logger } from '@yektayar/shared'

export type TelegramState = {
  ready: boolean
  available: boolean
  initData?: string
  initDataUnsafe?: Record<string, any>
  themeParams?: Record<string, string>
  colorScheme?: 'light' | 'dark'
  platform?: string
  version?: string
  webApp?: TelegramWebApp
}

const state = reactive<TelegramState>({
  ready: false,
  available: false,
  initData: undefined,
  initDataUnsafe: undefined,
  themeParams: undefined,
  colorScheme: undefined,
  platform: undefined,
  version: undefined,
  webApp: undefined,
})

export function useTelegramState() {
  return state
}

/**
 * Check if the app is running in a Telegram context
 * This checks for Telegram-specific parameters or user agent
 */
function isTelegramContext(): boolean {
  // Check URL parameters for Telegram-specific data
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('tgWebAppData') || urlParams.has('tgWebAppVersion')) {
    return true
  }

  // Check hash parameters (Telegram passes data in hash)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  if (hashParams.has('tgWebAppData') || hashParams.has('tgWebAppVersion')) {
    return true
  }

  // Check user agent for Telegram
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('telegram')) {
    return true
  }

  // Check if Telegram WebApp is already available (script loaded externally)
  if (window.Telegram?.WebApp) {
    return true
  }

  return false
}

/**
 * Dynamically load the Telegram Web App SDK script
 * @returns Promise that resolves when the script is loaded
 */
function loadTelegramScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.Telegram?.WebApp) {
      resolve()
      return
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="telegram-web-app.js"]')
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', reject)
      return
    }

    // Create and inject script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    script.onload = () => {
      logger.debug('Telegram Web App SDK loaded')
      resolve()
    }
    script.onerror = () => {
      logger.error('Failed to load Telegram Web App SDK')
      reject(new Error('Failed to load Telegram Web App SDK'))
    }

    document.head.appendChild(script)
  })
}

export default {
  async install(app: App) {
    // Check if we're in a Telegram context
    if (!isTelegramContext()) {
      logger.info('Not running in Telegram context - Telegram features disabled')
      state.available = false
      app.provide('telegram', state)
      return
    }

    // Load the Telegram SDK dynamically
    try {
      await loadTelegramScript()
    } catch (error) {
      logger.error('Failed to load Telegram SDK', error)
      state.available = false
      app.provide('telegram', state)
      return
    }

    const webApp = window.Telegram?.WebApp
    if (!webApp) {
      logger.info('Telegram WebApp not detected - running in regular browser mode')
      state.available = false
      app.provide('telegram', state)
      return
    }

    try {
      state.available = true
      state.webApp = webApp
      state.initData = webApp.initData
      state.initDataUnsafe = webApp.initDataUnsafe
      state.themeParams = webApp.themeParams
      state.colorScheme = webApp.colorScheme
      state.platform = webApp.platform
      state.version = webApp.version

      // Expand to full height when running in Telegram
      if (!webApp.isExpanded) {
        webApp.expand()
      }

      // Optional: listen for theme/viewport changes and update reactive state
      webApp.onEvent('themeChanged', () => {
        logger.debug('Telegram theme changed')
        state.themeParams = webApp.themeParams
        state.colorScheme = webApp.colorScheme
      })

      webApp.onEvent('viewportChanged', (data: any) => {
        logger.debug('Telegram viewport changed', {
          isExpanded: data.isStateStable ? webApp.isExpanded : undefined,
          height: webApp.viewportHeight
        })
      })

      // Mark app as ready to Telegram (call when UI is ready)
      webApp.ready()
      state.ready = true

      logger.success('Telegram WebApp initialized', {
        version: webApp.version,
        platform: webApp.platform,
        colorScheme: webApp.colorScheme
      })
    } catch (err) {
      logger.error('Error initializing Telegram WebApp', err)
    }

    app.provide('telegram', state)
  },
}
