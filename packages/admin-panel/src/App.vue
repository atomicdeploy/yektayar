<template>
  <div id="app" :dir="locale === 'fa' ? 'rtl' : 'ltr'" :class="{ 'dark': isDark }">
    <router-view />
    <ErrorNotification />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import { useUrlValidation } from './composables/useUrlValidation'
import { setupGlobalErrorHandlers } from './utils/errorHandlers'
import ErrorNotification from './components/ErrorNotification.vue'

const { locale } = useI18n()
const { isDark } = useTheme()

// Validate URL configuration (non-blocking)
useUrlValidation()

// Setup global error handlers for Vite HMR errors
setupGlobalErrorHandlers()
</script>
