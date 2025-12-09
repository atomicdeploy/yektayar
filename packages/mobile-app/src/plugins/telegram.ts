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

export default {
  install(app: App) {
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
        colorScheme: webApp.colorScheme,
        user: webApp.initDataUnsafe?.user?.first_name || 'Unknown'
      })
    } catch (err) {
      logger.error('Error initializing Telegram WebApp', err)
    }

    app.provide('telegram', state)
  },
}
