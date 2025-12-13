import { registerPlugin } from '@capacitor/core'

export interface AlertOptions {
  title: string
  message: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'wait'
  buttonText?: string
}

export interface AlertResult {
  dismissed: boolean
}

export interface ConfirmOptions {
  title: string
  message: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'wait'
  okButtonText?: string
  cancelButtonText?: string
}

export interface ConfirmResult {
  confirmed: boolean
}

export interface PromptOptions {
  title: string
  message: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'wait'
  hint?: string
  defaultValue?: string
  inputType?: 'text' | 'number' | 'phone' | 'email' | 'password'
  okButtonText?: string
  cancelButtonText?: string
}

export interface PromptResult {
  cancelled: boolean
  value: string
}

export interface DialogPlugin {
  alert(options: AlertOptions): Promise<AlertResult>
  confirm(options: ConfirmOptions): Promise<ConfirmResult>
  prompt(options: PromptOptions): Promise<PromptResult>
}

const Dialog = registerPlugin<DialogPlugin>('Dialog')

export default Dialog

/**
 * Show a custom alert dialog
 * @param options Alert options
 * @example
 * ```typescript
 * import { showAlert } from '@/plugins/dialog'
 * 
 * await showAlert({
 *   title: 'Notice',
 *   message: 'This is an important message',
 *   icon: 'info'
 * })
 * ```
 */
export async function showAlert(options: AlertOptions): Promise<AlertResult> {
  return Dialog.alert(options)
}

/**
 * Show a custom confirmation dialog
 * @param options Confirm options
 * @returns Promise resolving to confirmation result
 * @example
 * ```typescript
 * import { showConfirm } from '@/plugins/dialog'
 * 
 * const result = await showConfirm({
 *   title: 'Confirm Action',
 *   message: 'Are you sure you want to proceed?',
 *   icon: 'question'
 * })
 * 
 * if (result.confirmed) {
 *   // User confirmed
 * }
 * ```
 */
export async function showConfirm(options: ConfirmOptions): Promise<ConfirmResult> {
  return Dialog.confirm(options)
}

/**
 * Show a custom prompt dialog for user input
 * @param options Prompt options
 * @returns Promise resolving to prompt result with user input
 * @example
 * ```typescript
 * import { showPrompt } from '@/plugins/dialog'
 * 
 * const result = await showPrompt({
 *   title: 'Enter Name',
 *   message: 'Please enter your name:',
 *   hint: 'Name',
 *   defaultValue: '',
 *   inputType: 'text'
 * })
 * 
 * if (!result.cancelled) {
 *   console.log('User entered:', result.value)
 * }
 * ```
 */
export async function showPrompt(options: PromptOptions): Promise<PromptResult> {
  return Dialog.prompt(options)
}
