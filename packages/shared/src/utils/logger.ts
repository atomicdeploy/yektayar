/**
 * Enhanced Logger Utility
 * Provides colorized, emoji-enhanced logging that works in both browser and Node.js/CLI
 */

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
}

// Browser color styles
const BROWSER_STYLES = {
  success: 'color: #22c55e; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  info: 'color: #3b82f6; font-weight: bold;',
  warn: 'color: #f59e0b; font-weight: bold;',
  debug: 'color: #6b7280; font-weight: bold;',
}

// Emojis for different log levels
const EMOJIS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warn: '⚠️',
  debug: '🔍',
  rocket: '🚀',
  gear: '⚙️',
  link: '🔗',
  lock: '🔒',
  user: '👤',
  timer: '⏱️',
  check: '✓',
  cross: '✗',
}

/**
 * Detect if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof globalThis !== 'undefined' && 
         typeof (globalThis as any).window !== 'undefined' && 
         typeof (globalThis as any).window.document !== 'undefined'
}

/**
 * Logger class with enhanced formatting
 */
class Logger {
  /**
   * Log a success message
   */
  success(message: string, ...args: any[]): void {
    if (isBrowser()) {
      console.log(`%c${EMOJIS.success} ${message}`, BROWSER_STYLES.success, ...args)
    } else {
      console.log(`${COLORS.green}${EMOJIS.success} ${message}${COLORS.reset}`, ...args)
    }
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    if (isBrowser()) {
      console.error(`%c${EMOJIS.error} ${message}`, BROWSER_STYLES.error, ...args)
    } else {
      console.error(`${COLORS.red}${EMOJIS.error} ${message}${COLORS.reset}`, ...args)
    }
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    if (isBrowser()) {
      console.info(`%c${EMOJIS.info} ${message}`, BROWSER_STYLES.info, ...args)
    } else {
      console.info(`${COLORS.cyan}${EMOJIS.info} ${message}${COLORS.reset}`, ...args)
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    if (isBrowser()) {
      console.warn(`%c${EMOJIS.warn} ${message}`, BROWSER_STYLES.warn, ...args)
    } else {
      console.warn(`${COLORS.yellow}${EMOJIS.warn} ${message}${COLORS.reset}`, ...args)
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    if (isBrowser()) {
      console.log(`%c${EMOJIS.debug} ${message}`, BROWSER_STYLES.debug, ...args)
    } else {
      console.log(`${COLORS.gray}${EMOJIS.debug} ${message}${COLORS.reset}`, ...args)
    }
  }

  /**
   * Log with a custom emoji
   */
  custom(emoji: string, message: string, color: 'green' | 'red' | 'cyan' | 'yellow' | 'gray' | 'magenta' = 'cyan', ...args: any[]): void {
    if (isBrowser()) {
      const style = `color: ${this.getColorHex(color)}; font-weight: bold;`
      console.log(`%c${emoji} ${message}`, style, ...args)
    } else {
      console.log(`${COLORS[color]}${emoji} ${message}${COLORS.reset}`, ...args)
    }
  }

  /**
   * Get hex color for browser
   */
  private getColorHex(color: string): string {
    const colorMap: Record<string, string> = {
      green: '#22c55e',
      red: '#ef4444',
      cyan: '#3b82f6',
      yellow: '#f59e0b',
      gray: '#6b7280',
      magenta: '#a855f7',
    }
    return colorMap[color] || '#3b82f6'
  }

  /**
   * Log application startup information
   */
  startup(appName: string, config: Record<string, any>): void {
    const separator = '─'.repeat(50)
    
    if (isBrowser()) {
      console.log(`%c${EMOJIS.rocket} ${appName} Starting...`, 'color: #a855f7; font-weight: bold; font-size: 14px;')
      console.log(`%c${separator}`, 'color: #6b7280;')
      
      Object.entries(config).forEach(([key, value]) => {
        console.log(`%c${EMOJIS.gear} ${key}:`, 'color: #3b82f6; font-weight: bold;', value)
      })
      
      console.log(`%c${separator}`, 'color: #6b7280;')
    } else {
      console.log(`${COLORS.magenta}${EMOJIS.rocket} ${appName} Starting...${COLORS.reset}`)
      console.log(`${COLORS.gray}${separator}${COLORS.reset}`)
      
      Object.entries(config).forEach(([key, value]) => {
        console.log(`${COLORS.cyan}${EMOJIS.gear} ${key}: ${COLORS.reset}${value}`)
      })
      
      console.log(`${COLORS.gray}${separator}${COLORS.reset}`)
    }
  }

  /**
   * Get emoji by name for custom logging
   */
  emoji(name: keyof typeof EMOJIS): string {
    return EMOJIS[name] || ''
  }
}

// Export a singleton instance
export const logger = new Logger()

// Export the Logger class for testing or custom instances
export { Logger }

// Export emojis for direct use
export { EMOJIS }
