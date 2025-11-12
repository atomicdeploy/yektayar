import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useSessionStore } from './stores/session'
import { useErrorStore } from './stores/error'
import { messages } from './locales'
import { logger } from '@yektayar/shared'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Log startup information
logger.startup('YektaYar Admin Panel', {
  'API URL': API_URL,
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

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Setup global error handlers
const errorStore = useErrorStore()

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

app.mount('#app')

