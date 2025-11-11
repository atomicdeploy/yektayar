import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'
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

