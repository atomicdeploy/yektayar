import { ref, onMounted, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import StatusBar from '../plugins/statusBar'
import { logger } from '@yektayar/shared'

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
  const applyTheme = async (theme: Theme) => {
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
    await updateMetaThemeColor(isDark.value)
  }

  // Update meta theme color for mobile browsers
  const updateMetaThemeColor = async (dark: boolean) => {
    const backgroundColor = dark ? '#0a0f1a' : '#fafbfc'
    const iconStyle = dark ? 'light' : 'dark' // light=white icons, dark=black icons
    
    logger.info(`🎨 Updating theme: dark=${dark}, bg=${backgroundColor}, icons=${iconStyle}`)
    
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
        logger.info(`📱 Setting status bar: background=${backgroundColor}, iconStyle=${iconStyle}`)
        
        // Set status bar background color
        await StatusBar.setBackgroundColor({ color: backgroundColor }).catch((error) => {
          logger.error('Failed to set status bar background:', error)
        })
        
        // Set status bar icon style
        // CRITICAL: When dark=true (dark bg), we need 'light' (white icons)
        // CRITICAL: When dark=false (light bg), we need 'dark' (black icons)
        await StatusBar.setStyle({ style: iconStyle }).catch((error) => {
          logger.error('Failed to set status bar style:', error)
        })
        
        logger.info('✅ Status bar updated successfully')
      } catch (error) {
        logger.error('❌ Status bar plugin error:', error)
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
