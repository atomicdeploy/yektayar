/**
 * Storage abstraction for session tokens
 * Works in browser (localStorage), Node.js (in-memory), and React Native (AsyncStorage)
 */

import { logger } from '../utils/logger'

interface Storage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

class InMemoryStorage implements Storage {
  private storage: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }
}

/**
 * Get the appropriate storage implementation for the current environment
 */
function getStorage(): Storage {
  // Browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  // React Native / Capacitor - AsyncStorage would be handled by the consumer
  // For now, fall back to in-memory storage
  return new InMemoryStorage()
}

const storage = getStorage()

/**
 * Token storage helper
 */
export class TokenStorage {
  constructor(private storageKey: string = 'yektayar_session_token') {}

  /**
   * Get the stored token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await storage.getItem(this.storageKey)
      return token
    } catch (error) {
      logger.error('Error getting token from storage:', error)
      return null
    }
  }

  /**
   * Set the token
   */
  async setToken(token: string): Promise<void> {
    try {
      await storage.setItem(this.storageKey, token)
    } catch (error) {
      logger.error('Error setting token in storage:', error)
    }
  }

  /**
   * Remove the token
   */
  async removeToken(): Promise<void> {
    try {
      await storage.removeItem(this.storageKey)
    } catch (error) {
      logger.error('Error removing token from storage:', error)
    }
  }

  /**
   * Check if a token exists
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken()
    return token !== null && token !== ''
  }
}
