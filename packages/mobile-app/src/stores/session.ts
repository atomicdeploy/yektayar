import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import config from '@/config'
import { logger } from '@yektayar/shared'
import apiClient from '@/api'

const API_URL = config.apiBaseUrl
const STORAGE_KEY = 'yektayar_session_token'

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
      const response = await apiClient.post<{ token: string; expiresAt: string }>(
        '/api/auth/acquire-session',
        {},
        { skipAuth: true }
      )
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to acquire session')
      }

      // Store the session
      session.value = {
        token: response.data.token,
        userId: null,
        isLoggedIn: false,
        expiresAt: response.data.expiresAt
      }

      // Persist to localStorage and API client
      localStorage.setItem(STORAGE_KEY, response.data.token)
      await apiClient.setToken(response.data.token)

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
      // Set token in API client before validation
      await apiClient.setToken(token)
      
      const response = await apiClient.get<{
        token: string
        userId: string | null
        isLoggedIn: boolean
        expiresAt: string
      }>('/api/auth/session')

      if (!response.success || !response.data) {
        return false
      }

      // Update session state
      session.value = {
        token: response.data.token,
        userId: response.data.userId,
        isLoggedIn: response.data.isLoggedIn,
        expiresAt: response.data.expiresAt
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
      
      // Create socket with autoConnect disabled to ensure we have full control
      socket.value = io(API_URL, {
        auth: {
          token: session.value.token
        },
        autoConnect: false, // Prevent automatic connection until we're ready
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
        // If authentication fails, prevent further reconnection attempts
        if (error.message?.includes('Authentication') || error.message?.includes('token')) {
          logger.warn('Authentication error - stopping reconnection attempts')
          socket.value?.disconnect()
        }
      })

      // Before each reconnection attempt, verify we still have a valid token
      socket.value.io.on('reconnect_attempt', () => {
        if (!session.value?.token) {
          logger.warn('Reconnection attempted without valid token - aborting')
          socket.value?.disconnect()
        } else {
          logger.info('Reconnection attempt with valid token')
        }
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

      // Handle session revocation from server
      socket.value.on('session:revoked', async (data) => {
        logger.warn('Session revoked by server:', data)
        await handleSessionRevocation()
      })

      socket.value.on('session:invalid', async (data) => {
        logger.warn('Session marked as invalid by server:', data)
        await handleSessionRevocation()
      })

      // Now manually connect after all handlers are set up and token is confirmed
      socket.value.connect()
      logger.info('Socket connection initiated with valid token')

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
        await apiClient.post('/api/auth/logout')
      }
    } catch (error) {
      logger.error('Error during logout:', error)
    } finally {
      // Clear local state regardless of API call result
      session.value = null
      localStorage.removeItem(STORAGE_KEY)
      await apiClient.clearToken()
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

  /**
   * Handle session revocation from server
   */
  async function handleSessionRevocation(): Promise<void> {
    logger.warn('Handling session revocation - clearing local session and redirecting')
    
    // Clear local state
    session.value = null
    localStorage.removeItem(STORAGE_KEY)
    await apiClient.clearToken()
    disconnectSocket()
    
    // Redirect to splash screen
    // Using dynamic import to avoid circular dependency
    const router = await import('../router').then(m => m.default)
    router.replace('/splash')
  }

  /**
   * Validate current session with backend
   */
  async function validateSession(): Promise<boolean> {
    if (!session.value?.token) {
      logger.warn('No session to validate')
      return false
    }

    try {
      const isValid = await validateStoredSession(session.value.token)
      if (!isValid) {
        logger.warn('Session validation failed')
        await handleSessionRevocation()
      }
      return isValid
    } catch (error) {
      logger.error('Error validating session:', error)
      await handleSessionRevocation()
      return false
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
    validateSession,
    connectSocket,
    disconnectSocket,
    logout,
    linkUserToSession,
    handleSessionRevocation
  }
})
