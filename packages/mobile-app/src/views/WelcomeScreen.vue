<template>
  <ion-page>
    <ion-content :fullscreen="true" class="welcome-content" :scroll-y="true" :scrollEvents="true">
      <!-- 
        OverlayScrollbars temporarily disabled due to animation replay bug.
        
        Issue: OverlayScrollbars causes page animations to replay when CTA/terms appear.
        Root cause: OverlayScrollbars creates internal DOM structure that triggers layout
        changes and animation events when content height changes dynamically.
        
        Attempted fixes:
        - Added event.target filtering to ignore child elements
        - Added containerReady state check to prevent re-triggering
        - Added OverlayScrollbars element filtering (.os-scrollbar class)
        - Added explicit overflow configuration
        
        Result: Animation replay still occurs despite event isolation attempts.
        
        Note: Native scroll handlers now implemented for scroll reminder (ionScroll, wheel, scroll events).
        
        TODO: Investigate deeper integration approach or alternative scrolling solution.
      -->
      <!-- <OverlayScrollbarsComponent
        class="scrollable-content"
        :options="{
          scrollbars: {
            theme: 'os-theme-yektayar-mobile',
            visibility: 'auto',
            autoHide: 'scroll',
            autoHideDelay: 1300
          },
          overflow: {
            x: 'hidden',
            y: 'scroll'
          }
        }"
        defer
      > -->
      <div class="welcome-container">
        <!-- Decorative background elements -->
        <div class="bg-decoration bg-decoration-1"></div>
        <div class="bg-decoration bg-decoration-2"></div>
        
        <!-- Header with Title and Logo -->
        <div ref="headerRef" class="welcome-header" :class="{ 'exit-header': exitStates.header }">
          <div class="logo-accent">
            <ion-icon :icon="heartOutline" class="heart-icon"></ion-icon>
          </div>
          <h1 class="welcome-title">خوش آمدید!</h1>
          <div class="title-underline"></div>
        </div>

        <!-- Hero Image with Lazy Loading (above text) -->
        <div 
          ref="heroContainerRef"
          class="hero-image-container"
          :class="{ 'exit-hero': exitStates.hero }"
        >
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
        <div 
          ref="welcomeTextOuter" 
          class="welcome-text" 
          :class="{ 'exit-text': exitStates.text }"
          :style="{ height: welcomeTextHeight }"
        >
          <div ref="welcomeTextInner" class="welcome-text-inner">
            <p 
              v-for="(item, index) in typewriters" 
              :key="index"
              :ref="(el: unknown) => { paragraphRefs[index] = el as HTMLElement | null }"
              v-show="index === 0 || typewriters[index - 1].isComplete.value"
              class="welcome-paragraph"
              :class="{ 'highlight-first': index === 0 }"
            >
              <span v-html="item.displayText.value || '&nbsp;'"></span>
              <span v-if="(item.isTyping.value || (index === 0 && !item.isComplete.value && FEATURE_CONFIG.showCursorInitially)) && item.showCursor.value" class="typewriter-cursor"></span>
            </p>
          </div>
        </div>

        <!-- Terms Acceptance Checkbox -->
        <div 
          ref="termsContainerRef"
          class="terms-container" 
          :class="{ 
            'terms-container-slide': FEATURE_CONFIG.enableSmoothAnimations,
            'exit-terms': exitStates.terms 
          }"
          v-if="allTypewritersComplete"
        >
          <label class="terms-checkbox">
            <input 
              type="checkbox" 
              v-model="termsAccepted" 
              :disabled="isLoading"
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
          ref="ctaButtonRef"
          v-if="allTypewritersComplete"
          :disabled="!termsAccepted || isLoading"
          expand="block" 
          size="large" 
          class="cta-button"
          :class="{ 
            'cta-button-disabled': !termsAccepted || isLoading,
            'cta-button-slide-down': FEATURE_CONFIG.enableSmoothAnimations && !ctaHasBeenShown,
            'cta-button-loading': isLoading,
            'exit-cta': exitStates.cta
          }"
          @click="startApp"
        >
          <span class="button-content">
            <span v-if="isLoading" class="button-spinner">
              <ion-icon class="spinner-icon"></ion-icon>
            </span>
            <template v-else>
              <span class="button-icon">✨</span>
              <span class="button-text">شروع گفتگو</span>
            </template>
          </span>
          <div class="button-shine"></div>
        </ion-button>

        <!-- Error Message -->
        <div 
          v-if="errorMessage" 
          class="error-message"
        >
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <span class="error-text">{{ errorMessage }}</span>
        </div>

        <!-- Scroll Reminder -->
        <transition name="scroll-reminder-fade">
          <div 
            v-if="showScrollReminder"
            class="scroll-reminder"
            @click="scrollToBottom"
          >
            <div class="scroll-reminder-content">
              <div class="scroll-reminder-icon">
                <ion-icon :icon="chevronDownOutline" class="scroll-icon"></ion-icon>
              </div>
              <p class="scroll-reminder-text">برای مشاهده بیشتر به پایین بروید</p>
            </div>
            <div class="scroll-reminder-mask"></div>
          </div>
        </transition>

        <!-- Disclaimer with Icon -->
        <div ref="disclaimerRef" class="disclaimer-container" :class="{ 'exit-disclaimer': exitStates.disclaimer }">
          <ion-icon :icon="lockClosedOutline" class="disclaimer-icon"></ion-icon>
          <p class="disclaimer-text">
            اطلاعات شما محرمانه است، و تنها برای کمک به شما استفاده می‌شود.
          </p>
        </div>
      </div>
      <!-- </OverlayScrollbarsComponent> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { heartOutline, lockClosedOutline, checkmarkOutline, alertCircleOutline, chevronDownOutline } from 'ionicons/icons'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { logger } from '@yektayar/shared'
