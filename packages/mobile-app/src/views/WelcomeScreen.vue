<template>
  <ion-page>
    <ion-content :fullscreen="true" class="welcome-content" :scroll-y="true">
      <div class="welcome-container">
        <!-- Decorative background elements -->
        <div class="bg-decoration bg-decoration-1"></div>
        <div class="bg-decoration bg-decoration-2"></div>
        
        <!-- Header with Title and Logo -->
        <div class="welcome-header">
          <div class="logo-accent">
            <ion-icon :icon="heartOutline" class="heart-icon"></ion-icon>
          </div>
          <h1 class="welcome-title">خوش آمدید!</h1>
          <div class="title-underline"></div>
        </div>

        <!-- Hero Image with Lazy Loading (above text) -->
        <div class="hero-image-container">
          <LazyImage
            src="/welcome-hero.jpg"
            :srcset="`/welcome-hero.jpg 1x, /welcome-hero@2x.jpg 2x, /welcome-hero@3x.jpg 3x`"
            :webp-srcset="`/welcome-hero.webp 1x, /welcome-hero@2x.webp 2x, /welcome-hero@3x.webp 3x`"
            alt="خانواده شاد - یکتایار"
            image-class="hero-image"
            loading="eager"
            @error="onImageError"
          />
          <div class="image-overlay"></div>
        </div>

        <!-- Welcome Text Content with Card Style -->
        <div ref="welcomeTextOuter" class="welcome-text" :style="{ height: welcomeTextHeight }">
          <div ref="welcomeTextInner" class="welcome-text-inner">
            <p 
              v-for="(item, index) in typewriters" 
              :key="index"
              :ref="(el) => { paragraphRefs[index] = el as HTMLElement | null }"
              v-show="index === 0 || typewriters[index - 1].isComplete.value"
              class="welcome-paragraph"
              :class="{ 'highlight-first': index === 0 }"
            >
              <span v-html="item.displayText.value || '&nbsp;'"></span>
              <span v-if="item.isTyping.value && item.showCursor.value" class="typewriter-cursor"></span>
            </p>
          </div>
        </div>

        <!-- Terms Acceptance Checkbox -->
        <div 
          class="terms-container" 
          :class="{ 'terms-container-slide': FEATURE_CONFIG.enableSmoothAnimations }"
          v-if="allTypewritersComplete"
        >
          <label class="terms-checkbox">
            <input 
              type="checkbox" 
              v-model="termsAccepted" 
              class="checkbox-input"
            />
            <span class="checkbox-custom">
              <ion-icon :icon="checkmarkOutline" class="checkbox-icon"></ion-icon>
            </span>
            <span class="terms-text">
              <a href="#terms" @click.prevent="showTerms" class="terms-link">شرایط و قوانین</a>
              را خوانده‌ام و می‌پذیرم
            </span>
          </label>
        </div>

        <!-- Enhanced CTA Button - Only show after all typewriter effects complete -->
        <ion-button 
          v-if="allTypewritersComplete"
          :disabled="!termsAccepted"
          expand="block" 
          size="large" 
          class="cta-button"
          :class="{ 
            'cta-button-disabled': !termsAccepted,
            'cta-button-slide-down': FEATURE_CONFIG.enableSmoothAnimations && !ctaHasBeenShown
          }"
          @click="startApp"
        >
          <span class="button-content">
            <span class="button-icon">✨</span>
            <span class="button-text">شروع گفتگو</span>
          </span>
          <div class="button-shine"></div>
        </ion-button>

        <!-- Disclaimer with Icon -->
        <div class="disclaimer-container">
          <ion-icon :icon="lockClosedOutline" class="disclaimer-icon"></ion-icon>
          <p class="disclaimer-text">
            اطلاعات شما محرمانه است، و تنها برای کمک به شما استفاده می‌شود.
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { heartOutline, lockClosedOutline, checkmarkOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { logger } from '@yektayar/shared'
import apiClient from '@/api'
import LazyImage from '@/components/LazyImage.vue'
import { useTypewriter } from '@/composables/useTypewriter'
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useDebugConfigStore } from '@/stores/debugConfig'
import { createKeyboardHandler } from './WelcomeScreen.utils'

