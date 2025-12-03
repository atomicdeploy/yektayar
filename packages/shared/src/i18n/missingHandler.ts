/**
 * i18n Runtime Missing Key Handler
 * 
 * This module provides runtime detection and logging of missing i18n keys.
 * When a translation key is accessed but not found, it will be logged using
 * the logger utility.
 */

import { logger } from '../utils/logger'

// Track missing keys to avoid duplicate logs
const reportedMissingKeys = new Set<string>()

/**
 * Handler for missing i18n keys
 * Called by vue-i18n when a translation key is not found
 * 
 * @param locale - The current locale
 * @param key - The missing translation key
 * @param vm - The Vue component instance (optional)
 * @returns The key itself as fallback
 */
export function missingHandler(locale: string, key: string, vm?: any): string {
  const missingKeyId = `${locale}:${key}`
  
  // Only log each missing key once per session
  if (!reportedMissingKeys.has(missingKeyId)) {
    reportedMissingKeys.add(missingKeyId)
    
    // Log the missing key with context
    logger.warn(`Missing i18n key: "${key}" for locale "${locale}"`)
    
    // If we have component context, log it too
    if (vm && vm.$options && vm.$options.name) {
      logger.debug(`  Component: ${vm.$options.name}`)
    }
  }
  
  // Return the key itself as fallback
  return key
}

/**
 * Get all missing keys that have been reported in this session
 */
export function getMissingKeys(): string[] {
  return Array.from(reportedMissingKeys)
}

/**
 * Clear the list of reported missing keys
 */
export function clearMissingKeys(): void {
  reportedMissingKeys.clear()
}

/**
 * Print a summary of all missing keys to the console
 * Useful for debugging or end-of-session reporting
 */
export function printMissingKeysSummary(): void {
  const keys = getMissingKeys()
  
  if (keys.length === 0) {
    logger.success('No missing i18n keys detected')
    return
  }
  
  logger.warn(`Found ${keys.length} missing i18n key(s):`)
  
  // Group by locale
  const byLocale = new Map<string, string[]>()
  
  for (const missingKeyId of keys) {
    const [locale, ...keyParts] = missingKeyId.split(':')
    const key = keyParts.join(':')
    
    if (!byLocale.has(locale)) {
      byLocale.set(locale, [])
    }
    byLocale.get(locale)!.push(key)
  }
  
  // Print grouped by locale
  for (const [locale, localeKeys] of byLocale.entries()) {
    logger.info(`  ${locale}:`)
    for (const key of localeKeys) {
      logger.info(`    - ${key}`)
    }
  }
  
  logger.info('Please add these keys to your translation files.')
}

/**
 * Install the missing key handler globally (for browser environments)
 * Call this in development mode to get console warnings for missing keys
 */
export function installMissingKeyHandler(): void {
  // Make the summary function available globally for easy debugging
  if (typeof window !== 'undefined') {
    (window as any).__i18nMissingKeysSummary = printMissingKeysSummary
    logger.debug('Missing key handler installed. Call window.__i18nMissingKeysSummary() to see all missing keys.')
  }
}
