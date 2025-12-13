/**
 * i18n Key Validation Utilities
 * 
 * This module provides utilities to validate that all i18n keys used in the codebase
 * actually exist in the translation files.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { logger } from '../utils/logger'

export interface TranslationKeys {
  [locale: string]: Set<string>
}

export interface ValidationResult {
  isValid: boolean
  missingKeys: Array<{
    key: string
    file: string
    line: number
    locale: string
  }>
  unusedKeys: Array<{
    key: string
    locale: string
  }>
  summary: {
    totalUsedKeys: number
    totalAvailableKeys: number
    totalMissingKeys: number
    totalUnusedKeys: number
  }
}

/**
 * Extract all keys from a translation object (recursively flattens nested objects)
 */
export function extractKeysFromObject(
  obj: any,
  prefix = '',
  keys: Set<string> = new Set()
): Set<string> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively handle nested objects
        extractKeysFromObject(value, fullKey, keys)
      } else {
        // This is a leaf node, add the key
        keys.add(fullKey)
      }
    }
  }
  return keys
}

/**
 * Load translation keys from TypeScript locale files
 */
export function loadKeysFromTsFile(filePath: string): Set<string> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    
    // Extract the default export object
    const match = content.match(/export default\s+({[\s\S]*})/)
    if (!match) {
      return new Set()
    }

    // This is a simplified parser - for production, use a proper AST parser
    // For now, we'll extract keys by pattern matching
    const keys = new Set<string>()
    
    // Match simple key: value patterns
    const simpleKeyPattern = /^\s*(\w+):\s*['"`]/gm
    let simpleMatch
    while ((simpleMatch = simpleKeyPattern.exec(content)) !== null) {
      keys.add(simpleMatch[1])
    }
    
    // Match nested object keys (e.g., nav: { dashboard: ... })
    const nestedPattern = /(\w+):\s*{/g
    const nestedKeys: string[] = []
    let nestedMatch
    while ((nestedMatch = nestedPattern.exec(content)) !== null) {
      nestedKeys.push(nestedMatch[1])
    }
    
    // For nested keys, we need to parse the structure more carefully
    // This is a simplified approach - scanning for property patterns
    nestedKeys.forEach(parentKey => {
      const nestedRegex = new RegExp(`${parentKey}:\\s*{([^}]+)}`, 's')
      const nestedContent = content.match(nestedRegex)
      if (nestedContent) {
        const propertyPattern = /(\w+):\s*['"`]/g
        let propMatch
        while ((propMatch = propertyPattern.exec(nestedContent[1])) !== null) {
          keys.add(`${parentKey}.${propMatch[1]}`)
        }
      }
    })

    return keys
  } catch (error) {
    logger.error(`Error loading keys from ${filePath}:`, error)
    return new Set()
  }
}

/**
 * Load translation keys from JSON file
 */
export function loadKeysFromJsonFile(filePath: string, locale: string): Set<string> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const translations = JSON.parse(content)
    
    if (translations[locale]) {
      return extractKeysFromObject(translations[locale])
    }
    
    return new Set()
  } catch (error) {
    logger.error(`Error loading keys from ${filePath}:`, error)
    return new Set()
  }
}

/**
 * Find all files in a directory recursively
 */
export function findFiles(
  dir: string,
  extensions: string[],
  excludeDirs: string[] = ['node_modules', 'dist', 'build', '.git']
): string[] {
  const files: string[] = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          files.push(...findFiles(fullPath, extensions, excludeDirs))
        }
      } else if (extensions.includes(extname(item))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    logger.error(`Error reading directory ${dir}:`, error)
  }
  
  return files
}

/**
 * Extract i18n key usage from source files
 */
export function extractUsedKeys(filePath: string): Array<{
  key: string
  line: number
}> {
  const usedKeys: Array<{ key: string; line: number }> = []
  
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    // Match patterns like t('key'), t("key"), t(`key`)
    const tFunctionPattern = /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    
    lines.forEach((line, index) => {
      let match
      while ((match = tFunctionPattern.exec(line)) !== null) {
        usedKeys.push({
          key: match[1],
          line: index + 1
        })
      }
    })
  } catch (error) {
    logger.error(`Error extracting keys from ${filePath}:`, error)
  }
  
  return usedKeys
}

/**
 * Validate i18n keys in a project
 */
export function validateI18nKeys(
  sourceDir: string,
  availableKeys: TranslationKeys
): ValidationResult {
  const missingKeys: ValidationResult['missingKeys'] = []
  const usedKeysMap = new Map<string, Array<{ file: string; line: number }>>()
  
  // Find all source files
  const sourceFiles = findFiles(sourceDir, ['.vue', '.ts', '.tsx', '.js', '.jsx'])
  
  // Extract used keys from all source files
  for (const file of sourceFiles) {
    const keys = extractUsedKeys(file)
    
    for (const { key, line } of keys) {
      if (!usedKeysMap.has(key)) {
        usedKeysMap.set(key, [])
      }
      usedKeysMap.get(key)!.push({ file, line })
    }
  }
  
  // Check each used key against available keys for each locale
  for (const [key, usages] of usedKeysMap.entries()) {
    for (const [locale, keys] of Object.entries(availableKeys)) {
      if (!keys.has(key)) {
        for (const usage of usages) {
          missingKeys.push({
            key,
            file: usage.file,
            line: usage.line,
            locale
          })
        }
      }
    }
  }
  
  // Find unused keys
  const unusedKeys: ValidationResult['unusedKeys'] = []
  const allUsedKeys = new Set(usedKeysMap.keys())
  
  for (const [locale, keys] of Object.entries(availableKeys)) {
    for (const key of keys) {
      if (!allUsedKeys.has(key)) {
        unusedKeys.push({ key, locale })
      }
    }
  }
  
  // Calculate totals for each locale
  const totalAvailableKeys = Object.values(availableKeys).reduce(
    (sum, keys) => sum + keys.size, 
    0
  ) / Object.keys(availableKeys).length // Average across locales
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    unusedKeys,
    summary: {
      totalUsedKeys: usedKeysMap.size,
      totalAvailableKeys: Math.round(totalAvailableKeys),
      totalMissingKeys: missingKeys.length,
      totalUnusedKeys: unusedKeys.length
    }
  }
}