const router = useRouter()
const configStore = useDebugConfigStore()

const WELCOME_SHOWN_KEY = 'yektayar_welcome_shown'

// Get feature config from Pinia store
const FEATURE_CONFIG = computed(() => configStore.welcomeConfig)

// Terms acceptance state
const termsAccepted = ref(false)

// Welcome text height management
const welcomeTextOuter = ref<HTMLElement | null>(null)
const welcomeTextInner = ref<HTMLElement | null>(null)
const welcomeTextHeight = ref('auto')
const maxWelcomeTextHeight = ref<number | null>(null)

// Track if CTA button has been shown (for one-time animation)
const ctaHasBeenShown = ref(false)

// Welcome text paragraphs
const paragraphs = [
  'به <strong>یکتایار</strong> خوش اومدی؛ جایی که دیگه لازم نیست مشکلاتت رو توی دلت نگه داری. اینجا خیلی راحت می‌تونی حرف بزنی، احساساتت رو بگی و دغدغه‌هات رو مطرح کنی و فوراً یک نقشه مسیر علمی برای حل مشکلاتت بگیری.',
  'در یکتایار، دیگه خبری از سردرگمی و اتلاف وقت نیست؛ فوراً در مسیر درست حل مشکلاتت قرار می‌گیری، در کنارش سریع‌ترین راه برای دریافت وقت جلسات مشاوره جلوی پای تو هست و مطمئن می‌شی که همیشه یه تیم پشتیبان هم کنارت هست.',
  'از مشاوره و روان‌درمانی فردی گرفته تا زوج‌درمانی و خانواده درمانی، همه‌چی اینجا آمادست تا هر چه سریع‌تر، <u>آرامش</u>، <u>امنیت</u> و <u>حال خوب</u> به زندگیت بیاد.',
  'فقط کافیه رو دکمه‌ی شروع گفتگو بزنی و ببینی چطور همه‌چیز یکی‌یکی سر جاش قرار می‌گیره.'
]

// Initialize typewriter effects using a loop
const typewriters = paragraphs.map((text) => {
  const config = FEATURE_CONFIG.value
  const shouldSkip = configStore.skipTypewriter
  
  return useTypewriter(text, {
    speed: (config.enableTypewriter && !shouldSkip) ? 20 : 0,
    startDelay: 0,
    showCursor: config.enableTypewriter && !shouldSkip,
    mode: 'character',
    autoStart: !config.enableTypewriter || shouldSkip
  })
})

// Create refs for each paragraph to track viewport entry
const paragraphRefs = ref<(HTMLElement | null)[]>([])

