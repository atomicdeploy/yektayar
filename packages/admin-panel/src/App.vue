<template>
  <div id="app" :dir="locale === 'fa' ? 'rtl' : 'ltr'">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
