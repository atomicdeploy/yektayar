import { registerPlugin } from '@capacitor/core'

export interface ToastOptions {
  message: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'wait'
  duration?: 'short' | 'long'
  gravity?: 'top' | 'center' | 'bottom'
}

export interface ToastPlugin {
  show(options: ToastOptions): Promise<void>
}

const Toast = registerPlugin<ToastPlugin>('Toast')

export default Toast

/**
 * Show a custom toast message with optional icon
 * @param options Toast options
 * @example
 * ```typescript
 * import { showToast } from '@/plugins/toast'
 * 
 * await showToast({
 *   message: 'Operation successful!',
 *   icon: 'success',
 *   duration: 'long',
 *   gravity: 'bottom'
 * })
 * ```
 */
export async function showToast(options: ToastOptions): Promise<void> {
  return Toast.show(options)
}
