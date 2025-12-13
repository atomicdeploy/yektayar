/**
 * Device Information Utility Tests
 * 
 * Tests for device information collection and formatting utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getWebDeviceInfo,
  formatDeviceInfoForHeaders,
  summarizeDeviceInfo,
  type DeviceInfo
} from './deviceInfo'

// Mock browser APIs
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  language: 'en-US',
  languages: ['en-US', 'en', 'fa'],
  maxTouchPoints: 0,
  geolocation: {},
  mediaDevices: {
    getUserMedia: vi.fn()
  },
  connection: {
    effectiveType: '4g'
  },
  deviceMemory: 8,
  serviceWorker: {},
  bluetooth: {}
}

const mockWindow = {
  screen: {
    width: 1920,
    height: 1080
  },
  innerWidth: 1366,
  innerHeight: 768,
  devicePixelRatio: 1.5,
  Notification: vi.fn(),
  indexedDB: {},
  RTCPeerConnection: vi.fn()
}

const mockIntl = {
  DateTimeFormat: vi.fn(() => ({
    resolvedOptions: () => ({ timeZone: 'America/New_York' })
  }))
}

describe('Device Information Utilities', () => {
  beforeEach(() => {
    // Setup global mocks
    global.navigator = mockNavigator as any
    global.window = mockWindow as any
    global.Intl = mockIntl as any
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    } as any
    global.sessionStorage = global.localStorage as any
    global.document = {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => ({}))
      }))
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getWebDeviceInfo', () => {
    it('should collect basic device information', () => {
      const info = getWebDeviceInfo()
      
      expect(info.platform).toBe('web')
      expect(info.userAgent).toBe(mockNavigator.userAgent)
      expect(info.language).toBe('en-US')
      expect(info.languages).toEqual(['en-US', 'en', 'fa'])
    })

    it('should collect screen dimensions', () => {
      const info = getWebDeviceInfo()
      
      expect(info.screenWidth).toBe(1920)
      expect(info.screenHeight).toBe(1080)
      expect(info.viewportWidth).toBe(1366)
      expect(info.viewportHeight).toBe(768)
      expect(info.screenDensity).toBe(1.5)
    })

    it('should collect timezone information', () => {
      const info = getWebDeviceInfo()
      
      expect(info.timezone).toBe('America/New_York')
      expect(typeof info.timezoneOffset).toBe('number')
    })

    it('should detect capabilities', () => {
      const info = getWebDeviceInfo()
      
      expect(info.capabilities).toBeDefined()
      expect(info.capabilities?.touchScreen).toBe(false)
      expect(info.capabilities?.geolocation).toBe(true)
      expect(info.capabilities?.camera).toBe(true)
      expect(info.capabilities?.serviceWorker).toBe(true)
      expect(info.capabilities?.notifications).toBe(true)
      expect(info.capabilities?.localStorage).toBe(true)
      expect(info.capabilities?.indexedDB).toBe(true)
      expect(info.capabilities?.webRTC).toBe(true)
    })

    it('should include timestamp', () => {
      const info = getWebDeviceInfo()
      
      expect(info.collectedAt).toBeDefined()
      expect(() => new Date(info.collectedAt!)).not.toThrow()
    })

    it('should handle missing Intl API gracefully', () => {
      const originalIntl = global.Intl
      delete (global as any).Intl
      
      const info = getWebDeviceInfo()
      
      expect(info.timezoneOffset).toBeDefined()
      expect(typeof info.timezoneOffset).toBe('number')
      
      global.Intl = originalIntl
    })

    it('should detect touch screen devices', () => {
      global.navigator = {
        ...mockNavigator,
        maxTouchPoints: 5
      } as any
      
      const info = getWebDeviceInfo()
      
      expect(info.capabilities?.touchScreen).toBe(true)
    })

    it('should handle missing connection API', () => {
      const navWithoutConnection = { ...mockNavigator }
      delete (navWithoutConnection as any).connection
      global.navigator = navWithoutConnection as any
      
      const info = getWebDeviceInfo()
      
      expect(info.connectionType).toBeUndefined()
    })

    it('should handle missing deviceMemory API', () => {
      const navWithoutMemory = { ...mockNavigator }
      delete (navWithoutMemory as any).deviceMemory
      global.navigator = navWithoutMemory as any
      
      const info = getWebDeviceInfo()
      
      expect(info.memorySize).toBeUndefined()
    })
  })

  describe('formatDeviceInfoForHeaders', () => {
    it('should format basic device info to headers', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'android',
        deviceModel: 'SM-G991B',
        deviceManufacturer: 'Samsung',
        osName: 'Android',
        osVersion: '14',
        appVersion: '1.0.0',
        language: 'en-US',
        screenWidth: 1080,
        screenHeight: 2400,
        screenDensity: 3.0,
        viewportWidth: 1080,
        viewportHeight: 2280,
        timezone: 'America/New_York',
        timezoneOffset: -300,
        deviceId: 'abc123',
        connectionType: '4g'
      }
      
      const headers = formatDeviceInfoForHeaders(deviceInfo)
      
      expect(headers['X-Device-Platform']).toBe('android')
      expect(headers['X-Device-Model']).toBe('SM-G991B')
      expect(headers['X-Device-Manufacturer']).toBe('Samsung')
      expect(headers['X-OS-Name']).toBe('Android')
      expect(headers['X-OS-Version']).toBe('14')
      expect(headers['X-App-Version']).toBe('1.0.0')
      expect(headers['X-Device-Language']).toBe('en-US')
      expect(headers['X-Screen-Size']).toBe('1080x2400')
      expect(headers['X-Screen-Density']).toBe('3')
      expect(headers['X-Viewport-Size']).toBe('1080x2280')
      expect(headers['X-Device-Timezone']).toBe('America/New_York')
      expect(headers['X-Device-Timezone-Offset']).toBe('-300')
      expect(headers['X-Device-Id']).toBe('abc123')
      expect(headers['X-Connection-Type']).toBe('4g')
    })

    it('should format languages array', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'web',
        languages: ['en-US', 'en', 'fa']
      }
      
      const headers = formatDeviceInfoForHeaders(deviceInfo)
      
      expect(headers['X-Device-Languages']).toBe('en-US,en,fa')
    })

    it('should format capabilities as JSON', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'web',
        capabilities: {
          touchScreen: true,
          serviceWorker: true,
          notifications: false
        }
      }
      
      const headers = formatDeviceInfoForHeaders(deviceInfo)
      
      expect(headers['X-Device-Capabilities']).toBeDefined()
      const caps = JSON.parse(headers['X-Device-Capabilities'])
      expect(caps.touchScreen).toBe(true)
      expect(caps.serviceWorker).toBe(true)
      expect(caps.notifications).toBe(false)
    })

    it('should skip undefined values', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'web',
        deviceModel: undefined,
        osName: undefined
      }
      
      const headers = formatDeviceInfoForHeaders(deviceInfo)
      
      expect(headers['X-Device-Platform']).toBe('web')
      expect(headers['X-Device-Model']).toBeUndefined()
      expect(headers['X-OS-Name']).toBeUndefined()
    })

    it('should handle empty device info', () => {
      const deviceInfo: DeviceInfo = { platform: 'web' }
      
      const headers = formatDeviceInfoForHeaders(deviceInfo)
      
      expect(headers['X-Device-Platform']).toBe('web')
      expect(Object.keys(headers).length).toBe(1)
    })
  })

  describe('summarizeDeviceInfo', () => {
    it('should create summary with all fields', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'android',
        deviceManufacturer: 'Samsung',
        deviceModel: 'SM-G991B',
        osName: 'Android',
        osVersion: '14',
        screenWidth: 1080,
        screenHeight: 2400
      }
      
      const summary = summarizeDeviceInfo(deviceInfo)
      
      expect(summary).toContain('Platform: android')
      expect(summary).toContain('Device: Samsung SM-G991B')
      expect(summary).toContain('OS: Android 14')
      expect(summary).toContain('Screen: 1080x2400')
    })

    it('should handle missing fields gracefully', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'web'
      }
      
      const summary = summarizeDeviceInfo(deviceInfo)
      
      expect(summary).toBe('Platform: web')
    })

    it('should handle partial device info', () => {
      const deviceInfo: DeviceInfo = {
        platform: 'ios',
        osName: 'iOS',
        osVersion: '15.0'
      }
      
      const summary = summarizeDeviceInfo(deviceInfo)
      
      expect(summary).toContain('Platform: ios')
      expect(summary).toContain('OS: iOS 15.0')
      expect(summary).not.toContain('Device:')
      expect(summary).not.toContain('Screen:')
    })
  })
})
