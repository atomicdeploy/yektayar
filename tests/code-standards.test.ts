import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Test to ensure code consistency standards are met
 */
describe('Code Standards', () => {
  const packagesDir = join(__dirname, '..', 'packages')
  
  /**
   * Recursively find all TypeScript files
   */
  function findTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir)
    
    files.forEach(file => {
      const filePath = join(dir, file)
      const stat = statSync(filePath)
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', 'dist', 'build', 'android', 'ios', '.git'].includes(file)) {
          findTypeScriptFiles(filePath, fileList)
        }
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        // Skip test files, config files, and the logger itself
        if (
          !file.endsWith('.test.ts') &&
          !file.endsWith('.spec.ts') &&
          !file.endsWith('.config.ts') &&
          !file.endsWith('.config.js') &&
          !filePath.includes('logger.ts') &&
          !filePath.includes('usage.ts') // Example/demo files are allowed
        ) {
          fileList.push(filePath)
        }
      }
    })
    
    return fileList
  }

  it('should use logger utility instead of direct console.* calls', () => {
    const files = findTypeScriptFiles(packagesDir)
    const violations: Array<{ file: string; line: number; content: string }> = []
    
    files.forEach(filePath => {
      try {
        const content = readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')
        
        lines.forEach((line, index) => {
          // Check for console.log, console.error, console.warn, console.info, console.debug
          const consoleMatch = line.match(/console\.(log|error|warn|info|debug|trace|table|group|groupEnd|groupCollapsed|time|timeEnd)/)
          
          if (consoleMatch && !line.trim().startsWith('//')) {
            violations.push({
              file: filePath.replace(packagesDir, 'packages'),
              line: index + 1,
              content: line.trim()
            })
          }
        })
      } catch (error) {
        // Skip files that can't be read
      }
    })
    
    if (violations.length > 0) {
      const message = `Found ${violations.length} direct console usage(s). Please use the logger utility instead:\n\n` +
        violations.map(v => `  ${v.file}:${v.line}\n    ${v.content}`).join('\n\n')
      
      console.error(message)
      expect(violations).toHaveLength(0)
    }
  })

  it('should import logger from @yektayar/shared when using it', () => {
    const files = findTypeScriptFiles(packagesDir)
    const violations: Array<{ file: string; reason: string }> = []
    
    files.forEach(filePath => {
      try {
        const content = readFileSync(filePath, 'utf-8')
        
        // Check if file uses logger but doesn't import it
        if (content.includes('logger.')) {
          const hasImport = 
            content.includes("import { logger }") ||
            content.includes("import {logger}") ||
            content.includes('from "./utils/logger"') ||
            content.includes('from "../utils/logger"') ||
            content.includes('from "@yektayar/shared"')
          
          if (!hasImport) {
            violations.push({
              file: filePath.replace(packagesDir, 'packages'),
              reason: 'Uses logger but does not import it'
            })
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    })
    
    if (violations.length > 0) {
      const message = `Found ${violations.length} file(s) using logger without importing:\n\n` +
        violations.map(v => `  ${v.file}\n    ${v.reason}`).join('\n\n')
      
      console.error(message)
      expect(violations).toHaveLength(0)
    }
  })
})
