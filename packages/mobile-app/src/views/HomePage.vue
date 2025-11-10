<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('welcome') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t('app_title') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <h1>{{ t('welcome') }}</h1>
        <p>Mobile app home page - to be implemented</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.container {
  padding: 1rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
</style>
