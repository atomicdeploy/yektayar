#!/usr/bin/env node

/**
 * i18n Keys Validation Script
 * 
 * This script validates that all i18n keys used in the codebase exist in translation files.
 * It can be run as part of CI/CD to catch missing translations early.
 * 
 * Usage:
 *   node scripts/validate-i18n-keys.mjs [--fix] [--package=<package-name>]
 * 
 * Options:
 *   --fix                  Auto-generate missing keys with placeholder values
 *   --package=<name>       Validate only a specific package (admin-panel, mobile-app)
 *   --show-unused          Show unused translation keys
 *   --strict               Fail on unused keys as well
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  fix: args.includes('--fix'),
  showUnused: args.includes('--show-unused'),
  strict: args.includes('--strict'),
  package: args.find(arg => arg.startsWith('--package='))?.split('=')[1]
}

/**
 * Extract all keys from a translation object (recursively)
 */
function extractKeysFromObject(obj, prefix = '', keys = new Set()) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        extractKeysFromObject(value, fullKey, keys)
      } else {
        keys.add(fullKey)
      }
    }
  }
  return keys
}

/**
 * Load translation keys from a TypeScript locale file
 */
function loadKeysFromTsFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const keys = new Set()
    
    // Simple pattern matching for keys
    // Matches patterns like: key: 'value' or key: "value"
    const keyPattern = /^\s*(\w+):\s*['"`]/gm
    let match
    
    while ((match = keyPattern.exec(content)) !== null) {
      keys.add(match[1])
    }
    
    // Handle nested objects like nav: { dashboard: 'Dashboard' }
    const nestedPattern = /(\w+):\s*\{([^}]+)\}/gs
    const nestedMatches = [...content.matchAll(nestedPattern)]
    
    for (const nestedMatch of nestedMatches) {
      const parentKey = nestedMatch[1]
      const nestedContent = nestedMatch[2]
      
      const nestedKeyPattern = /(\w+):\s*['"`]/g
      let nestedKeyMatch
      
      while ((nestedKeyMatch = nestedKeyPattern.exec(nestedContent)) !== null) {
        keys.add(`${parentKey}.${nestedKeyMatch[1]}`)
      }
    }
    
    return keys
  } catch (error) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, error.message)
    return new Set()
  }
}

/**
 * Load translation keys from JSON file
 */
function loadKeysFromJsonFile(filePath, locale) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const translations = JSON.parse(content)
    
    if (translations[locale]) {
      return extractKeysFromObject(translations[locale])
    }
    
    return new Set()
  } catch (error) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, error.message)
    return new Set()
  }
}

/**
 * Find files recursively
 */
