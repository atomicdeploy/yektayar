/**
 * Device Information Validation Utility
 * 
 * Validates and sanitizes device information received from clients
 * to prevent DoS attacks and ensure data integrity.
 */

import type { DeviceInfo } from '@yektayar/shared'

/**
 * Maximum allowed sizes for device info validation
 */
const MAX_STRING_LENGTH = 500
const MAX_ARRAY_LENGTH = 50
const MAX_OBJECT_DEPTH = 5
const MAX_CAPABILITIES_KEYS = 30

/**
 * Validate and sanitize device information object
 * 
 * @param deviceInfo - Raw device info from client
 * @returns Validated and sanitized device info
 */
export function validateDeviceInfo(deviceInfo: any): Partial<DeviceInfo> {
  if (!deviceInfo || typeof deviceInfo !== 'object') {
    return {}
  }
  
  // Prevent deeply nested objects
  if (getObjectDepth(deviceInfo) > MAX_OBJECT_DEPTH) {
    throw new Error('Device info object is too deeply nested')
  }
  
  const validated: Partial<DeviceInfo> = {}
  
  // Validate string fields
  const stringFields = [
    'platform', 'platformVersion', 'deviceModel', 'deviceManufacturer',
    'deviceId', 'osName', 'osVersion', 'appVersion', 'appBuild',
    'userAgent', 'language', 'timezone', 'connectionType'
  ] as const
  
  for (const field of stringFields) {
    if (field in deviceInfo && typeof deviceInfo[field] === 'string') {
      validated[field] = sanitizeString(deviceInfo[field])
    }
  }
  
  // Validate number fields
  const numberFields = [
    'screenWidth', 'screenHeight', 'screenDensity',
    'viewportWidth', 'viewportHeight', 'timezoneOffset',
    'memorySize', 'diskSpace', 'batteryLevel'
  ] as const
  
  for (const field of numberFields) {
    if (field in deviceInfo && typeof deviceInfo[field] === 'number') {
      if (isFinite(deviceInfo[field]) && deviceInfo[field] >= 0) {
        validated[field] = deviceInfo[field]
      }
    }
  }
  
  // Validate boolean fields
  const booleanFields = ['isVirtual', 'isCharging'] as const
  
  for (const field of booleanFields) {
    if (field in deviceInfo && typeof deviceInfo[field] === 'boolean') {
      validated[field] = deviceInfo[field]
    }
  }
  
  // Validate languages array
  if (Array.isArray(deviceInfo.languages)) {
    validated.languages = deviceInfo.languages
      .slice(0, MAX_ARRAY_LENGTH)
      .filter((lang: any) => typeof lang === 'string')
      .map((lang: string) => sanitizeString(lang))
  }
  
  // Validate capabilities object
  if (deviceInfo.capabilities && typeof deviceInfo.capabilities === 'object') {
    validated.capabilities = validateCapabilities(deviceInfo.capabilities)
  }
  
  // Validate collectedAt timestamp
  if (typeof deviceInfo.collectedAt === 'string') {
    try {
      const date = new Date(deviceInfo.collectedAt)
      if (!isNaN(date.getTime())) {
        validated.collectedAt = deviceInfo.collectedAt
      }
    } catch {
      // Invalid date, skip
    }
  }
  
  return validated
}

/**
 * Sanitize string to prevent injection and limit length
 * 
 * @param str - Raw string
 * @returns Sanitized string
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return ''
  }
  
  // Trim and limit length
  const trimmed = str.trim().substring(0, MAX_STRING_LENGTH)
  
  // Remove control characters but keep basic punctuation
  return trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Validate capabilities object
 * 
 * @param capabilities - Raw capabilities object
 * @returns Validated capabilities
 */
function validateCapabilities(capabilities: any): Record<string, boolean> {
  if (!capabilities || typeof capabilities !== 'object') {
    return {}
  }
  
  const validated: Record<string, boolean> = {}
  const keys = Object.keys(capabilities).slice(0, MAX_CAPABILITIES_KEYS)
  
  for (const key of keys) {
    if (typeof capabilities[key] === 'boolean') {
      validated[key] = capabilities[key]
    }
  }
  
  return validated
}

/**
 * Calculate depth of nested object
 * 
 * @param obj - Object to measure
 * @param currentDepth - Current depth level
 * @returns Maximum depth
 */
function getObjectDepth(obj: any, currentDepth: number = 0): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth
  }
  
  if (currentDepth >= MAX_OBJECT_DEPTH) {
    return currentDepth
  }
  
  let maxDepth = currentDepth
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const depth = getObjectDepth(obj[key], currentDepth + 1)
      maxDepth = Math.max(maxDepth, depth)
    }
  }
  
  return maxDepth
}

/**
 * Get the size of a JSON object in bytes
 * 
 * @param obj - Object to measure
 * @returns Size in bytes
 */
export function getObjectSize(obj: any): number {
  try {
    return JSON.stringify(obj).length
  } catch {
    return 0
  }
}

/**
 * Check if object size exceeds maximum allowed
 * 
 * @param obj - Object to check
 * @param maxSizeKB - Maximum size in kilobytes
 * @returns True if size is acceptable
 */
export function isValidObjectSize(obj: any, maxSizeKB: number = 100): boolean {
  const sizeBytes = getObjectSize(obj)
  const sizeKB = sizeBytes / 1024
  return sizeKB <= maxSizeKB
}
