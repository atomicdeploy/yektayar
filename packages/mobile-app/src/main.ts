import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import { useSessionStore } from './stores/session'
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Log startup information
logger.startup('YektaYar Mobile App', {
  'API URL': API_URL,
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

const app = createApp(App)
const pinia = createPinia()

app.use(IonicVue)
app.use(pinia)
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

