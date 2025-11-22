<template>
  <Teleport to="body">
    <div class="error-notifications">
      <ion-toast
        v-for="error in errors"
        :key="error.id"
        :is-open="true"
        :message="formatErrorMessage(error)"
        :duration="10000"
        position="top"
        color="danger"
        @didDismiss="removeError(error.id)"
      >
        <template #buttons>
          <ion-button @click="removeError(error.id)">
            {{ $t('common.close') }}
          </ion-button>
        </template>
      </ion-toast>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonToast, IonButton } from '@ionic/vue'
import { useErrorStore } from '@/stores/error'

const errorStore = useErrorStore()
const errors = computed(() => errorStore.errors)

function formatErrorMessage(error: typeof errors.value[0]): string {
  let msg = `<strong>${error.title}</strong><br>${error.message}`
  if (error.details) {
    msg += `<br><small>${error.details}</small>`
  }
  return msg
}

function removeError(id: string) {
  errorStore.removeError(id)
}
</script>

<style scoped>
.error-notifications {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
}

.error-notifications ion-toast {
  pointer-events: auto;
}
</style>
