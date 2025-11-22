<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Custom Icon Test - Comprehensive</ion-title>
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
        <p class="subtitle">Comprehensive shadow-root verification</p>
        
        <!-- Test Results Summary -->
        <ion-card v-if="testResults.length > 0">
          <ion-card-header>
            <ion-card-title>Test Results Summary</ion-card-title>
            <ion-card-subtitle>
              {{ passedTests }}/{{ testResults.length }} tests passed
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="test-results">
              <div 
                v-for="(result, index) in testResults" 
                :key="index"
                class="test-result"
                :class="{ 'test-pass': result.passed, 'test-fail': !result.passed }"
              >
                <span class="test-icon">{{ result.passed ? '✓' : '✗' }}</span>
                <span class="test-name">{{ result.name }}</span>
                <span v-if="!result.passed" class="test-error">{{ result.error }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        
        <!-- Built-in Icons Section -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Built-in Icons (Reference)</ion-card-title>
            <ion-card-subtitle>Standard Ionicons for comparison</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="icon-showcase">
              <div class="icon-item">
                <ion-icon :icon="star" id="builtin-star" size="large" color="warning"></ion-icon>
                <p>Built-in Star</p>
                <code>&lt;ion-icon :icon="star"&gt;</code>
              </div>
              <div class="icon-item">
                <ion-icon :icon="heart" id="builtin-heart" size="large" color="danger"></ion-icon>
                <p>Built-in Heart</p>
                <code>&lt;ion-icon :icon="heart"&gt;</code>
              </div>
              <div class="icon-item">
                <ion-icon :icon="rocket" id="builtin-rocket" size="large" color="primary"></ion-icon>
                <p>Built-in Rocket</p>
                <code>&lt;ion-icon :icon="rocket"&gt;</code>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        
        <!-- Custom Icon Using src Attribute -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>YektaYar Logo (Custom Icon with src)</ion-card-title>
            <ion-card-subtitle>Using src="/logo-simple.svg" approach</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="icon-showcase">
              <div class="icon-item">
                <ion-icon src="/logo-simple.svg" id="custom-logo" size="large" color="warning"></ion-icon>
                <p>YektaYar Logo</p>
                <code>&lt;ion-icon src="/logo-simple.svg"&gt;</code>
              </div>
              <div class="icon-item">
                <img src="/logo-simple.svg" alt="Direct img tag" style="width: 64px; height: 64px;" />
                <p>Direct IMG Tag</p>
                <code>&lt;img src="/logo-simple.svg"&gt;</code>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        
        <!-- OLD APPROACH - Using name attribute (doesn't work) -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>❌ Old Approach (Not Working)</ion-card-title>
            <ion-card-subtitle>Using name="yektayar" with addIcons() - empty icon-inner</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="icon-showcase">
              <div class="icon-item">
                <ion-icon name="yektayar" id="custom-yektayar-old" size="large" color="warning"></ion-icon>
                <p>YektaYar (old approach)</p>
                <code>&lt;ion-icon name="yektayar"&gt;</code>
              </div>
            </div>
            <ion-note color="danger">
              This approach results in empty icon-inner in shadow-root
            </ion-note>
          </ion-card-content>
        </ion-card>
        
        <!-- Different Sizes -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Different Sizes</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="size-showcase">
              <div class="size-item">
                <ion-icon src="/logo-simple.svg" size="small"></ion-icon>
                <p>Small</p>
              </div>
              <div class="size-item">
                <ion-icon src="/logo-simple.svg"></ion-icon>
                <p>Default</p>
              </div>
              <div class="size-item">
                <ion-icon src="/logo-simple.svg" size="large"></ion-icon>
                <p>Large</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        
        <!-- In Buttons -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>In Buttons</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="button-showcase">
              <ion-button>
                <ion-icon slot="start" src="/logo-simple.svg"></ion-icon>
                Launch
              </ion-button>
              <ion-button color="warning">
                <ion-icon slot="start" :icon="star"></ion-icon>
                Favorite
              </ion-button>
              <ion-button fill="outline" color="primary">
                <ion-icon slot="icon-only" src="/logo-simple.svg"></ion-icon>
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
        
        <!-- Technical Details -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Technical Details</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <h3>✅ Correct Approach (Using src attribute)</h3>
            <div class="code-block">
&lt;ion-icon src="/logo-simple.svg"&gt;&lt;/ion-icon&gt;
            </div>
            <ul>
              <li>✓ Icon renders properly in shadow-root</li>
              <li>✓ icon-inner contains actual SVG content</li>
              <li>✓ Works consistently across frameworks</li>
              <li>✓ No need to register icons in code</li>
            </ul>
            
            <h3 style="margin-top: 1.5rem;">❌ Incorrect Approach (Using name with addIcons)</h3>
            <div class="code-block">
// In custom-icons.ts
addIcons({ 'yektayar': svgString })

// In template
&lt;ion-icon name="yektayar"&gt;&lt;/ion-icon&gt;
            </div>
            <ul>
              <li>✗ Results in empty icon-inner</li>
              <li>✗ Icon doesn't display</li>
              <li>✗ Complex registration process</li>
              <li>✗ Unreliable across environments</li>
            </ul>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonNote
} from '@ionic/vue'
import { arrowBack, star, heart, rocket } from 'ionicons/icons'

const router = useRouter()
const testResults = ref<Array<{ name: string; passed: boolean; error?: string }>>([])

const passedTests = computed(() => testResults.value.filter(r => r.passed).length)

const goBack = () => {
  router.back()
}

// Helper function to wait for icon to load
async function waitForIconToLoad(iconElement: HTMLElement, maxWait = 3000): Promise<void> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const shadowRoot = (iconElement as any).shadowRoot
    if (shadowRoot) {
      const iconInner = shadowRoot.querySelector('.icon-inner')
      if (iconInner && iconInner.children.length > 0) {
        return
      }
    }
  }
  
  throw new Error('Icon did not load within timeout')
}

