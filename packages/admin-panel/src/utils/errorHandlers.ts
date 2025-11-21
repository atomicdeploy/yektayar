import { useErrorStore } from '@/stores/error'

/**
 * Sets up global error handlers to catch and display Vite HMR WebSocket errors
 */
export function setupGlobalErrorHandlers() {
  const errorStore = useErrorStore()
  
  // Catch global errors
  window.addEventListener('error', (event) => {
    // Check if it's a Vite HMR error
    if (event.message && (
      event.message.includes('vite') ||
      event.message.includes('WebSocket') ||
      event.message.includes('HMR')
    )) {
      event.preventDefault() // Prevent console spam
      
      errorStore.addError(
        'HMR Connection Error',
        'Hot Module Replacement connection failed. Check your network or reverse proxy configuration.',
        event.message
      )
    }
  })
  
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason?.toString() || 'Unknown error'
    
    // Check if it's a Vite HMR related error
    if (reason.includes('vite') || reason.includes('WebSocket') || reason.includes('HMR')) {
      event.preventDefault() // Prevent console spam
      
      errorStore.addError(
        'HMR Connection Error',
        'Hot Module Replacement connection failed. This may affect live reloading.',
        reason
      )
    }
  })
  
  // Hook into console.error to catch Vite client errors
  const originalConsoleError = console.error
  console.error = (...args: any[]) => {
    const message = args.join(' ')
    
    // Check if it's a Vite HMR error
    if (message.includes('[vite]') || message.includes('WebSocket connection')) {
      errorStore.addError(
        'Development Server Issue',
        'Vite development server connection issue detected.',
        message
      )
    }
    
    // Still log to console for developers
    originalConsoleError.apply(console, args)
  }
}
