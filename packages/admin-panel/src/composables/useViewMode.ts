import { ref, watch } from 'vue'

export type ViewMode = 'card' | 'table'

/**
 * Composable for managing view mode (card vs table) with localStorage persistence
 * @param storageKey - Unique key for localStorage
 * @param defaultMode - Default view mode (defaults to 'card')
 */
export function useViewMode(storageKey: string, defaultMode: ViewMode = 'card') {
  // Try to load from localStorage, fall back to default
  const savedMode = localStorage.getItem(storageKey) as ViewMode | null
  const viewMode = ref<ViewMode>(savedMode || defaultMode)

  // Save to localStorage when changed
  watch(viewMode, (newMode) => {
    localStorage.setItem(storageKey, newMode)
  })

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'card' ? 'table' : 'card'
  }

  const isCardView = () => viewMode.value === 'card'
  const isTableView = () => viewMode.value === 'table'

  return {
    viewMode,
    toggleViewMode,
    isCardView,
    isTableView,
  }
}
