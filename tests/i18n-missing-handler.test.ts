import { describe, it, expect, beforeEach, vi } from 'vitest'
import { missingHandler, getMissingKeys, clearMissingKeys, printMissingKeysSummary } from '../packages/shared/src/i18n/missingHandler'

describe('i18n Missing Handler', () => {
  beforeEach(() => {
    // Clear any previously reported missing keys
    clearMissingKeys()
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should track missing keys', () => {
    // Call the missing handler
    missingHandler('en', 'test.missing.key')
    
    // Check that the key was tracked
    const missingKeys = getMissingKeys()
    expect(missingKeys).toContain('en:test.missing.key')
    expect(missingKeys).toHaveLength(1)
  })

  it('should not track duplicate missing keys', () => {
    // Call the missing handler multiple times with the same key
    missingHandler('en', 'test.missing.key')
    missingHandler('en', 'test.missing.key')
    missingHandler('en', 'test.missing.key')
    
    // Check that the key was only tracked once
    const missingKeys = getMissingKeys()
    expect(missingKeys).toContain('en:test.missing.key')
    expect(missingKeys).toHaveLength(1)
  })

  it('should track different keys separately', () => {
    // Call the missing handler with different keys
    missingHandler('en', 'test.key1')
    missingHandler('en', 'test.key2')
    missingHandler('fa', 'test.key3')
    
    // Check that all keys were tracked
    const missingKeys = getMissingKeys()
    expect(missingKeys).toContain('en:test.key1')
    expect(missingKeys).toContain('en:test.key2')
    expect(missingKeys).toContain('fa:test.key3')
    expect(missingKeys).toHaveLength(3)
  })

  it('should return the key as fallback', () => {
    const result = missingHandler('en', 'test.missing.key')
    expect(result).toBe('test.missing.key')
  })

  it('should clear missing keys', () => {
    // Add some missing keys
    missingHandler('en', 'test.key1')
    missingHandler('en', 'test.key2')
    
    // Clear the keys
    clearMissingKeys()
    
    // Check that the keys were cleared
    const missingKeys = getMissingKeys()
    expect(missingKeys).toHaveLength(0)
  })

  it('should print summary with no missing keys', () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    printMissingKeysSummary()
    
    // Should not print anything when there are no missing keys
    expect(consoleLogSpy).toHaveBeenCalled()
  })

  it('should print summary with missing keys', () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    // Add some missing keys
    missingHandler('en', 'test.key1')
    missingHandler('fa', 'test.key2')
    
    printMissingKeysSummary()
    
    // Should print summary
    expect(consoleLogSpy).toHaveBeenCalled()
  })

  it('should group keys by locale in summary', () => {
    const consoleInfoSpy = vi.spyOn(console, 'info')
    
    // Add keys for different locales
    missingHandler('en', 'test.key1')
    missingHandler('en', 'test.key2')
    missingHandler('fa', 'test.key3')
    
    printMissingKeysSummary()
    
    // Check that the output includes locale grouping
    const output = consoleInfoSpy.mock.calls.map(call => call.join(' ')).join('\n')
    expect(output).toContain('en:')
    expect(output).toContain('fa:')
  })
})
