<template>
  <!-- Use debug mode component if flag is enabled -->
  <NotFoundPageDebug v-if="isDebugMode" />
  
  <!-- Otherwise use standard styled component -->
  <ion-page v-else>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ locale === 'fa' ? 'صفحه یافت نشد' : 'Page Not Found' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Hero Section -->
      <div class="not-found-container">
        <div class="not-found-content">
          <!-- Animated 404 Icon -->
          <div class="not-found-icon-wrapper">
            <div class="not-found-icon">
              <span class="error-code">404</span>
              <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
            </div>
          </div>

          <!-- Title -->
          <h1 class="not-found-title">
            {{ locale === 'fa' ? 'صفحه مورد نظر یافت نشد' : 'Page Not Found' }}
          </h1>

          <!-- Description -->
          <p class="not-found-description">
            {{ locale === 'fa' 
              ? 'متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.'
              : 'Sorry, the page you\'re looking for doesn\'t exist or has been moved.' 
            }}
          </p>

          <!-- Current Path Info -->
          <div class="path-info">
            <ion-chip color="medium" outline>
              <ion-icon :icon="linkOutline"></ion-icon>
              <ion-label>{{ currentPath }}</ion-label>
            </ion-chip>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <ion-button 
              expand="block" 
              color="primary" 
              @click="goHome"
              class="action-button"
            >
              <ion-icon :icon="homeOutline" slot="start"></ion-icon>
              {{ locale === 'fa' ? 'بازگشت به صفحه اصلی' : 'Go to Home' }}
            </ion-button>

            <ion-button 
              expand="block" 
              fill="outline" 
              color="primary" 
              @click="goBack"
              class="action-button"
            >
              <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
              {{ locale === 'fa' ? 'بازگشت به صفحه قبل' : 'Go Back' }}
            </ion-button>
          </div>

          <!-- Helpful Links -->
          <div class="helpful-links">
            <h3 class="links-title">
              {{ locale === 'fa' ? 'صفحات پرکاربرد' : 'Popular Pages' }}
            </h3>
            
            <div class="links-grid">
              <ion-card button @click="navigateTo('/tabs/home')" class="link-card">
                <div class="link-icon primary">
                  <ion-icon :icon="homeOutline"></ion-icon>
                </div>
                <div class="link-text">
                  {{ locale === 'fa' ? 'خانه' : 'Home' }}
                </div>
              </ion-card>

              <ion-card button @click="navigateTo('/tabs/chat')" class="link-card">
                <div class="link-icon success">
                  <ion-icon :icon="chatbubblesOutline"></ion-icon>
                </div>
                <div class="link-text">
                  {{ locale === 'fa' ? 'گفتگو' : 'Chat' }}
                </div>
              </ion-card>

              <ion-card button @click="navigateTo('/tabs/appointments')" class="link-card">
                <div class="link-icon warning">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                </div>
                <div class="link-text">
                  {{ locale === 'fa' ? 'نوبت‌ها' : 'Appointments' }}
                </div>
              </ion-card>

              <ion-card button @click="navigateTo('/tabs/profile')" class="link-card">
                <div class="link-icon tertiary">
                  <ion-icon :icon="personOutline"></ion-icon>
                </div>
                <div class="link-text">
                  {{ locale === 'fa' ? 'پروفایل' : 'Profile' }}
                </div>
              </ion-card>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonChip,
  IonLabel,
} from '@ionic/vue'
import {
  searchOutline,
  homeOutline,
  arrowBackOutline,
  linkOutline,
  chatbubblesOutline,
  calendarOutline,
  personOutline,
} from 'ionicons/icons'
import NotFoundPageDebug from './NotFoundPageDebug.vue'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()

// Check if debug mode is enabled via environment variable
const isDebugMode = computed(() => import.meta.env.VITE_404_DEBUG_MODE === 'true')

const currentPath = computed(() => route.fullPath)

const goHome = () => {
  router.push('/tabs/home')
}

const goBack = () => {
  router.back()
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: 2rem 1.5rem;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

/* 404 Icon */
.not-found-icon-wrapper {
  margin-bottom: 2rem;
}

.not-found-icon {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(var(--ion-color-primary-rgb), 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-code {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.search-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 2.5rem;
  color: white;
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Text */
.not-found-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--ion-text-color);
  margin: 0 0 1rem;
}

.not-found-description {
  font-size: 1rem;
  color: var(--ion-color-medium);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

/* Path Info */
.path-info {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.path-info ion-chip {
  max-width: 100%;
}

.path-info ion-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 250px;
}

/* Action Buttons */
.action-buttons {
  margin-bottom: 2rem;
}

.action-button {
  margin-bottom: 0.75rem;
}

/* Helpful Links */
.helpful-links {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--ion-color-light);
}

.links-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 1.25rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.link-card {
  margin: 0;
  padding: 1.25rem 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.link-card:active {
  transform: scale(0.95);
}

.link-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 0.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-icon ion-icon {
  font-size: 1.5rem;
  color: white;
}

.link-icon.primary {
  background: var(--ion-color-primary);
}

.link-icon.success {
  background: var(--ion-color-success);
}

.link-icon.warning {
  background: var(--ion-color-warning);
}

.link-icon.tertiary {
  background: var(--ion-color-tertiary);
}

.link-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ion-text-color);
}
</style>
