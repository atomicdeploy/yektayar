<template>
  <ion-page>
    <ion-content class="splash-content" :fullscreen="true" :style="contentStyle">
      <div class="splash-container">
        <!-- Logo -->
        <div class="logo-container fade-in">
          <div class="logo-circle" :style="logoCircleStyle">
            <img src="/logo-simple.svg" alt="YektaYar Logo" class="logo-svg" />
          </div>
          <h1 class="app-title" :style="titleStyle">یکتایار</h1>
          <p class="app-subtitle" :style="subtitleStyle">همراه شما در مسیر سلامت روان</p>
          <p class="app-tagline" :style="taglineStyle">«تا خانواده با عشق و آرامش پابرجا بماند»</p>
          <p class="app-version" :style="versionStyle">
            YektaYar v0.1.0 – Color Tester
          </p>
        </div>

        <!-- Loading indicator -->
        <div class="loading-container fade-in">
          <ion-spinner name="crescent" :style="spinnerStyle"></ion-spinner>
          <p class="loading-text" :style="loadingTextStyle">در حال آماده‌سازی...</p>
        </div>
      </div>

      <!-- Color Scheme Selector -->
      <div class="color-selector">
        <ion-list class="selector-list">
          <ion-list-header>
            <ion-label>Select Color Scheme (Hotkeys 1-5)</ion-label>
          </ion-list-header>
          
          <ion-radio-group :value="selectedScheme" @ionChange="onSchemeChange">
            <ion-item v-for="(scheme, index) in colorSchemes" :key="index" lines="none" :button="true" @click="selectedScheme = index">
              <ion-radio :value="index" slot="start"></ion-radio>
              <ion-label>
                <h3>Scheme {{ index + 1 }} (Key: {{ index + 1 }})</h3>
                <p>BG: {{ scheme.background }} / FG: {{ scheme.foreground }}</p>
              </ion-label>
              <div class="color-preview" :style="{ background: scheme.background }" slot="end"></div>
            </ion-item>
          </ion-radio-group>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IonPage, IonContent, IonSpinner, IonList, IonListHeader, IonLabel, IonRadioGroup, IonRadio, IonItem } from '@ionic/vue'

interface ColorScheme {
  background: string
  backgroundGradient: string
  foreground: string
  accent: string
}

const colorSchemes: ColorScheme[] = [
  {
    background: '#01003A',
    backgroundGradient: 'linear-gradient(135deg, #01003A 0%, #02005A 50%, #01003A 100%)',
    foreground: '#d4a43e',
    accent: 'rgba(212, 164, 62, 0.15)'
  },
  {
    background: '#1A1F4A',
    backgroundGradient: 'linear-gradient(135deg, #1A1F4A 0%, #252A6A 50%, #1A1F4A 100%)',
    foreground: '#d4a43e',
    accent: 'rgba(212, 164, 62, 0.15)'
  },
  {
    background: '#2C2F5C',
    backgroundGradient: 'linear-gradient(135deg, #2C2F5C 0%, #3A3D7C 50%, #2C2F5C 100%)',
    foreground: '#d4a43e',
    accent: 'rgba(212, 164, 62, 0.15)'
  },
  {
    background: '#01183A',
    backgroundGradient: 'linear-gradient(135deg, #01183A 0%, #012952 50%, #01183A 100%)',
    foreground: '#d4a43e',
    accent: 'rgba(212, 164, 62, 0.15)'
  },
  {
    background: '#061D63',
    backgroundGradient: 'linear-gradient(135deg, #061D63 0%, #0A2883 50%, #061D63 100%)',
    foreground: '#d4a43e',
    accent: 'rgba(212, 164, 62, 0.15)'
  }
]

const selectedScheme = ref<number>(3) // Default to scheme 4 (original)

const currentScheme = computed(() => colorSchemes[selectedScheme.value])

const contentStyle = computed(() => ({
  '--background': currentScheme.value.backgroundGradient
}))

const logoCircleStyle = computed(() => ({
  background: currentScheme.value.accent,
  borderColor: `${currentScheme.value.foreground}50`
}))

const titleStyle = computed(() => ({
  color: currentScheme.value.foreground
}))

const subtitleStyle = computed(() => ({
  color: 'rgba(255, 255, 255, 0.95)'
}))

const taglineStyle = computed(() => ({
  color: currentScheme.value.foreground
}))

const versionStyle = computed(() => ({
  color: 'rgba(255, 255, 255, 0.6)'
}))

const loadingTextStyle = computed(() => ({
  color: 'rgba(255, 255, 255, 0.9)'
}))

const spinnerStyle = computed(() => ({
  '--color': currentScheme.value.foreground
}))

const onSchemeChange = (event: CustomEvent) => {
  selectedScheme.value = event.detail.value
}

// Hotkey support
const handleKeyPress = (event: KeyboardEvent) => {
  const key = parseInt(event.key)
  if (key >= 1 && key <= 5) {
    selectedScheme.value = key - 1
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.splash-content {
  /* Default gradient - will be overridden by contentStyle */
  --background: linear-gradient(135deg, #01183a 0%, #012952 50%, #01183a 100%);
}

.splash-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
  padding-bottom: 250px; /* Make room for color selector */
}

.logo-container {
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.logo-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-circle {
  width: 140px;
  height: 140px;
  background: rgba(212, 164, 62, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(212, 164, 62, 0.3);
  animation: pulse-gold 2.5s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(212, 164, 62, 0.2);
  transition: background 0.3s ease, border-color 0.3s ease;
}

.logo-svg {
  width: 90px;
  height: 90px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4a43e;
  margin: 0 0 0.5rem;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
  transition: color 0.3s ease;
}

.app-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 1rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

.app-tagline {
  font-family: 'IranNastaliq', 'Sahel', serif;
  font-size: 1.3rem;
  color: #d4a43e;
  margin: 0.8rem 0 1.2rem;
  font-weight: normal;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(212, 164, 62, 0.3);
  line-height: 1.8;
  animation: shimmer 3s ease-in-out infinite;
  transition: color 0.3s ease;
}

.app-version {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 0;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

.loading-container {
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s;
}

.loading-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.loading-text {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

ion-spinner {
  transform: scale(1.5);
  --color: #d4a43e;
}

.color-selector {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  max-height: 250px;
  overflow-y: auto;
}

.selector-list {
  background: transparent;
  padding: 0;
}

.selector-list ion-list-header {
  padding-left: 0;
  padding-bottom: 0.5rem;
}

.selector-list ion-list-header ion-label {
  color: #d4a43e;
  font-size: 0.9rem;
  font-weight: 600;
}

.selector-list ion-item {
  --background: transparent;
  --color: rgba(255, 255, 255, 0.9);
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 0.5rem;
}

.selector-list ion-item h3 {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  margin: 0 0 0.25rem;
}

.selector-list ion-item p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin: 0;
  font-family: monospace;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

ion-radio {
  --color: rgba(255, 255, 255, 0.6);
  --color-checked: #d4a43e;
}

@keyframes pulse-gold {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(212, 164, 62, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 32px rgba(212, 164, 62, 0.4), 0 0 0 15px rgba(212, 164, 62, 0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes glow {
  from {
    text-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(212, 164, 62, 0.3);
  }
  to {
    text-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(212, 164, 62, 0.6),
      0 0 30px rgba(212, 164, 62, 0.4);
  }
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
