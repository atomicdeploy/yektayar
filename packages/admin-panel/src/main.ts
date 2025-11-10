import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// i18n configuration
const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  messages: {
    fa: {
      welcome: 'خوش آمدید به یکتاکر',
      admin_panel: 'پنل مدیریت'
    },
    en: {
      welcome: 'Welcome to YektaYar',
      admin_panel: 'Admin Panel'
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
