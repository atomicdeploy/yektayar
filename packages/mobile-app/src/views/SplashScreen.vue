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
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-else class="loading-text">در حال آماده‌سازی...</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { useSessionStore } from '../stores/session'
import { logger } from '@yektayar/shared'

const router = useRouter()
const sessionStore = useSessionStore()
const errorMessage = ref<string>('')
const fontsLoaded = ref<boolean>(false)
const appVersion = ref<string>('0.1.0')
const apiVersion = ref<string>('')

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

onMounted(async () => {
  // Load fonts first
  await checkFontsLoaded()
  
  try {
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
    
    // If successful, navigate to welcome screen after a brief delay (for UX)
    setTimeout(() => {
      router.replace('/welcome')
    }, 2000)
  } catch (error: any) {
    logger.error('Failed to acquire session:', error)
    errorMessage.value = 'خطا در برقراری ارتباط. لطفاً مجدداً تلاش کنید.'
    
    // Retry after 3 seconds
    setTimeout(async () => {
      errorMessage.value = ''
      try {
        await sessionStore.acquireSession()
        router.replace('/welcome')
      } catch (retryError) {
        errorMessage.value = 'امکان برقراری ارتباط وجود ندارد.'
      }
    }, 3000)
  }
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
