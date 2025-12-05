<template>
  <component :is="isMobile ? 'ion-page' : 'div'" :class="isMobile ? '' : 'error-screen'">
    <component 
      :is="isMobile ? 'ion-content' : 'div'" 
      :class="[isMobile ? 'error-content' : '', { 'dark-mode': isDarkMode }]"
    >
      <div class="error-container" :dir="direction">
        <div class="error-icon">❌</div>
        <h1 class="error-title">{{ t('error_screen.api_config_error') }}</h1>
        <p class="error-message">{{ t('error_screen.cannot_start') }}</p>
        
        <div v-if="isDevelopment && details" class="error-section">
          <h3 class="section-title">{{ t('error_screen.details') }}</h3>
          <div class="error-details" :dir="errorDetailsDirection">
            <p>{{ translatedDetails }}</p>
          </div>
        </div>

        <div v-if="isDevelopment && showSolution" class="error-section">
          <component 
            :is="isMobile ? 'ion-button' : 'button'"
            :expand="isMobile ? 'block' : undefined"
            @click="toggleSolution" 
            class="solution-toggle"
          >
            {{ solutionExpanded ? t('error_screen.hide_solution') : t('error_screen.show_solution') }}
            <span class="toggle-icon">{{ solutionExpanded ? '▲' : '▼' }}</span>
          </component>
          
          <div v-if="solutionExpanded && currentSolution" class="solution-content">
            <h3 class="section-title">{{ t('error_screen.solution') }}</h3>

            <p v-if="currentSolution && currentSolution?.solution" class="solution-text">{{ currentSolution.solution }}</p>

            <div v-for="(step, index) in (currentSolution?.steps || [])" :key="index" class="code-block">
              <code>{{ step }}</code>
            </div>

            <p v-if="currentSolution && currentSolution?.note" class="solution-note">
              <span class="info-icon">ℹ️</span>
              <span class="note-text">{{ currentSolution.note }}</span>
            </p>
          </div>
        </div>
      </div>
    </component>
  </component>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// Detect if running in mobile (Ionic) context
const isMobile = computed(() => {
  // Check if Ionic components are available globally
  return typeof window !== 'undefined' && 
         'customElements' in window && 
         customElements.get('ion-app') !== undefined
})

const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development' || import.meta.env.DEV
})

const direction = computed(() => {
  return locale.value === 'fa' ? 'rtl' : 'ltr'
})

const isTranslatedError = computed(() => {
  if (!props.details) return false
  // Check if this error will be translated
  return props.details.includes('API_BASE_URL')
})

const translatedDetails = computed(() => {
  if (!props.details) return ''
  // Translate the error message if it's a translatable error
  if (isTranslatedError.value) {
    return t('error_screen.api_url_missing')
  }
  // Otherwise return raw error message
  return props.details
})

const errorDetailsDirection = computed(() => {
  // If using a translated error message, use the app's direction
  if (isTranslatedError.value) {
    return direction.value
  }
  // Otherwise, raw error messages are in English, so always use LTR
  return 'ltr'
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

<style scoped lang="scss">
/* Web (non-mobile) styles */
.error-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: background 0.3s ease;
}

.error-screen.dark-mode {
  background: #1a1a1a;
}

/* Mobile (Ionic) styles */
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
  text-align: center;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
}

/* Mobile-specific: add centering */
ion-content .error-container {
  justify-content: center;
  min-height: 100vh;
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
  line-height: 1.6;
}

/* Mobile-specific: max-width for message */
ion-content .error-message {
  max-width: 600px;
}

.dark-mode .error-message {
  color: #d0d0d0;
}

.error-section {
  width: 100%;
  margin-top: 1.5rem;
}

/* Mobile-specific: max-width for sections */
ion-content .error-section {
  max-width: 600px;
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  word-break: break-word;
}

.dark-mode .error-details p {
  color: #b0b0b0;
}

/* Web button styles */
button.solution-toggle {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease;
  margin-bottom: 1rem;
}

button.solution-toggle:hover {
  background: #0056b3;
}

.dark-mode button.solution-toggle {
  background: #0d6efd;
}

.dark-mode button.solution-toggle:hover {
  background: #0a58ca;
}

/* Mobile button styles */
ion-button.solution-toggle {
  margin-bottom: 1rem;
}

.toggle-icon {
  font-size: 0.875rem;
}

/* Mobile-specific: add margin for icon */
ion-button .toggle-icon {
  margin-inline-start: 0.5rem;
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
