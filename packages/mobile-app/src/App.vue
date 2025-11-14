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

const { locale } = useI18n()

import ErrorNotification from './components/ErrorNotification.vue'

// Initialize theme system
useTheme()
</script>