// Set up intersection observers for each paragraph manually
const setupParagraphObservers = () => {
  const config = FEATURE_CONFIG.value
  const shouldSkip = configStore.skipTypewriter
  
  // If typewriter is disabled or should be skipped, mark all as complete
  if (!config.enableTypewriter || shouldSkip) {
    typewriters.forEach((tw, idx) => {
      tw.displayText.value = paragraphs[idx]
      tw.isComplete.value = true
      tw.isTyping.value = false
    })
    return
  }
  
  // If viewport waiting is disabled, start all immediately
  if (config.viewportWaitingMode === 'none') {
    typewriters.forEach((tw, index) => {
      if (index === 0) {
        tw.start()
      } else {
        // Watch for previous to complete
        watch(() => typewriters[index - 1].isComplete.value, (isComplete) => {
          if (isComplete && !tw.isTyping.value && !tw.isComplete.value) {
            setTimeout(() => tw.start(), 500)
          }
        }, { immediate: true })
      }
    })
    return
  }
  
  // If only first paragraph waits for viewport
  if (config.viewportWaitingMode === 'first') {
    paragraphRefs.value.forEach((element, index) => {
      if (!element) return
      
      if (index === 0) {
        // Only first paragraph uses viewport observer
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !typewriters[0].isTyping.value && !typewriters[0].isComplete.value) {
                logger.info('[WelcomeScreen] Starting first paragraph typewriter')
                typewriters[0].start()
                observer.unobserve(element)
              }
            })
          },
          { threshold: 0.2, rootMargin: '0px' }
        )
        observer.observe(element)
      } else {
        // Rest start when previous completes
        watch(() => typewriters[index - 1].isComplete.value, (isComplete) => {
          if (isComplete && !typewriters[index].isTyping.value && !typewriters[index].isComplete.value) {
            setTimeout(() => typewriters[index].start(), 500)
          }
        }, { immediate: true })
      }
    })
    return
  }
  
  // Default: 'all' mode - each paragraph waits for viewport entry
  paragraphRefs.value.forEach((element, index) => {
    if (!element) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Check if this typewriter should start
            const shouldStart = index === 0 || typewriters[index - 1].isComplete.value
            
            if (shouldStart && !typewriters[index].isTyping.value && !typewriters[index].isComplete.value) {
              logger.info(`[WelcomeScreen] Starting paragraph ${index + 1} typewriter`)
              setTimeout(() => {
                typewriters[index].start()
              }, index === 0 ? 0 : 500)
              observer.unobserve(element)
            } else if (index > 0 && !typewriters[index - 1].isComplete.value) {
              // Wait for previous to complete
              const unwatch = watch(() => typewriters[index - 1].isComplete.value, (isComplete) => {
                if (isComplete && entry.isIntersecting) {
                  logger.info(`[WelcomeScreen] Starting paragraph ${index + 1} after previous complete`)
                  setTimeout(() => {
                    typewriters[index].start()
                  }, 500)
                  observer.unobserve(element)
                  unwatch()
                }
              })
            }
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px'
      }
    )
    
    observer.observe(element)
  })
}

// Computed property to check if all typewriters are complete
const allTypewritersComplete = computed(() => {
  return typewriters.every(tw => tw.isComplete.value)
})

// Set up keyboard shortcuts using utility function
const handleKeyPress = createKeyboardHandler(typewriters, paragraphs)

// Watch for when CTA button first appears and mark it
watch(allTypewritersComplete, (isComplete) => {
  if (isComplete && !ctaHasBeenShown.value) {
    // Mark as shown after a short delay to allow animation to play
    setTimeout(() => {
      ctaHasBeenShown.value = true
    }, 1200) // Animation delay (0.6s) + animation duration (0.6s)
  }
})

// Fetch user preferences to check if terms were already accepted
const fetchUserPreferences = async () => {
  try {
    const response = await apiClient.get('/api/users/preferences')
    if (response.data?.termsAccepted) {
      termsAccepted.value = true
      logger.info('[WelcomeScreen] User has previously accepted terms')
    }
  } catch (error) {
    // If fetch fails, default to unchecked (false)
    logger.debug('[WelcomeScreen] Could not fetch user preferences, defaulting to unchecked')
  }
}

