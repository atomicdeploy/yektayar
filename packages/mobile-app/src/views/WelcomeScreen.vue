<template>
  <ion-page>
    <ion-content :fullscreen="true" class="welcome-content">
      <div class="welcome-container">
        <!-- Header with Title -->
        <div class="welcome-header">
          <h1 class="welcome-title">خوش آمدید!</h1>
        </div>

        <!-- Welcome Text Content -->
        <div class="welcome-text">
          <p class="welcome-paragraph">
            به یکتاکر خوش اومدی؛ جایی که دیگه لازم نیست مشکلاتت رو توی دلت نگه داری. اینجا خیلی راحت میتونی حرف بزنی، احساساتت رو بگی و دغدغههات رو مطرح کنی. همون لحظه میفهمی باید پیش کدوم مشاور یا تراپیست بری و وقت بگیری.
          </p>
          <p class="welcome-paragraph">
            یکتاکر مسیر رو برات کوتاه کرده؛ دیگه خبری از سردرگمی و اتلاف وقت نیست. سریعترین راه برای گرفتن وقت مشاوره جلوی پاته و مطمئن میشی که همیشه یه تیم پشتیبان کنارت هست.
          </p>
          <p class="welcome-paragraph">
            از مشاوره فردی گرفته تا زوجدرمانی و خانواده، همهچی توی یکتاکر آمادهست تا آرامش، امنیت و حال خوب دوباره برگرده به زندگیت.
          </p>
          <p class="welcome-paragraph">
            با یکتاکر، انتخاب درست همیشه دم دستته؛ فقط کافیه شروع کنی و ببینی چطور همهچیز یکییکی سر جاش قرار میگیره.
          </p>
        </div>

        <!-- Hero Image -->
        <div class="hero-image-container">
          <img 
            src="/welcome-hero.jpg" 
            alt="خانواده شاد" 
            class="hero-image"
            @error="onImageError"
          />
        </div>

        <!-- CTA Button -->
        <ion-button 
          expand="block" 
          size="large" 
          color="success"
          class="cta-button"
          @click="startApp"
        >
          🔘 شروع کنید
        </ion-button>

        <!-- Disclaimer -->
        <p class="disclaimer-text">
          اطلاعات شما محرمّانه است، و تنها برای کمک به شما استفاده میشود.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { logger } from '@yektayar/shared'
import apiClient from '@/api'

const router = useRouter()

const WELCOME_SHOWN_KEY = 'yektayar_welcome_shown'

const startApp = async () => {
  logger.info('User started the app from welcome screen')
  
  // Mark welcome screen as shown in localStorage
  localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
  
  // Also mark on backend if user is authenticated
  try {
    await apiClient.post('/api/users/preferences', {
      welcomeScreenShown: true
    })
    logger.info('Welcome screen preference saved to backend')
  } catch (error) {
    // If backend call fails, it's okay - localStorage will handle it
    logger.warn('Failed to save welcome preference to backend:', error)
  }
  
  router.replace('/tabs/home')
}

const onImageError = (event: Event) => {
  // If image fails to load, hide it gracefully
  logger.warn('Welcome hero image failed to load')
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<style scoped>
.welcome-content {
  --background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.welcome-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 2rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.welcome-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4a43e;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeInDown 0.6s ease-out;
}

.welcome-text {
  text-align: right;
  direction: rtl;
  margin-bottom: 2rem;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.welcome-paragraph {
  font-size: 1rem;
  line-height: 1.8;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 400;
}

.hero-image-container {
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 400px;
}

.cta-button {
  --border-radius: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
  text-transform: none;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.disclaimer-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 1rem 0 0 0;
  padding: 0 1rem;
  animation: fadeIn 0.8s ease-out 0.8s both;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .welcome-content {
    --background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .welcome-paragraph {
    color: #e9ecef;
  }

  .disclaimer-text {
    color: #adb5bd;
  }
}

/* Responsive adjustments */
@media (max-width: 375px) {
  .welcome-container {
    padding: 1.5rem 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-paragraph {
    font-size: 0.95rem;
  }

  .cta-button {
    font-size: 1.1rem;
  }
}
</style>
