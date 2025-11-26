import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, Logger } from './logger'

describe('Logger', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any
  let consoleInfoSpy: any
  let consoleWarnSpy: any

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks()
  })

  describe('success', () => {
    it('should log success messages', () => {
      logger.success('Test success message')
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('✅')
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Test success message')
    })

    it('should log success messages with additional arguments', () => {
      logger.success('Test success', { data: 'value' })
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message')
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('❌')
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Test error message')
    })

    it('should log error messages with additional arguments', () => {
      const errorObj = new Error('Test error')
      logger.error('An error occurred', errorObj)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message')
      expect(consoleInfoSpy).toHaveBeenCalled()
      expect(consoleInfoSpy.mock.calls[0][0]).toContain('ℹ️')
      expect(consoleInfoSpy.mock.calls[0][0]).toContain('Test info message')
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message')
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('⚠️')
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('Test warning message')
    })
  })

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message')
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('🔍')
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Test debug message')
    })
  })

  describe('custom', () => {
    it('should log custom messages with emoji and color', () => {
      logger.custom('🚀', 'Custom message', 'cyan')
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('🚀')
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Custom message')
    })
  })

  describe('startup', () => {
    it('should log startup information', () => {
      const config = { 
        port: 3000, 
        environment: 'development' 
      }
      logger.startup('Test App', config)
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('🚀')
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Test App Starting...')
    })
  })

  describe('emoji', () => {
    it('should return the correct emoji', () => {
      expect(logger.emoji('success')).toBe('✅')
      expect(logger.emoji('error')).toBe('❌')
      expect(logger.emoji('info')).toBe('ℹ️')
      expect(logger.emoji('warn')).toBe('⚠️')
      expect(logger.emoji('debug')).toBe('🔍')
    })

    it('should return empty string for unknown emoji', () => {
      expect(logger.emoji('unknown' as any)).toBe('')
    })
  })

  describe('Logger class', () => {
    it('should allow creating custom Logger instances', () => {
      const customLogger = new Logger()
      customLogger.info('Custom logger instance')
      expect(consoleInfoSpy).toHaveBeenCalled()
    })
  })
})
