import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import config from './config'
import { ErrorScreen } from '@yektayar/shared/components'
import { parseSolutionsMarkdown, findSolutionForError, validateApi, getPackageVersion, missingHandler, installMissingKeyHandler } from '@yektayar/shared'
import { useSessionStore } from './stores/session'
import { logger } from '@yektayar/shared'
import translations from '@yektayar/shared/i18n/translations.json'
import 'overlayscrollbars/overlayscrollbars.css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

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
import './theme/fonts.scss'

/* Theme variables */
import './theme/variables.scss'

// Get version from environment variable
const APP_VERSION = getPackageVersion()

// Log startup information
logger.startup('YektaYar Mobile App', {
  'API URL': config.apiBaseUrl,
  'Environment': import.meta.env.MODE || 'development',
  'Version': APP_VERSION,
  'Platform': 'Ionic/Capacitor'
})

// i18n configuration with missing key handler
const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  missing: missingHandler,
  messages: {
    fa: {
      ...translations.fa,
      app_title: 'یکتایار',
      tagline: 'پلتفرم مراقبت سلامت روان',
      welcome: 'خوش آمدید به یکتایار',
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
        network_solution_1: 'سرور API به نظر می‌رسد غیرفعال یا در دسترس نیست. لطفاً موارد زیر را بررسی کنید:',
        network_step_1: 'مطمئن شوید که سرور API در حال اجرا است (بررسی کنید که روی پورت پیکربندی‌شده در حال گوش دادن باشد)',
        network_step_2: 'تنظیمات فایروال خود را بررسی کنید تا مطمئن شوید اتصال را مسدود نمی‌کند',
        network_step_3: 'اطمینان حاصل کنید که API_BASE_URL در فایل .env با آدرس واقعی سرور مطابقت دارد',
        network_step_4: 'در صورت استفاده از Docker یا VM، اتصال شبکه بین کانتینرها/ماشین‌ها را بررسی کنید',
        cors_solution_1: 'سرور API باید برای پذیرش درخواست‌ها از این برنامه پیکربندی شود. موارد زیر را به فایل .env بک‌اند اضافه کنید:',
        cors_solution_2: 'مطمئن شوید که URL دقیق مبدأ (شامل پورت) که این برنامه روی آن اجرا می‌شود را وارد کرده‌اید، سپس سرور بک‌اند را مجدداً راه‌اندازی کنید.',
        ssl_solution_1: 'مشکلی در گواهی SSL/TLS وجود دارد. این راه‌حل‌ها را امتحان کنید:',
        ssl_step_1: 'در صورت استفاده از HTTPS در محیط توسعه، از HTTP استفاده کنید یا یک گواهی SSL معتبر نصب کنید',
        ssl_step_2: 'بررسی کنید که گواهی‌های ریشه سیستم شما به‌روز هستند',
        ssl_step_3: 'برای گواهی‌های خودامضا، آنها را به مخزن گواهی‌های قابل اعتماد خود اضافه کنید',
        timeout_solution_1: 'اتصال به سرور API با وقفه زمانی مواجه شد. لطفاً موارد زیر را بررسی کنید:',
        timeout_step_1: 'بررسی کنید که سرور API در حال اجرا و پاسخگویی است (ممکن است بارگذاری زیاد یا در حال راه‌اندازی باشد)',
        timeout_step_2: 'اتصال شبکه و تأخیر خود به سرور را بررسی کنید',
        timeout_step_3: 'در صورت استفاده از شبکه کند، سرور ممکن است به زمان بیشتری برای پاسخ نیاز داشته باشد',
        dns_solution_1: 'نمی‌توان نام میزبان سرور را حل کرد. این راه‌حل‌ها را امتحان کنید:',
        dns_step_1: 'نام میزبان در API_BASE_URL را بررسی کنید که صحیح باشد',
        dns_step_2: 'تنظیمات DNS خود را بررسی کنید یا به جای نام میزبان از آدرس IP استفاده کنید',
        dns_step_3: 'در صورتی که سرور از راه دور است، اطمینان حاصل کنید که اتصال اینترنت دارید',
        server_solution_1: 'سرور API یک خطا برگرداند. لطفاً موارد زیر را بررسی کنید:',
        server_step_1: 'لاگ‌های سرور بک‌اند را برای جزئیات خطا بررسی کنید',
        server_step_2: 'اطمینان حاصل کنید که endpoint مسیر /health به درستی در بک‌اند پیکربندی شده است',
        unknown_solution_1: 'یک خطای غیرمنتظره رخ داده است. این مراحل عیب‌یابی عمومی را امتحان کنید:',
        unknown_step_1: 'کنسول مرورگر را برای پیام‌های خطای دقیق بررسی کنید',
        unknown_step_2: 'بررسی کنید که همه متغیرهای محیطی به درستی پیکربندی شده‌اند',
        unknown_step_3: 'سعی کنید هم سرور فرانت‌اند و هم بک‌اند را مجدداً راه‌اندازی کنید',
      },
      welcome_screen: {
        auth_required: 'لطفاً ابتدا وارد حساب کاربری خود شوید',
        request_timeout: 'زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید',
        network_offline: 'اتصال به اینترنت برقرار نیست. لطفاً اتصال خود را بررسی کنید',
        generic_error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید',
        server_error: 'مشکلی در سرور پیش آمده است. لطفاً بعداً تلاش کنید'
      }
    },
    en: {
      ...translations.en,
      app_title: 'YektaYar',
      tagline: 'Mental Health Care Platform',
      welcome: 'Welcome to YektaYar',
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
        network_solution_1: 'The API server appears to be offline or unreachable. Please try the following:',
        network_step_1: 'Verify that the backend API server is running (check if it\'s listening on the configured port)',
        network_step_2: 'Check your firewall settings to ensure it\'s not blocking the connection',
        network_step_3: 'Ensure the API_BASE_URL in your .env file matches the actual server address',
        network_step_4: 'If using Docker or a VM, verify network connectivity between containers/machines',
        cors_solution_1: 'The API server needs to be configured to accept requests from this application. Add the following to your backend .env file:',
        cors_solution_2: 'Make sure to include the exact origin URL (including port) where this application is running, then restart the backend server.',
        ssl_solution_1: 'There is a problem with the SSL/TLS certificate. Try these solutions:',
        ssl_step_1: 'If using HTTPS in development, use HTTP instead or install a valid SSL certificate',
        ssl_step_2: 'Check if your system\'s root certificates are up to date',
        ssl_step_3: 'For self-signed certificates, add them to your trusted certificate store',
        timeout_solution_1: 'The connection to the API server timed out. Please check:',
        timeout_step_1: 'Verify the API server is running and responding (it may be overloaded or starting up)',
        timeout_step_2: 'Check your network connection and latency to the server',
        timeout_step_3: 'If on a slow network, the server may need more time to respond',
        dns_solution_1: 'Cannot resolve the server hostname. Try these solutions:',
        dns_step_1: 'Verify the hostname in API_BASE_URL is correct',
        dns_step_2: 'Check your DNS settings or try using an IP address instead of a hostname',
        dns_step_3: 'Ensure you have internet connectivity if the server is remote',
        server_solution_1: 'The API server returned an error. Please check:',
        server_step_1: 'Check the backend server logs for error details',
        server_step_2: 'Ensure the /health endpoint is properly configured on the backend',
        unknown_solution_1: 'An unexpected error occurred. Try these general troubleshooting steps:',
        unknown_step_1: 'Check the browser console for detailed error messages',
        unknown_step_2: 'Verify all environment variables are correctly configured',
        unknown_step_3: 'Try restarting both the frontend and backend servers',
      },
      welcome_screen: {
        auth_required: 'Please log in first',
        request_timeout: 'Request timed out. Please try again',
        network_offline: 'No internet connection. Please check your connection',
        generic_error: 'An error occurred. Please try again',
        server_error: 'Server error occurred. Please try again later'
      }
    }
  }
})

