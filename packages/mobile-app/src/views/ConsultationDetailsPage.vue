<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <!-- Logo and Progress -->
        <div class="header-content">
          <div class="logo-header">
            <img src="/logo-simple.svg" alt="يكتایار" class="header-logo" />
            <span class="header-title">يكتایار</span>
          </div>
          <div class="progress-container">
            <div 
              class="progress-bar" 
              role="progressbar" 
              :aria-valuenow="progressPercent" 
              aria-valuemin="0" 
              aria-valuemax="100"
              :aria-label="`${progressPercent}٪ تکمیل شده`"
            >
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <span class="progress-text">{{ progressPercent }}٪ تکمیل شده</span>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="content-wrapper">
        <!-- Main Question -->
        <div class="question-section">
          <h1 class="question-text">
            اینجا واسم بنویس چالش یا مشکلی که الان باهاش درگیری و به خاطرش میخوای مشاوره بگیری چیه
          </h1>
        </div>

        <!-- Voice Recording Button -->
        <div v-if="speechRecognitionSupported" class="recording-section">
          <button 
            class="mic-button" 
            :class="{ 
              'recording': isRecording, 
              'has-transcript': transcriptText.length > 0,
              'processing': isProcessing 
            }"
            @click="toggleRecording"
            :disabled="isProcessing"
            :aria-label="isRecording ? 'توقف ضبط صدا' : 'شروع ضبط صدا'"
          >
            <div class="mic-icon-wrapper">
              <ion-icon 
                :icon="isRecording ? stop : mic" 
                class="mic-icon"
              ></ion-icon>
              <div v-if="isRecording" class="pulse-ring"></div>
              <div v-if="isRecording" class="pulse-ring delayed"></div>
            </div>
          </button>
          
          <p class="recording-hint">
            <template v-if="!isRecording && !transcriptText">
              صحبت کن، ما تبدیلش می‌کنیم به متن 👇
            </template>
            <template v-else-if="isRecording">
              در حال ضبط... برای توقف کلیک کنید
            </template>
            <template v-else-if="transcriptText">
              می‌توانید ویرایش کنید یا دوباره ضبط نمایید
            </template>
          </p>

          <!-- Error Message with Type Instead option -->
          <div v-if="errorMessage" class="error-message">
            <div class="error-content">
              <ion-icon :icon="alertCircle"></ion-icon>
              <span>{{ errorMessage }}</span>
            </div>
            <button 
              type="button"
              class="type-instead-link" 
              @click="typeInstead"
            >
              <ion-icon :icon="create"></ion-icon>
              بجای آن تایپ کنید
            </button>
          </div>
        </div>

        <!-- Transcribed Text Display/Edit -->
        <div v-if="shouldShowTextarea" class="transcript-section">
          <div class="transcript-card">
            <ion-textarea
              v-model="transcriptText"
              :placeholder="isRecording ? 'در حال دریافت...' : 'متن شما اینجا نمایش داده می‌شود'"
              :auto-grow="true"
              :rows="6"
              class="transcript-textarea"
              aria-label="متن توضیحات مشاوره"
            ></ion-textarea>
            <div class="transcript-actions">
              <button 
                class="action-button secondary" 
                @click="clearTranscript"
                :disabled="isProcessing"
                aria-label="پاک کردن متن"
              >
                <ion-icon :icon="trash"></ion-icon>
                پاک کردن
              </button>
              <button 
                v-if="speechRecognitionSupported"
                class="action-button primary" 
                @click="toggleRecording"
                :disabled="isProcessing"
                :aria-label="isRecording ? 'توقف ضبط مجدد' : 'ضبط مجدد'"
              >
                <ion-icon :icon="mic"></ion-icon>
                ضبط مجدد
              </button>
            </div>
          </div>
        </div>

        <!-- Continue Button -->
        <div class="action-section">
          <ion-button 
            expand="block" 
            @click="handleContinue"
            :disabled="!canContinue || isSaving"
            class="continue-button"
          >
            <ion-icon v-if="!isSaving" :slot="iconSlot" :icon="continueArrowIcon"></ion-icon>
            <ion-spinner v-if="isSaving" :slot="iconSlot" name="crescent"></ion-spinner>
            {{ isSaving ? 'در حال ارسال...' : 'ادامه بده' }}
          </ion-button>
        </div>

        <!-- Privacy Notice -->
        <div class="privacy-notice">
          <ion-icon :icon="lockClosed"></ion-icon>
          <p>اطلاعاتت محرمانه می‌مونه و فقط برای کمک بهت استفاده می‌شه.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonTextarea,
  toastController,
  alertController,
} from '@ionic/vue'
import {
  mic,
  stop,
  arrowForward,
  arrowBack,
  lockClosed,
  trash,
  alertCircle,
  create,
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { logger } from '@yektayar/shared'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()

// Constants
const TOTAL_STEPS = 10 // Total steps in consultation flow
const DEFAULT_STEP = 4 // Default to step 4 if not specified
const MIN_CONSULTATION_TEXT_LENGTH = 10 // Minimum characters required for consultation text
const TEXTAREA_FOCUS_DELAY = 100 // Delay in ms to ensure textarea is rendered before focusing

// Get current step from route query param or use default
const currentStep = computed(() => {
  const stepParam = route.query.step
  if (stepParam) {
    const step = parseInt(stepParam as string, 10)
    return !isNaN(step) && step > 0 && step <= TOTAL_STEPS ? step : DEFAULT_STEP
  }
  return DEFAULT_STEP
})

// State
const isSaving = ref(false)
const showTextarea = ref(false)
const errorMessage = ref('')

// Initialize Speech Recognition composable
const langCode = computed(() => locale.value === 'fa' ? 'fa-IR' : 'en-US')
const speechRecognition = useSpeechRecognition({
  lang: langCode.value,
  continuous: true,
  interimResults: true,
  autoRestart: true,
  accumulateResults: true, // Use APPEND pattern for continuous dictation
})

// Destructure composable
const {
  isSupported: speechRecognitionSupported,
  isListening: isRecording,
  fullTranscript,
  finalTranscript,
  interimTranscript,
  error: speechError,
  start: startRecognition,
  stop: stopRecognition,
  reset: resetRecognition,
  setFinalTranscript,
} = speechRecognition

// Local transcript ref that user can edit
const transcriptText = ref('')

// Sync fullTranscript from composable to local editable ref
watch(fullTranscript, (newValue) => {
  transcriptText.value = newValue
})

// Watch for speech recognition errors
watch(speechError, (error) => {
  if (error) {
    switch (error) {
      case 'no-speech':
        errorMessage.value = 'صدایی دریافت نشد. لطفا دوباره تلاش کنید'
        break
      case 'audio-capture':
        errorMessage.value = 'میکروفون در دسترس نیست'
        break
      case 'not-allowed':
        errorMessage.value = 'لطفا دسترسی به میکروفون را مجاز کنید'
        break
      default:
        errorMessage.value = 'خطا در ضبط صدا. لطفا دوباره تلاش کنید'
    }
  }
})

// Computed progress based on current step
const progressPercent = computed(() => {
  return Math.round((currentStep.value / TOTAL_STEPS) * 100)
})

// Watch for changes that should show the textarea
const shouldShowTextarea = computed(() => {
  return transcriptText.value || isRecording.value || !speechRecognitionSupported.value || showTextarea.value
})

// Processing state (for compatibility)
const isProcessing = computed(() => false)

// Computed property for arrow icon based on locale
const continueArrowIcon = computed(() => {
  return locale.value === 'fa' ? arrowBack : arrowForward
})

// Computed property for icon slot position based on locale
const iconSlot = computed(() => {
  return locale.value === 'fa' ? 'end' : 'start'
})
// Functions
async function toggleRecording() {
  if (!speechRecognitionSupported.value) {
    await showAlert(
      'خطا',
      'قابلیت تشخیص گفتار در دسترس نیست. لطفا از مرورگر Chrome استفاده کنید.'
    )
    return
  }

  if (isRecording.value) {
    stopRecognition()
  } else {
    errorMessage.value = ''
    // Set initial text if user has typed something before recording
    if (transcriptText.value && transcriptText.value !== fullTranscript.value) {
      setFinalTranscript(transcriptText.value)
    }
    startRecognition()
  }
}

function clearTranscript() {
  transcriptText.value = ''
  resetRecognition()
  errorMessage.value = ''
}

function typeInstead() {
  errorMessage.value = ''
  showTextarea.value = true
  // Wait for DOM update before focusing - ensures textarea is rendered
  setTimeout(() => {
    const textarea = document.querySelector('.transcript-textarea')
    if (textarea) {
      (textarea as HTMLElement).focus()
    }
  }, TEXTAREA_FOCUS_DELAY)
}

const canContinue = computed(() => {
  return transcriptText.value.trim().length > MIN_CONSULTATION_TEXT_LENGTH
})

async function handleContinue() {
  if (!canContinue.value) {
    await showToast('لطفا ابتدا مشکل خود را شرح دهید', 'warning')
    return
  }

  isSaving.value = true

  try {
    // TODO: Send to backend API
    // await apiClient.post('/api/consultations', {
    //   description: transcriptText.value.trim(),
    //   step: currentStep.value
    // })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    await showToast('اطلاعات با موفقیت ذخیره شد', 'success')
    
    // Navigate to next step (e.g., AI chatbot)
    // TODO: Navigate to the next step in the consultation flow
    router.push('/tabs/chat')
    
  } catch (error) {
    await showToast('خطا در ذخیره اطلاعات. لطفا دوباره تلاش کنید', 'danger')
  } finally {
    isSaving.value = false
  }
}

async function showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'bottom',
    color,
  })
  await toast.present()
}

