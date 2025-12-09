import { inject } from 'vue'
import { useTelegramState, TelegramState } from '../plugins/telegram'
import { logger } from '@yektayar/shared'

export function useTelegram() {
  // Prefer provided state
  const provided = inject<TelegramState | undefined>('telegram')
  const state = provided ?? useTelegramState()

  /**
   * Send data to the bot. The data will be sent to the bot in a service message.
   * Once this method is called, the Web App will be closed.
   */
  function sendData(payload: string) {
    if (!state.available || !state.webApp) {
      logger.warn('Telegram WebApp not available, cannot send data')
      return
    }
    
    try {
      state.webApp.sendData(payload)
      logger.info('Data sent to Telegram bot', { payload })
    } catch (error) {
      logger.error('Failed to send data to Telegram bot', error)
    }
  }

  /**
   * Close the Web App
   */
  function close() {
    if (!state.available || !state.webApp) {
      logger.warn('Telegram WebApp not available, cannot close')
      return
    }
    
    state.webApp.close()
    logger.info('Telegram WebApp closed')
  }

  /**
   * Configure and show the main button
   */
  function setMainButton(text: string, onClick?: () => void) {
    if (!state.available || !state.webApp) {
      logger.warn('Telegram WebApp not available, cannot set main button')
      return
    }
    
    const mainButton = state.webApp.MainButton
    mainButton.setText(text)
    mainButton.show()
    
    if (onClick) {
      mainButton.onClick(onClick)
    }
    
    logger.debug('Main button configured', { text })
  }

  /**
   * Hide the main button
   */
  function hideMainButton() {
    if (!state.available || !state.webApp) return
    state.webApp.MainButton.hide()
  }

  /**
   * Show the back button
   */
  function showBackButton(onClick?: () => void) {
    if (!state.available || !state.webApp) return
    
    const backButton = state.webApp.BackButton
    backButton.show()
    
    if (onClick) {
      backButton.onClick(onClick)
    }
  }

  /**
   * Hide the back button
   */
  function hideBackButton() {
    if (!state.available || !state.webApp) return
    state.webApp.BackButton.hide()
  }

  /**
   * Trigger haptic feedback
   */
  function hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning') {
    if (!state.available || !state.webApp) return
    
    const haptic = state.webApp.HapticFeedback
    
    if (type === 'impact' && (style === 'light' || style === 'medium' || style === 'heavy' || style === 'rigid' || style === 'soft')) {
      haptic.impactOccurred(style)
    } else if (type === 'notification' && (style === 'error' || style === 'success' || style === 'warning')) {
      haptic.notificationOccurred(style)
    } else if (type === 'selection') {
      haptic.selectionChanged()
    }
  }

  /**
   * Open a link in external browser
   */
  function openLink(url: string, tryInstantView = false) {
    if (!state.available || !state.webApp) {
      // Fallback to regular window.open in non-Telegram environment
      window.open(url, '_blank')
      return
    }
    
    state.webApp.openLink(url, { try_instant_view: tryInstantView })
  }

  /**
   * Open a Telegram link (t.me/...) inside Telegram app
   */
  function openTelegramLink(url: string) {
    if (!state.available || !state.webApp) {
      logger.warn('Telegram WebApp not available, cannot open Telegram link')
      return
    }
    
    state.webApp.openTelegramLink(url)
  }

  /**
   * Show a native alert popup
   */
  function showAlert(message: string, callback?: () => void) {
    if (!state.available || !state.webApp) {
      // Fallback to browser alert
      alert(message)
      callback?.()
      return
    }
    
    state.webApp.showAlert(message, callback)
  }

  /**
   * Show a native confirmation popup
   */
  function showConfirm(message: string, callback?: (confirmed: boolean) => void) {
    if (!state.available || !state.webApp) {
      // Fallback to browser confirm
      const result = confirm(message)
      callback?.(result)
      return
    }
    
    state.webApp.showConfirm(message, callback)
  }

  /**
   * Expand the Web App to maximum height
   */
  function expand() {
    if (!state.available || !state.webApp) return
    state.webApp.expand()
  }

  /**
   * Enable closing confirmation
   */
  function enableClosingConfirmation() {
    if (!state.available || !state.webApp) return
    state.webApp.enableClosingConfirmation()
  }

  /**
   * Disable closing confirmation
   */
  function disableClosingConfirmation() {
    if (!state.available || !state.webApp) return
    state.webApp.disableClosingConfirmation()
  }

  return {
    state,
    sendData,
    close,
    setMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    openLink,
    openTelegramLink,
    showAlert,
    showConfirm,
    expand,
    enableClosingConfirmation,
    disableClosingConfirmation,
  }
}
