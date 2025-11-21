<template>
  <UrlValidator>
    <ion-app :dir="locale === 'fa' ? 'rtl' : 'ltr'">
      <ion-router-outlet />
    </ion-app>
  </UrlValidator>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import UrlValidator from './components/UrlValidator.vue'

const { locale } = useI18n()

// Initialize theme system
useTheme()
</script>
