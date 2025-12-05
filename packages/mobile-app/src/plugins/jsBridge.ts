import { registerPlugin, PluginListenerHandle } from '@capacitor/core'

export interface JSBridgePlugin {
  /**
   * Echo method - returns the input message
   */
  echo(options: { message: string }): Promise<{ message: string; timestamp: number }>
  
  /**
   * Get device info
   */
  getDeviceInfo(): Promise<{
    manufacturer: string
    model: string
    osVersion: string
    sdkVersion: number
  }>
  
  /**
   * Show a toast message
   */
  showToast(options: { message: string; duration?: number }): Promise<void>
  
  /**
   * Perform a custom action
   */
  performAction(options: { action: string; params?: any }): Promise<{
    action: string
    success: boolean
    message: string
  }>
  
  /**
   * Add listener for events from Java
   */
  addListener(
    eventName: string,
    listenerFunc: (data: any) => void
  ): Promise<PluginListenerHandle>
}

const JSBridge = registerPlugin<JSBridgePlugin>('JSBridge')

export default JSBridge
