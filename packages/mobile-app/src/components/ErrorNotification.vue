<template>
  <Teleport to="body">
    <TransitionGroup
      name="notification"
      tag="div"
      class="error-notifications"
      :class="{ 'rtl': isRTL }"
    >
      <ion-card
        v-for="error in errors"
        :key="error.id"
        class="error-card"
      >
        <ion-card-header>
          <ion-card-title class="error-title">
            <ion-icon :icon="alertCircle" class="error-icon" />
            {{ error.title }}
            <ion-button
              fill="clear"
              size="small"
              @click="removeError(error.id)"
              class="close-button"
            >
              <ion-icon :icon="close" />
            </ion-button>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p class="error-message">{{ error.message }}</p>
          <p v-if="error.details" class="error-details">{{ error.details }}</p>
        </ion-card-content>
      </ion-card>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon } from '@ionic/vue'
import { alertCircle, close } from 'ionicons/icons'
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
.error-notifications {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 24rem;
  width: 100%;
  max-width: 90vw;
}

.error-notifications.rtl {
  left: 1rem;
  right: auto;
}

.error-card {
  background: var(--ion-color-danger-tint);
  border: 1px solid var(--ion-color-danger);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ion-color-danger-contrast);
  font-size: 0.875rem;
  font-weight: 600;
}

.error-icon {
  font-size: 1.25rem;
  color: var(--ion-color-danger);
}

.close-button {
  margin-left: auto;
  --color: var(--ion-color-danger-contrast);
}

.error-message {
  color: var(--ion-color-danger-shade);
  font-size: 0.875rem;
  margin: 0;
}

.error-details {
  color: var(--ion-color-danger-shade);
  font-size: 0.75rem;
  font-family: monospace;
  margin: 0.5rem 0 0;
  word-break: break-word;
}

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