// Fetch preferences on mount
onMounted(async () => {
  // Set up keyboard shortcuts
  window.addEventListener('keydown', handleKeyPress)
  
  // Fetch user preferences first
  await fetchUserPreferences()
  
  // Then set up observers
  await nextTick()
  setupParagraphObservers()
  
  // Set up ResizeObserver to watch inner container height (only if feature enabled)
  if (FEATURE_CONFIG.value.enableDynamicHeight && welcomeTextInner.value) {
    // Get line height from computed style
    const computedStyle = window.getComputedStyle(welcomeTextInner.value.querySelector('.welcome-paragraph') || welcomeTextInner.value)
    const fontSize = parseFloat(computedStyle.fontSize)
    const lineHeight = parseFloat(computedStyle.lineHeight)
    const lineHeightPx = lineHeight > 10 ? lineHeight : fontSize * lineHeight
    
    let previousHeight = 0
    
    // Function to create virtual element with proper styles
    const createVirtualElement = (outerStyle: CSSStyleDeclaration) => {
      const virtualElement = document.createElement('div')
      
      // Copy only necessary styles to avoid animation/transition interference
      const stylesToCopy = ['boxSizing', 'padding', 'paddingTop', 'paddingBottom', 'direction', 'textAlign', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight']
      stylesToCopy.forEach(prop => {
        virtualElement.style[prop as any] = outerStyle[prop as any]
      })
      
      virtualElement.style.position = 'absolute'
      virtualElement.style.visibility = 'hidden'
      virtualElement.style.left = '-9999px'
      virtualElement.style.width = welcomeTextOuter.value!.offsetWidth + 'px'
      
      return virtualElement
    }
    
    // Function to recalculate max height dynamically
    const recalculateMaxHeight = (debugMode = false) => {
      if (!welcomeTextInner.value || !welcomeTextOuter.value) return
      
      const outerStyle = window.getComputedStyle(welcomeTextOuter.value)
      const virtualElement = createVirtualElement(outerStyle)
      
      // Create inner container to match structure
      const virtualInner = document.createElement('div')
      virtualInner.className = 'welcome-text-inner'
      
      // Add all paragraphs with full text
      paragraphs.forEach((text, index) => {
        const p = document.createElement('p')
        p.className = index === 0 ? 'welcome-paragraph highlight-first' : 'welcome-paragraph'
        p.innerHTML = text
        virtualInner.appendChild(p)
      })
      
      virtualElement.appendChild(virtualInner)
      document.body.appendChild(virtualElement)
      
      // Use scrollHeight to include all content including padding
      const paddingTop = parseFloat(outerStyle.paddingTop)
      const paddingBottom = parseFloat(outerStyle.paddingBottom)
      const calculatedMax = virtualElement.scrollHeight
      
      if (debugMode) {
        console.log('[WelcomeScreen] Height calculation debug:')
        console.log(`  Outer: ${welcomeTextOuter.value.offsetWidth}px wide, padding: ${paddingTop}/${paddingBottom}`)
        console.log(`  Virtual: ${calculatedMax}px, Inner: ${virtualInner.scrollHeight}px`)
        console.log(`  Actual inner: ${welcomeTextInner.value.scrollHeight}px`)
      }
      
      document.body.removeChild(virtualElement)
      
      maxWelcomeTextHeight.value = calculatedMax
      
      return calculatedMax
    }
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let height = entry.contentRect.height
        
        // Recalculate max height on each resize for accuracy
        const currentMax = recalculateMaxHeight(false)
        
        // Ensure height grows by at least one full line height
        if (previousHeight > 0 && height > previousHeight) {
          const diff = height - previousHeight
          if (diff < lineHeightPx) {
            height = previousHeight + lineHeightPx
          }
        }
        
        // Add one line height buffer to prevent text overflow
        height += lineHeightPx
        
        // But don't exceed max height
        if (currentMax && height > currentMax) {
          height = currentMax
        }
        
        // Overflow check: if text is overflowing, extend height to fit all content
        if (welcomeTextInner.value && welcomeTextInner.value.scrollHeight > height) {
          logger.warn(`[WelcomeScreen] Text overflow: ${welcomeTextInner.value.scrollHeight}px needed, ${height}px available`)
          
          // Show detailed debug info only when problem occurs
          recalculateMaxHeight(true)
          
          // Extend height to fit all content (use scrollHeight + buffer)
          height = welcomeTextInner.value.scrollHeight + lineHeightPx
          logger.info(`[WelcomeScreen] Extended height to ${height}px to fit content`)
        }
        
        welcomeTextHeight.value = `${height}px`
        previousHeight = height - lineHeightPx // Store without buffer for next comparison
      }
    })
    resizeObserver.observe(welcomeTextInner.value)
  }
})

// Cleanup keyboard shortcuts on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

