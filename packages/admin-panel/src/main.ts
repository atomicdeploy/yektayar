import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useSessionStore } from './stores/session'
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

// Acquire session on app startup
const sessionStore = useSessionStore()
sessionStore.acquireSession().catch((error) => {
  logger.error('Failed to acquire session on startup:', error)
  // Continue anyway - session will be acquired on next attempt
})

app.mount('#app')

