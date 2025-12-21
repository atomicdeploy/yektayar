/**
 * Composable for AI Chat functionality
 * Handles WebSocket connection, message sending/receiving, and AI streaming
 */

import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useI18n } from 'vue-i18n'
import config from '@/config'
import apiClient from '@/api'
import { getWebSocketPathFromEnv, logger } from '@yektayar/shared'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sent?: boolean
  streaming?: boolean
}

// Global state (shared across component instances)
const socket = ref<Socket | null>(null)
const messages = ref<ChatMessage[]>([])
const isTyping = ref(false)
const isSending = ref(false)
const isConnected = ref(false)
const currentStreamingMessage = ref<ChatMessage | null>(null)

export function useAIChat() {
  const { t } = useI18n()
  
  /**
   * Connect to WebSocket server
   */
  const connect = async () => {
    if (socket.value?.connected) {
      logger.debug('Socket already connected')
      return
    }

    try {
      // Get session token from storage
      const sessionToken = localStorage.getItem('yektayar_session_token')
      
      if (!sessionToken) {
        logger.warn('No session token found, connecting without auth')
      }

      // Initialize Socket.IO client
      socket.value = io(config.apiBaseUrl, {
        path: getWebSocketPathFromEnv(),
        auth: {
          token: sessionToken
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      // Connection handlers
      socket.value.on('connect', () => {
        logger.success('[AI Chat] WebSocket connected:', socket.value?.id)
        isConnected.value = true
      })

      socket.value.on('disconnect', (reason) => {
        logger.warn('[AI Chat] WebSocket disconnected:', reason)
        isConnected.value = false
      })

      socket.value.on('connect_error', (error) => {
        logger.error('[AI Chat] WebSocket connection error:', error)
        isConnected.value = false
      })

      // AI Chat event handlers
      socket.value.on('ai:response:start', (data: { messageId: string }) => {
        logger.info('[AI Chat] AI response started:', data.messageId)
        isTyping.value = true
        
        // Create a new streaming message
        currentStreamingMessage.value = {
          id: data.messageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          streaming: true
        }
        messages.value.push(currentStreamingMessage.value)
      })

      socket.value.on('ai:response:chunk', (data: { messageId: string, chunk: string }) => {
        logger.debug('[AI Chat] AI response chunk received')
        
        // Append chunk to current streaming message
        if (currentStreamingMessage.value && currentStreamingMessage.value.id === data.messageId) {
          currentStreamingMessage.value.content += data.chunk
        }
      })

      socket.value.on('ai:response:complete', (data: { messageId: string, fullResponse: string }) => {
        logger.success('[AI Chat] AI response complete:', data.messageId)
        isTyping.value = false
        
        // Finalize the streaming message
        if (currentStreamingMessage.value && currentStreamingMessage.value.id === data.messageId) {
          currentStreamingMessage.value.streaming = false
          currentStreamingMessage.value.content = data.fullResponse
          currentStreamingMessage.value = null
        }
      })

      socket.value.on('ai:response:error', (data: { error: string }) => {
        logger.error('[AI Chat] AI response error:', data.error)
        isTyping.value = false
        isSending.value = false
        
        // Add internationalized error message
        messages.value.push({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: t('messages.ai_error'),
          timestamp: new Date()
        })
        
        currentStreamingMessage.value = null
      })

      logger.info('[AI Chat] WebSocket client initialized')
    } catch (error) {
      logger.error('[AI Chat] Error connecting to WebSocket:', error)
      isConnected.value = false
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  /**
   * Send a message to the AI
   */
  const sendMessage = async (content: string, locale: string = 'fa') => {
    if (!content.trim() || isSending.value) {
      return
    }

    isSending.value = true

    // Add user message to the list
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      sent: false
    }
    messages.value.push(userMessage)

    try {
      // Send message via Socket.IO if connected
      if (socket.value?.connected) {
        logger.info('[AI Chat] Sending message via WebSocket')
        socket.value.emit('ai:chat', {
          message: content.trim(),
          conversationHistory: messages.value
            .filter(m => !m.streaming)
            .slice(-10) // Send last 10 messages for context
            .map(m => ({
              role: m.role,
              content: m.content
            })),
          locale: locale
        })
        
        userMessage.sent = true
      } else {
        // Fallback to REST API if socket not connected
        logger.warn('[AI Chat] WebSocket not connected, using REST API fallback')
        await sendMessageViaREST(content, locale)
        userMessage.sent = true
      }
    } catch (error) {
      logger.error('[AI Chat] Error sending message:', error)
      userMessage.sent = false
      
      // Add internationalized error message
      messages.value.push({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('messages.ai_error'),
        timestamp: new Date()
      })
    } finally {
      isSending.value = false
    }
  }

  /**
   * Fallback method to send message via REST API
   */
  const sendMessageViaREST = async (content: string, locale: string = 'fa') => {
    isTyping.value = true

    // Define the response type from backend
    interface AIChatResponse {
      success: boolean
      response?: string
      message?: string
      error?: string
      timestamp?: string
    }

    try {
      logger.info('[AI Chat] Sending message via REST API:', { 
        messageLength: content.length,
        locale 
      })

      const response = await apiClient.post<AIChatResponse>(
        '/ai/chat',
        {
          message: content,
          conversationHistory: messages.value
            .filter(m => !m.streaming)
            .slice(-10)
            .map(m => ({
              role: m.role,
              content: m.content
            })),
          locale: locale
        }
      )

      // Note: Backend returns response directly (not wrapped in ApiResponse.data)
      // This is by design - the backend returns { success, response, ... } directly
      // Type assertion is necessary due to ApiClient wrapper type definition
      const apiResponse = response as unknown as AIChatResponse

      logger.debug('[AI Chat] REST API response:', { success: apiResponse.success })

      // Runtime validation: Check if the API call was successful
      if (!apiResponse.success) {
        logger.error('[AI Chat] API returned error:', apiResponse.error)
        throw new Error(apiResponse.error || 'API request failed')
      }

      // Runtime validation: Validate response structure
      if (!apiResponse.response || typeof apiResponse.response !== 'string') {
        throw new Error('Invalid API response: missing or invalid response field')
      }

      // The response is in the 'response' field of the backend response
      const aiResponse = apiResponse.response
      
      logger.success('[AI Chat] Received AI response via REST API')

      // Add AI response
      messages.value.push({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      })
    } catch (error) {
      logger.error('[AI Chat] Error in REST API fallback:', error)
      throw error
    } finally {
      isTyping.value = false
    }
  }

  /**
   * Clear all messages
   */
  const clearMessages = () => {
    messages.value = []
    currentStreamingMessage.value = null
    isTyping.value = false
    isSending.value = false
  }

  return {
    messages: computed(() => messages.value),
    isTyping: computed(() => isTyping.value),
    isSending: computed(() => isSending.value),
    isConnected: computed(() => isConnected.value),
    sendMessage,
    clearMessages,
    connect,
    disconnect
  }
}
