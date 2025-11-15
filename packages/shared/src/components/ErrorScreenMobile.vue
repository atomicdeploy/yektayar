<template>
  <ion-page>
    <ion-content :class="['error-content', { 'dark-mode': isDarkMode }]">
      <div class="error-container" :dir="direction">
        <div class="error-icon">❌</div>
        <h1 class="error-title">{{ t('error_screen.api_config_error') }}</h1>
        <p class="error-message">{{ t('error_screen.cannot_start') }}</p>
        
        <div v-if="isDevelopment && details" class="error-section">
          <h3 class="section-title">{{ t('error_screen.details') }}</h3>
          <div class="error-details">
            <p>{{ translatedDetails }}</p>
          </div>
        </div>

        <div v-if="isDevelopment && showSolution" class="error-section">
          <ion-button expand="block" @click="toggleSolution" class="solution-toggle">
            {{ solutionExpanded ? t('error_screen.hide_solution') : t('error_screen.show_solution') }}
            <span class="toggle-icon">{{ solutionExpanded ? '▲' : '▼' }}</span>
          </ion-button>
          
          <div v-if="solutionExpanded" class="solution-content">
            <h3 class="section-title">{{ t('error_screen.solution') }}</h3>
            
            <p v-if="currentSolution?.solution" class="solution-text">{{ currentSolution.solution }}</p>
            
            <div v-for="(step, index) in currentSolution?.steps" :key="index" class="code-block">
              <code>{{ step }}</code>
            </div>
            
            <p v-if="currentSolution?.note" class="solution-note">
              <span class="info-icon">ℹ️</span>
              <span class="note-text">{{ currentSolution.note }}</span>
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import type { Solution } from '../utils/solutions'

interface Props {
  title?: string
  message: string
  details?: string
  solution?: Solution | null
  errorType?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Configuration Error',
  solution: null,
  errorType: undefined
})

const { t, locale } = useI18n()

const solutionExpanded = ref(false)
const isDarkMode = ref(false)

const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development' || import.meta.env.DEV
})

const direction = computed(() => {
  return locale.value === 'fa' ? 'rtl' : 'ltr'
})

const translatedDetails = computed(() => {
  if (!props.details) return ''
  // Translate the error message if it contains VITE_API_BASE_URL or API_BASE_URL
  if (props.details.includes('API_BASE_URL') || props.details.includes('VITE_API_BASE_URL')) {
    return t('error_screen.api_url_missing')
  }
  return props.details
})

const currentSolution = computed(() => {
  return props.solution
})

const showSolution = computed(() => {
  return currentSolution.value !== null && currentSolution.value !== undefined
})

const toggleSolution = () => {
  solutionExpanded.value = !solutionExpanded.value
}

// Detect dark mode from system preferences
onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
  }
  
  // Listen for changes to dark mode preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    isDarkMode.value = e.matches
  })
})
</script>

<style scoped>
.error-content {
  --background: #f8f9fa;
}

.error-content.dark-mode {
  --background: #1a1a1a;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #dc3545;
  margin-bottom: 1rem;
}

.dark-mode .error-title {
  color: #ff6b6b;
}

.error-message {
  font-size: 1.125rem;
  color: #495057;
  margin-bottom: 1.5rem;
  max-width: 600px;
  line-height: 1.6;
}

.dark-mode .error-message {
  color: #d0d0d0;
}

.error-section {
  width: 100%;
  max-width: 600px;
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 0.75rem;
  text-align: start;
}

.dark-mode .section-title {
  color: #e0e0e0;
}

.error-details {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  width: 100%;
  text-align: start;
}

.dark-mode .error-details {
  background: #2a2a2a;
  border-color: #404040;
}

.error-details p {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
  font-family: monospace;
  word-break: break-word;
}

.dark-mode .error-details p {
  color: #b0b0b0;
}

.solution-toggle {
  margin-bottom: 1rem;
}

.toggle-icon {
  margin-inline-start: 0.5rem;
  font-size: 0.875rem;
}

.solution-content {
  text-align: start;
}

.solution-text {
  font-size: 0.95rem;
  color: #495057;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.dark-mode .solution-text {
  color: #c0c0c0;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
}

.dark-mode .code-block {
  background: #2a2a2a;
  border-color: #404040;
}

.code-block code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  color: #e83e8c;
  white-space: pre;
  direction: ltr;
}

.dark-mode .code-block code {
  color: #ff79c6;
}

.solution-note {
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  direction: ltr;
  text-align: left;
}

.info-icon {
  flex-shrink: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.note-text {
  flex: 1;
}

.dark-mode .solution-note {
  color: #a0a0a0;
}
</style>
