<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Custom Icon Test</ion-title>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="test-container">
        <h1>YektaYar Custom Icon Test</h1>
        
        <!-- Test Section 1: Default Size -->
        <div class="test-section">
          <h2>1. Default Size (32px)</h2>
          <div class="icon-display">
            <ion-icon name="yektayar" class="test-icon-32"></ion-icon>
          </div>
          <div class="code-display">
            &lt;ion-icon name="yektayar"&gt;&lt;/ion-icon&gt;
          </div>
        </div>

        <!-- Test Section 2: Large Size -->
        <div class="test-section">
          <h2>2. Large Size (64px)</h2>
          <div class="icon-display">
            <ion-icon name="yektayar" class="test-icon-64"></ion-icon>
          </div>
          <div class="code-display">
            &lt;ion-icon name="yektayar" style="font-size: 64px"&gt;&lt;/ion-icon&gt;
          </div>
        </div>

        <!-- Test Section 3: With Color -->
        <div class="test-section">
          <h2>3. Different Colors</h2>
          <div class="icon-row">
            <div class="icon-item">
              <ion-icon name="yektayar" class="test-icon-gold"></ion-icon>
              <p>Gold (default)</p>
            </div>
            <div class="icon-item">
              <ion-icon name="yektayar" class="test-icon-white"></ion-icon>
              <p>White</p>
            </div>
            <div class="icon-item">
              <ion-icon name="yektayar" class="test-icon-blue"></ion-icon>
              <p>Blue</p>
            </div>
          </div>
        </div>

        <!-- Test Section 4: In Circle Container (Like Welcome Screen) -->
        <div class="test-section">
          <h2>4. In Circle Container (Welcome Screen Style)</h2>
          <div class="logo-accent">
            <ion-icon name="yektayar" class="welcome-style-icon"></ion-icon>
          </div>
          <div class="code-display">
            Same as WelcomeScreen.vue
          </div>
        </div>

        <!-- Test Section 5: Inspect SVG -->
        <div class="test-section">
          <h2>5. SVG Inspection</h2>
          <p class="info-text">
            Open browser DevTools and inspect the icons above to see if the SVG paths are being rendered correctly.
            The icon should show the YektaYar logo with three path elements.
          </p>
        </div>

        <!-- Debug Info -->
        <div class="test-section debug-section">
          <h2>Debug Information</h2>
          <div class="debug-info">
            <p><strong>Icon Name:</strong> yektayar</p>
            <p><strong>Registration:</strong> {{ isIconRegistered ? '✓ Registered' : '✗ Not Registered' }}</p>
            <p><strong>Ionic Version:</strong> {{ ionicVersion }}</p>
            <pre v-if="debugInfo">{{ debugInfo }}</pre>
          </div>
          <div style="margin-top: 1rem;">
            <p><strong>Console Output:</strong></p>
            <p style="font-size: 0.9rem;">Open browser console (F12) to see icon registration logs</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/vue'
import { arrowBack } from 'ionicons/icons'

const router = useRouter()
const isIconRegistered = ref(false)
const ionicVersion = ref('8.x')
const debugInfo = ref('')

const goBack = () => {
  router.back()
}

onMounted(() => {
  // Check if the custom icon is registered
  // This is a simple check by looking at the DOM
  setTimeout(() => {
    const iconElement = document.querySelector('ion-icon[name="yektayar"]')
    if (iconElement) {
      const svgElement = iconElement.shadowRoot?.querySelector('svg')
      const paths = iconElement.shadowRoot?.querySelectorAll('path')
      isIconRegistered.value = !!svgElement
      
      // Gather debug info
      debugInfo.value = `
Icon Element: ${iconElement ? 'Found' : 'Not Found'}
Shadow Root: ${iconElement?.shadowRoot ? 'Present' : 'Missing'}
SVG Element: ${svgElement ? 'Present' : 'Missing'}
Path Count: ${paths?.length || 0}
SVG ViewBox: ${svgElement?.getAttribute('viewBox') || 'N/A'}
Icon Class: ${iconElement?.className || 'N/A'}
      `.trim()
      
      console.log('Icon Debug Info:', debugInfo.value)
      console.log('Shadow DOM:', iconElement?.shadowRoot)
    } else {
      debugInfo.value = 'Icon element not found in DOM'
    }
  }, 1000)
})
</script>

<style scoped>
.test-container {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.debug-info pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

h1 {
  text-align: center;
  color: var(--ion-color-primary);
  margin-bottom: 2rem;
}

.test-section {
  background: var(--ion-color-light);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  border: 2px solid var(--ion-color-medium);
}

.test-section h2 {
  color: var(--ion-color-secondary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.icon-display {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.icon-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
}

.icon-item {
  text-align: center;
}

.icon-item p {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.test-icon-32 {
  font-size: 32px;
  color: #d4a43e;
}

.test-icon-64 {
  font-size: 64px;
  color: #d4a43e;
}

.test-icon-gold {
  font-size: 48px;
  color: #d4a43e;
}

.test-icon-white {
  font-size: 48px;
  color: white;
  background: #01183a;
  padding: 1rem;
  border-radius: 8px;
}

.test-icon-blue {
  font-size: 48px;
  color: #2196F3;
}

/* Welcome Screen Style */
.logo-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #d4a43e 0%, #c99433 100%);
  box-shadow: 0 4px 20px rgba(212, 164, 62, 0.3);
  margin: 0 auto;
}

.welcome-style-icon {
  font-size: 40px;
  color: white;
}

.code-display {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
}

.info-text {
  line-height: 1.6;
  color: var(--ion-color-medium-shade);
}

.debug-section {
  background: #fff3cd;
  border-color: #ffc107;
}

.debug-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

.debug-info p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.debug-info strong {
  color: var(--ion-color-primary);
}
</style>
