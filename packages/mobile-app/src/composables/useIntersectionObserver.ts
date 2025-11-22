import { ref, onMounted, onUnmounted, Ref } from 'vue'
import { logger } from '@yektayar/shared'

export interface IntersectionObserverOptions {
  /**
   * Root element for intersection observer
   * @default null (viewport)
   */
  root?: Element | null
  
  /**
   * Margin around the root element
   * @default '0px'
   */
  rootMargin?: string
  
  /**
   * Threshold(s) at which to trigger callback
   * @default 0
   */
  threshold?: number | number[]
  
  /**
   * Whether to trigger only once
   * @default false
   */
  once?: boolean
}

/**
 * Intersection Observer composable
 * Detects when an element enters or leaves the viewport
 */
export function useIntersectionObserver(
  targetRef: Ref<Element | null>,
  options: IntersectionObserverOptions = {}
) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    once = false
  } = options

  const isIntersecting = ref(false)
  const hasIntersected = ref(false)
  let observer: IntersectionObserver | null = null

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      isIntersecting.value = entry.isIntersecting
      
      if (entry.isIntersecting) {
        hasIntersected.value = true
        logger.debug('[useIntersectionObserver] Element entered viewport')
        
        if (once && observer && targetRef.value) {
          observer.unobserve(targetRef.value)
          logger.debug('[useIntersectionObserver] Unobserved after first intersection (once mode)')
        }
      } else {
        logger.debug('[useIntersectionObserver] Element left viewport')
      }
    })
  }

  const observe = () => {
    if (!targetRef.value) {
      logger.warn('[useIntersectionObserver] No target element to observe')
      return
    }

    observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold
    })

    observer.observe(targetRef.value)
    logger.debug('[useIntersectionObserver] Started observing element')
  }

  const unobserve = () => {
    if (observer && targetRef.value) {
      observer.unobserve(targetRef.value)
      logger.debug('[useIntersectionObserver] Stopped observing element')
    }
  }

  const disconnect = () => {
    if (observer) {
      observer.disconnect()
      observer = null
      logger.debug('[useIntersectionObserver] Disconnected observer')
    }
  }

  onMounted(() => {
    observe()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isIntersecting,
    hasIntersected,
    observe,
    unobserve,
    disconnect
  }
}
