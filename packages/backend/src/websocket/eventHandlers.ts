/**
 * Shared WebSocket event handlers
 * This module contains DRY implementations of all WebSocket events
 * Used by both Socket.IO and native WebSocket implementations
 */

export interface WebSocketSessionData {
  sessionToken: string
  userId: string | null
  isLoggedIn: boolean
  socketId: string
}

export type MessageSender = (message: any) => void

/**
 * Handle ping event
 */
export function handlePing(send: MessageSender) {
  send({
    event: 'pong',
    data: { timestamp: new Date().toISOString() }
  })
}

/**
 * Handle status event
 */
export function handleStatus(send: MessageSender, sessionData: WebSocketSessionData, protocol: string) {
  send({
    event: 'status_response',
    data: {
      server: {
        name: 'YektaYar API Server',
        version: '0.1.0',
        status: 'running',
        timestamp: new Date().toISOString()
      },
      connection: {
        socketId: sessionData.socketId,
        sessionToken: sessionData.sessionToken,
        userId: sessionData.userId,
        isLoggedIn: sessionData.isLoggedIn,
        protocol
      }
    }
  })
}

/**
 * Handle echo event
 */
export function handleEcho(send: MessageSender, sessionData: WebSocketSessionData, data: any) {
  send({
    event: 'echo_response',
    data: {
      received: data,
      timestamp: new Date().toISOString(),
      socketId: sessionData.socketId
    }
  })
}

/**
 * Handle info event
 */
export function handleInfo(send: MessageSender, sessionData: WebSocketSessionData, protocol: string) {
  send({
    event: 'info_response',
    data: {
      server: {
        name: 'YektaYar API',
        version: '0.1.0',
        description: 'Backend API with real-time communication',
        features: {
          rest: true,
          websocket: true,
          authentication: true,
          realtime: true,
          protocol
        }
      },
      websocket: {
        connected: true,
        protocol
      },
      session: {
        authenticated: sessionData.isLoggedIn,
        userId: sessionData.userId || 'anonymous',
        sessionToken: sessionData.sessionToken ? '***' + sessionData.sessionToken.slice(-4) : null
      },
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Handle message event
 */
export function handleMessage(send: MessageSender, sessionData: WebSocketSessionData, data: any) {
  console.log(`Message received from ${sessionData.socketId}:`, data)
  send({
    event: 'message_received',
    data: {
      success: true,
      message: 'Message received successfully',
      data,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Handle AI chat event
 */
export async function handleAIChat(send: MessageSender, sessionData: WebSocketSessionData, chatData: any) {
  try {
    const { message, conversationHistory } = chatData
    const messageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log(`AI chat request from ${sessionData.socketId}:`, message)

    // Emit start event
    send({
      event: 'ai:response:start',
      data: { messageId }
    })

    // Import AI service dynamically
    const { streamAIResponseChunks } = await import('../services/aiService')

    // Stream the response
    let fullResponse = ''
    for await (const chunk of streamAIResponseChunks(message, conversationHistory)) {
      fullResponse += chunk
      send({
        event: 'ai:response:chunk',
        data: { messageId, chunk }
      })
    }

    // Emit completion event
    send({
      event: 'ai:response:complete',
      data: { messageId, fullResponse }
    })

    console.log(`AI response completed for ${sessionData.socketId}`)
  } catch (error) {
    console.error('AI chat error:', error)
    send({
      event: 'ai:response:error',
      data: { error: 'Failed to generate response. Please try again.' }
    })
  }
}

/**
 * Route event to appropriate handler
 */
export async function routeEvent(
  eventName: string,
  eventData: any,
  send: MessageSender,
  sessionData: WebSocketSessionData,
  protocol: string
): Promise<boolean> {
  switch (eventName) {
    case 'ping':
      handlePing(send)
      return true

    case 'status':
      handleStatus(send, sessionData, protocol)
      return true

    case 'echo':
      handleEcho(send, sessionData, eventData)
      return true

    case 'info':
      handleInfo(send, sessionData, protocol)
      return true

    case 'message':
      handleMessage(send, sessionData, eventData)
      return true

    case 'ai:chat':
      await handleAIChat(send, sessionData, eventData)
      return true

    default:
      send({
        event: 'error',
        data: { error: `Unknown event type: ${eventName}` }
      })
      return false
  }
}

/**
 * Create welcome message
 */
export function createWelcomeMessage(sessionData: WebSocketSessionData, protocol: string) {
  return {
    event: 'connected',
    data: {
      message: `Connected to YektaYar server via ${protocol}`,
      socketId: sessionData.socketId,
      isLoggedIn: sessionData.isLoggedIn,
      protocol
    }
  }
}
