<template>
  <Teleport to="body">
    <TransitionGroup
      name="notification"
      tag="div"
      class="fixed bottom-4 right-4 z-50 space-y-2 max-w-md"
      :class="{ 'left-4 right-auto': isRTL }"
    >
      <div
        v-for="error in errors"
        :key="error.id"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 flex items-start gap-3"
        role="alert"
      >
        <ExclamationTriangleIcon class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
            {{ error.title }}
          </h4>
          <p class="text-sm text-red-700 dark:text-red-400 break-words">
            {{ error.message }}
          </p>
          <p v-if="error.details" class="text-xs text-red-600 dark:text-red-500 mt-1 font-mono">
            {{ error.details }}
          </p>
        </div>
        <button
          @click="removeError(error.id)"
          class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 flex-shrink-0"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useErrorStore } from '@/stores/error'

const { locale } = useI18n()
const errorStore = useErrorStore()

const isRTL = computed(() => locale.value === 'fa')
const errors = computed(() => errorStore.errors)

function removeError(id: string) {
  errorStore.removeError(id)
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
