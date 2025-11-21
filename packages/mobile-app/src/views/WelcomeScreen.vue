<template>
  <ion-page>
    <ion-content :fullscreen="true" class="welcome-content" :scroll-y="true">
      <div class="welcome-container">
        <!-- Decorative background elements -->
        <div class="bg-decoration bg-decoration-1"></div>
        <div class="bg-decoration bg-decoration-2"></div>
        
        <!-- Header with Title and Logo -->
        <div class="welcome-header">
          <div class="logo-accent">
            <!-- <ion-icon name="yektayar" :icon="yektayar" class="yektayar-icon"></ion-icon> -->
            <img src="/logo-simple.svg" alt="YektaYar Logo" class="yektayar-icon" />
          </div>
          <h1 class="welcome-title">خوش آمدید!</h1>
          <div class="title-underline"></div>
        </div>

        <!-- Hero Image with Lazy Loading (ABOVE text as requested) -->
        <div class="hero-image-container">
          <LazyImage
            src="/welcome-hero.jpg"
            :srcset="`/welcome-hero.jpg 1x, /welcome-hero@2x.jpg 2x, /welcome-hero@3x.jpg 3x`"
            :webp-srcset="`/welcome-hero.webp 1x, /welcome-hero@2x.webp 2x, /welcome-hero@3x.webp 3x`"
            alt="خانواده شاد - یکتایار"
            image-class="hero-image"
            loading="eager"
            @error="onImageError"
          />
          <div class="image-overlay"></div>
        </div>

        <!-- Welcome Text Content with Card Style -->
        <div class="welcome-text">
          <p class="welcome-paragraph highlight-first">
            به <strong>یکتایار</strong> خوش اومدی؛ جایی که دیگه لازم نیست مشکلاتت رو توی دلت نگه داری.
            اینجا خیلی راحت میتونی حرف بزنی، احساساتت رو بگی و دغدغههات رو مطرح کنی و فوراً یک نقشه مسیر علمی برای حل مشکلاتت بگیری.
          </p>
          <p class="welcome-paragraph">
            در یکتایار، دیگه خبری از سردرگمی و اتلاف وقت نیست؛ فوراً در مسیرِ درستِ حل مشکلاتت قرار می‌گیری، در کنارش سریع‌ترین راه برای دریافت وقت جلسات مشاوره جلوی پای تو هست و مطمئن می‌شی که همیشه یه تیم پشتیبان هم کنارت هست.
          </p>
          <p class="welcome-paragraph">
            از مشاوره و روان‌درمانی فردی گرفته تا زوج‌درمانی و خانواده درمانی ، همه‌چی اینجا آمادست تا هر چه سریع‌تر، <u>آرامش</u>، <u>امنیت</u> و <u>حال خوب</u> به زندگیت بیاد.
          </p>
          <p class="welcome-paragraph">
            فقط کافیه رو دکمه شروع  گفتگو بزنی و ببینی چطور همهچیز یکییکی سر جاش قرار میگیره.
          </p>
        </div>

        <!-- CTA Button with Enhanced Design -->
        <ion-button 
          expand="block" 
          size="large" 
          color="success"
          class="cta-button"
          @click="startApp"
        >
          <span class="button-content">
            <span class="button-icon">🚀</span>
            <span class="button-text">شروع گفتگو</span>
          </span>
        </ion-button>

        <!-- Disclaimer with Icon -->
        <div class="disclaimer-container">
          <ion-icon :icon="lockClosedOutline" class="disclaimer-icon"></ion-icon>
          <p class="disclaimer-text">
            اطلاعات شما محرمّانه است، و تنها برای کمک به شما استفاده میشود.
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { lockClosedOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { logger } from '@yektayar/shared'
import apiClient from '@/api'
import LazyImage from '@/components/LazyImage.vue'

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

const onImageError = () => {
  logger.warn('Welcome hero image failed to load')
}
</script>

<style scoped>
.welcome-content {
  --background: linear-gradient(135deg, 
    #f8f9fa 0%, 
    #fff 20%, 
    #f0f4f8 80%, 
    #e9ecef 100%
  );
  position: relative;
  overflow: hidden;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 3rem 1.5rem 2rem;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Decorative background elements */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  z-index: 0;
  pointer-events: none;
}

.bg-decoration-1 {
  width: 300px;
  height: 300px;
  background: #d4a43e;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.bg-decoration-2 {
  width: 200px;
  height: 200px;
  background: #01183a;
  bottom: 100px;
  left: -50px;
  animation: float 8s ease-in-out infinite reverse;
}

/* Header styling */
.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.logo-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: linear-gradient(135deg, #d4a43e 0%, #c99433 100%);
  box-shadow: 0 4px 20px rgba(212, 164, 62, 0.3);
  margin: 0 auto 1rem;
  animation: scaleIn 0.5s ease-out;
}

.yektayar-icon {
  width: 50px;
  height: 50px;
  padding: 10px;
  filter: brightness(0) invert(1);
  animation: heartbeat 2s ease-in-out infinite;
}

.welcome-title {
  font-size: 2.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #d4a43e 0%, #c99433 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 2px 8px rgba(212, 164, 62, 0.1);
  animation: fadeInDown 0.6s ease-out;
  letter-spacing: -0.5px;
}

.title-underline {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #d4a43e, transparent);
  margin: 0 auto;
  border-radius: 2px;
  animation: expandWidth 0.8s ease-out 0.3s both;
}

/* Hero image styling */
.hero-image-container {
  width: 100%;
  margin: 2rem 0;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: fadeInUp 0.8s ease-out 0.3s both;
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 280px;
}

.hero-image-container :deep(.lazy-image) {
  border-radius: 28px;
}

.hero-image-container:hover :deep(.lazy-image) {
  /* transform: scale(1.02); */
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(1, 24, 58, 0) 0%,
    rgba(1, 24, 58, 0.02) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Text content styling */
.welcome-text {
  text-align: right;
  direction: rtl;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(212, 164, 62, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease-out 0.5s both;
}

.welcome-paragraph {
  font-size: 1.05rem;
  line-height: 2;
  color: #2c3e50;
  margin: 0 0 1.25rem 0;
  font-weight: 400;
}

.welcome-paragraph:last-child {
  margin-bottom: 0;
}

.welcome-paragraph.highlight-first {
  font-size: 1.1rem;
  font-weight: 500;
  color: #01183a;
}

/* CTA Button styling */
.cta-button {
  --border-radius: 20px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  --box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
  margin: 2.5rem 0 1.5rem 0;
  text-transform: none;
  animation: fadeInUp 0.8s ease-out 0.6s both;
  font-size: 1.3rem;
  font-weight: 700;
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.cta-button:hover::before {
  width: 300px;
  height: 300px;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.button-icon {
  font-size: 1.4rem;
  animation: bounce 2s ease-in-out infinite;
}

.button-text {
  font-size: 1.3rem;
}

/* Disclaimer styling */
.disclaimer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(108, 117, 125, 0.08);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  animation: fadeIn 0.8s ease-out 0.8s both;
  border: 1px solid rgba(108, 117, 125, 0.1);
}

.disclaimer-icon {
  font-size: 1.1rem;
  color: #6c757d;
  flex-shrink: 0;
}

.disclaimer-text {
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
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
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .welcome-content {
    --background: linear-gradient(135deg, 
      #0f1419 0%, 
      #1a1f2e 20%,
      #16213e 80%, 
      #0f1419 100%
    );
  }

  .bg-decoration-1 {
    background: #d4a43e;
    opacity: 0.03;
  }

  .bg-decoration-2 {
    background: #fff;
    opacity: 0.02;
  }

  .welcome-text {
    background: rgba(26, 31, 46, 0.6);
    border-color: rgba(212, 164, 62, 0.15);
  }

  .welcome-paragraph {
    color: #e9ecef;
  }

  .welcome-paragraph.highlight-first {
    color: #fff;
  }

  .hero-image-container {
    background: linear-gradient(135deg, #1a1f2e 0%, #16213e 100%);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .image-overlay {
    background: linear-gradient(
      180deg,
      rgba(1, 24, 58, 0.1) 0%,
      rgba(1, 24, 58, 0.3) 100%
    );
  }

  .disclaimer-container {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .disclaimer-text {
    color: #adb5bd;
  }

  .disclaimer-icon {
    color: #adb5bd;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .welcome-container {
    padding: 2rem 1.25rem 1.5rem;
  }

  .welcome-title {
    font-size: 2.25rem;
  }

  .welcome-paragraph {
    font-size: 1rem;
    line-height: 1.9;
  }

  .welcome-paragraph.highlight-first {
    font-size: 1.05rem;
  }

  .hero-image {
    max-height: 350px;
  }

  .cta-button {
    font-size: 1.2rem;
  }

  .button-text {
    font-size: 1.2rem;
  }
}

@media (max-width: 375px) {
  .welcome-container {
    padding: 1.5rem 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .logo-accent {
    width: 50px;
    height: 50px;
  }

  .heart-icon {
    font-size: 26px;
  }

  .welcome-text {
    padding: 1.25rem;
  }

  .welcome-paragraph {
    font-size: 0.95rem;
  }

  .welcome-paragraph.highlight-first {
    font-size: 1rem;
  }

  .hero-image {
    max-height: 300px;
  }

  .cta-button {
    font-size: 1.1rem;
  }

  .button-text {
    font-size: 1.1rem;
  }

  .button-icon {
    font-size: 1.2rem;
  }

  .disclaimer-text {
    font-size: 0.85rem;
  }
}
</style>
