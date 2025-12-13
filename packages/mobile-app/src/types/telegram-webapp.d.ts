/**
 * TypeScript definitions for Telegram Web App API
 * @see https://core.telegram.org/bots/webapps
 */

interface TelegramWebAppMainButton {
  isVisible: boolean
  isActive: boolean
  isProgressVisible: boolean
  text: string
  color: string
  textColor: string
  setText(text: string): void
  show(): void
  hide(): void
  enable(): void
  disable(): void
  showProgress(leaveActive?: boolean): void
  hideProgress(): void
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void
  onClick(handler: () => void): void
  offClick(handler: () => void): void
}

interface TelegramWebAppBackButton {
  isVisible: boolean
  show(): void
  hide(): void
  onClick(handler: () => void): void
  offClick(handler: () => void): void
}

interface TelegramWebAppHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'error' | 'success' | 'warning'): void
  selectionChanged(): void
}

interface TelegramWebAppPopupButton {
  id?: string
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
  text?: string
}

interface TelegramWebAppPopupParams {
  title?: string
  message: string
  buttons?: TelegramWebAppPopupButton[]
}

interface TelegramWebApp {
  /** A string with raw data transferred to the Web App, convenient for validating data. */
  initData: string
  /** An object with input data transferred to the Web App. */
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      is_bot?: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
      photo_url?: string
    }
    receiver?: {
      id: number
      is_bot?: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
      photo_url?: string
    }
    chat?: {
      id: number
      type: 'group' | 'supergroup' | 'channel'
      title: string
      username?: string
      photo_url?: string
    }
    chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel'
    chat_instance?: string
    start_param?: string
    can_send_after?: number
    auth_date: number
    hash: string
  }
  /** The version of the Bot API available in the user's Telegram app. */
  version: string
  /** The name of the platform of the user's Telegram app. */
  platform: string
  /** The color scheme currently used in the Telegram app. */
  colorScheme: 'light' | 'dark'
  /** An object containing the current theme settings used in the Telegram app. */
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
  }
  /** True if the Web App is expanded to the maximum available height. */
  isExpanded: boolean
  /** The current height of the visible area of the Web App. */
  viewportHeight: number
  /** The height of the visible area of the Web App in its last stable state. */
  viewportStableHeight: number
  /** Current header color in the #RRGGBB format. */
  headerColor: string
  /** Current background color in the #RRGGBB format. */
  backgroundColor: string
  /** True if the confirmation dialog is enabled while the user is trying to close the Web App. */
  isClosingConfirmationEnabled: boolean
  /** An object for controlling the back button which can be displayed in the header of the Web App. */
  BackButton: TelegramWebAppBackButton
  /** An object for controlling the main button, which is displayed at the bottom of the Web App. */
  MainButton: TelegramWebAppMainButton
  /** An object for controlling haptic feedback. */
  HapticFeedback: TelegramWebAppHapticFeedback
  /** Returns true if the user's app supports a version of the Bot API that is equal to or higher than the version passed as the parameter. */
  isVersionAtLeast(version: string): boolean
  /** A method that sets the app header color in the #RRGGBB format or using one of the keywords bg_color, secondary_bg_color. */
  setHeaderColor(color: string): void
  /** A method that sets the app background color in the #RRGGBB format or using one of the keywords bg_color, secondary_bg_color. */
  setBackgroundColor(color: string): void
  /** A method that enables the confirmation dialog while the user is trying to close the Web App. */
  enableClosingConfirmation(): void
  /** A method that disables the confirmation dialog while the user is trying to close the Web App. */
  disableClosingConfirmation(): void
  /** A method that informs the Telegram app that the Web App is ready to be displayed. */
  ready(): void
  /** A method that expands the Web App to the maximum available height. */
  expand(): void
  /** A method that closes the Web App. */
  close(): void
  /** A method used to send data to the bot. */
  sendData(data: string): void
  /** A method that opens a link in an external browser. */
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  /** A method that opens a telegram link inside the Telegram app. */
  openTelegramLink(url: string): void
  /** A method that opens an invoice using its link. */
  openInvoice(url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void
  /** A method that shows a native popup. */
  showPopup(params: TelegramWebAppPopupParams, callback?: (button_id: string) => void): void
  /** A method that shows a native popup with a message. */
  showAlert(message: string, callback?: () => void): void
  /** A method that shows a native popup with a confirmation dialog. */
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  /** A method that shows a scan QR popup. */
  showScanQrPopup(params: { text?: string }, callback?: (data: string) => boolean | void): void
  /** A method that closes the QR scanner. */
  closeScanQrPopup(): void
  /** A method that reads the text from the clipboard. */
  readTextFromClipboard(callback?: (text: string) => void): void
  /** A method that requests write access for the bot. */
  requestWriteAccess(callback?: (access_granted: boolean) => void): void
  /** A method that requests phone number from the user. */
  requestContact(callback?: (success: boolean, contact?: { contact: { phone_number: string; first_name: string; last_name?: string; user_id?: number } }) => void): void
  /** A method that switches to an inline mode. */
  switchInlineQuery(query: string, choose_chat_types?: string[]): void
  /** A method that sets up the event handler for events. */
  onEvent(eventType: string, eventHandler: (...args: any[]) => void): void
  /** A method that removes the event handler. */
  offEvent(eventType: string, eventHandler: (...args: any[]) => void): void
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp
  }
}
