<template>
  <div
    class="lazy-image-wrapper"
    :class="{ 'loaded': isLoaded, 'error': hasError }"
  >
    <!-- Loading state with blur effect -->
    <div
      v-if="!isLoaded && !hasError"
      class="image-placeholder"
    >
      <div class="image-skeleton" />
      <div class="loading-spinner">
        <ion-spinner
          name="crescent"
          color="primary"
        />
      </div>
    </div>

    <!-- Error state with broken image icon -->
    <div
      v-if="hasError"
      class="image-error"
    >
      <ion-icon
        :icon="imageOutline"
        class="error-icon"
      />
      <p class="error-text">
        تصویر بارگذاری نشد
      </p>
    </div>

    <!-- Actual image with responsive srcset -->
    <picture v-show="!hasError">
      <!-- WebP sources for different densities -->
      <source
        v-if="webpSrcset"
        :srcset="webpSrcset"
        type="image/webp"
      >
      
      <!-- Standard sources for different densities -->
      <source
        v-if="srcset"
        :srcset="srcset"
        :type="imageType"
      >

      <!-- Fallback image -->
      <img
        ref="imageRef"
        :src="src"
        :alt="alt"
        :class="['lazy-image', imageClass]"
        :loading="loading"
        @load="onLoad"
        @error="onError"
      >
    </picture>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonSpinner, IonIcon } from '@ionic/vue'
import { imageOutline } from 'ionicons/icons'

interface Props {
  src: string
  alt: string
  webpSrc?: string
  srcset?: string
  webpSrcset?: string
  imageClass?: string
  loading?: 'lazy' | 'eager'
  sizes?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  imageClass: '',
  sizes: '100vw'
})

const emit = defineEmits<{
  load: []
  error: []
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const hasError = ref(false)

const imageType = computed(() => {
  const ext = props.src.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp'
  }
  return typeMap[ext || 'jpg'] || 'image/jpeg'
})

const onLoad = () => {
  isLoaded.value = true
  emit('load')
}

const onError = () => {
  hasError.value = true
  emit('error')
}

// For eager loading, check if image is already cached
onMounted(() => {
  if (props.loading === 'eager' && imageRef.value?.complete) {
    isLoaded.value = true
  }
})
</script>

<style scoped>
.lazy-image-wrapper {
  display: flex;
  position: relative;
  overflow: hidden;
  background: var(--ion-color-light);
  width: 100%;
  height: 100%;
  min-height: inherit;
}

/* Image placeholder with blur effect */
.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(var(--ion-color-light-rgb), 0.2) 0%,
    rgba(var(--ion-color-light-rgb), 0.4) 50%,
    rgba(var(--ion-color-light-rgb), 0.2) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite ease-in-out;
}

.loading-spinner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner ion-spinner {
  transform: scale(1.5);
}

/* Error state */
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--ion-color-light-rgb), 0.5);
  backdrop-filter: blur(10px);
  padding: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--ion-color-medium);
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  text-align: center;
  margin: 0;
}

/* Actual image */
.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image-wrapper.loaded .lazy-image {
  opacity: 1;
}

/* Shimmer animation for loading skeleton */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .lazy-image-wrapper {
    background: var(--ion-color-dark);
  }

  .image-skeleton {
    background: linear-gradient(
      90deg,
      rgba(var(--ion-color-dark-rgb), 0.2) 0%,
      rgba(var(--ion-color-dark-rgb), 0.4) 50%,
      rgba(var(--ion-color-dark-rgb), 0.2) 100%
    );
  }
}
</style>