// Test function for an icon
async function testIcon(id: string, name: string): Promise<{ name: string; passed: boolean; error?: string }> {
  try {
    const iconElement = document.querySelector(`#${id}`) as HTMLElement
    if (!iconElement) {
      return { name, passed: false, error: 'Icon element not found' }
    }
    
    // Wait for icon to load
    await waitForIconToLoad(iconElement)
    
    // Access shadow root
    const shadowRoot = (iconElement as any).shadowRoot
    if (!shadowRoot) {
      return { name, passed: false, error: 'Shadow root not found' }
    }
    
    // Check icon-inner exists and has content
    const iconInner = shadowRoot.querySelector('.icon-inner')
    if (!iconInner) {
      return { name, passed: false, error: 'icon-inner not found' }
    }
    
    if (iconInner.children.length === 0) {
      return { name, passed: false, error: 'icon-inner is empty (no children)' }
    }
    
    // Check for SVG content
    const svg = iconInner.querySelector('svg')
    if (!svg) {
      return { name, passed: false, error: 'SVG element not found in icon-inner' }
    }
    
    console.log(`✓ ${name}: Passed all checks`, {
      shadowRoot: !!shadowRoot,
      iconInner: !!iconInner,
      children: iconInner.children.length,
      svg: !!svg
    })
    
    return { name, passed: true }
  } catch (error) {
    console.error(`✗ ${name}: Failed`, error)
    return { name, passed: false, error: (error as Error).message }
  }
}

onMounted(async () => {
  console.log('=== Starting Icon Tests ===')
  
  // Wait a bit for all icons to render
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Test all icons
  const tests = [
    testIcon('builtin-star', 'Built-in Star'),
    testIcon('builtin-heart', 'Built-in Heart'),
    testIcon('builtin-rocket', 'Built-in Rocket'),
    testIcon('custom-logo', 'Custom Logo (src attribute)'),
    testIcon('custom-yektayar-old', 'Custom YektaYar (name attribute - expected to fail)')
  ]
  
  const results = await Promise.all(tests)
  testResults.value = results
  
  console.log('=== Test Results ===')
  console.log(`Passed: ${results.filter(r => r.passed).length}/${results.length}`)
  console.table(results)
})
</script>

<style scoped>
.test-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--ion-color-medium);
  margin-bottom: 1.5rem;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--ion-color-light);
}

.test-result.test-pass {
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid var(--ion-color-success);
}

.test-result.test-fail {
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid var(--ion-color-danger);
}

.test-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.test-result.test-pass .test-icon {
  color: var(--ion-color-success);
}

.test-result.test-fail .test-icon {
  color: var(--ion-color-danger);
}

.test-name {
  flex: 1;
  font-weight: 500;
}

.test-error {
  font-size: 0.85rem;
  color: var(--ion-color-danger);
  font-style: italic;
}

.icon-showcase {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 1rem 0;
}

.icon-item {
  text-align: center;
  padding: 1rem;
}

.icon-item ion-icon {
  margin-bottom: 0.75rem;
}

.icon-item p {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.icon-item code {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  display: block;
}

.size-showcase {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 1rem 0;
}

.size-item {
  text-align: center;
}

.size-item ion-icon {
  margin-bottom: 0.5rem;
}

.size-item p {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.button-showcase {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 1rem 0;
}

.code-block {
  background: var(--ion-color-dark);
  color: var(--ion-color-light);
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  margin: 0.75rem 0;
  overflow-x: auto;
  white-space: pre;
}

h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--ion-color-primary);
}

ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  line-height: 1.8;
}

li {
  margin-bottom: 0.25rem;
}

ion-card {
  margin-bottom: 1rem;
}

ion-note {
  display: block;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
}
</style>