async function showAlert(header: string, message: string) {
  const alert = await alertController.create({
    header,
    message,
    buttons: ['باشه'],
  })
  await alert.present()
}
</script>

<style scoped>
/* Header Styling */
.header-content {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  gap: 0.75rem;
}

.logo-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
}

.header-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  font-family: var(--ion-font-family);
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--surface-3);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  direction: rtl;
}

/* Content Wrapper */
.content-wrapper {
  padding: 2rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100%;
}

/* Question Section */
.question-section {
  text-align: center;
  animation: fadeIn 0.6s ease-out;
  padding: 1rem 0;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  direction: rtl;
  font-family: var(--ion-font-family);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Recording Section */
.recording-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.mic-button {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
  color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 24px rgba(212, 164, 62, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
}

.mic-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 
    0 12px 32px rgba(212, 164, 62, 0.5),
    0 6px 16px rgba(0, 0, 0, 0.15);
}

.mic-button:active:not(:disabled) {
  transform: scale(0.95);
  box-shadow: 
    0 4px 16px rgba(212, 164, 62, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.mic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mic-button.recording {
  background: linear-gradient(135deg, var(--ion-color-danger) 0%, #ff6b6b 100%);
  animation: pulse 2s ease-in-out infinite;
}

.mic-button.processing {
  background: linear-gradient(135deg, var(--ion-color-medium) 0%, #b0b0b0 100%);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 
      0 8px 24px rgba(235, 68, 90, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 
      0 12px 32px rgba(235, 68, 90, 0.6),
      0 6px 16px rgba(0, 0, 0, 0.15);
  }
}

.mic-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-icon {
  font-size: 64px;
  color: white;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
  position: relative;
  z-index: 1;
}

.pulse-ring {
  position: absolute;
  width: 140px;
  height: 140px;
  border: 3px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring.delayed {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.recording-hint {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  direction: rtl;
  max-width: 350px;
  line-height: 1.5;
  font-weight: 500;
  transition: all 0.3s ease;
}

.error-message {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(235, 68, 90, 0.1);
  border: 1px solid var(--ion-color-danger);
  border-radius: 12px;
  color: var(--ion-color-danger);
  font-size: 0.9rem;
  direction: rtl;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.type-instead-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0;
  background: transparent;
  border: none;
  color: var(--ion-color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--ion-font-family);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.type-instead-link:hover {
  color: var(--ion-color-primary-shade);
  text-decoration-thickness: 2px;
}

.type-instead-link:active {
  transform: scale(0.98);
  color: var(--ion-color-primary-tint);
}

.type-instead-link ion-icon {
  font-size: 18px;
}

/* Transcript Section */
.transcript-section {
  animation: slideInUp 0.6s ease-out;
}

.transcript-card {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  border: 2px solid var(--glass-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.transcript-card:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 
    var(--card-shadow-hover),
    0 0 0 4px rgba(212, 164, 62, 0.1);
  transform: translateY(-2px);
}

.transcript-textarea {
  --background: transparent;
  --color: var(--text-primary);
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  font-size: 1rem;
  line-height: 1.6;
  direction: rtl;
  font-family: var(--ion-font-family);
  min-height: 150px;
}

.transcript-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  direction: rtl;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--ion-font-family);
  transform: scale(1);
}

.action-button:hover:not(:disabled) {
  transform: scale(1.02);
}

.action-button:active:not(:disabled) {
  transform: scale(0.98);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(212, 164, 62, 0.3);
}

.action-button.secondary {
  background: var(--surface-2);
  color: var(--text-secondary);
  border: 2px solid var(--glass-border);
}

.action-button ion-icon {
  font-size: 20px;
}

/* Action Section */
.action-section {
  margin-top: auto;
  padding-top: 1rem;
  animation: fadeIn 1s ease-out 0.4s both;
}

.continue-button {
  --background: linear-gradient(135deg, var(--ion-color-success) 0%, #42d77d 100%);
  --background-activated: var(--ion-color-success-shade);
  --box-shadow: 0 6px 20px rgba(45, 211, 111, 0.4);
  font-weight: 700;
  height: 58px;
  border-radius: 16px;
  text-transform: none;
  letter-spacing: 0.3px;
  font-size: 1.1rem;
  direction: rtl;
  font-family: var(--ion-font-family);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.continue-button:hover:not([disabled]) {
  --box-shadow: 0 8px 24px rgba(45, 211, 111, 0.5);
  transform: translateY(-2px);
}

.continue-button:not([disabled]):active {
  transform: translateY(0);
  --box-shadow: 0 4px 16px rgba(45, 211, 111, 0.3);
}

.continue-button ion-icon,
.continue-button ion-spinner {
  font-size: 24px;
}

/* Privacy Notice */
.privacy-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  padding: 1rem;
  background: rgba(212, 164, 62, 0.08);
  border-radius: 12px;
  direction: rtl;
  animation: fadeIn 1.2s ease-out 0.6s both;
}

.privacy-notice ion-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
  flex-shrink: 0;
}

.privacy-notice p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .question-text {
    font-size: 1.25rem;
  }
  
  .mic-button {
    width: 120px;
    height: 120px;
  }
  
  .mic-icon {
    font-size: 56px;
  }
  
  .pulse-ring {
    width: 120px;
    height: 120px;
  }
}
</style>
