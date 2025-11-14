<template>
  <ion-page>
    <ion-content class="splash-content" :fullscreen="true">
      <div class="splash-container">
        <!-- Logo -->
        <div class="logo-container" :class="{ 'fade-in': fontsLoaded }">
          <div class="logo-circle">
            <img src="/logo-simple.svg" alt="YektaYar Logo" class="logo-svg" />
          </div>
          <h1 class="app-title">یکتایار</h1>
          <p class="app-subtitle">همراه شما در مسیر سلامت روان</p>
          <p class="app-tagline">«تا خانواده با عشق و آرامش پابرجا بماند»</p>
          <p class="app-version">
            YektaYar v{{ appVersion }}{{ apiVersion ? ` – API v${apiVersion}` : '' }}
          </p>
        </div>

        <!-- Loading indicator -->
        <div class="loading-container" :class="{ 'fade-in': fontsLoaded }">
          <ion-spinner v-if="isConnecting" name="crescent" color="primary"></ion-spinner>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-else-if="isConnecting" class="loading-text">در حال آماده‌سازی...</p>
          
          <!-- Action buttons -->
          <div v-if="showActionButtons" class="action-buttons">
            <ion-button 
              expand="block" 
              color="primary" 
              @click="handleRetry"
              class="retry-button"
            >
              تلاش مجدد
            </ion-button>
            <ion-button 
              v-if="showCancelButton"
              expand="block" 
              fill="outline"
              color="light"
              @click="handleCancel"
              class="cancel-button"
            >
              لغو
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner, IonButton } from '@ionic/vue'
import { useSessionStore } from '../stores/session'
import { logger } from '@yektayar/shared'

const router = useRouter()
const sessionStore = useSessionStore()
const errorMessage = ref<string>('')
const fontsLoaded = ref<boolean>(false)
const appVersion = ref<string>('0.1.0')
const apiVersion = ref<string>('')
const isConnecting = ref<boolean>(true)
const showActionButtons = ref<boolean>(false)
const showCancelButton = ref<boolean>(false)
const autoRetryEnabled = ref<boolean>(true)
const retryTimeoutId = ref<number | null>(null)
const cancelTimeoutId = ref<number | null>(null)

// Wait for fonts to load before displaying content
const checkFontsLoaded = async () => {
  try {
    // Check if IranNastaliq font is loaded
    await document.fonts.load('1em IranNastaliq')
    await document.fonts.load('1em Sahel')
    fontsLoaded.value = true
  } catch (error) {
    // If font loading fails, still show content after timeout
    logger.warn('Font loading check failed, continuing anyway:', error)
    setTimeout(() => {
      fontsLoaded.value = true
    }, 500)
  }
}

// Clear all timeouts
const clearTimeouts = () => {
  if (retryTimeoutId.value) {
    clearTimeout(retryTimeoutId.value)
    retryTimeoutId.value = null
  }
  if (cancelTimeoutId.value) {
    clearTimeout(cancelTimeoutId.value)
    cancelTimeoutId.value = null
  }
}

// Handle manual retry
const handleRetry = async () => {
  logger.info('Manual retry triggered by user')
  clearTimeouts()
  showActionButtons.value = false
  showCancelButton.value = false
  isConnecting.value = true
  errorMessage.value = ''
  await attemptConnection()
}

// Handle cancel - stops auto-retry
const handleCancel = () => {
  logger.info('Connection attempt cancelled by user')
  clearTimeouts()
  autoRetryEnabled.value = false
  showCancelButton.value = false
  isConnecting.value = false
}

