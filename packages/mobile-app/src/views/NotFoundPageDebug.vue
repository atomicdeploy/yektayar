<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="not-found-container-debug">
        <div class="not-found-content">
          <div class="error-animation">
            <div class="number-wrapper">
              <span class="number">4</span>
              <div class="phone-icon">
                <div class="phone-screen">
                  <div class="sad-face">:(</div>
                </div>
              </div>
              <span class="number">4</span>
            </div>
          </div>
          
          <h1 class="error-title">{{ locale === 'fa' ? 'صفحه یافت نشد' : 'Page Not Found' }}</h1>
          <p class="error-message">
            {{ locale === 'fa' 
              ? 'اوه! به نظر می‌رسد صفحه‌ای که به دنبال آن هستید گم شده است.'
              : 'Oops! The page you\'re looking for seems to have wandered off.' 
            }}
          </p>
          
          <div class="error-details">
            <p class="path-info">
              <strong>{{ locale === 'fa' ? 'مسیر درخواستی:' : 'Requested path:' }}</strong> {{ currentPath }}
            </p>
            <p class="path-info">
              <strong>{{ locale === 'fa' ? 'زمان:' : 'Timestamp:' }}</strong> {{ timestamp }}
            </p>
          </div>
          
          <div class="actions">
            <button class="primary-button" @click="goHome">
              <span class="icon">🏠</span>
              {{ locale === 'fa' ? 'بازگشت به خانه' : 'Go Home' }}
            </button>
            <button class="secondary-button" @click="goBack">
              <span class="icon">←</span>
              {{ locale === 'fa' ? 'بازگشت' : 'Go Back' }}
            </button>
          </div>
          
          <div class="suggestions">
            <p class="suggestions-title">{{ locale === 'fa' ? 'چه کار می‌توانید بکنید؟' : 'What can you do?' }}</p>
            <ul>
              <li>{{ locale === 'fa' ? 'URL را برای اشتباه تایپی بررسی کنید' : 'Check the URL for typos' }}</li>
              <li>{{ locale === 'fa' ? 'به صفحه اصلی بازگردید' : 'Return to the home page' }}</li>
              <li>{{ locale === 'fa' ? 'از منوی ناوبری استفاده کنید' : 'Use the navigation menu' }}</li>
              <li>{{ locale === 'fa' ? 'اگر فکر می‌کنید این یک خطاست، با پشتیبانی تماس بگیرید' : 'Contact support if you believe this is an error' }}</li>
            </ul>
          </div>

          <div class="debug-section">
            <button class="debug-button" @click="copyDebugInfo">
              <span class="icon">📋</span>
              {{ locale === 'fa' ? 'کپی اطلاعات اشکال‌زدایی' : 'Copy Debug Info' }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent } from '@ionic/vue'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()

const currentPath = computed(() => route.path)
const timestamp = computed(() => new Date().toLocaleString(locale.value === 'fa' ? 'fa-IR' : 'en-US'))

const goHome = () => {
  router.push('/tabs/home')
}

const goBack = () => {
  router.back()
}

const copyDebugInfo = () => {
  const debugInfo = `
404 Error - Mobile App
=====================
Path: ${currentPath.value}
Full Path: ${route.fullPath}
Timestamp: ${timestamp.value}
User Agent: ${navigator.userAgent}
Referrer: ${document.referrer || 'Direct access'}
  `.trim()
  
  navigator.clipboard.writeText(debugInfo).then(() => {
    alert(locale.value === 'fa' ? 'اطلاعات اشکال‌زدایی کپی شد!' : 'Debug info copied!')
  })
}
</script>

<style scoped>
.not-found-container-debug {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.not-found-content {
  background: white;
  border-radius: 24px;
  padding: 2.5rem 1.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-animation {
  margin-bottom: 1.5rem;
}

.number-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.number {
  font-size: 5rem;
  font-weight: 900;
  color: #667eea;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.phone-icon {
  width: 80px;
  height: 120px;
  background: #667eea;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: wobble 3s ease-in-out infinite;
  position: relative;
}

@keyframes wobble {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.phone-screen {
  width: 70px;
  height: 100px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sad-face {
  font-size: 2.5rem;
  color: #667eea;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.75rem;
}

.error-message {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.error-details {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.path-info {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0.5rem 0;
  word-break: break-all;
}

.path-info strong {
  color: #2d3748;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.primary-button:active {
  transform: scale(0.95);
}

.secondary-button {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.secondary-button:active {
  transform: scale(0.95);
  background: #f7fafc;
}

.icon {
  font-size: 1.25rem;
}

.suggestions {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: left;
  margin-bottom: 1rem;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.75rem;
}

.suggestions ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.suggestions li {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.debug-section {
  margin-top: 1rem;
}

.debug-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #edf2f7;
  color: #2d3748;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.debug-button:active {
  transform: scale(0.95);
  background: #e2e8f0;
}

@media (max-width: 420px) {
  .number {
    font-size: 4rem;
  }
  
  .phone-icon {
    width: 60px;
    height: 90px;
  }
  
  .phone-screen {
    width: 52px;
    height: 75px;
  }
  
  .sad-face {
    font-size: 2rem;
  }
}
</style>
