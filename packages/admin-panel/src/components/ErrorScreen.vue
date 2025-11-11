<template>
  <div class="error-screen">
    <div class="error-container">
      <div class="error-icon">❌</div>
      <h1 class="error-title">{{ title }}</h1>
      <p class="error-message">{{ message }}</p>
      <div class="error-details" v-if="details">
        <p>{{ details }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
.error-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  max-width: 600px;
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
  line-height: 1.6;
}

.error-details {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
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
