import { registerPlugin } from '@capacitor/core'

export interface StatusBarInfo {
  visible: boolean
  style: string
}

export interface StatusBarPlugin {
  /**
   * Set status bar style
   * @param options - { style: 'light' | 'dark' }
   */
  setStyle(options: { style: 'light' | 'dark' }): Promise<void>
  
  /**
   * Set status bar background color
   * @param options - { color: string } - hex color like "#RRGGBB"
   */
  setBackgroundColor(options: { color: string }): Promise<void>
  
  /**
   * Get current status bar info
   */
  getInfo(): Promise<StatusBarInfo>
}

const StatusBar = registerPlugin<StatusBarPlugin>('StatusBar')

export default StatusBar
