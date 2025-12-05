import { registerPlugin } from '@capacitor/core'

export interface BackButtonPlugin {
  /**
   * Exit the application
   */
  exitApp(): Promise<void>
  
  /**
   * Check if back button can exit the app
   */
  canExit(): Promise<void>
}

const BackButton = registerPlugin<BackButtonPlugin>('BackButton')

export default BackButton
