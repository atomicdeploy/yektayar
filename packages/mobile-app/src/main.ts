import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import config from './config'
import { validateApi } from './config/validation'
import ErrorScreen from './components/ErrorScreen.vue'

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
  console.log('=== YektaYar Mobile App Initialization ===')
  console.log(`Environment: ${config.environment}`)
  
  const validationResult = await validateApi(config.apiBaseUrl)
  
  if (!validationResult.isValid) {
    console.error('❌ API Configuration Error:', validationResult.error)
    
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

  console.log(`✅ API Base URL: ${config.apiBaseUrl}`)
  console.log('=== Initialization Complete ===')

  // Create and mount the main app
  const app = createApp(App)

  app.use(IonicVue)
  app.use(createPinia())
  app.use(router)
  app.use(i18n)

  router.isReady().then(() => {
    app.mount('#app')
  })
}

// Start initialization
initializeApp().catch((error) => {
  console.error('Failed to initialize app:', error)
})