const showTerms = () => {
  // TODO: Navigate to terms and conditions page or show modal
  logger.info('Show terms and conditions')
  // For now, just open in a new tab or show an alert
  alert('شرایط و قوانین استفاده از یکتایار در اینجا نمایش داده خواهد شد.')
}

const startApp = async () => {
  if (!termsAccepted.value) {
    logger.warn('Cannot start app without accepting terms')
    return
  }
  
  logger.info('User started the app from welcome screen')
  
  // Mark welcome screen as shown in localStorage
  localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
  
  // Also mark on backend if user is authenticated
  try {
    await apiClient.post('/api/users/preferences', {
      welcomeScreenShown: true,
      termsAccepted: true
    })
    logger.info('Welcome screen preference saved to backend')
  } catch (error) {
    // If backend call fails, it's okay - localStorage will handle it
    logger.warn('Failed to save welcome preference to backend:', error)
  }
  
  // TODO: Navigate back to the previous screen (if present) instead of home
  router.replace('/tabs/home')
}

const onImageError = () => {
  logger.warn('Welcome hero image failed to load')
}
</script>

<style scoped lang="scss">
.welcome-content {
  --background: linear-gradient(135deg, 
    #f8f9fa 0%, 
    #fff 20%, 
    #f0f4f8 80%, 
    #e9ecef 100%
  );
  position: relative;
  overflow: hidden;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 3rem 1.5rem 2rem;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Decorative background elements */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  z-index: 0;
  pointer-events: none;
}

.bg-decoration-1 {
  width: 300px;
  height: 300px;
  background: #d4a43e;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.bg-decoration-2 {
  width: 200px;
  height: 200px;
  background: #01183a;
  bottom: 100px;
  left: -50px;
  animation: float 8s ease-in-out infinite reverse;
}

/* Header styling */
.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.logo-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: linear-gradient(135deg, #d4a43e 0%, #c99433 100%);
  box-shadow: 0 4px 20px rgba(212, 164, 62, 0.3);
  margin: 0 auto 1rem;
  animation: scaleIn 0.5s ease-out;
}

.heart-icon {
  font-size: 32px;
  color: white;
  animation: heartbeat 2s ease-in-out infinite;
}

.welcome-title {
  font-size: 2.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #d4a43e 0%, #c99433 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 2px 8px rgba(212, 164, 62, 0.1);
  animation: fadeInDown 0.6s ease-out;
  letter-spacing: -0.5px;
}

.title-underline {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #d4a43e, transparent);
  margin: 0 auto;
  border-radius: 2px;
  animation: expandWidth 0.8s ease-out 0.3s both;
}

/* Hero image styling */
.hero-image-container {
  width: 100%;
  margin: 2rem 0;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: fadeInUp 0.8s ease-out 0.3s both;
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 280px;
}

.hero-image-container :deep(.lazy-image) {
  border-radius: 28px;
}

