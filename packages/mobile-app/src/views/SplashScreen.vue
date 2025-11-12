<template>
  <ion-page>
    <ion-content class="splash-content" :fullscreen="true">
      <div class="splash-container">
        <!-- Logo -->
        <div class="logo-container">
          <div class="logo-circle">
            <ion-icon :icon="heart" class="logo-icon"></ion-icon>
          </div>
          <h1 class="app-title">یکتایار</h1>
          <p class="app-subtitle">همراه شما در مسیر سلامت روان</p>
        </div>

        <!-- Loading indicator -->
        <div class="loading-container">
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
import { IonPage, IonContent, IonSpinner, IonIcon } from '@ionic/vue'
import { heart } from 'ionicons/icons'
import { useSessionStore } from '../stores/session'
import { logger } from '@yektayar/shared'

const router = useRouter()
const sessionStore = useSessionStore()
const errorMessage = ref<string>('')

onMounted(async () => {
  try {
    // Attempt to acquire or restore session
    await sessionStore.acquireSession()
    
    // If successful, navigate to main app after a brief delay (for UX)
    setTimeout(() => {
      router.replace('/tabs/home')
    }, 1500)
  } catch (error: any) {
    logger.error('Failed to acquire session:', error)
    errorMessage.value = 'خطا در برقراری ارتباط. لطفاً مجدداً تلاش کنید.'
    
    // Retry after 3 seconds
    setTimeout(async () => {
      errorMessage.value = ''
      try {
        await sessionStore.acquireSession()
        router.replace('/tabs/home')
      } catch (retryError) {
        errorMessage.value = 'امکان برقراری ارتباط وجود ندارد.'
      }
    }, 3000)
  }
})
</script>

<style scoped>
.splash-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.logo-icon {
  font-size: 60px;
  color: white;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
}

.loading-container {
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.error-message {
  margin-top: 1rem;
  color: #ffeb3b;
  font-size: 0.95rem;
  font-weight: 500;
}

ion-spinner {
  transform: scale(1.5);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
}
</style>
