<template>
  <ion-app :dir="locale === 'fa' ? 'rtl' : 'ltr'">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import { useRouter } from 'vue-router'

const { locale } = useI18n()
const router = useRouter()

// Initialize theme system with router
useTheme(router)
</script>