import apiClient from '@/api'
import LazyImage from '@/components/LazyImage.vue'
import { useTypewriter } from '@/composables/useTypewriter'
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useDebugConfigStore } from '@/stores/debugConfig'
import { createKeyboardHandler } from './WelcomeScreen.utils'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const configStore = useDebugConfigStore()

const WELCOME_SHOWN_KEY = 'yektayar_welcome_shown'

// Get intended destination from query params or default to home
const intendedDestination = ref<string>((route.query.redirect as string) || '/tabs/home')

// Get feature config from Pinia store
const FEATURE_CONFIG = computed(() => configStore.welcomeConfig)

// Terms acceptance state
const termsAccepted = ref(false)

// Loading and error states
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Exit animation state - removed simple boolean approach
// Individual element exit states for event-based control
const exitStates = ref({
  cta: false,
  terms: false,
  text: false,
  hero: false,
  header: false,
  disclaimer: false
})

// Refs for elements that need to exit
const ctaButtonRef = ref<HTMLElement | null>(null)
const termsContainerRef = ref<HTMLElement | null>(null)
const heroContainerRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const disclaimerRef = ref<HTMLElement | null>(null)

// Scroll reminder state
const showScrollReminder = ref(false)
const userHasScrolled = ref(false)
let scrollReminderTimeout: ReturnType<typeof setTimeout> | null = null
let activityTimeout: ReturnType<typeof setTimeout> | null = null
let scrollElement: HTMLElement | null = null
let keydownHandler: ((e: KeyboardEvent) => void) | null = null

// Welcome text height management
const welcomeTextOuter = ref<HTMLElement | null>(null)
const welcomeTextInner = ref<HTMLElement | null>(null)
const welcomeTextHeight = ref('auto')
const maxWelcomeTextHeight = ref<number | null>(null)

// Track if CTA button has been shown (for one-time animation)
const ctaHasBeenShown = ref(false)

// Track readiness for typewriter start
const containerReady = ref(false)
const initialHeightSet = ref(false)

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

// Helper to check if all conditions are met to start typewriter
const canStartTypewriter = () => {
  const config = FEATURE_CONFIG.value
  
  // Always wait for container to be ready
  if (!containerReady.value) return false
  
  // If dynamic height is enabled, wait for initial height to be set
  if (config.enableDynamicHeight && !initialHeightSet.value) return false
  
  return true
}