.hero-image-container:hover :deep(.lazy-image) {
  /* transform: scale(1.02); */
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(1, 24, 58, 0) 0%,
    rgba(1, 24, 58, 0.02) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Text content styling */
.welcome-text {
  text-align: justify;
  direction: rtl;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(212, 164, 62, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease-out 0.5s both;
  transition: height 0.3s ease-out;
  overflow: hidden;
}

.welcome-text-inner {
  /* Inner container that holds the actual content */
  padding-bottom: 1.25rem; /* Use padding instead of margin on last paragraph for proper height calculation */
}

.welcome-paragraph {
  font-size: 1.05rem;
  line-height: 2;
  color: #2c3e50;
  margin: 0 0 1.25rem 0;
  font-weight: 400;
  text-indent: 1.5rem;
}

.welcome-paragraph:last-child {
  margin-bottom: 0; /* Remove margin, use padding on parent instead */
}

.welcome-paragraph.highlight-first {
  font-size: 1.1rem;
  font-weight: 500;
  color: #01183a;
}

.welcome-paragraph :deep(strong) {
  color: #d4a43e;
  font-weight: 700;
}

/* Terms Acceptance Checkbox styling */
.terms-container {
  margin: 2rem 0 0 0; /* Added top margin back for proper spacing */
}

.terms-container-slide {
  animation: fadeInUp 0.6s ease-out both;
  animation-delay: 0.3s;
}

.terms-checkbox {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  direction: rtl;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  border-color: rgba(212, 164, 62, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.terms-checkbox:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(212, 164, 62, 0.3);
  /* transform: translateY(-2px); */
  box-shadow: 0 4px 12px rgba(212, 164, 62, 0.2);
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2.5px solid #d4a43e;
  border-radius: 8px;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.checkbox-icon {
  font-size: 20px;
  color: white;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-input:checked ~ .checkbox-custom {
  background: linear-gradient(135deg, #d4a43e 0%, #e8c170 100%);
  border-color: #d4a43e;
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(212, 164, 62, 0.2);
}

.checkbox-input:checked ~ .checkbox-custom .checkbox-icon {
  opacity: 1;
  transform: scale(1);
}

.terms-text {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.6;
  text-align: right;
}

.terms-link {
  color: #d4a43e;
  text-decoration: none;
  font-weight: 700;
  border-bottom: 2px solid rgba(212, 164, 62, 0.3);
  transition: all 0.2s;
  padding-bottom: 1px;
}

.terms-link:hover {
  color: #c99433;
  border-bottom-color: #c99433;
}

/* Typewriter cursor styling */
.typewriter-cursor {
  display: inline-block;
  width: 12px;
  height: 1.2em;
  background: #d4a43e;
  margin-left: 2px;
  margin-right: 2px;
  vertical-align: text-bottom;
  border-radius: 3px;
  animation: blink 1s infinite, glow 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(212, 164, 62, 0.6);
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(212, 164, 62, 0.6), 0 0 12px rgba(212, 164, 62, 0.4);
  }
  50% {
    box-shadow: 0 0 16px rgba(212, 164, 62, 0.8), 0 0 24px rgba(212, 164, 62, 0.6), 0 0 32px rgba(212, 164, 62, 0.4);
  }
}

/* CTA Button styling - Enhanced with gradient and effects */
.cta-button {
  --border-radius: 20px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  --box-shadow: 
    0 8px 32px rgba(212, 164, 62, 0.3),
    0 4px 16px rgba(1, 24, 58, 0.2);
  margin: 1.5rem 0 1.5rem 0;
  text-transform: none;
  font-size: 1.3rem;
  font-weight: 700;
  position: relative;
  overflow: hidden;
  /* TODO: can be "success" (green) in light mode, instead of branding's navy seal */
  background-image: linear-gradient(135deg, #d4a43e 0%, #e8c170 50%, #d4a43e 100%);
  background-size: 200% 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s ease-out;
  border-radius: var(--border-radius);
  --background: transparent; /* Fix for the `button-native` inside; otherwise it'll mask the actual cta-button */
}

.cta-button:not(.cta-button-disabled) {
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.cta-button:not(.cta-button-disabled):active {
  transform: scale(0.98);
  --box-shadow: 
    0 4px 16px rgba(212, 164, 62, 0.4),
    0 2px 8px rgba(1, 24, 58, 0.3);
}

/* SlideDown animation for CTA button - Define first so disabled can override */
.cta-button-slide-down {
  --final-opacity: 1;
  animation: slideDown 0.6s ease-out both;
  animation-delay: 0.6s;
}

.cta-button-disabled {
  --final-opacity: 0.5;
  opacity: var(--final-opacity);
  cursor: not-allowed;
  background-image: linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%);
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: var(--final-opacity);
    transform: translateY(0);
  }
}

/* Shine effect for CTA button */
.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.cta-button:not(.cta-button-disabled):hover .button-shine {
  left: 100%;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.cta-button:not(.cta-button-disabled):hover::before {
  width: 300px;
  height: 300px;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  pointer-events: none;
  color: #01183a;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.button-icon {
  font-size: 1.4rem;
  animation: bounce 2s ease-in-out infinite;
}

.button-text {
  font-size: 1.3rem;
  /* letter-spacing: -0.3px; */
}

/* Disclaimer styling */
.disclaimer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(108, 117, 125, 0.08);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  animation: fadeIn 0.8s ease-out 0.8s both;
  border: 1px solid rgba(108, 117, 125, 0.1);
}

.disclaimer-icon {
  font-size: 1.1rem;
  color: #6c757d;
  flex-shrink: 0;
}

.disclaimer-text {
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .welcome-content {
    --background: linear-gradient(135deg, 
      #0f1419 0%, 
      #1a1f2e 20%,
      #16213e 80%, 
      #0f1419 100%
    );
  }

  .bg-decoration-1 {
    background: #d4a43e;
    opacity: 0.03;
  }

  .bg-decoration-2 {
    background: #fff;
    opacity: 0.02;
  }

  .welcome-text {
    background: rgba(26, 31, 46, 0.6);
    border-color: rgba(212, 164, 62, 0.15);
  }

  .welcome-paragraph {
    color: #e9ecef;
  }

  .welcome-paragraph.highlight-first {
    color: #fff;
  }

  .hero-image-container {
    background: linear-gradient(135deg, #1a1f2e 0%, #16213e 100%);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .image-overlay {
    background: linear-gradient(
      180deg,
      rgba(1, 24, 58, 0.1) 0%,
      rgba(1, 24, 58, 0.3) 100%
    );
  }

  .disclaimer-container {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .disclaimer-text {
    color: #adb5bd;
  }

  .disclaimer-icon {
    color: #adb5bd;
  }

  .terms-checkbox {
    background: rgba(26, 31, 46, 0.6);
    border-color: transparent;
  }

  .terms-checkbox:hover {
    background: rgba(26, 31, 46, 0.8);
    border-color: rgba(212, 164, 62, 0.3);
  }

  .terms-text {
    color: #e9ecef;
  }

  .checkbox-custom {
    background: rgba(255, 255, 255, 0.1);
    border-color: #d4a43e;
  }

  .cta-button:not(.cta-button-disabled) {
    background: linear-gradient(135deg, #d4a43e 0%, #e8c170 50%, #d4a43e 100%);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .welcome-container {
    padding: 2rem 1.25rem 1.5rem;
  }

  .welcome-title {
    font-size: 2.25rem;
  }

  .welcome-paragraph {
    font-size: 1rem;
    line-height: 1.9;
  }

  .welcome-paragraph.highlight-first {
    font-size: 1.05rem;
  }

  .hero-image {
    max-height: 350px;
  }

  .cta-button {
    font-size: 1.2rem;
  }

  .button-text {
    font-size: 1.2rem;
  }

  .button-icon {
    font-size: 1.2rem;
  }

  .terms-text {
    font-size: 0.95rem;
  }

  .checkbox-custom {
    width: 26px;
    height: 26px;
  }

  .checkbox-icon {
    font-size: 18px;
  }
}

@media (max-width: 375px) {
  .welcome-container {
    padding: 1.5rem 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .logo-accent {
    width: 50px;
    height: 50px;
  }

  .heart-icon {
    font-size: 26px;
  }

  .welcome-text {
    padding: 1.25rem;
  }

  .welcome-paragraph {
    font-size: 0.95rem;
  }

  .welcome-paragraph.highlight-first {
    font-size: 1rem;
  }

  .hero-image {
    max-height: 300px;
  }

  .cta-button {
    font-size: 1.1rem;
  }

  .button-text {
    font-size: 1.1rem;
  }

  .button-icon {
    font-size: 1.2rem;
  }

  .terms-text {
    font-size: 0.9rem;
  }

  .checkbox-custom {
    width: 24px;
    height: 24px;
  }

  .checkbox-icon {
    font-size: 16px;
  }

  .disclaimer-text {
    font-size: 0.85rem;
  }
}
</style>
