<template>
  <ion-page>
    <ion-content class="error-content">
      <div class="error-container">
        <div class="error-icon">❌</div>
        <h1 class="error-title">{{ title }}</h1>
        <p class="error-message">{{ message }}</p>
        <div class="error-details" v-if="details">
          <p>{{ details }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'

interface Props {
  title?: string
  message: string
  details?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Configuration Error'
})
</script>

<style scoped>
.error-content {
  --background: #f8f9fa;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.125rem;
  color: #495057;
  margin-bottom: 1.5rem;
  max-width: 600px;
  line-height: 1.6;
}

.error-details {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 600px;
  width: 100%;
}

.error-details p {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
  font-family: monospace;
  word-break: break-word;
}
</style>