// Helper to start typewriter with proper delay and conditions check
const startTypewriterWithConditions = (
  index: number,
  entry: IntersectionObserverEntry,
  observer: IntersectionObserver,
  element: HTMLElement
) => {
  const delay = index === 0 ? 0 : 500 // 0.2s delay for first paragraph, 0.5s for others
  
  if (canStartTypewriter()) {
    logger.info(`[WelcomeScreen] Starting paragraph ${index + 1} typewriter`)
    setTimeout(() => {
      typewriters[index].start()
    }, delay)
    observer.unobserve(element)
  } else {
    // Watch for readiness conditions
    const unwatchReady = watch([containerReady, initialHeightSet], () => {
      if (canStartTypewriter() && entry.isIntersecting) {
        logger.info(`[WelcomeScreen] Starting paragraph ${index + 1} typewriter (after waiting)`)
        setTimeout(() => {
          typewriters[index].start()
        }, delay)
        observer.unobserve(element)
        unwatchReady()
      }
    })
  }
}

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
        setTimeout(() => tw.start(), 200) // 0.2s delay for first paragraph
      } else {
        // Watch for previous to complete
        watch(() => typewriters[index - 1].isComplete.value, (isComplete: boolean) => {
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
    paragraphRefs.value.forEach((element: HTMLElement | null, index: number) => {
      if (!element) return
      
      if (index === 0) {
        // Only first paragraph uses viewport observer
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !typewriters[0].isTyping.value && !typewriters[0].isComplete.value) {
                startTypewriterWithConditions(0, entry, observer, element)
              }
            })
          },
          { threshold: 0.2, rootMargin: '0px' }
        )
        observer.observe(element)
      } else {
        // Rest start when previous completes
        watch(() => typewriters[index - 1].isComplete.value, (isComplete: boolean) => {
          if (isComplete && !typewriters[index].isTyping.value && !typewriters[index].isComplete.value) {
            setTimeout(() => typewriters[index].start(), 500)
          }
        }, { immediate: true })
      }
    })
    return
  }
  
  // Default: 'all' mode - each paragraph waits for viewport entry
  paragraphRefs.value.forEach((element: HTMLElement | null, index: number) => {
    if (!element) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Check if this typewriter should start
            const shouldStart = index === 0 || typewriters[index - 1].isComplete.value
            
            if (shouldStart && !typewriters[index].isTyping.value && !typewriters[index].isComplete.value) {
              startTypewriterWithConditions(index, entry, observer, element)
            } else if (index > 0 && !typewriters[index - 1].isComplete.value) {
              // Wait for previous to complete
              const unwatch = watch(() => typewriters[index - 1].isComplete.value, (isComplete: boolean) => {
                if (isComplete && entry.isIntersecting) {
                  startTypewriterWithConditions(index, entry, observer, element)
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

// Debug hotkey: Numpad Dash to toggle exit animation (for testing)
const handleDebugKey = (event: KeyboardEvent) => {
  // Numpad Dash (109) or regular Dash with Numpad modifier
  if (event.key === 'Subtract' || (event.code === 'NumpadSubtract')) {
    event.preventDefault()
    logger.info('[WelcomeScreen] Debug hotkey pressed - toggling exit animation')
    
    // Toggle loading state
    isLoading.value = !isLoading.value
    
    if (isLoading.value) {
      // Simulate exit animation
      exitElementsSequentially().catch(error => {
        logger.error('[WelcomeScreen] Debug exit animation error:', error)
      })
    } else {
      // Reset exit states to restore elements
      resetExitStates()
    }
  }
}

// Watch for when CTA button first appears and mark it
watch(allTypewritersComplete, (isComplete: boolean) => {
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
  window.addEventListener('keydown', handleDebugKey)
  
  // Fetch user preferences first
  await fetchUserPreferences()
  
  // Wait for next tick to ensure DOM is ready
  await nextTick()
  
  // Listen for transitions/animations on welcome-container
  const welcomeContainer = document.querySelector('.welcome-container')
  if (welcomeContainer) {
    const style = window.getComputedStyle(welcomeContainer)
    const hasTransition = style.transitionDuration && parseFloat(style.transitionDuration) > 0
    const hasAnimation = style.animationDuration && parseFloat(style.animationDuration) > 0
    
    if (hasTransition || hasAnimation) {
      // Set up event listeners with additional filtering
      const handleTransitionEnd = (event: TransitionEvent) => {
        // Only respond to events from the container itself, not children or OverlayScrollbars elements
        if (event.target === welcomeContainer && !containerReady.value) {
          // Check that the target is not an OverlayScrollbars internal element
          const target = event.target as HTMLElement
          if (!target.classList.contains('os-scrollbar') && !target.closest('.os-scrollbar')) {
            containerReady.value = true
            logger.info('[WelcomeScreen] Container transition complete, ready for typewriter')
            welcomeContainer.removeEventListener('transitionend', handleTransitionEnd)
          }
        }
      }
      
      const handleAnimationEnd = (event: AnimationEvent) => {
        // Only respond to events from the container itself, not children or OverlayScrollbars elements
        if (event.target === welcomeContainer && !containerReady.value) {
          // Check that the target is not an OverlayScrollbars internal element
          const target = event.target as HTMLElement
          if (!target.classList.contains('os-scrollbar') && !target.closest('.os-scrollbar')) {
            containerReady.value = true
            logger.info('[WelcomeScreen] Container animation complete, ready for typewriter')
            welcomeContainer.removeEventListener('animationend', handleAnimationEnd)
          }
        }
      }
      
      if (hasTransition) {
        welcomeContainer.addEventListener('transitionend', handleTransitionEnd)
      }
      if (hasAnimation) {
        welcomeContainer.addEventListener('animationend', handleAnimationEnd)
      }
      
      // Fallback timeout in case events don't fire
      setTimeout(() => {
        if (!containerReady.value) {
          containerReady.value = true
          logger.info('[WelcomeScreen] Container ready (fallback timeout)')
        }
      }, 2000)
    } else {
      // No transition or animation, mark as ready immediately
      containerReady.value = true
    }
  } else {
    // Container not found, mark as ready
    containerReady.value = true
  }
  
  // Set up observers
  setupParagraphObservers()
  
  // Set up scroll and activity listeners for scroll reminder
  await nextTick()
  const content = document.querySelector('ion-content')
  if (content) {
    // Listen for Ionic scroll events (touch/swipe on mobile)
    content.addEventListener('ionScroll', handleScroll)
    logger.info('[WelcomeScreen] ionScroll event listener added to ion-content')
    
    // Get the actual scrollable element inside ion-content for wheel/keyboard events
    scrollElement = await content.getScrollElement()
    if (scrollElement) {
      // Listen for wheel events (desktop mouse wheel)
      scrollElement.addEventListener('wheel', handleScroll, { passive: true })
      // Listen for scroll events (fallback for keyboard and other scroll methods)
      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
      logger.info('[WelcomeScreen] wheel and scroll event listeners added to scroll element')
    } else {
      logger.warn('[WelcomeScreen] Scroll element not found inside ion-content')
    }
  } else {
    logger.warn('[WelcomeScreen] ion-content not found - scroll listener not added')
  }
  
  // Listen for keyboard events (arrow keys, page up/down, etc.)
  keydownHandler = (e: KeyboardEvent) => {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
    if (scrollKeys.includes(e.key)) {
      logger.debug('[WelcomeScreen] Scroll key pressed:', e.key)
      handleUserActivity(e)
    }
  }
  window.addEventListener('keydown', keydownHandler)
  
  window.addEventListener('click', handleUserActivity)
  window.addEventListener('touchstart', handleUserActivity)
  logger.info('[WelcomeScreen] Activity listeners (click, touchstart, keydown) added to window')
  
  // Set up ResizeObserver to watch inner container height (only if feature enabled)
  if (FEATURE_CONFIG.value.enableDynamicHeight && welcomeTextInner.value) {
    // Get line height from computed style
    const computedStyle = window.getComputedStyle(welcomeTextInner.value.querySelector('.welcome-paragraph') || welcomeTextInner.value)
    const fontSize = parseFloat(computedStyle.fontSize)
    const lineHeight = parseFloat(computedStyle.lineHeight)
    const lineHeightPx = lineHeight > 10 ? lineHeight : fontSize * lineHeight
    
    let previousHeight = 0
    let isFirstHeight = true
    
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
        
        // Mark initial height as set on first observation
        if (isFirstHeight) {
          isFirstHeight = false
          initialHeightSet.value = true
          logger.info('[WelcomeScreen] Initial height set, ready for typewriter')
        }
      }
    })
    resizeObserver.observe(welcomeTextInner.value)
  } else {
    // If dynamic height is disabled, mark as set immediately
    initialHeightSet.value = true
  }
})

// Scroll reminder logic
const handleScroll = (event?: any) => {
  logger.info('[WelcomeScreen] handleScroll triggered', {
    userHasScrolled: userHasScrolled.value,
    showScrollReminder: showScrollReminder.value,
    eventType: event?.type,
    detail: event?.detail
  })
  
  if (!userHasScrolled.value) {
    userHasScrolled.value = true
    logger.info('[WelcomeScreen] User has scrolled - hiding scroll reminder')
    hideScrollReminder()
  } else {
    logger.debug('[WelcomeScreen] Scroll event but user already scrolled')
  }
}

const handleUserActivity = (event?: any) => {
  logger.debug('[WelcomeScreen] handleUserActivity triggered', {
    eventType: event?.type,
    showScrollReminder: showScrollReminder.value,
    hasActivityTimeout: !!activityTimeout
  })
  
  // Reset activity timeout on any user interaction
  if (activityTimeout) {
    clearTimeout(activityTimeout)
    logger.debug('[WelcomeScreen] Cleared activity timeout')
  }
  
  // If scroll reminder is showing and user clicks/types, hide it
  if (showScrollReminder.value) {
    logger.info('[WelcomeScreen] Hiding scroll reminder due to user activity')
    hideScrollReminder()
  }
}

const hideScrollReminder = () => {
  logger.info('[WelcomeScreen] Hiding scroll reminder', {
    wasShowing: showScrollReminder.value
  })
  
  showScrollReminder.value = false
  if (scrollReminderTimeout) {
    clearTimeout(scrollReminderTimeout)
    scrollReminderTimeout = null
  }
  if (activityTimeout) {
    clearTimeout(activityTimeout)
    activityTimeout = null
  }
}

const scrollToBottom = () => {
  logger.info('[WelcomeScreen] scrollToBottom triggered - auto-scrolling to bottom')
  const content = document.querySelector('ion-content')
  if (content) {
    content.scrollToBottom(500)
    logger.info('[WelcomeScreen] Scroll to bottom initiated')
  } else {
    logger.warn('[WelcomeScreen] ion-content element not found')
  }
  hideScrollReminder()
}

// Watch for first paragraph completion to show scroll reminder
watch(() => typewriters[0].isComplete.value, (isComplete) => {
  logger.info('[WelcomeScreen] First paragraph completion watch triggered', {
    isComplete,
    userHasScrolled: userHasScrolled.value,
    showScrollReminder: showScrollReminder.value
  })
  
  if (isComplete && !userHasScrolled.value && !showScrollReminder.value) {
    logger.info('[WelcomeScreen] Setting 3-second timeout to show scroll reminder')
    // Wait 3 seconds of inactivity before showing reminder
    activityTimeout = setTimeout(() => {
      // Check if user still hasn't scrolled
      if (!userHasScrolled.value) {
        showScrollReminder.value = true
        logger.info('[WelcomeScreen] Showing scroll reminder after timeout')
      } else {
        logger.info('[WelcomeScreen] User scrolled during timeout - not showing reminder')
      }
    }, 3000)
  } else {
    logger.debug('[WelcomeScreen] Scroll reminder not triggered', {
      reason: !isComplete ? 'paragraph not complete' : 
              userHasScrolled.value ? 'user already scrolled' :
              showScrollReminder.value ? 'reminder already showing' : 'unknown'
    })
  }
})

// Cleanup keyboard shortcuts and scroll reminder on unmount
onUnmounted(() => {
  logger.info('[WelcomeScreen] Component unmounting - cleaning up listeners')
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('keydown', handleDebugKey)
  hideScrollReminder()
  
  // Remove scroll and activity listeners
  const content = document.querySelector('ion-content')
  if (content) {
    content.removeEventListener('ionScroll', handleScroll)
    logger.info('[WelcomeScreen] Removed ionScroll event listener from ion-content')
  }
  
  if (scrollElement) {
    scrollElement.removeEventListener('wheel', handleScroll)
    scrollElement.removeEventListener('scroll', handleScroll)
    logger.info('[WelcomeScreen] Removed wheel and scroll event listeners from scroll element')
  }
  
  if (keydownHandler) {
    window.removeEventListener('keydown', keydownHandler)
  }
  window.removeEventListener('click', handleUserActivity)
  window.removeEventListener('touchstart', handleUserActivity)
  logger.info('[WelcomeScreen] Removed activity listeners from window')
})

const showTerms = () => {
  // TODO: Navigate to terms and conditions page or show modal
  logger.info('Show terms and conditions')
  // For now, just open in a new tab or show an alert
  alert('شرایط و قوانین استفاده از یکتایار در اینجا نمایش داده خواهد شد.')
}

const startApp = async () => {
  if (!termsAccepted.value || isLoading.value) {
    logger.warn('Cannot start app without accepting terms or while loading')
    return
  }
  
  // Reset error message
  errorMessage.value = null
  
  // Set loading state
  isLoading.value = true
  
  logger.info('User started the app from welcome screen')
  
  try {
    // Execute sequential exit animations
    await exitElementsSequentially()
    
    // Mark welcome screen as shown in localStorage
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    
    // Also mark on backend if user is authenticated
    await apiClient.post('/api/users/preferences', {
      welcomeScreenShown: true,
      termsAccepted: true
    })
    logger.info('Welcome screen preference saved to backend')
    
    // Success! Navigate to intended destination
    // Supports dynamic routing via ?redirect=/intended/path query parameter
    router.replace(intendedDestination.value)
  } catch (error: any) {
    logger.error('Failed to save welcome preference to backend:', error)
    
    // Restore elements by removing all exit states
    resetExitStates()
    
    // Set error message based on the error type using i18n
    if (error.response?.status === 401) {
      errorMessage.value = t('welcome_screen.auth_required')
    } else if (error.response?.status >= 500) {
      errorMessage.value = t('welcome_screen.server_error')
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage.value = t('welcome_screen.request_timeout')
    } else if (!navigator.onLine) {
      errorMessage.value = t('welcome_screen.network_offline')
    } else {
      errorMessage.value = t('welcome_screen.generic_error')
    }
    
    // Reset loading state
    isLoading.value = false
  }
}

// Helper to reset all exit states
const resetExitStates = () => {
  exitStates.value = {
    cta: false,
    terms: false,
    text: false,
    hero: false,
    header: false,
    disclaimer: false
  }
}

// Sequential exit animation with proper height calculation and overlapping transitions
const exitElementsSequentially = async () => {
  const ANIMATION_DURATION = 400 // Animation duration in ms
  const OVERLAP_PERCENTAGE = 0.7 // Start next animation when previous is 70% complete
  const overlapDelay = ANIMATION_DURATION * (1 - OVERLAP_PERCENTAGE) // ~120ms
  
  // Helper function to animate a single element
  const animateElementExit = (element: HTMLElement | null, stateName: keyof typeof exitStates.value): Promise<void> => {
    return new Promise((resolve) => {
      if (!element) {
        resolve()
        return
      }
      
      // Calculate and set current height before collapsing
      const currentHeight = element.offsetHeight
      element.style.maxHeight = `${currentHeight}px`
      
      // Force reflow to ensure maxHeight is applied
      element.offsetHeight
      
      // Wait a frame, then apply exit class
      requestAnimationFrame(() => {
        exitStates.value[stateName] = true
        
        // Resolve when animation is mostly complete (for overlapping)
        setTimeout(() => {
          resolve()
        }, ANIMATION_DURATION * OVERLAP_PERCENTAGE)
      })
    })
  }
  
  // Exit elements with overlapping animations (bottom to top, reverse of entry)
  // 1. CTA button - start immediately
  const ctaPromise = animateElementExit(ctaButtonRef.value?.$el || ctaButtonRef.value, 'cta')
  
  // 2. Terms checkbox - start when CTA is 70% complete
  await ctaPromise
  const termsPromise = animateElementExit(termsContainerRef.value, 'terms')
  
  // 3. Welcome text - start when terms is 70% complete
  await termsPromise
  const textPromise = animateElementExit(welcomeTextOuter.value, 'text')
  
  // 4. Hero image - start when text is 70% complete
  await textPromise
  const heroPromise = animateElementExit(heroContainerRef.value, 'hero')
  
  // 5. Header - start when hero is 70% complete
  await heroPromise
  const headerPromise = animateElementExit(headerRef.value, 'header')
  
  // 6. Disclaimer - start when header is 70% complete
  await headerPromise
  await animateElementExit(disclaimerRef.value, 'disclaimer')
  
  // Wait for the last animation to fully complete
  await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION * (1 - OVERLAP_PERCENTAGE)))
}

const onImageError = () => {
  logger.warn('Welcome hero image failed to load')
}
</script>

<style scoped lang="scss">
.scrollable-content {
  height: 100%;
  width: 100%;
}

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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-header.exit-header {
  animation: fadeOutUp 0.4s ease-in forwards;
  pointer-events: none;
  margin-bottom: 0 !important;
  overflow: hidden;
  transition: max-height 0.4s ease-in, margin-bottom 0.4s ease-in;
  max-height: 0 !important;
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
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-image-container.exit-hero {
  animation: fadeOutUp 0.4s ease-in forwards;
  pointer-events: none;
  transition: max-height 0.4s ease-in, margin 0.4s ease-in, min-height 0.4s ease-in;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  overflow: hidden;
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
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s ease-out;
  overflow: hidden;
}

.welcome-text.exit-text {
  animation: fadeOutUp 0.4s ease-in forwards;
  pointer-events: none;
  transition: max-height 0.4s ease-in, margin-bottom 0.4s ease-in, padding 0.4s ease-in;
  margin-bottom: 0 !important;
  padding: 0 !important;
  max-height: 0 !important;
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
  margin: 0; /* 2rem 0 1rem 0; */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.terms-container.exit-terms {
  animation: fadeOutDown 0.4s ease-in forwards;
  pointer-events: none;
  transition: max-height 0.4s ease-in, margin 0.4s ease-in;
  margin: 0 !important;
  max-height: 0 !important;
  overflow: hidden;
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

/* 
  Note: :has() pseudo-class is supported in modern browsers:
  - Safari 15.4+ (March 2022)
  - Chrome 105+ (August 2022)
  - Firefox 121+ (December 2023)
  Ionic/Capacitor apps typically use modern WebView engines that support this.
*/
.terms-checkbox:has(input:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.terms-checkbox:not(:has(input:disabled)):hover {
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
  margin: 2.5rem 0 1.5rem 0;
  text-transform: none;
  font-size: 1.3rem;
  font-weight: 700;
  position: relative;
  overflow: hidden;
  /* light mode CTA background */
  /* background-image: linear-gradient(135deg, #d4a43e 0%, #e8c170 50%, #d4a43e 100%); */
  background-image: radial-gradient(circle farthest-corner at center, #10B981 0%, #07a674 100%);
  background-size: 200% 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s ease-out;
  border-radius: var(--border-radius);
  --background: transparent; /* Fix for the `button-native` inside; otherwise it'll mask the actual cta-button */
}

.cta-button.exit-cta {
  animation: fadeOutDown 0.4s ease-in forwards;
  pointer-events: none;
  transition: max-height 0.4s ease-in, margin-top 0.4s ease-in;
  margin-top: 0 !important;
  max-height: 0 !important;
  overflow: hidden;
}

.cta-button:not(.cta-button-disabled):not(.cta-button-loading) {
  animation: gradientShift 3s ease-in-out infinite;
}

/* Elegant Loading State - Overrides disabled styles */
.cta-button-loading {
  cursor: wait !important;
  opacity: 1 !important;
  background-image: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  ) !important;
  background-size: 300% 100% !important;
  animation: loadingGradient 2s ease-in-out infinite !important;
  --box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.4),
    0 6px 20px rgba(118, 75, 162, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) !important;
  transform: scale(1.02);
}

@keyframes loadingGradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
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
  transition: color 0.3s ease;
}

.cta-button-loading .button-content {
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.button-icon {
  font-size: 1.4rem;
  animation: bounce 2s ease-in-out infinite;
}

.button-text {
  font-size: 1.3rem;
  /* letter-spacing: -0.3px; */
}

/* Loading Spinner - Enhanced for elegant loading state */
.button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-right-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  box-shadow: 
    0 0 15px rgba(255, 255, 255, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error Message - Elegant and Professional Design */
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.12) 100%);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  margin-top: 1rem;
  border: 1.5px solid rgba(239, 68, 68, 0.25);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 12px rgba(239, 68, 68, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05);
  animation: errorSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.error-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  border-radius: 16px 0 0 16px;
}

@keyframes errorSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  font-size: 1.25rem;
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 0.1rem;
  filter: drop-shadow(0 1px 2px rgba(220, 38, 38, 0.3));
}

.error-text {
  text-align: right;
  font-size: 0.95rem;
  color: #991b1b;
  line-height: 1.6;
  margin: 0;
  font-weight: 600;
  direction: rtl;
  flex: 1;
  letter-spacing: -0.01em;
}

/* Scroll Reminder - Elegant and Professional */
.scroll-reminder {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
}

.scroll-reminder-content {
  position: relative;
  z-index: 101;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  gap: 0.75rem;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scroll-reminder-content:hover {
  transform: translateY(-4px);
}

.scroll-reminder-content:active {
  transform: translateY(-2px);
}

.scroll-reminder-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d4a43e 0%, #e8c170 100%);
  border-radius: 50%;
  box-shadow: 
    0 4px 16px rgba(212, 164, 62, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1);
  animation: bounceDown 2s ease-in-out infinite;
}

.scroll-icon {
  font-size: 28px;
  color: #01183a;
  animation: arrowBounce 1.5s ease-in-out infinite;
}

.scroll-reminder-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #01183a;
  margin: 0;
  text-align: center;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
  direction: rtl;
}

