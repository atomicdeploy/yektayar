/**
 * Device Information Utility
 * 
 * Collects comprehensive device information including hardware details,
 * screen size, capabilities, and platform-specific data.
 * Works across web, Capacitor/Cordova, and Node.js environments.
 */

export interface DeviceInfo {
  // Platform information
  platform: string // 'web', 'android', 'ios', 'electron', etc.
  platformVersion?: string
  
  // Device hardware
  deviceModel?: string
  deviceManufacturer?: string
  deviceId?: string // Unique device identifier (when available)
  
  // Operating System
  osName?: string
  osVersion?: string
  
  // Screen information
  screenWidth?: number
  screenHeight?: number
  screenDensity?: number
  viewportWidth?: number
  viewportHeight?: number
  
  // App information
  appVersion?: string
  appBuild?: string
  
  // Browser/WebView information
  userAgent?: string
  language?: string
  languages?: string[]
  
  // Hardware capabilities
  capabilities?: {
    touchScreen?: boolean
    camera?: boolean
    geolocation?: boolean
    bluetooth?: boolean
    nfc?: boolean
    accelerometer?: boolean
    gyroscope?: boolean
  }
  
  // Connection information
  connectionType?: string // 'wifi', 'cellular', 'ethernet', 'none', 'unknown'
  
  // Memory and performance
  memorySize?: number // Available RAM in MB
  diskSpace?: number // Available storage in MB
  
  // Additional metadata
  isVirtual?: boolean // Emulator/VM detection
  batteryLevel?: number
  isCharging?: boolean
  
  // Timestamp
  collectedAt?: string
}

/**
 * Collects device information from browser/web environment
 */
export function getWebDeviceInfo(): Partial<DeviceInfo> {
  const info: Partial<DeviceInfo> = {
    platform: 'web',
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenDensity: window.devicePixelRatio,
    collectedAt: new Date().toISOString(),
  }
  
  // Detect OS from user agent
  const ua = navigator.userAgent
  if (ua.includes('Windows')) {
    info.osName = 'Windows'
  } else if (ua.includes('Mac')) {
    info.osName = 'macOS'
  } else if (ua.includes('Linux')) {
    info.osName = 'Linux'
  } else if (ua.includes('Android')) {
    info.osName = 'Android'
    info.platform = 'android'
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    info.osName = 'iOS'
    info.platform = 'ios'
  }
  
  // Detect capabilities
  info.capabilities = {
    touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  }
  
  // Connection information
  if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    info.connectionType = connection?.effectiveType || connection?.type || 'unknown'
  }
  
  // Memory information (if available)
  if ('deviceMemory' in navigator) {
    info.memorySize = (navigator as any).deviceMemory * 1024 // Convert GB to MB
  }
  
  return info
}

/**
 * Formats device info for HTTP headers
 * Returns key-value pairs suitable for request headers
 */
export function formatDeviceInfoForHeaders(deviceInfo: DeviceInfo): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (deviceInfo.platform) {
    headers['X-Device-Platform'] = deviceInfo.platform
  }
  
  if (deviceInfo.deviceModel) {
    headers['X-Device-Model'] = deviceInfo.deviceModel
  }
  
  if (deviceInfo.deviceManufacturer) {
    headers['X-Device-Manufacturer'] = deviceInfo.deviceManufacturer
  }
  
  if (deviceInfo.osName) {
    headers['X-OS-Name'] = deviceInfo.osName
  }
  
  if (deviceInfo.osVersion) {
    headers['X-OS-Version'] = deviceInfo.osVersion
  }
  
  if (deviceInfo.appVersion) {
    headers['X-App-Version'] = deviceInfo.appVersion
  }
  
  if (deviceInfo.screenWidth && deviceInfo.screenHeight) {
    headers['X-Screen-Size'] = `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`
  }
  
  if (deviceInfo.screenDensity) {
    headers['X-Screen-Density'] = deviceInfo.screenDensity.toString()
  }
  
  if (deviceInfo.language) {
    headers['X-Device-Language'] = deviceInfo.language
  }
  
  if (deviceInfo.deviceId) {
    headers['X-Device-Id'] = deviceInfo.deviceId
  }
  
  if (deviceInfo.connectionType) {
    headers['X-Connection-Type'] = deviceInfo.connectionType
  }
  
  return headers
}

/**
 * Create a summary string of device information for logging
 */
export function summarizeDeviceInfo(deviceInfo: DeviceInfo): string {
  const parts: string[] = []
  
  if (deviceInfo.platform) {
    parts.push(`Platform: ${deviceInfo.platform}`)
  }
  
  if (deviceInfo.deviceManufacturer && deviceInfo.deviceModel) {
    parts.push(`Device: ${deviceInfo.deviceManufacturer} ${deviceInfo.deviceModel}`)
  }
  
  if (deviceInfo.osName && deviceInfo.osVersion) {
    parts.push(`OS: ${deviceInfo.osName} ${deviceInfo.osVersion}`)
  }
  
  if (deviceInfo.screenWidth && deviceInfo.screenHeight) {
    parts.push(`Screen: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`)
  }
  
  return parts.join(' | ')
}
