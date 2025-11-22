<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'درباره ما' : 'About Us' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'درباره ما' : 'About Us' }}</ion-title>
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
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>{{ locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...' }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircle" color="danger" class="error-icon"></ion-icon>
        <h3>{{ locale === 'fa' ? 'خطا در بارگذاری' : 'Loading Error' }}</h3>
        <p>{{ error }}</p>
        <ion-button @click="loadPage" color="primary">
          <ion-icon :icon="refresh" slot="start"></ion-icon>
          {{ locale === 'fa' ? 'تلاش مجدد' : 'Retry' }}
        </ion-button>
      </div>

      <!-- Content -->
      <div v-else-if="pageData" class="about-content">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-icon">
            <ion-icon :icon="heart"></ion-icon>
          </div>
          <h1 class="hero-title">{{ pageData.title }}</h1>
        </div>

        <!-- Content Section -->
        <div class="content-section">
          <div class="markdown-content" v-html="renderedContent"></div>
        </div>

        <!-- Contact CTA -->
        <div class="cta-section">
          <ion-card class="cta-card">
            <ion-card-header>
              <ion-card-title>{{ locale === 'fa' ? 'با ما در تماس باشید' : 'Get in Touch' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>{{ locale === 'fa' ? 'برای اطلاعات بیشتر یا دریافت خدمات، با ما تماس بگیرید' : 'Contact us for more information or to receive services' }}</p>
              <ion-button expand="block" color="primary" @click="navigateToContact">
                <ion-icon :icon="call" slot="start"></ion-icon>
                {{ locale === 'fa' ? 'تماس با ما' : 'Contact Us' }}
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Bottom Spacing -->
      <div style="height: 2rem;"></div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/vue'
import { heart, alertCircle, refresh, call } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import apiClient from '@/api'

const { locale } = useI18n()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const pageData = ref<any>(null)

// Simple markdown to HTML converter
const renderedContent = computed(() => {
  if (!pageData.value?.content) return ''
  
  let html = pageData.value.content
  
  // Convert headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  
  // Wrap in paragraph
  html = '<p>' + html + '</p>'
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p><h/g, '<h')
  html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>')
  
  return html
})

async function loadPage() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.get('/api/pages/about-us', { skipAuth: true })
    
    if (response.success && response.data) {
      pageData.value = response.data
    } else {
      error.value = locale.value === 'fa' 
        ? 'محتوا یافت نشد' 
        : 'Content not found'
    }
  } catch (err: any) {
    console.error('Error loading about-us page:', err)
    error.value = locale.value === 'fa'
      ? 'خطا در بارگذاری محتوا'
      : 'Error loading content'
  } finally {
    loading.value = false
  }
}

function navigateToContact() {
  router.push('/tabs/contact')
}

onMounted(() => {
  loadPage()
})
</script>

<style scoped lang="scss">
/* OverlayScrollbars container */
.scrollable-content {
  height: 100%;
  width: 100%;
}

.content-wrapper {
  min-height: 100%;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 60vh;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--ion-color-medium);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h3 {
  margin: 0 0 0.5rem;
  color: var(--ion-color-danger);
}

.error-container p {
  color: var(--ion-color-medium);
  margin-bottom: 1.5rem;
}

/* Hero Section */
.hero-section {
  background: var(--accent-gradient);
  padding: 3rem 1.5rem;
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
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.hero-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
}

.hero-icon ion-icon {
  font-size: 2.5rem;
  color: white;
}

.hero-title {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Content Section */
.content-section {
  padding: 2rem 1.5rem;
  background: var(--ion-background-color);
}

.markdown-content {
  line-height: 1.8;
  color: var(--ion-text-color);
}

.markdown-content :deep(h1) {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 2rem 0 1rem;
  color: var(--ion-color-primary);
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.75rem 0 1rem;
  color: var(--ion-color-primary-shade);
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: var(--ion-color-secondary);
}

.markdown-content :deep(p) {
  margin: 1rem 0;
  color: var(--ion-text-color);
  font-size: 1rem;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: var(--ion-color-primary);
}

/* CTA Section */
.cta-section {
  padding: 0 1.5rem 2rem;
}

.cta-card {
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(212, 164, 62, 0.3);
}

.cta-card ion-card-title {
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
}

.cta-card p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.cta-card ion-button {
  --background: white;
  --color: var(--ion-color-primary);
  margin-top: 0.5rem;
  font-weight: 600;
}

/* RTL Support */
[dir="rtl"] .markdown-content {
  text-align: right;
}

[dir="ltr"] .markdown-content {
  text-align: left;
}
</style>