.scroll-reminder-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(255, 255, 255, 0.7) 40%,
    rgba(255, 255, 255, 0.9) 70%,
    rgba(255, 255, 255, 1) 100%
  );
  pointer-events: none;
  z-index: 100;
}

/* Scroll reminder animation */
@keyframes bounceDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes arrowBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

/* Scroll reminder transitions */
.scroll-reminder-fade-enter-active {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.scroll-reminder-fade-leave-active {
  transition: opacity 0.3s ease-in, transform 0.3s ease-in;
}

.scroll-reminder-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.scroll-reminder-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
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
  transition: all 0.4s ease-in;
}

.disclaimer-container.exit-disclaimer {
  animation: fadeOutDown 0.4s ease-in forwards;
  pointer-events: none;
  transition: max-height 0.4s ease-in, margin 0.4s ease-in, padding 0.4s ease-in;
  margin: 0 !important;
  padding: 0 !important;
  max-height: 0 !important;
  overflow: hidden;
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

/* Exit animations - Reverse of entry animations */
@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-30px);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(30px);
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

  .terms-checkbox:not(:has(input:disabled)):hover {
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
    /* dark mode CTA background */
    /* background-image: linear-gradient(135deg, #d4a43e 0%, #e8c170 50%, #d4a43e 100%); */
    background-image: radial-gradient(circle farthest-corner at center, #10B981 0%, #07a674 100%);
  }

  .error-message {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.2) 100%);
    border-color: rgba(239, 68, 68, 0.35);
    box-shadow: 
      0 4px 16px rgba(239, 68, 68, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .error-message::before {
    background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
  }

  .error-icon {
    color: #f87171;
  }

  .error-text {
    color: #fca5a5;
  }

  .scroll-reminder-text {
    color: #e9ecef;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }

  .scroll-reminder-mask {
    background: linear-gradient(
      to bottom,
      rgba(15, 20, 25, 0) 0%,
      rgba(15, 20, 25, 0.4) 20%,
      rgba(15, 20, 25, 0.7) 40%,
      rgba(15, 20, 25, 0.9) 70%,
      rgba(15, 20, 25, 1) 100%
    );
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

  .scroll-reminder-icon {
    width: 40px;
    height: 40px;
  }

  .scroll-icon {
    font-size: 24px;
  }

  .scroll-reminder-text {
    font-size: 0.85rem;
  }

  .scroll-reminder-mask {
    height: 180px;
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
