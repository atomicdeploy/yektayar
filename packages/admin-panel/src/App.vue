<template>
  <div id="app" :dir="locale === 'fa' ? 'rtl' : 'ltr'" :class="{ 'dark': isDark }">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'

const { locale } = useI18n()
const isDark = useDark()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100;
}

#app {
  min-height: 100vh;
}
</style>
