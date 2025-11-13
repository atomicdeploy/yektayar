import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import config from './config'
import { ErrorScreenMobile, parseSolutionsMarkdown, findSolutionForError, validateApi, logger, messages } from '@yektayar/shared'
import { useSessionStore } from './stores/session'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Sahel Font */
import './theme/fonts.css'

/* Theme variables */
import './theme/variables.css'

// Log startup information
logger.startup('YektaYar Mobile App', {
  'API URL': config.apiBaseUrl,
  'Environment': import.meta.env.MODE || 'development',
  'Version': '0.1.0',
  'Platform': 'Ionic/Capacitor'
})

// i18n configuration
const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  messages,
})

// Validate API configuration and reachability before mounting the app
async function initializeApp() {
  logger.info('=== YektaYar Mobile App Initialization ===')
  logger.info(`Environment: ${config.environment}`)
  
  const validationResult = await validateApi(config.apiBaseUrl)
  
  if (!validationResult.isValid) {
    logger.error('❌ API Configuration Error:', validationResult.error)
    
    // Allow bypassing API validation only if explicitly enabled via environment variable
    // Set VITE_SKIP_API_VALIDATION=true in .env to enable this for UI testing
    const skipApiValidation = import.meta.env.VITE_SKIP_API_VALIDATION === 'true'
    
    if (skipApiValidation) {
      logger.warn('⚠️ VITE_SKIP_API_VALIDATION is enabled - bypassing API validation')
      logger.warn('⚠️ This should only be used for UI development/testing')
    } else {
      // Show error screen with solution parsing
      let solution = null
      if (import.meta.env.DEV && import.meta.env.SOLUTIONS_MD) {
        const solutionsData = parseSolutionsMarkdown(import.meta.env.SOLUTIONS_MD)
        solution = findSolutionForError(solutionsData, validationResult.error || '', validationResult.errorType)
      }
      
    // Create and mount error screen
      const errorApp = createApp(ErrorScreenMobile, {
        title: 'API Configuration Error',
        message: 'Cannot start the application due to API configuration issues.',
        details: validationResult.error,
        solution: solution,
        errorType: validationResult.errorType
      })
      
      errorApp.use(IonicVue)
      errorApp.use(i18n)
      errorApp.mount('#app')
      return
    }
  } else {
    logger.info(`✅ API Base URL: ${config.apiBaseUrl}`)
  }
  
  logger.info('=== Initialization Complete ===')

  // Create and mount the main app
  const app = createApp(App)

  app.use(IonicVue)
  app.use(createPinia())
  app.use(router)
  app.use(i18n)

  router.isReady().then(() => {
    app.mount('#app')
    
    // Acquire session after app is mounted
    const sessionStore = useSessionStore()
    sessionStore.acquireSession().catch((error) => {
      logger.error('Failed to acquire session on startup:', error)
      // Continue anyway - session will be acquired on next attempt
    })
  })
}

// Start initialization
initializeApp().catch((error) => {
  logger.error('Failed to initialize app:', error)
})
