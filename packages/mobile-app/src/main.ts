import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import config from './config'
import { validateApi } from './config/validation'
import ErrorScreen from './components/ErrorScreen.vue'
import { useSessionStore } from './stores/session'
import { useErrorStore } from './stores/error'
import { logger } from '@yektayar/shared'

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
  messages: {
    fa: {
      welcome: 'خوش آمدید به یکتایار',
      app_title: 'یکتایار'
    },
    en: {
      welcome: 'Welcome to YektaYar',
      app_title: 'YektaYar'
    }
  }
})

// Validate API configuration and reachability before mounting the app
async function initializeApp() {
  logger.info('=== YektaYar Mobile App Initialization ===')
  logger.info(`Environment: ${config.environment}`)
  
  const validationResult = await validateApi(config.apiBaseUrl)
  
  if (!validationResult.isValid) {
    logger.error('❌ API Configuration Error:', validationResult.error)
    
    // Create and mount error screen
    const errorApp = createApp(ErrorScreen, {
      title: 'API Configuration Error',
      message: 'Cannot start the application due to API configuration issues.',
      details: validationResult.error
    })
    
    errorApp.use(IonicVue)
    errorApp.mount('#app')
    return
  }

  logger.info(`✅ API Base URL: ${config.apiBaseUrl}`)
  logger.info('=== Initialization Complete ===')

  // Create and mount the main app
  const app = createApp(App)
  const pinia = createPinia()

  app.use(IonicVue)
  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // Setup global error handlers
  const errorStore = useErrorStore(pinia)

  // Vue error handler
  app.config.errorHandler = (err, instance, info) => {
    const error = err as Error
    const message = error.message || 'An unknown error occurred'
    const details = `Component: ${instance?.$options?.name || 'Unknown'}, Info: ${info}`
    
    errorStore.addError('Application Error', message, details)
  }

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    const message = error?.message || String(error) || 'Unhandled promise rejection'
    
    errorStore.addError('Promise Rejection', message, error?.stack)
    event.preventDefault()
  })

  // Global error event handler
  window.addEventListener('error', (event) => {
    if (event.error) {
      errorStore.addError('JavaScript Error', event.error.message, event.error.stack)
    } else {
      errorStore.addError('Error', event.message || 'Unknown error')
    }
    event.preventDefault()
  })

  router.isReady().then(() => {
    app.mount('#app')
    
    // Acquire session after app is mounted
    const sessionStore = useSessionStore()
    sessionStore.acquireSession().catch((error) => {
      logger.error('Failed to acquire session on startup:', error)
      errorStore.addError(
        'Session Error',
        'Failed to connect to the server. Some features may not work correctly.',
        'Please check if the backend server is running.'
      )
      // Continue anyway - session will be acquired on next attempt
    })
  })
}

// Start initialization
initializeApp().catch((error) => {
  logger.error('Failed to initialize app:', error)
  
  // Show error screen if app failed to initialize
  const errorApp = createApp(ErrorScreen, {
    title: 'Initialization Error',
    message: 'Failed to start the application.',
    details: error?.message || String(error)
  })
  
  errorApp.use(IonicVue)
  errorApp.mount('#app')
})
