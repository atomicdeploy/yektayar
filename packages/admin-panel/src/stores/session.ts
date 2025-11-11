import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import { logger } from '@yektayar/shared'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const STORAGE_KEY = 'yektayar_admin_session_token'

export interface Session {
  token: string
  userId: string | null
  isLoggedIn: boolean
  expiresAt: string
}

export const useSessionStore = defineStore('session', () => {
  // State
  const session = ref<Session | null>(null)
  const isAcquiring = ref(false)
  const socket = ref<Socket | null>(null)
  const isSocketConnected = ref(false)

  // Computed
  const hasSession = computed(() => !!session.value)
  const isAuthenticated = computed(() => session.value?.isLoggedIn || false)
  const sessionToken = computed(() => session.value?.token || null)

  // Actions
  
  /**
   * Acquire a new session or restore existing one
   */
  async function acquireSession(): Promise<void> {
    if (isAcquiring.value) {
      logger.info('Session acquisition already in progress')
      return
    }

    isAcquiring.value = true

    try {
      // First, try to restore session from localStorage
      const storedToken = localStorage.getItem(STORAGE_KEY)
      
      if (storedToken) {
        logger.info('Found stored session token, validating...')
        const isValid = await validateStoredSession(storedToken)
        
        if (isValid) {
          logger.success('Stored session is valid')
          await connectSocket()
          return
        } else {
          logger.warn('Stored session is invalid, acquiring new one')
          localStorage.removeItem(STORAGE_KEY)
        }
      }

      // Acquire a new session
      logger.custom(logger.emoji('rocket'), 'Acquiring new session...', 'cyan')
      const response = await fetch(`${API_URL}/api/auth/acquire-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to acquire session: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to acquire session')
      }

      // Store the session
      session.value = {
        token: data.data.token,
        userId: null,
        isLoggedIn: false,
        expiresAt: data.data.expiresAt
      }

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, data.data.token)

      logger.success('Session acquired successfully')

      // Connect Socket.IO
      await connectSocket()
    } catch (error) {
      logger.error('Error acquiring session:', error)
      throw error
    } finally {
      isAcquiring.value = false
    }
  }

  /**
   * Validate a stored session token
   */
  async function validateStoredSession(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      if (!data.success) {
        return false
      }

      // Update session state
      session.value = {
        token: data.data.token,
        userId: data.data.userId,
        isLoggedIn: data.data.isLoggedIn,
        expiresAt: data.data.expiresAt
      }

      return true
    } catch (error) {
      logger.error('Error validating stored session:', error)
      return false
    }
  }

  /**
   * Connect Socket.IO with session token
   */
  async function connectSocket(): Promise<void> {
    if (!session.value?.token) {
      logger.error('Cannot connect socket: no session token')
      return
    }

    if (socket.value?.connected) {
      logger.info('Socket already connected')
      return
    }

    try {
      logger.custom(logger.emoji('link'), 'Connecting to Socket.IO...', 'cyan')
      
      socket.value = io(API_URL, {
        auth: {
          token: session.value.token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      // Socket event handlers
      socket.value.on('connect', () => {
        logger.success(`Socket.IO connected: ${socket.value?.id}`)
        isSocketConnected.value = true
      })

      socket.value.on('connected', (data) => {
        logger.info('Server confirmed connection:', data)
      })

      socket.value.on('disconnect', (reason) => {
        logger.warn(`Socket.IO disconnected: ${reason}`)
        isSocketConnected.value = false
      })

      socket.value.on('error', (error) => {
        logger.error('Socket.IO error:', error)
      })

      socket.value.on('connect_error', (error) => {
        logger.error('Socket.IO connection error:', error)
      })

      // Ping/pong for connection health
      setInterval(() => {
        if (socket.value?.connected) {
          socket.value.emit('ping')
        }
      }, 30000) // Every 30 seconds

      socket.value.on('pong', (data) => {
        logger.debug('Received pong:', data)
      })

    } catch (error) {
      logger.error('Error connecting socket:', error)
      throw error
    }
  }

  /**
   * Disconnect Socket.IO
   */
  function disconnectSocket(): void {
    if (socket.value) {
      logger.info('Disconnecting socket...')
      socket.value.disconnect()
      socket.value = null
      isSocketConnected.value = false
    }
  }

  /**
   * Logout and clear session
   */
  async function logout(): Promise<void> {
    try {
      if (session.value?.token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.value.token}`
          }
        })
      }
    } catch (error) {
      logger.error('Error during logout:', error)
    } finally {
      // Clear local state regardless of API call result
      session.value = null
      localStorage.removeItem(STORAGE_KEY)
      disconnectSocket()
    }
  }

  /**
   * Link user to current session (after authentication)
   */
  function linkUserToSession(userId: string): void {
    if (session.value) {
      session.value.userId = userId
      session.value.isLoggedIn = true
    }
  }

  return {
    // State
    session,
    isAcquiring,
    socket,
    isSocketConnected,
    
    // Computed
    hasSession,
    isAuthenticated,
    sessionToken,
    
    // Actions
    acquireSession,
    validateStoredSession,
    connectSocket,
    disconnectSocket,
    logout,
    linkUserToSession
  }
})
