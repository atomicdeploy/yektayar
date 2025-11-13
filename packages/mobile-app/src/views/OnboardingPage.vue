<template>
  <ion-page>
    <ion-content class="onboarding-content" :fullscreen="true">
      <div class="onboarding-container">
        <!-- Header -->
        <div class="header-section">
          <div class="app-logo">
            <img src="/logo-simple.svg" alt="YektaYar" class="logo-img" />
          </div>
          <h1 class="main-question">
            {{ t('onboarding.main_question') }}
          </h1>
        </div>

        <!-- Options -->
        <div class="options-container">
          <div 
            v-for="option in counselingOptions" 
            :key="option.type"
            class="option-card"
            @click="selectOption(option.type)"
          >
            <div class="option-icon" v-html="option.icon"></div>
            <div class="option-label">{{ option.label }}</div>
          </div>
        </div>

        <!-- Skip Button -->
        <div class="skip-section">
          <ion-button 
            fill="clear" 
            class="skip-button"
            @click="skipOnboarding"
          >
            {{ t('onboarding.skip_for_now') }}
          </ion-button>
        </div>

        <!-- Privacy Notice -->
        <div class="privacy-notice">
          <ion-icon :icon="lockClosed" class="privacy-icon"></ion-icon>
          <p class="privacy-text">{{ t('onboarding.privacy_notice') }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { lockClosed } from 'ionicons/icons'

const router = useRouter()
const { t } = useI18n()

const counselingOptions = computed(() => [
  {
    type: 'individual',
    label: t('onboarding.options.individual'),
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Individual counseling icon: person with supportive elements -->
      <circle cx="50" cy="30" r="14" fill="#d4a43e"/>
      <path d="M 50 47 C 35 47 25 57 25 67 L 25 80 C 25 82 26 83 28 83 L 72 83 C 74 83 75 82 75 80 L 75 67 C 75 57 65 47 50 47 Z" fill="#d4a43e"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#d4a43e" stroke-width="2" stroke-dasharray="4,4" opacity="0.4"/>
    </svg>`
  },
  {
    type: 'couple',
    label: t('onboarding.options.couple'),
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Couple counseling icon: two people together with heart -->
      <circle cx="35" cy="28" r="11" fill="#d4a43e"/>
      <circle cx="65" cy="28" r="11" fill="#d4a43e"/>
      <path d="M 35 42 C 24 42 17 49 17 57 L 17 67 L 45 67 L 45 57 C 45 49 42 42 35 42 Z" fill="#d4a43e"/>
      <path d="M 65 42 C 54 42 55 49 55 57 L 55 67 L 83 67 L 83 57 C 83 49 76 42 65 42 Z" fill="#d4a43e"/>
      <path d="M 50 20 C 48 20 46 21 45 23 L 42 27 C 41 29 42 31 44 32 C 46 33 48 32 49 30 L 50 28 L 51 30 C 52 32 54 33 56 32 C 58 31 59 29 58 27 L 55 23 C 54 21 52 20 50 20 Z" fill="#ff6b6b"/>
    </svg>`
  },
  {
    type: 'family',
    label: t('onboarding.options.family'),
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Family counseling icon: family group -->
      <circle cx="35" cy="25" r="9" fill="#d4a43e"/>
      <circle cx="65" cy="25" r="9" fill="#d4a43e"/>
      <circle cx="50" cy="52" r="7" fill="#d4a43e"/>
      <path d="M 35 37 C 26 37 20 43 20 50 L 20 58 L 47 58 L 47 50 C 47 43 43 37 35 37 Z" fill="#d4a43e"/>
      <path d="M 65 37 C 56 37 53 43 53 50 L 53 58 L 80 58 L 80 50 C 80 43 74 37 65 37 Z" fill="#d4a43e"/>
      <path d="M 50 61 C 43 61 38 65 38 70 L 38 77 L 62 77 L 62 70 C 62 65 57 61 50 61 Z" fill="#d4a43e"/>
      <ellipse cx="50" cy="45" rx="35" ry="30" fill="none" stroke="#d4a43e" stroke-width="2" opacity="0.3"/>
    </svg>`
  },
  {
    type: 'child_teen',
    label: t('onboarding.options.child_teen'),
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Child and teen counseling icon: young person with playful elements -->
      <circle cx="45" cy="30" r="12" fill="#d4a43e"/>
      <path d="M 45 45 C 32 45 24 53 24 62 L 24 73 L 66 73 L 66 62 C 66 53 58 45 45 45 Z" fill="#d4a43e"/>
      <circle cx="70" cy="30" r="6" fill="#4ecdc4" opacity="0.7"/>
      <circle cx="78" cy="42" r="5" fill="#ff6b6b" opacity="0.7"/>
      <circle cx="73" cy="54" r="4" fill="#ffe66d" opacity="0.7"/>
      <path d="M 32 24 L 35 18 M 40 20 L 40 13 M 50 20 L 52 13" stroke="#d4a43e" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>`
  }
])

const selectOption = (type: string) => {
  // Store the selected counseling type (could use Pinia store)
  console.log('Selected counseling type:', type)
  
  // Navigate to the next step in the onboarding flow
  // For now, navigate to home
  router.push('/tabs/home')
}

const skipOnboarding = () => {
  // Navigate to home without selecting
  router.push('/tabs/home')
}
</script>

<style scoped>
.onboarding-content {
  --background: linear-gradient(135deg, #01183a 0%, #012952 50%, #01183a 100%);
}

.onboarding-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 2rem 1.5rem;
  padding-bottom: 3rem;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.app-logo {
  margin-bottom: 1.5rem;
}

.logo-img {
  width: 50px;
  height: 50px;
  filter: drop-shadow(0 2px 8px rgba(212, 164, 62, 0.3));
}

.main-question {
  font-size: 1.6rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.5;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Options Container */
.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.option-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.option-icon {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 164, 62, 0.1);
  border-radius: 16px;
}

.option-icon :deep(svg) {
  width: 50px;
  height: 50px;
}

.option-label {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #01183a;
  text-align: right;
  line-height: 1.4;
}

/* Skip Section */
.skip-section {
  text-align: center;
  margin-bottom: 1rem;
}

.skip-button {
  --color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
  text-decoration: underline;
}

/* Privacy Notice */
.privacy-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.privacy-icon {
  font-size: 16px;
  color: #d4a43e;
}

.privacy-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-align: center;
  line-height: 1.4;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .onboarding-container {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-height: 700px) {
  .header-section {
    margin-bottom: 1.5rem;
  }
  
  .main-question {
    font-size: 1.4rem;
  }
  
  .option-card {
    padding: 1.2rem;
  }
  
  .option-icon {
    width: 60px;
    height: 60px;
  }
}
</style>
