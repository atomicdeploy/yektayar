import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import config from './config'
import { ErrorScreen } from '@yektayar/shared'
import { parseSolutionsMarkdown, findSolutionForError, validateApi } from '@yektayar/shared'
import { useSessionStore } from './stores/session'
import { useErrorStore } from './stores/error'
import { messages } from './locales'
import { logger } from '@yektayar/shared'

// Log startup information
logger.startup('YektaYar Admin Panel', {
  'API URL': config.apiBaseUrl,
  'Environment': import.meta.env.MODE || 'development',
  'Version': '0.1.0'
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
  logger.info('=== YektaYar Admin Panel Initialization ===')
  logger.info(`Environment: ${config.environment}`)
  
  const validationResult = await validateApi(config.apiBaseUrl)
  
  if (!validationResult.isValid) {
    logger.error('❌ API Configuration Error:', validationResult.error)
    
    // Parse solutions if available in development mode
    let solution = null
    if (import.meta.env.DEV && import.meta.env.SOLUTIONS_MD) {
      const solutionsData = parseSolutionsMarkdown(import.meta.env.SOLUTIONS_MD)
      solution = findSolutionForError(solutionsData, validationResult.error || '', validationResult.errorType)
    }
    
    // Create and mount error screen
    const errorApp = createApp(ErrorScreen, {
      title: 'API Configuration Error',
      message: 'Cannot start the admin panel due to API configuration issues.',
      details: validationResult.error,
      solution: solution,
      errorType: validationResult.errorType
    })
    
    errorApp.use(i18n)
    errorApp.mount('#app')
    return
  }

  logger.info(`✅ API Base URL: ${config.apiBaseUrl}`)
  logger.info('=== Initialization Complete ===')

  // Create and mount the main app
  const app = createApp(App)
  const pinia = createPinia()

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

  // Acquire session on app startup
  const sessionStore = useSessionStore(pinia)
  sessionStore.acquireSession().catch((error) => {
    logger.error('Failed to acquire session on startup:', error)
    errorStore.addError(
      'Session Error',
      'Failed to connect to the server. Some features may not work correctly.',
      'Please check if the backend server is running.'
    )
    // Continue anyway - session will be acquired on next attempt
  })

  app.mount('#app')
}

// Start initialization
initializeApp().catch((error) => {
  logger.error('Failed to initialize app:', error)
  
  // Show error screen if app failed to initialize
  const errorApp = createApp(ErrorScreen, {
    title: 'Initialization Error',
    message: 'Failed to start the admin panel.',
    details: error?.message || String(error)
  })
  
  errorApp.mount('#app')
})
