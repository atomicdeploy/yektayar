<template>
  <transition name="fade">
    <div v-if="isLoading" class="route-loading-overlay">
      <div class="loading-content">
        <ion-spinner name="circular" color="primary" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { IonSpinner } from '@ionic/vue'

const router = useRouter()
const isLoading = ref(false)
const navigationId = ref(0)

// Show loading indicator during route transitions
const removeBeforeEach = router.beforeEach((_to, _from, next) => {
  // Only show loading for tab navigation routes
  if (_to.path.startsWith('/tabs/') && _from.path.startsWith('/tabs/')) {
    navigationId.value++
    isLoading.value = true
  }
  next()
})

const removeAfterEach = router.afterEach(() => {
  const currentNavId = navigationId.value
  // Add a small delay to ensure smooth transition
  setTimeout(() => {
    // Only hide if no new navigation has started
    if (currentNavId === navigationId.value) {
      isLoading.value = false
    }
  }, 150)
})

// Clean up router guards when component is unmounted
onBeforeUnmount(() => {
  removeBeforeEach()
  removeAfterEach()
})
</script>

<style scoped lang="scss">
.route-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .route-loading-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

ion-spinner {
  width: 48px;
  height: 48px;
  --color: var(--ion-color-primary);
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
