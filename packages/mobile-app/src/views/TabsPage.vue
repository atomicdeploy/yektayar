<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="app-tab-bar">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="home" />
          <ion-label>{{ t('home') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="chat" href="/tabs/chat">
          <ion-icon :icon="chatbubbles" />
          <ion-label>{{ t('chat') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="appointments" href="/tabs/appointments">
          <ion-icon :icon="calendar" />
          <ion-label>{{ t('appointments') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="person" />
          <ion-label>{{ t('profile') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from '@ionic/vue'
import { home, chatbubbles, calendar, person } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({
  messages: {
    fa: {
      home: 'خانه',
      chat: 'گفتگو',
      appointments: 'نوبت‌ها',
      profile: 'پروفایل'
    },
    en: {
      home: 'Home',
      chat: 'Chat',
      appointments: 'Appointments',
      profile: 'Profile'
    }
  }
})
</script>

<style scoped lang="scss">
ion-tab-button {
  --color: var(--text-secondary);
  --color-selected: var(--ion-color-primary);
  --ripple-color: var(--ion-color-primary-tint);
  font-weight: 500;
  transition: all 0.3s ease;
}

ion-tab-button ion-icon {
  font-size: 24px;
  margin-bottom: 2px;
  transition: all 0.3s ease;
}

ion-tab-button ion-label {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}

ion-tab-button.tab-selected {
  font-weight: 600;
  position: relative;
}

ion-tab-button.tab-selected ion-icon {
  transform: translateY(-2px) scale(1.1);
}

ion-tab-button.tab-selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--secondary-gradient);
  border-radius: 0 0 3px 3px;
  box-shadow: var(--secondary-glow);
}
</style>
