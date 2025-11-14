import { ref, onMounted, watch } from 'vue'

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
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
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
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
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
