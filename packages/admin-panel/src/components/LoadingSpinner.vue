<template>
  <div class="loading-spinner" :style="{ width: size, height: size }">
    <svg viewBox="0 0 50 50" class="spinner-svg">
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        :stroke="color"
        stroke-width="4"
        stroke-linecap="round"
        class="spinner-circle"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: '32px',
  color: 'currentColor',
})
</script>

<style scoped>
.loading-spinner {
  display: inline-block;
  animation: rotate 2s linear infinite;
}

.spinner-svg {
  width: 100%;
  height: 100%;
}

.spinner-circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
