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
  appId?: string // Package name/identifier (e.g., com.yektayar.app)
  
  // Browser/WebView information
  userAgent?: string
  language?: string
  languages?: string[]
  timezone?: string
  timezoneOffset?: number // Minutes from UTC
  
  // Hardware capabilities
  capabilities?: {
    touchScreen?: boolean
    camera?: boolean
    geolocation?: boolean
    bluetooth?: boolean
    nfc?: boolean
    accelerometer?: boolean
    gyroscope?: boolean
    // Browser/PWA specific capabilities
    serviceWorker?: boolean
    notifications?: boolean
    localStorage?: boolean
    sessionStorage?: boolean
    indexedDB?: boolean
    webGL?: boolean
    webRTC?: boolean
    mediaDevices?: boolean
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
  
  // Timezone information
  info.timezoneOffset = new Date().getTimezoneOffset()
  try {
    info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_error) {
    // Fallback if Intl API not available - timezone offset already set
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
  
  // Detect capabilities - both native and PWA features
  info.capabilities = {
    touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    mediaDevices: 'mediaDevices' in navigator,
    
    // PWA/Browser capabilities
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    localStorage: ((): boolean => {
      try {
        return typeof localStorage !== 'undefined'
      } catch {
        return false
      }
    })(),
    sessionStorage: ((): boolean => {
      try {
        return typeof sessionStorage !== 'undefined'
      } catch {
        return false
      }
    })(),
    indexedDB: 'indexedDB' in window,
    webGL: ((): boolean => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    })(),
    webRTC: 'RTCPeerConnection' in window,
    
    // Check for Bluetooth API
    bluetooth: 'bluetooth' in navigator,
  }
  
  // Connection information
  // Note: Network Information API is experimental and may not be available in all browsers
  // See: https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
  if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    info.connectionType = connection?.effectiveType || connection?.type || 'unknown'
  }
  
  // Memory information
  // Note: Device Memory API is experimental and not widely supported (Chrome, Edge only)
  // Returns approximate amount of device memory in gigabytes
  // See: https://developer.mozilla.org/en-US/docs/Web/API/Device_Memory_API
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
  
  if (deviceInfo.appBuild) {
    headers['X-App-Build'] = deviceInfo.appBuild
  }
  
  if (deviceInfo.appId) {
    headers['X-App-Id'] = deviceInfo.appId
  }
  
  if (deviceInfo.screenWidth && deviceInfo.screenHeight) {
    headers['X-Screen-Size'] = `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`
  }
  
  if (deviceInfo.screenDensity) {
    headers['X-Screen-Density'] = deviceInfo.screenDensity.toString()
  }
  
  if (deviceInfo.viewportWidth && deviceInfo.viewportHeight) {
    headers['X-Viewport-Size'] = `${deviceInfo.viewportWidth}x${deviceInfo.viewportHeight}`
  }
  
  if (deviceInfo.language) {
    headers['X-Device-Language'] = deviceInfo.language
  }
  
  // Send all supported languages as a comma-separated list
  if (deviceInfo.languages && deviceInfo.languages.length > 0) {
    headers['X-Device-Languages'] = deviceInfo.languages.join(',')
  }
  
  if (deviceInfo.timezone) {
    headers['X-Device-Timezone'] = deviceInfo.timezone
  }
  
  if (deviceInfo.timezoneOffset !== undefined) {
    headers['X-Device-Timezone-Offset'] = deviceInfo.timezoneOffset.toString()
  }
  
  if (deviceInfo.deviceId) {
    headers['X-Device-Id'] = deviceInfo.deviceId
  }
  
  if (deviceInfo.connectionType) {
    headers['X-Connection-Type'] = deviceInfo.connectionType
  }
  
  // Send capabilities as JSON string if available
  if (deviceInfo.capabilities) {
    headers['X-Device-Capabilities'] = JSON.stringify(deviceInfo.capabilities)
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
