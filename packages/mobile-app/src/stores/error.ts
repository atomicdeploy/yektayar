import { defineStore } from 'pinia'
import { ref } from 'vue'
import { logger } from '@yektayar/shared'

export interface ErrorNotification {
  id: string
  title: string
  message: string
  details?: string
  timestamp: Date
}

export const useErrorStore = defineStore('error', () => {
  const errors = ref<ErrorNotification[]>([])
  const maxErrors = 5
  const autoRemoveDelay = 10000 // 10 seconds

  function addError(title: string, message: string, details?: string) {
    const error: ErrorNotification = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      details,
      timestamp: new Date(),
    }

    // Log to console/terminal
    logger.error(`${title}: ${message}`, details ? { details } : undefined)

    // Add to errors array (keep only the latest maxErrors)
    errors.value.unshift(error)
    if (errors.value.length > maxErrors) {
      errors.value.pop()
    }

    // Auto-remove after delay
    setTimeout(() => {
      removeError(error.id)
    }, autoRemoveDelay)

    return error.id
  }

  function removeError(id: string) {
    const index = errors.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      errors.value.splice(index, 1)
    }
  }

  function clearErrors() {
    errors.value = []
  }

  return {
    errors,
    addError,
    removeError,
    clearErrors,
  }
})
