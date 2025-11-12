import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import config from './config'
import { ErrorScreenMobile } from '@yektayar/shared'
import { parseSolutionsMarkdown, findSolutionForError, validateApi } from '@yektayar/shared'
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
      app_title: 'یکتایار',
      error_screen: {
        title: 'خطای پیکربندی',
        api_config_error: 'خطای پیکربندی API',
        cannot_start: 'امکان راه‌اندازی برنامه به دلیل مشکل در پیکربندی API وجود ندارد.',
        api_url_missing: 'متغیر محیطی API_BASE_URL تنظیم نشده است. لطفاً آدرس پایه API را پیکربندی کنید.',
        details: 'جزئیات',
        solution: 'راه‌حل',
        show_solution: 'نمایش راه‌حل',
        hide_solution: 'پنهان کردن راه‌حل',
        fix_instruction: 'برای رفع این مشکل، می‌توانید دستور زیر را در ترمینال اجرا کنید:',
        or: 'یا',
        manual_setup: 'به صورت دستی یک فایل .env در ریشه پروژه با محتوای زیر ایجاد کنید:',
        restart_note: 'پس از تنظیم متغیر محیطی، سرور توسعه را مجدداً راه‌اندازی کنید.',
      }
    },
    en: {
      welcome: 'Welcome to YektaYar',
      app_title: 'YektaYar',
      error_screen: {
        title: 'Configuration Error',
        api_config_error: 'API Configuration Error',
        cannot_start: 'Cannot start the application due to API configuration issues.',
        api_url_missing: 'API_BASE_URL environment variable is not set. Please configure the API base URL.',
        details: 'Details',
        solution: 'Solution',
        show_solution: 'Show Solution',
        hide_solution: 'Hide Solution',
        fix_instruction: 'To fix this issue, you can run the following command in your terminal:',
        or: 'Or',
        manual_setup: 'Manually create a .env file in the project root with:',
        restart_note: 'After setting the environment variable, restart the development server.',
      }
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
    
    // Parse solutions if available in development mode
    let solution = null
    if (import.meta.env.DEV && import.meta.env.SOLUTIONS_MD) {
      const solutionsData = parseSolutionsMarkdown(import.meta.env.SOLUTIONS_MD)
      solution = findSolutionForError(solutionsData, validationResult.error || '')
    }
    
    // Create and mount error screen
    const errorApp = createApp(ErrorScreenMobile, {
      title: 'API Configuration Error',
      message: 'Cannot start the application due to API configuration issues.',
      details: validationResult.error,
      solution: solution
    })
    
    errorApp.use(IonicVue)
    errorApp.use(i18n)
    errorApp.mount('#app')
    return
  }

  logger.info(`✅ API Base URL: ${config.apiBaseUrl}`)
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
