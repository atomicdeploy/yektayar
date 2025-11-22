<template>
  <ion-app :dir="locale === 'fa' ? 'rtl' : 'ltr'">
    <ion-router-outlet />
    <ErrorNotification />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import { useUrlValidation } from './composables/useUrlValidation'
import { setupGlobalErrorHandlers } from './utils/errorHandlers'
import ErrorNotification from './components/ErrorNotification.vue'

const { locale } = useI18n()

// Initialize theme system
useTheme()

// Validate URL configuration (non-blocking)
useUrlValidation()

// Setup global error handlers for Vite HMR errors
setupGlobalErrorHandlers()
</script>
