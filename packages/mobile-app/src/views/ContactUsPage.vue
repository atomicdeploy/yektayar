<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'تماس با ما' : 'Contact Us' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'تماس با ما' : 'Contact Us' }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Hero Section -->
      <div class="contact-hero">
        <div class="hero-icon">
          <ion-icon :icon="call"></ion-icon>
        </div>
        <h2>{{ locale === 'fa' ? 'ما همیشه در دسترس هستیم' : 'We\'re Always Here' }}</h2>
        <p>{{ locale === 'fa' ? 'از طریق راه‌های زیر می‌توانید با ما در تماس باشید' : 'Get in touch with us through the following channels' }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>

      <!-- Contact Methods -->
      <div v-else class="section">
        <!-- Phone -->
        <ion-card class="contact-card" button @click="callPhone">
          <div class="contact-icon phone">
            <ion-icon :icon="call"></ion-icon>
          </div>
          <div class="contact-content">
            <h3>{{ locale === 'fa' ? 'تماس تلفنی' : 'Phone Call' }}</h3>
            <p class="contact-value">{{ contactInfo.phone || '+98 21 1234 5678' }}</p>
            <p class="contact-description">{{ locale === 'fa' ? 'تماس مستقیم با تیم پشتیبانی' : 'Direct call to support team' }}</p>
          </div>
        </ion-card>

        <!-- Email -->
        <ion-card class="contact-card" button @click="sendEmail">
          <div class="contact-icon email">
            <ion-icon :icon="mail"></ion-icon>
          </div>
          <div class="contact-content">
            <h3>{{ locale === 'fa' ? 'ایمیل' : 'Email' }}</h3>
            <p class="contact-value">{{ contactInfo.email || 'info@yektayar.com' }}</p>
            <p class="contact-description">{{ locale === 'fa' ? 'ارسال ایمیل به تیم پشتیبانی' : 'Send email to support team' }}</p>
          </div>
        </ion-card>

        <!-- Address -->
        <ion-card class="contact-card">
          <div class="contact-icon address">
            <ion-icon :icon="location"></ion-icon>
          </div>
          <div class="contact-content">
            <h3>{{ locale === 'fa' ? 'آدرس دفتر' : 'Office Address' }}</h3>
            <p class="contact-value">{{ locale === 'fa' ? (contactInfo.address || 'تهران، خیابان ولیعصر') : (contactInfo.address_en || 'Tehran, Vali Asr Street') }}</p>
            <p class="contact-description">{{ locale === 'fa' ? 'مراجعه حضوری به دفتر' : 'Visit our office' }}</p>
          </div>
        </ion-card>
      </div>

      <!-- Map Section -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'موقعیت ما روی نقشه' : 'Our Location' }}</h3>
        <ion-card class="map-card">
          <div class="map-container" @click="openInMaps">
            <div class="map-placeholder">
              <ion-icon :icon="mapOutline"></ion-icon>
              <p>{{ locale === 'fa' ? 'مشاهده در نقشه' : 'View on Map' }}</p>
            </div>
          </div>
        </ion-card>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'خدمات پشتیبانی' : 'Support Services' }}</h3>
        
        <ion-card button @click="navigateToSupport" class="action-card">
          <div class="action-icon">
            <ion-icon :icon="chatbubbles"></ion-icon>
          </div>
          <div class="action-content">
            <h4>{{ locale === 'fa' ? 'پشتیبانی آنلاین' : 'Online Support' }}</h4>
            <p>{{ locale === 'fa' ? 'ارسال تیکت و چت با پشتیبانی' : 'Send tickets and chat with support' }}</p>
          </div>
          <ion-icon :icon="chevronForward"></ion-icon>
        </ion-card>

        <ion-card button @click="navigateToAbout" class="action-card">
          <div class="action-icon">
            <ion-icon :icon="informationCircle"></ion-icon>
          </div>
          <div class="action-content">
            <h4>{{ locale === 'fa' ? 'درباره ما' : 'About Us' }}</h4>
            <p>{{ locale === 'fa' ? 'بیشتر درباره یکتایار بدانید' : 'Learn more about YektaYar' }}</p>
          </div>
          <ion-icon :icon="chevronForward"></ion-icon>
        </ion-card>
      </div>

      <!-- Social Media (placeholder for future) -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'شبکه‌های اجتماعی' : 'Social Media' }}</h3>
        <div class="social-grid">
          <div class="social-item">
            <div class="social-icon">
              <ion-icon :icon="logoInstagram"></ion-icon>
            </div>
            <span>Instagram</span>
          </div>
          <div class="social-item">
            <div class="social-icon">
              <ion-icon :icon="logoTwitter"></ion-icon>
            </div>
            <span>Twitter</span>
          </div>
          <div class="social-item">
            <div class="social-icon">
              <ion-icon :icon="logoLinkedin"></ion-icon>
            </div>
            <span>LinkedIn</span>
          </div>
          <div class="social-item">
            <div class="social-icon">
              <ion-icon :icon="globeOutline"></ion-icon>
            </div>
            <span>Website</span>
          </div>
        </div>
      </div>

      <!-- Bottom Spacing -->
      <div style="height: 2rem;"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonSpinner,
} from '@ionic/vue'
import { 
  call, 
  mail, 
  location, 
  mapOutline,
  chatbubbles,
  informationCircle,
  chevronForward,
  logoInstagram,
  logoTwitter,
  logoLinkedin,
  globeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import apiClient from '@/api'

const { locale } = useI18n()
const router = useRouter()

const loading = ref(true)
const contactInfo = ref({
  phone: '',
  email: '',
  address: '',
  address_en: '',
  map_lat: 35.6892,
  map_lng: 51.3890,
})

async function loadContactInfo() {
  loading.value = true
  try {
    const response = await apiClient.get('/api/settings', { skipAuth: true })
    if (response.success && response.data) {
      contactInfo.value = {
        phone: response.data.contact_phone || '',
        email: response.data.contact_email || '',
        address: response.data.contact_address || '',
        address_en: response.data.contact_address_en || '',
        map_lat: parseFloat(response.data.contact_map_lat) || 35.6892,
        map_lng: parseFloat(response.data.contact_map_lng) || 51.3890,
      }
    }
  } catch (error) {
    console.error('Error loading contact info:', error)
  } finally {
    loading.value = false
  }
}

function callPhone() {
  const phone = contactInfo.value.phone || '+982112345678'
  window.open(`tel:${phone}`, '_system')
}

function sendEmail() {
  const email = contactInfo.value.email || 'info@yektayar.com'
  window.open(`mailto:${email}`, '_system')
}

function openInMaps() {
  const lat = contactInfo.value.map_lat
  const lng = contactInfo.value.map_lng
  
  // Try to open in Google Maps app, fallback to web
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  window.open(mapsUrl, '_system')
}

function navigateToSupport() {
  router.push('/tabs/support')
}

function navigateToAbout() {
  router.push('/tabs/about')
}

onMounted(() => {
  loadContactInfo()
})
</script>

<style scoped>
/* Hero Section */
.contact-hero {
  background: var(--accent-gradient);
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: white;
}

.hero-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.hero-icon ion-icon {
  font-size: 2.5rem;
}

.contact-hero h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.contact-hero p {
  margin: 0;
  opacity: 0.9;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

/* Section */
.section {
  padding: 1.5rem;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

/* Contact Cards */
.contact-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 16px;
  transition: transform 0.2s ease;
}

.contact-card:active {
  transform: scale(0.98);
}

.contact-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon ion-icon {
  font-size: 1.5rem;
  color: white;
}

.contact-icon.phone {
  background: var(--ion-color-primary);
}

.contact-icon.email {
  background: var(--ion-color-success);
}

.contact-icon.address {
  background: var(--ion-color-tertiary);
}

.contact-content {
  flex: 1;
}

.contact-content h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.contact-value {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--ion-color-primary);
}

.contact-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

/* Map Card */
.map-card {
  margin: 0;
  border-radius: 16px;
  overflow: hidden;
}

.map-container {
  height: 200px;
  background: var(--ion-color-light);
  cursor: pointer;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-primary);
}

.map-placeholder ion-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.map-placeholder p {
  margin: 0;
  font-weight: 600;
}

/* Action Cards */
.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 16px;
}

.action-icon {
  width: 45px;
  height: 45px;
  background: var(--ion-color-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon ion-icon {
  font-size: 1.5rem;
  color: white;
}

.action-content {
  flex: 1;
}

.action-content h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.action-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.social-icon {
  width: 50px;
  height: 50px;
  background: var(--ion-color-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: transform 0.2s ease;
}

.social-item:active .social-icon {
  transform: scale(0.95);
}

.social-icon ion-icon {
  font-size: 1.5rem;
  color: var(--ion-color-primary);
}

.social-item span {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}

/* RTL Support - Flip chevron arrow direction for right-to-left languages */
[dir="rtl"] .action-card > ion-icon {
  transform: scaleX(-1);
}
</style>
