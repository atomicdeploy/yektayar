<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ t('app_title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleTheme">
            <ion-icon :icon="isDark ? sunny : moon" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t('app_title') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <OverlayScrollbarsComponent
        class="scrollable-content"
        :options="{
          scrollbars: {
            theme: 'os-theme-yektayar-mobile',
            visibility: 'auto',
            autoHide: 'scroll',
            autoHideDelay: 1300
          }
        }"
        defer
      >
        <div class="content-wrapper">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="logo-container">
            <div class="logo-circle">
              <ion-icon name="yektayar" class="hero-icon"></ion-icon>
            </div>
          </div>
          <h1 class="hero-title">{{ t('welcome') }}</h1>
          <p class="hero-subtitle">{{ locale === 'fa' ? 'همراه شما در مسیر سلامت روان' : 'Your companion on the path to mental wellness' }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">{{ locale === 'fa' ? 'دسترسی سریع' : 'Quick Actions' }}</h2>
        <div class="quick-actions">
          <div class="action-card" @click="navigateToAIChat">
            <div class="action-icon-wrapper ai">
              <ion-icon :icon="sparkles" class="action-icon"></ion-icon>
            </div>
            <div class="action-content">
              <h3>{{ locale === 'fa' ? 'مشاور هوشمند' : 'AI Counselor' }}</h3>
              <p>{{ locale === 'fa' ? 'گفتگو با هوشمند' : 'Chat with AI assistant' }}</p>
            </div>
            <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
          </div>

          <div class="action-card" @click="navigateToChat">
            <div class="action-icon-wrapper secondary">
              <ion-icon :icon="chatbubbles" class="action-icon"></ion-icon>
            </div>
            <div class="action-content">
              <h3>{{ locale === 'fa' ? 'گفتگو با مشاور' : 'Chat with Counselor' }}</h3>
              <p>{{ locale === 'fa' ? 'شروع مکالمه آنی' : 'Start instant conversation' }}</p>
            </div>
            <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
          </div>

          <div class="action-card" @click="navigateToAppointments">
            <div class="action-icon-wrapper success">
              <ion-icon :icon="calendar" class="action-icon"></ion-icon>
            </div>
            <div class="action-content">
              <h3>{{ locale === 'fa' ? 'رزرو نوبت' : 'Book Appointment' }}</h3>
              <p>{{ locale === 'fa' ? 'برنامه‌ریزی جلسات' : 'Schedule your sessions' }}</p>
            </div>
            <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
          </div>

          <div class="action-card" @click="navigateToProfile">
            <div class="action-icon-wrapper warning">
              <ion-icon :icon="person" class="action-icon"></ion-icon>
            </div>
            <div class="action-content">
              <h3>{{ locale === 'fa' ? 'پروفایل من' : 'My Profile' }}</h3>
              <p>{{ locale === 'fa' ? 'مدیریت اطلاعات شخصی' : 'Manage your information' }}</p>
            </div>
            <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="section">
        <h2 class="section-title">{{ locale === 'fa' ? 'خدمات ما' : 'Our Services' }}</h2>
        <div class="features-grid">
          <ion-card class="feature-card">
            <div class="feature-icon">
              <ion-icon :icon="notifications"></ion-icon>
            </div>
            <ion-card-header>
              <ion-card-title>{{ locale === 'fa' ? 'یادآوری‌های هوشمند' : 'Smart Reminders' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              {{ locale === 'fa' ? 'یادآوری خودکار برای جلسات و مراقبت از خود' : 'Automatic reminders for sessions and self-care' }}
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <div class="feature-icon">
              <ion-icon :icon="statsChart"></ion-icon>
            </div>
            <ion-card-header>
              <ion-card-title>{{ locale === 'fa' ? 'پیگیری پیشرفت' : 'Progress Tracking' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              {{ locale === 'fa' ? 'مشاهده پیشرفت و دستاوردهای خود' : 'View your progress and achievements' }}
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <div class="feature-icon">
              <ion-icon :icon="shield"></ion-icon>
            </div>
            <ion-card-header>
              <ion-card-title>{{ locale === 'fa' ? 'محرمانگی کامل' : 'Complete Privacy' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              {{ locale === 'fa' ? 'اطلاعات شما با امنیت بالا محافظت می‌شود' : 'Your information is protected with high security' }}
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <div class="feature-icon">
              <ion-icon :icon="people"></ion-icon>
            </div>
            <ion-card-header>
              <ion-card-title>{{ locale === 'fa' ? 'متخصصین مجرب' : 'Expert Professionals' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              {{ locale === 'fa' ? 'دسترسی به روانشناسان و مشاوران حرفه‌ای' : 'Access to professional psychologists and counselors' }}
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Wellness Quote -->
      <div class="wellness-card">
        <div class="quote-icon">
          <ion-icon :icon="sparkles"></ion-icon>
        </div>
        <p class="wellness-quote">
          {{ locale === 'fa' 
            ? '«سلامت روان، پایه و اساس زندگی شادی و معنادار است»' 
            : '"Mental health is the foundation of a happy and meaningful life"' }}
        </p>
      </div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonButtons,
} from '@ionic/vue'
import { 
  chatbubbles, 
  calendar, 
  person, 
  chevronForward,
  notifications,
  statsChart,
  shield,
  people,
  sparkles,
  moon,
  sunny,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const { t, locale } = useI18n()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const navigateToAIChat = () => router.push('/tabs/chat/ai')
const navigateToChat = () => router.push('/tabs/chat')
const navigateToAppointments = () => router.push('/tabs/appointments')
const navigateToProfile = () => router.push('/tabs/profile')
</script>

<style scoped>
/* OverlayScrollbars container */
.scrollable-content {
  height: 100%;
  width: 100%;
}

.content-wrapper {
  min-height: 100%;
}

/* Hero Section */
.hero-section {
  background: var(--accent-gradient);
  padding: 3rem 1.5rem 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.logo-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.logo-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
}

.hero-icon {
  font-size: 48px;
  color: white;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 300;
}

/* Sections */
.section {
  padding: 1.5rem 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0.5rem;
  color: var(--secondary-accent);
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0.5rem;
  bottom: 0;
  width: 60px;
  height: 3px;
  background: var(--secondary-gradient);
  border-radius: 2px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-card {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--card-shadow);
  border-left: 3px solid var(--secondary-accent-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-left-color: var(--secondary-accent);
  box-shadow: var(--card-shadow-hover), var(--secondary-glow);
}

.action-card:active {
  transform: scale(0.98);
}

.action-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon-wrapper.primary {
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
}

.action-icon-wrapper.secondary {
  background: var(--secondary-gradient);
  box-shadow: var(--secondary-glow);
}

.action-icon-wrapper.success {
  background: linear-gradient(135deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
}

.action-icon-wrapper.warning {
  background: linear-gradient(135deg, #ff9500 0%, #ffb038 100%);
}

.action-icon-wrapper.ai {
  background: var(--accent-gradient);
}

.action-icon {
  font-size: 28px;
  color: white;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.action-content p {
  font-size: 0.9rem;
  margin: 0;
  color: var(--text-secondary);
}

.action-arrow {
  font-size: 20px;
  color: var(--text-tertiary);
}

/* RTL Support - Flip arrow direction for right-to-left languages */
[dir="rtl"] .action-arrow {
  transform: scaleX(-1);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.feature-card {
  margin: 0;
  text-align: center;
  background: var(--surface-1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon ion-icon {
  font-size: 30px;
  color: white;
}

ion-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

ion-card-content {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Wellness Card */
.wellness-card {
  margin: 1.5rem 1rem;
  padding: 2rem 1.5rem;
  background: var(--glass-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  text-align: center;
  box-shadow: var(--card-shadow);
}

.quote-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-icon ion-icon {
  font-size: 24px;
  color: white;
}

.wellness-quote {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
  font-weight: 400;
  font-style: italic;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
