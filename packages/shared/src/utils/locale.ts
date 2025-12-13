/**
 * Language and Timezone Detection Utilities
 * 
 * Provides functions to detect client language and timezone preferences
 * from browser/system settings.
 */

export interface LocaleInfo {
  language: string
  timezone: string
  languages: readonly string[]
}

export interface TimezoneInfo {
  timezone: string
  offset: number
  offsetString: string
}

/**
 * Supported languages in the application
 */
export const SUPPORTED_LANGUAGES = ['fa', 'en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

/**
 * Default language fallback
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'fa'

/**
 * Detect the user's preferred language from browser settings
 * 
 * Priority:
 * 1. navigator.language (primary language)
 * 2. navigator.languages[0] (first preferred language)
 * 3. Default to Persian (fa)
 * 
 * @returns ISO 639-1 language code (e.g., 'fa', 'en')
 */
export function detectLanguage(): SupportedLanguage {
  // Check if we're in a browser environment
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  // Get browser language
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0])
  
  if (!browserLang) {
    return DEFAULT_LANGUAGE
  }

  // Extract language code (e.g., 'en-US' -> 'en', 'fa-IR' -> 'fa')
  const langCode = browserLang.toLowerCase().split('-')[0]
  
  // Check if it's a supported language
  if (SUPPORTED_LANGUAGES.includes(langCode as SupportedLanguage)) {
    return langCode as SupportedLanguage
  }

  // Default to Persian
  return DEFAULT_LANGUAGE
}

/**
 * Get all browser languages in order of preference
 * 
 * @returns Array of language codes
 */
export function getBrowserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') {
    return [DEFAULT_LANGUAGE]
  }

  if (navigator.languages) {
    return navigator.languages.map(lang => lang.toLowerCase().split('-')[0])
  }

  if (navigator.language) {
    return [navigator.language.toLowerCase().split('-')[0]]
  }

  return [DEFAULT_LANGUAGE]
}

/**
 * Detect the user's timezone using Intl API
 * 
 * @returns IANA timezone identifier (e.g., 'Asia/Tehran', 'America/New_York')
 */
export function detectTimezone(): string {
  try {
    // Use Intl.DateTimeFormat to get timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_error) {
    // Fallback to UTC if detection fails
    return 'UTC'
  }
}

/**
 * Get detailed timezone information
 * 
 * @param timezone Optional timezone (defaults to detected timezone)
 * @returns Timezone information including offset
 */
export function getTimezoneInfo(timezone?: string): TimezoneInfo {
  const tz = timezone || detectTimezone()
  
  try {
    // Get current date
    const now = new Date()
    
    // Calculate offset for the specific timezone using Intl API
    // Get UTC time
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    // Get local time in the specified timezone
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    
    // Calculate offset in minutes (timezone time - UTC time)
    const offset = Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60))
    
    // Format offset as string (e.g., '+03:30', '-05:00')
    const sign = offset >= 0 ? '+' : '-'
    const absOffset = Math.abs(offset)
    const hours = Math.floor(absOffset / 60)
    const minutes = absOffset % 60
    const offsetString = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    return {
      timezone: tz,
      offset,
      offsetString
    }
  } catch (_error) {
    return {
      timezone: 'UTC',
      offset: 0,
      offsetString: '+00:00'
    }
  }
}

/**
 * Get complete locale information
 * 
 * @returns Locale information including language, timezone, and browser languages
 */
export function detectLocaleInfo(): LocaleInfo {
  return {
    language: detectLanguage(),
    timezone: detectTimezone(),
    languages: getBrowserLanguages()
  }
}

/**
 * Check if a language is supported
 * 
 * @param language Language code to check
 * @returns True if language is supported
 */
export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
}

/**
 * Normalize language code to supported language
 * Safely converts a language string to a supported language or returns default
 * 
 * @param language Language code to normalize
 * @returns Supported language or default
 */
export function normalizeLanguage(language: string): SupportedLanguage {
  const normalized = language.toLowerCase().split('-')[0]
  return isSupportedLanguage(normalized) ? normalized : DEFAULT_LANGUAGE
}

/**
 * Parse Accept-Language header (server-side)
 * 
 * @param acceptLanguage Accept-Language header value
 * @returns Parsed language with quality scores
 */
export function parseAcceptLanguage(acceptLanguage: string): Array<{ language: string; quality: number }> {
  if (!acceptLanguage) {
    return []
  }

  return acceptLanguage
    .split(',')
    .map(lang => {
      const parts = lang.trim().split(';')
      const language = parts[0].toLowerCase().split('-')[0]
      const qualityMatch = parts[1]?.match(/q=([0-9.]+)/)
      const quality = qualityMatch ? parseFloat(qualityMatch[1]) : 1.0
      
      return { language, quality }
    })
    .sort((a, b) => b.quality - a.quality)
}

/**
 * Get best matching language from Accept-Language header
 * 
 * @param acceptLanguage Accept-Language header value
 * @returns Best matching supported language or default
 */
export function getBestLanguageMatch(acceptLanguage: string): SupportedLanguage {
  const languages = parseAcceptLanguage(acceptLanguage)
  
  for (const { language } of languages) {
    const normalized = normalizeLanguage(language)
    if (isSupportedLanguage(normalized)) {
      return normalized
    }
  }
  
  return DEFAULT_LANGUAGE
}

/**
 * Locale to country code mapping
 * Maps language codes to their primary locale identifiers
 */
const LOCALE_MAPPING: Record<SupportedLanguage, string> = {
  fa: 'fa-IR',
  en: 'en-US'
}

/**
 * Validate IANA timezone identifier
 * 
 * @param timezone Timezone string to validate
 * @returns True if valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (_error) {
    return false
  }
}

/**
 * Normalize timezone to valid IANA identifier
 * 
 * @param timezone Timezone to normalize
 * @returns Valid timezone or UTC fallback
 */
export function normalizeTimezone(timezone: string): string {
  if (!timezone || timezone.trim() === '') {
    return 'UTC'
  }
  
  return isValidTimezone(timezone) ? timezone : 'UTC'
}

/**
 * Format a date according to locale
 * 
 * @param date Date to format
 * @param language Language code
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateByLocale(
  date: Date,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = LOCALE_MAPPING[language]
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch (_error) {
    return date.toISOString()
  }
}
