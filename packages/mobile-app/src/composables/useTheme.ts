import { ref, onMounted, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import StatusBar from '../plugins/statusBar'

export type Theme = 'light' | 'dark' | 'auto'

const currentTheme = ref<Theme>('auto')
const isDark = ref(false)

/**
 * Theme management composable
 * Handles dark/light theme switching based on system preferences or manual selection
 */
export function useTheme() {
  // Check system preference
  const checkSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    if (theme === 'auto') {
      isDark.value = checkSystemTheme()
      // Remove forced mode marker when in auto mode
      document.documentElement.classList.remove('theme-forced')
    } else {
      isDark.value = theme === 'dark'
      // Add forced mode marker to prevent media query from overriding
      document.documentElement.classList.add('theme-forced')
    }

    // Update document class
    if (isDark.value) {
      document.documentElement.classList.add('ion-palette-dark')
    } else {
      document.documentElement.classList.remove('ion-palette-dark')
    }

    // Update meta theme-color for status bar
    updateMetaThemeColor(isDark.value)
  }

  // Update meta theme color for mobile browsers
  const updateMetaThemeColor = (dark: boolean) => {
    const backgroundColor = dark ? '#0a0f1a' : '#fafbfc'
    
    // Update meta tag for web browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', backgroundColor)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = backgroundColor
      document.head.appendChild(meta)
    }
    
    // Update native status bar on Capacitor platforms
    if (Capacitor.isNativePlatform()) {
      try {
        // Set status bar background color
        StatusBar.setBackgroundColor({ color: backgroundColor }).catch(() => {
          // Silently fail if plugin not available
        })
        
        // Set status bar icon style
        // Dark background = light icons, Light background = dark icons
        StatusBar.setStyle({ style: dark ? 'dark' : 'light' }).catch(() => {
          // Silently fail if plugin not available
        })
      } catch (error) {
        // Plugin not available on this platform
      }
    }
  }

  // Set theme
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('yektayar-theme', theme)
    applyTheme(theme)
  }

  // Toggle theme: auto -> dark -> light -> auto
  const toggleTheme = () => {
    if (currentTheme.value === 'auto') {
      setTheme('dark')
    } else if (currentTheme.value === 'dark') {
      setTheme('light')
    } else {
      setTheme('auto')
    }
  }

  // Initialize theme on mount
  onMounted(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('yektayar-theme') as Theme | null
    if (savedTheme) {
      currentTheme.value = savedTheme
    }

    // Apply initial theme
    applyTheme(currentTheme.value)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (currentTheme.value === 'auto') {
        isDark.value = e.matches
        applyTheme('auto')
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  })

  // Watch for theme changes
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
