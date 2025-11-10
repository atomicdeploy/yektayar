<template>
  <div class="home">
    <h1>{{ t('welcome') }}</h1>
    <p>{{ t('admin_panel') }}</p>
    <router-link to="/dashboard">Go to Dashboard</router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.home {
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}
</style>
