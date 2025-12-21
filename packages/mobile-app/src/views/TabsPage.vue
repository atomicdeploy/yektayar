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

        <ion-tab-button tab="courses" href="/tabs/courses">
          <ion-icon :icon="school" />
          <ion-label>{{ t('courses') }}</ion-label>
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
import { home, chatbubbles, calendar, person, school } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({
  messages: {
    fa: {
      home: 'خانه',
      courses: 'دوره‌ها',
      chat: 'گفتگو',
      appointments: 'نوبت‌ها',
      profile: 'پروفایل'
    },
    en: {
      home: 'Home',
      courses: 'Courses',
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

  ion-icon {
    font-size: 24px;
    margin-bottom: 2px;
    transition: all 0.3s ease;
  }

  ion-label {
    font-size: 11px;
    font-weight: 500;
    margin-top: 2px;
  }

  &.tab-selected {
    font-weight: 600;
    position: relative;

    ion-icon {
      transform: translateY(-2px) scale(1.1);
    }

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: var(--tab-indicator-height);
      background: var(--secondary-gradient);
      border-radius: var(--tab-indicator-height) var(--tab-indicator-height) 0 0;
      box-shadow: var(--secondary-glow);
      --tab-indicator-height: 3px;
    }
  }
}
</style>
