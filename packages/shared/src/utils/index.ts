export * from './logger'
export * from './solutions'
export * from './validation'

/**
 * Format date for Persian (Jalali) calendar
 * Uses the browser's built-in Intl.DateTimeFormat with fa-IR locale
 */
export function formatPersianDate(date: Date): string {
  return date.toLocaleDateString('fa-IR')
}

/**
 * Format date for Gregorian calendar
 */
export function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString('en-US')
}

/**
 * Validate Iranian phone number
 */
export function validateIranianPhone(phone: string): boolean {
  const regex = /^(\+98|0)?9\d{9}$/
  return regex.test(phone)
}

/**
 * Sanitize user input by removing HTML tags
 * Note: For production, use a proper HTML sanitization library like DOMPurify or validator.js
 * This basic implementation is for prototype purposes only
 */
export function sanitizeInput(input: string): string {
  // Simple and safe approach: remove all < and > characters
  // This prevents HTML injection without complex regex patterns
  return input
    .trim()
    .split('')
    .filter(char => char !== '<' && char !== '>')
    .join('')
}

/**
 * Generate random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(session: any): boolean {
  return session && session.isLoggedIn && new Date(session.expiresAt) > new Date()
}
