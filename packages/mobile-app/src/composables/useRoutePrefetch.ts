import { Router } from 'vue-router'
import { logger } from '@yektayar/shared'

/**
 * Composable for intelligent route prefetching
 * Prefetches routes that are likely to be visited next
 */
export function useRoutePrefetch(router: Router) {
  const prefetchedRoutes = new Set<string>()

  /**
   * Prefetch a route by path
   */
  const prefetchRoute = async (path: string) => {
    if (prefetchedRoutes.has(path)) {
      return // Already prefetched
    }

    try {
      const route = router.resolve(path)
      if (route.matched.length > 0) {
        // Prefetch all components in the matched route
        await Promise.all(
          route.matched.map(async (match) => {
            if (match.components) {
              await Promise.all(
                Object.values(match.components).map(async (component: any) => {
                  // Check if it's a lazy-loaded component (function that returns a promise)
                  if (typeof component === 'function' && !component.name) {
                    await component()
                  }
                })
              )
            }
          })
        )
        prefetchedRoutes.add(path)
        // Only log in development mode to avoid production overhead
        if (import.meta.env.DEV) {
          logger.debug(`Prefetched route: ${path}`)
        }
      }
    } catch (error) {
      logger.error(`Failed to prefetch route ${path}:`, error)
    }
  }

  /**
   * Prefetch multiple routes
   */
  const prefetchRoutes = async (paths: string[]) => {
    await Promise.all(paths.map(path => prefetchRoute(path)))
  }

  /**
   * Prefetch adjacent tab routes based on current route
   */
  const prefetchAdjacentTabs = async (currentPath: string) => {
    const tabRoutes = [
      '/tabs/home',
      '/tabs/chat',
      '/tabs/courses',
      '/tabs/appointments',
      '/tabs/profile'
    ]

    const currentIndex = tabRoutes.indexOf(currentPath)
    if (currentIndex === -1) return

    // Prefetch adjacent tabs (one before and one after)
    const adjacentRoutes: string[] = []
    if (currentIndex > 0) {
      adjacentRoutes.push(tabRoutes[currentIndex - 1])
    }
    if (currentIndex < tabRoutes.length - 1) {
      adjacentRoutes.push(tabRoutes[currentIndex + 1])
    }

    await prefetchRoutes(adjacentRoutes)
  }

  return {
    prefetchRoute,
    prefetchRoutes,
    prefetchAdjacentTabs
  }
}
