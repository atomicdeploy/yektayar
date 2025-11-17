<template>
  <div class="error-screen" :class="{ 'dark-mode': isDarkMode }">
    <div class="error-container" :dir="textDirection">
      <div class="error-icon" aria-hidden="true">❌</div>
      
      <h1 class="error-title">{{ t('error_screen.api_config_error') }}</h1>
      <p class="error-message">{{ t('error_screen.cannot_start') }}</p>
      
      <section v-if="shouldShowDetails" class="error-section">
        <h3 class="section-title">{{ t('error_screen.details') }}</h3>
        <div class="error-details" :dir="detailsDirection">
          <p>{{ displayDetails }}</p>
        </div>
      </section>

      <section v-if="shouldShowSolution" class="error-section">
        <button 
          @click="toggleSolution" 
          class="solution-toggle"
          :aria-expanded="solutionExpanded"
        >
          <span>{{ solutionExpanded ? t('error_screen.hide_solution') : t('error_screen.show_solution') }}</span>
          <span class="toggle-icon" aria-hidden="true">{{ solutionExpanded ? '▲' : '▼' }}</span>
        </button>
        
        <div v-if="solutionExpanded && solution" class="solution-content">
          <h3 class="section-title">{{ t('error_screen.solution') }}</h3>

          <p v-if="solution.solution" class="solution-text">{{ solution.solution }}</p>

          <div v-for="(step, index) in solution.steps" :key="index" class="code-block">
            <code>{{ step }}</code>
          </div>

          <p v-if="solution.note" class="solution-note">
            <span class="info-icon" aria-hidden="true">ℹ️</span>
            <span class="note-text">{{ solution.note }}</span>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

// State
const solutionExpanded = ref(false)
const isDarkMode = ref(false)

// Computed properties
const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development' || import.meta.env.DEV
})

const textDirection = computed(() => {
  return locale.value === 'fa' ? 'rtl' : 'ltr'
})

// Check if the error message is one of our built-in translatable errors
const isBuiltInError = computed(() => {
  if (!props.details) return false
  // Built-in errors contain specific markers that indicate they should be translated
  return props.details.includes('API_BASE_URL')
})

const displayDetails = computed(() => {
  if (!props.details) return ''
  // Use translated message for built-in errors, raw message otherwise
  return isBuiltInError.value 
    ? t('error_screen.api_url_missing') 
    : props.details
})

const detailsDirection = computed(() => {
  // Built-in errors use app's text direction, raw errors are always LTR (English)
  return isBuiltInError.value ? textDirection.value : 'ltr'
})

const shouldShowDetails = computed(() => {
  return isDevelopment.value && props.details
})

const shouldShowSolution = computed(() => {
  return isDevelopment.value && props.solution
})

// Methods
const toggleSolution = () => {
  solutionExpanded.value = !solutionExpanded.value
}

// Dark mode handling
let darkModeMediaQuery: MediaQueryList | null = null

const updateDarkMode = (e: MediaQueryListEvent | MediaQueryList) => {
  isDarkMode.value = e.matches
}

onMounted(() => {
  if (window.matchMedia) {
    darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = darkModeMediaQuery.matches
    darkModeMediaQuery.addEventListener('change', updateDarkMode)
  }
})

onBeforeUnmount(() => {
  if (darkModeMediaQuery) {
    darkModeMediaQuery.removeEventListener('change', updateDarkMode)
  }
})
</script>

<style scoped lang="scss">
.error-screen {
  /* CSS Variables for theming */
  --error-bg: #f8f9fa;
  --error-text: #495057;
  --error-title-color: #dc3545;
  --error-border: #dee2e6;
  --error-card-bg: #fff;
  --error-detail-text: #6c757d;
  --error-section-title: #343a40;
  --error-button-bg: #007bff;
  --error-button-hover: #0056b3;
  --error-code-bg: #f8f9fa;
  --error-code-text: #e83e8c;
  
  position: fixed;
  inset: 0;
  background: var(--error-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: background-color 0.3s ease;
}

.error-screen.dark-mode {
  --error-bg: #1a1a1a;
  --error-text: #d0d0d0;
  --error-title-color: #ff6b6b;
  --error-border: #404040;
  --error-card-bg: #2a2a2a;
  --error-detail-text: #b0b0b0;
  --error-section-title: #e0e0e0;
  --error-button-bg: #0d6efd;
  --error-button-hover: #0a58ca;
  --error-code-bg: #2a2a2a;
  --error-code-text: #ff79c6;
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

.error-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--error-title-color);
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.125rem;
  color: var(--error-text);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.error-section {
  width: 100%;
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--error-section-title);
  margin-bottom: 0.75rem;
  text-align: start;
}

.error-details {
  background: var(--error-card-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  padding: 1rem;
  width: 100%;
  text-align: start;
}

.error-details p {
  font-size: 0.875rem;
  color: var(--error-detail-text);
  margin: 0;
  font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', Courier, monospace;
  word-break: break-word;
}

.solution-toggle {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--error-button-bg);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
  margin-bottom: 1rem;
}

.solution-toggle:hover {
  background: var(--error-button-hover);
}

.solution-toggle:focus-visible {
  outline: 2px solid var(--error-button-bg);
  outline-offset: 2px;
}

.toggle-icon {
  font-size: 0.875rem;
  margin-inline-start: 0.5rem;
}

.solution-content {
  text-align: start;
}

.solution-text {
  font-size: 0.95rem;
  color: var(--error-text);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.code-block {
  background: var(--error-code-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
}

.code-block code {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  color: var(--error-code-text);
  white-space: pre;
  direction: ltr;
}

.solution-note {
  font-size: 0.875rem;
  color: var(--error-detail-text);
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
</style>
