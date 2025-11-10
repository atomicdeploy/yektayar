<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
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
