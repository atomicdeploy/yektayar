<template>
  <ion-app :dir="locale === 'fa' ? 'rtl' : 'ltr'">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
</script>
