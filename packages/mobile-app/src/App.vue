<template>
  <ion-app :dir="locale === 'fa' ? 'rtl' : 'ltr'">
    <!-- Network status indicator -->
    <div v-if="!isOnline" class="offline-banner">
      <ion-icon :icon="cloudOfflineOutline" />
      <span>{{ t('offline_mode') }}</span>
    </div>
    <div v-if="wasOffline && isOnline" class="online-banner">
      <ion-icon :icon="cloudDoneOutline" />
      <span>{{ t('back_online') }}</span>
    </div>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/vue'
import { cloudOfflineOutline, cloudDoneOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import { useNetworkStatus } from './composables/useNetworkStatus'
import { useRoutePrefetch } from './composables/useRoutePrefetch'
import { useRouter, useRoute } from 'vue-router'
import { watch } from 'vue'

const { locale, t } = useI18n({
  messages: {
    fa: {
      offline_mode: 'حالت آفلاین - برخی امکانات ممکن است محدود باشند',
      back_online: 'اتصال برقرار شد'
    },
    en: {
      offline_mode: 'Offline mode - Some features may be limited',
      back_online: 'Connection restored'
    }
  }
})

// Initialize theme system
useTheme()

// Initialize network status monitoring
const { isOnline, wasOffline } = useNetworkStatus()

// Initialize route prefetching
const router = useRouter()
const route = useRoute()
const { prefetchAdjacentTabs } = useRoutePrefetch(router)

// Prefetch adjacent tabs when navigating
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/tabs/')) {
    prefetchAdjacentTabs(newPath)
  }
})
</script>

<style scoped>
.offline-banner,
.online-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

.offline-banner {
  background: var(--ion-color-warning);
  color: var(--ion-color-warning-contrast);
}

.online-banner {
  background: var(--ion-color-success);
  color: var(--ion-color-success-contrast);
  animation: slideDown 0.3s ease-out, slideUp 0.3s ease-out 2.7s forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}
</style>