// Install missing key handler for development
if (import.meta.env.DEV) {
  installMissingKeyHandler()
}

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
      const errorApp = createApp(ErrorScreen, {
        title: 'API Configuration Error',
        message: 'Cannot start the application due to API configuration issues.',
        details: validationResult.error,
        solution: solution,
        errorType: validationResult.errorType
      })
      
      errorApp.use(IonicVue)
      errorApp.use(i18n)
      
      // Add back button handler for error screen
      errorApp.mixin({
        async mounted() {
          // Only add listener once at root level
          if (this.$el?.id === 'app') {
            try {
              const { App } = await import('@capacitor/app')
              const { Capacitor } = await import('@capacitor/core')
              const { Toast } = await import('@capacitor/toast')
              
              if (Capacitor.isNativePlatform()) {
                logger.info('✅ Registering back button listener for ErrorScreen')
                await App.addListener('backButton', async (event) => {
                  logger.info('🔙 Back button pressed on error screen - exiting app', event)
                  
                  // Show toast for debugging
                  try {
                    await Toast.show({
                      text: 'Back pressed on error screen - exiting...',
                      duration: 'short',
                      position: 'bottom'
                    })
                  } catch (toastError) {
                    logger.warn('Toast not available:', toastError)
                  }
                  
                  // Small delay to show toast
                  setTimeout(async () => {
                    try {
                      const BackButton = (await import('./plugins/backButton')).default
                      await BackButton.exitApp()
                    } catch (error) {
                      logger.error('Failed to exit app:', error)
                    }
                  }, 300)
                })
                logger.info('✅ Back button listener registered for ErrorScreen')
              }
            } catch (error) {
              logger.error('❌ Failed to register back button for ErrorScreen:', error)
            }
          }
        }
      })
      
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
  
  // Register OverlayScrollbars component globally
  app.component('OverlayScrollbarsComponent', OverlayScrollbarsComponent)

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
