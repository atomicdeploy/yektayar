/**
 * Format date for Persian (Jalali) calendar
 * Note: This is a placeholder - full Jalali implementation needed
 */
export function formatPersianDate(date: Date): string {
  // TODO: Implement proper Jalali conversion
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
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '')
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
