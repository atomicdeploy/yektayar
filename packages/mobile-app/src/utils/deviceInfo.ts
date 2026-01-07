/**
 * Capacitor Device Information Collector
 * 
 * This module collects comprehensive device information using Capacitor APIs
 * and the native DeviceInfoPlugin for Android-specific details.
 */

import { Device } from '@capacitor/device'
import { App } from '@capacitor/app'
import { Capacitor, registerPlugin } from '@capacitor/core'
import type { DeviceInfo } from '@yektayar/shared'
import { getWebDeviceInfo } from '@yektayar/shared'
import { logger } from '@yektayar/shared'

// Import our custom native plugin
interface DeviceInfoPluginResponse {
  appVersion: string
  packageName: string
  deviceModel: string
  deviceManufacturer: string
  androidVersion: string
  androidSDK: number
  deviceInfoString: string
  screenWidth: number
  screenHeight: number
  screenDensityDpi: number
  screenDensity: number
  deviceId: string
  hardwareName: string
  boardName: string
  brand: string
  product: string
}

interface DeviceInfoPluginInterface {
  getDeviceInfo(): Promise<DeviceInfoPluginResponse>
}

// Register the native plugin
const NativeDeviceInfoPlugin = registerPlugin<DeviceInfoPluginInterface>('DeviceInfoPlugin')

/**
 * Get comprehensive device information using Capacitor APIs
 */
export async function getCapacitorDeviceInfo(): Promise<DeviceInfo> {
  try {
    const isNative = Capacitor.isNativePlatform()
    
    // Start with web info as baseline
    const baseInfo = getWebDeviceInfo()
    
    if (!isNative) {
      logger.info('Running in web mode, using web device info')
      return baseInfo as DeviceInfo
    }
    
    // Get Capacitor Device info
    const deviceInfo = await Device.getInfo()
    const deviceId = await Device.getId()
    const batteryInfo = await Device.getBatteryInfo()
    const languageCode = await Device.getLanguageCode()
    
    // Get App info
    const appInfo = await App.getInfo()
    
    // Construct comprehensive device info
    const info: DeviceInfo = {
      ...baseInfo,
      platform: deviceInfo.platform || 'unknown',
      platformVersion: deviceInfo.osVersion,
      
      deviceModel: deviceInfo.model,
      deviceManufacturer: deviceInfo.manufacturer,
      deviceId: deviceId.identifier,
      
      osName: deviceInfo.operatingSystem,
      osVersion: deviceInfo.osVersion,
      
      appVersion: appInfo.version,
      appBuild: appInfo.build,
      appId: appInfo.id, // Package name/identifier (e.g., com.yektayar.app)
      
      language: languageCode.value,
      
      isVirtual: deviceInfo.isVirtual,
      
      batteryLevel: batteryInfo.batteryLevel !== undefined ? batteryInfo.batteryLevel * 100 : undefined,
      isCharging: batteryInfo.isCharging,
      
      capabilities: {
        ...baseInfo.capabilities,
      },
      
      collectedAt: new Date().toISOString(),
    }
    
    // Try to get additional Android-specific info from our custom plugin
    if (deviceInfo.platform === 'android') {
      try {
        const nativeInfo: DeviceInfoPluginResponse = await NativeDeviceInfoPlugin.getDeviceInfo()
        logger.debug('Native Android device info:', nativeInfo)
        
        // Merge native info (prefer native values when available)
        if (nativeInfo.deviceModel) info.deviceModel = nativeInfo.deviceModel
        if (nativeInfo.deviceManufacturer) info.deviceManufacturer = nativeInfo.deviceManufacturer
        if (nativeInfo.androidVersion) info.osVersion = nativeInfo.androidVersion
        if (nativeInfo.packageName) info.appId = nativeInfo.packageName
        if (nativeInfo.screenWidth) info.screenWidth = nativeInfo.screenWidth
        if (nativeInfo.screenHeight) info.screenHeight = nativeInfo.screenHeight
        if (nativeInfo.screenDensity) info.screenDensity = nativeInfo.screenDensity
        if (nativeInfo.deviceId) info.deviceId = nativeInfo.deviceId
      } catch (error) {
        logger.warn('Could not get native Android device info:', error)
      }
    }
    
    // Add memory info if available (experimental API, may not be supported in all browsers)
    if ('deviceMemory' in navigator) {
      info.memorySize = (navigator as any).deviceMemory * 1024 // GB to MB
    }
    
    // Add connection type if available (experimental API, may not be supported in all browsers)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      info.connectionType = connection?.effectiveType || 'unknown'
    }
    
    logger.success('Device info collected:', info)
    return info
  } catch (error) {
    logger.error('Error collecting device info:', error)
    // Fallback to web info
    return getWebDeviceInfo() as DeviceInfo
  }
}
