import { describe, it, expect } from 'vitest'
import {
  detectLanguage,
  detectTimezone,
  getBrowserLanguages,
  getTimezoneInfo,
  detectLocaleInfo,
  isSupportedLanguage,
  parseAcceptLanguage,
  getBestLanguageMatch,
  formatDateByLocale,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
} from './locale'

describe('Locale Detection Utilities', () => {
  describe('detectLanguage', () => {
    it('should detect Persian language', () => {
      // Mock navigator
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fa-IR' },
        writable: true,
        configurable: true
      })
      
      expect(detectLanguage()).toBe('fa')
    })

    it('should detect English language', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US' },
        writable: true,
        configurable: true
      })
      
      expect(detectLanguage()).toBe('en')
    })

    it('should fallback to default language for unsupported languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR' },
        writable: true,
        configurable: true
      })
      
      expect(detectLanguage()).toBe(DEFAULT_LANGUAGE)
    })

    it('should use navigator.languages as fallback', () => {
      Object.defineProperty(global, 'navigator', {
        value: { languages: ['en-GB', 'en-US'] },
        writable: true,
        configurable: true
      })
      
      expect(detectLanguage()).toBe('en')
    })

    it('should return default language when navigator is undefined', () => {
      const originalNavigator = global.navigator
      // @ts-expect-error Testing undefined navigator
      delete global.navigator
      
      expect(detectLanguage()).toBe(DEFAULT_LANGUAGE)
      
      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      })
    })
  })

  describe('getBrowserLanguages', () => {
    it('should return array of browser languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: { languages: ['en-US', 'fa-IR', 'fr-FR'] },
        writable: true,
        configurable: true
      })
      
      const langs = getBrowserLanguages()
      expect(langs).toContain('en')
      expect(langs).toContain('fa')
      expect(langs).toContain('fr')
    })

    it('should return single language when languages array is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fa-IR' },
        writable: true,
        configurable: true
      })
      
      const langs = getBrowserLanguages()
      expect(langs).toEqual(['fa'])
    })
  })

  describe('detectTimezone', () => {
    it('should detect timezone using Intl API', () => {
      const timezone = detectTimezone()
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
      // Should be a valid IANA timezone or UTC
      expect(timezone).toMatch(/^[A-Z][a-z]+\/[A-Z][a-z_]+$|^UTC$/)
    })
  })

  describe('getTimezoneInfo', () => {
    it('should return timezone information with offset', () => {
      const info = getTimezoneInfo()
      
      expect(info).toHaveProperty('timezone')
      expect(info).toHaveProperty('offset')
      expect(info).toHaveProperty('offsetString')
      expect(typeof info.timezone).toBe('string')
      expect(typeof info.offset).toBe('number')
      expect(info.offsetString).toMatch(/^[+-]\d{2}:\d{2}$/)
    })

    it('should accept custom timezone', () => {
      const info = getTimezoneInfo('Asia/Tehran')
      expect(info.timezone).toBe('Asia/Tehran')
    })
  })

  describe('detectLocaleInfo', () => {
    it('should return complete locale information', () => {
      const info = detectLocaleInfo()
      
      expect(info).toHaveProperty('language')
      expect(info).toHaveProperty('timezone')
      expect(info).toHaveProperty('languages')
      expect(SUPPORTED_LANGUAGES).toContain(info.language)
      expect(Array.isArray(info.languages)).toBe(true)
    })
  })

  describe('isSupportedLanguage', () => {
    it('should return true for supported languages', () => {
      expect(isSupportedLanguage('fa')).toBe(true)
      expect(isSupportedLanguage('en')).toBe(true)
    })

    it('should return false for unsupported languages', () => {
      expect(isSupportedLanguage('fr')).toBe(false)
      expect(isSupportedLanguage('de')).toBe(false)
      expect(isSupportedLanguage('es')).toBe(false)
    })
  })

  describe('parseAcceptLanguage', () => {
    it('should parse Accept-Language header', () => {
      const result = parseAcceptLanguage('en-US,en;q=0.9,fa;q=0.8')
      
      expect(result).toHaveLength(3)
      expect(result[0].language).toBe('en')
      expect(result[0].quality).toBe(1.0)
      expect(result[1].language).toBe('en')
      expect(result[1].quality).toBe(0.9)
      expect(result[2].language).toBe('fa')
      expect(result[2].quality).toBe(0.8)
    })

    it('should sort by quality score', () => {
      const result = parseAcceptLanguage('fa;q=0.8,en;q=0.9,fr;q=0.7')
      
      expect(result[0].language).toBe('en')
      expect(result[0].quality).toBe(0.9)
      expect(result[1].language).toBe('fa')
      expect(result[1].quality).toBe(0.8)
    })

    it('should handle empty header', () => {
      const result = parseAcceptLanguage('')
      expect(result).toEqual([])
    })
  })

  describe('getBestLanguageMatch', () => {
    it('should return best matching supported language', () => {
      expect(getBestLanguageMatch('en-US,en;q=0.9,fa;q=0.8')).toBe('en')
      expect(getBestLanguageMatch('fa-IR,fa;q=0.9,en;q=0.8')).toBe('fa')
    })

    it('should return default language when no match found', () => {
      expect(getBestLanguageMatch('fr-FR,de-DE')).toBe(DEFAULT_LANGUAGE)
    })

    it('should prioritize by quality score', () => {
      expect(getBestLanguageMatch('fr;q=0.9,fa;q=0.8,en;q=0.7')).toBe('fa')
    })
  })

  describe('formatDateByLocale', () => {
    it('should format date in Persian locale', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDateByLocale(date, 'fa')
      
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })

    it('should format date in English locale', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDateByLocale(date, 'en')
      
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })

    it('should accept custom format options', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDateByLocale(date, 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })

    it('should use default language when not specified', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDateByLocale(date)
      
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })
  })
})
