<template>
  <div id="app" :dir="locale === 'fa' ? 'rtl' : 'ltr'" :class="{ 'dark': isDark }">
    <router-view />
    <ErrorNotification />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import ErrorNotification from './components/ErrorNotification.vue'

const { locale } = useI18n()
const { isDark } = useTheme()
</script>