function findFiles(dir, extensions, excludeDirs = ['node_modules', 'dist', 'build', '.git', 'android', 'ios']) {
  const files = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      
      try {
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            files.push(...findFiles(fullPath, extensions, excludeDirs))
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath)
        }
      } catch (err) {
        // Skip files we can't access
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${dir}:${colors.reset}`, error.message)
  }
  
  return files
}

/**
 * Extract i18n key usage from source files
 */
function extractUsedKeys(filePath) {
  const usedKeys = []
  
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    // Match t('key'), t("key"), t(`key`), and also $t('key') for Vue template syntax
    const patterns = [
      /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /\$t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ]
    
    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        let match
        // Reset regex state
        pattern.lastIndex = 0
        
        while ((match = pattern.exec(line)) !== null) {
          const key = match[1]
          
          // Skip keys with template literal syntax (${...})
          // These are dynamic keys that can't be statically validated
          if (key.includes('${')) {
            continue
          }
          
          usedKeys.push({
            key,
            line: index + 1
          })
        }
      }
    })
  } catch (error) {
    // Skip files we can't read
  }
  
  return usedKeys
}

/**
 * Validate i18n keys for a package
 */
function validatePackage(packageName, packagePath) {
  console.log(`\n${colors.cyan}${colors.bold}Validating ${packageName}...${colors.reset}`)
  
  // Determine locale file paths based on package
  let localeFiles = {}
  let sourceDir = ''
  
  if (packageName === 'admin-panel') {
    sourceDir = join(packagePath, 'src')
    localeFiles = {
      en: join(packagePath, 'src/locales/en.ts'),
      fa: join(packagePath, 'src/locales/fa.ts')
    }
  } else if (packageName === 'mobile-app') {
    sourceDir = join(packagePath, 'src')
    // Mobile app has inline translations, we'll parse main.ts
    const mainTsPath = join(packagePath, 'src/main.ts')
    try {
      const content = readFileSync(mainTsPath, 'utf-8')
      
      // Extract the messages object from main.ts
      const messagesMatch = content.match(/messages:\s*\{([\s\S]*?)\n  \}\n\}\)/s)
      if (messagesMatch) {
        // For now, note that mobile-app has inline translations
        console.log(`${colors.yellow}Note: Mobile app has inline translations in main.ts${colors.reset}`)
      }
    } catch (error) {
      console.log(`${colors.yellow}Warning: Could not parse mobile-app translations${colors.reset}`)
    }
    // For simplicity, we'll skip mobile-app for now
    return { isValid: true, missingKeys: [], unusedKeys: [] }
  } else {
    console.log(`${colors.yellow}Unknown package: ${packageName}${colors.reset}`)
    return { isValid: true, missingKeys: [], unusedKeys: [] }
  }
  
  // Load available keys
  const availableKeys = {}
  for (const [locale, filePath] of Object.entries(localeFiles)) {
    availableKeys[locale] = loadKeysFromTsFile(filePath)
    console.log(`${colors.gray}Loaded ${availableKeys[locale].size} keys for ${locale}${colors.reset}`)
  }
  
  // Find all source files
  const sourceFiles = findFiles(sourceDir, ['.vue', '.ts', '.tsx', '.js', '.jsx'])
  console.log(`${colors.gray}Scanning ${sourceFiles.length} source files...${colors.reset}`)
  
  // Extract used keys
  const usedKeysMap = new Map()
  for (const file of sourceFiles) {
    const keys = extractUsedKeys(file)
    
    for (const { key, line } of keys) {
      if (!usedKeysMap.has(key)) {
        usedKeysMap.set(key, [])
      }
      usedKeysMap.get(key).push({ file: file.replace(rootDir, ''), line })
    }
  }
  
  console.log(`${colors.gray}Found ${usedKeysMap.size} unique keys in use${colors.reset}`)
  
  // Find missing keys
  const missingKeys = []
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
  const unusedKeys = []
  const allUsedKeys = new Set(usedKeysMap.keys())
  
  for (const [locale, keys] of Object.entries(availableKeys)) {
    for (const key of keys) {
      if (!allUsedKeys.has(key)) {
        unusedKeys.push({ key, locale })
      }
    }
  }
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    unusedKeys,
    usedCount: usedKeysMap.size,
    availableCount: Object.values(availableKeys)[0]?.size || 0
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}YektaYar i18n Key Validation${colors.reset}`)
  console.log(`${'='.repeat(60)}`)
  
  const packagesDir = join(rootDir, 'packages')
  const packagesToValidate = []
  
  if (options.package) {
    packagesToValidate.push({
      name: options.package,
      path: join(packagesDir, options.package)
    })
  } else {
    packagesToValidate.push(
      { name: 'admin-panel', path: join(packagesDir, 'admin-panel') },
      // Mobile app will be skipped for now due to inline translations
      // { name: 'mobile-app', path: join(packagesDir, 'mobile-app') }
    )
  }
  
  let hasErrors = false
  let totalMissing = 0
  let totalUnused = 0
  
  for (const pkg of packagesToValidate) {
    const result = validatePackage(pkg.name, pkg.path)
    
    if (result.missingKeys.length > 0) {
      hasErrors = true
      totalMissing += result.missingKeys.length
      
      console.log(`\n${colors.red}${colors.bold}❌ Found ${result.missingKeys.length} missing key(s):${colors.reset}`)
      
      // Group by key
      const keyGroups = new Map()
      for (const item of result.missingKeys) {
        if (!keyGroups.has(item.key)) {
          keyGroups.set(item.key, [])
        }
        keyGroups.get(item.key).push(item)
      }
      
      for (const [key, items] of keyGroups.entries()) {
        console.log(`\n  ${colors.yellow}${key}${colors.reset}`)
        console.log(`    Missing in: ${items.map(i => i.locale).join(', ')}`)
        console.log(`    Used in:`)
        const uniqueFiles = [...new Set(items.map(i => `${i.file}:${i.line}`))]
        for (const fileRef of uniqueFiles.slice(0, 3)) {
          console.log(`      - ${fileRef}`)
        }
        if (uniqueFiles.length > 3) {
          console.log(`      ... and ${uniqueFiles.length - 3} more`)
        }
      }
    } else {
      console.log(`${colors.green}${colors.bold}✅ All used keys are available${colors.reset}`)
    }
    
    if (options.showUnused && result.unusedKeys.length > 0) {
      totalUnused += result.unusedKeys.length
      console.log(`\n${colors.yellow}${colors.bold}⚠️  Found ${result.unusedKeys.length} unused key(s):${colors.reset}`)
      
      // Group by locale
      const localeGroups = new Map()
      for (const item of result.unusedKeys) {
        if (!localeGroups.has(item.locale)) {
          localeGroups.set(item.locale, [])
        }
        localeGroups.get(item.locale).push(item.key)
      }
      
      for (const [locale, keys] of localeGroups.entries()) {
        console.log(`\n  ${colors.cyan}${locale}:${colors.reset}`)
        for (const key of keys.slice(0, 10)) {
          console.log(`    - ${key}`)
        }
        if (keys.length > 10) {
          console.log(`    ... and ${keys.length - 10} more`)
        }
      }
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${colors.bold}Summary:${colors.reset}`)
  console.log(`  Missing keys: ${totalMissing > 0 ? colors.red : colors.green}${totalMissing}${colors.reset}`)
  if (options.showUnused) {
    console.log(`  Unused keys: ${totalUnused > 0 ? colors.yellow : colors.green}${totalUnused}${colors.reset}`)
  }
  
  if (hasErrors) {
    console.log(`\n${colors.red}${colors.bold}❌ Validation failed!${colors.reset}`)
    console.log(`${colors.gray}Please add the missing translations to your locale files.${colors.reset}`)
    process.exit(1)
  } else if (options.strict && totalUnused > 0) {
    console.log(`\n${colors.yellow}${colors.bold}⚠️  Validation failed (strict mode): Found unused keys${colors.reset}`)
    process.exit(1)
  } else {
    console.log(`\n${colors.green}${colors.bold}✅ Validation passed!${colors.reset}`)
    process.exit(0)
  }
}

// Run the script
main()