// Attempt to connect/acquire session
const attemptConnection = async () => {
  const WELCOME_SHOWN_KEY = 'yektayar_welcome_shown'
  
  try {
    isConnecting.value = true
    // Attempt to acquire or restore session
    await sessionStore.acquireSession()
    
    // Fetch API version from backend
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/`)
      if (response.ok) {
        const data = await response.json()
        apiVersion.value = data.version || '0.1.0'
      }
    } catch (versionError) {
      logger.warn('Could not fetch API version:', versionError)
    }
    
    // Check if welcome screen has been shown
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY) === 'true'
    
    // If successful, navigate to appropriate screen after a brief delay (for UX)
    setTimeout(() => {
      if (welcomeShown) {
        logger.info('Welcome screen already shown, skipping to home')
        router.replace('/tabs/home')
      } else {
        logger.info('First time user, showing welcome screen')
        router.replace('/welcome')
      }
    }, 2000)
  } catch (error: any) {
    logger.error('Failed to acquire session:', error)
    isConnecting.value = false
    
    // Check if error has a specific message from backend
    const backendMessage = error?.message || error?.error
    
    // Check if backend disabled auto-retry
    const disableAutoRetry = error?.disableAutoRetry === true
    if (disableAutoRetry) {
      autoRetryEnabled.value = false
      logger.info('Auto-retry disabled by backend')
    }
    
    if (backendMessage && typeof backendMessage === 'string') {
      errorMessage.value = backendMessage
    } else {
      errorMessage.value = 'خطا در برقراری ارتباط. لطفاً مجدداً تلاش کنید.'
    }
    
    // Schedule cancel button to appear after 15 seconds
    cancelTimeoutId.value = window.setTimeout(() => {
      if (isConnecting.value) {
        showCancelButton.value = true
      }
    }, 15000)
    
    // Retry automatically if enabled
    if (autoRetryEnabled.value) {
      retryTimeoutId.value = window.setTimeout(async () => {
        errorMessage.value = ''
        try {
          await sessionStore.acquireSession()
          const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY) === 'true'
          router.replace(welcomeShown ? '/tabs/home' : '/welcome')
        } catch (retryError: any) {
          isConnecting.value = false
          const retryBackendMessage = retryError?.message || retryError?.error
          
          // Check if backend disabled auto-retry on second attempt
          if (retryError?.disableAutoRetry === true) {
            autoRetryEnabled.value = false
          }
          
          if (retryBackendMessage && typeof retryBackendMessage === 'string') {
            errorMessage.value = retryBackendMessage
          } else {
            errorMessage.value = 'امکان برقراری ارتباط وجود ندارد.'
          }
          
          // Show action buttons after failed retry
          showActionButtons.value = true
        }
      }, 3000)
    } else {
      // Auto-retry disabled, show action buttons immediately
      showActionButtons.value = true
    }
  }
}

onMounted(async () => {
  // Load fonts first
  await checkFontsLoaded()
  await attemptConnection()
})

onUnmounted(() => {
  clearTimeouts()
})
</script>

<style scoped>
.splash-content {
  /* YektaYar Navy Seal gradient background */
  --background: linear-gradient(135deg, #01183a 0%, #012952 50%, #01183a 100%);
}

.splash-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
}

.logo-container {
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.logo-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-circle {
  width: 140px;
  height: 140px;
  background: rgba(212, 164, 62, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(212, 164, 62, 0.3);
  animation: pulse-gold 2.5s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(212, 164, 62, 0.2);
}

.logo-svg {
  width: 90px;
  height: 90px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4a43e;
  margin: 0 0 0.5rem;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

.app-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 1rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-tagline {
  font-family: 'IranNastaliq', 'Sahel', serif;
  font-size: 1.3rem;
  color: #d4a43e;
  margin: 0.8rem 0 1.2rem;
  font-weight: normal;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(212, 164, 62, 0.3);
  line-height: 1.8;
  animation: shimmer 3s ease-in-out infinite;
}

.app-version {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 0;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.loading-container {
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s;
}

.loading-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.loading-text {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.error-message {
  margin-top: 1rem;
  color: #ffd54f;
  font-size: 0.95rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.action-buttons {
  margin-top: 2rem;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.retry-button {
  --background: #d4a43e;
  --background-hover: #c99433;
  --background-activated: #b8842d;
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  --box-shadow: 0 4px 12px rgba(212, 164, 62, 0.3);
  font-weight: 600;
  font-size: 1rem;
  text-transform: none;
}

.cancel-button {
  --border-color: rgba(255, 255, 255, 0.3);
  --color: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 500;
  font-size: 0.95rem;
  text-transform: none;
}

ion-spinner {
  transform: scale(1.5);
  --color: #d4a43e;
}

@keyframes pulse-gold {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(212, 164, 62, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 32px rgba(212, 164, 62, 0.4), 0 0 0 15px rgba(212, 164, 62, 0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes glow {
  from {
    text-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(212, 164, 62, 0.3);
  }
  to {
    text-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(212, 164, 62, 0.6),
      0 0 30px rgba(212, 164, 62, 0.4);
  }
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
