import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import config from './config'
import { validateApi } from './config/validation'
import ErrorScreen from './components/ErrorScreen.vue'
import { useSessionStore } from './stores/session'

// i18n configuration
const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  messages: {
    fa: {
      welcome: 'خوش آمدید به یکتایار',
      admin_panel: 'پنل مدیریت'
    },
    en: {
      welcome: 'Welcome to YektaYar',
      admin_panel: 'Admin Panel'
    }
  }
})

// Validate API configuration and reachability before mounting the app
async function initializeApp() {
  console.log('=== YektaYar Admin Panel Initialization ===')
  console.log(`Environment: ${config.environment}`)
  
  const validationResult = await validateApi(config.apiBaseUrl)
  
  if (!validationResult.isValid) {
    console.error('❌ API Configuration Error:', validationResult.error)
    
    // Create and mount error screen
    const errorApp = createApp(ErrorScreen, {
      title: 'API Configuration Error',
      message: 'Cannot start the admin panel due to API configuration issues.',
      details: validationResult.error
    })
    
    errorApp.mount('#app')
    return
  }

  console.log(`✅ API Base URL: ${config.apiBaseUrl}`)
  console.log('=== Initialization Complete ===')

  // Create and mount the main app
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // Acquire session on app startup
  const sessionStore = useSessionStore()
  sessionStore.acquireSession().catch((error) => {
    console.error('Failed to acquire session on startup:', error)
    // Continue anyway - session will be acquired on next attempt
  })

  app.mount('#app')
}

// Start initialization
initializeApp().catch((error) => {
  console.error('Failed to initialize app:', error)
})


