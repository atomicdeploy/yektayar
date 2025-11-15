import type { ServerWebSocket } from 'bun'
import { validateSessionToken } from '../services/sessionService'

export interface WebSocketData {
  sessionToken: string
  userId: string | null
  isLoggedIn: boolean
  socketId: string
}

/**
 * Handle native WebSocket connections
 * This implements the same event handlers as Socket.IO for compatibility
 */
export function setupNativeWebSocket() {
  return {
    /**
     * Handle WebSocket upgrade request
     * Validate authentication before upgrading connection
     */
    async upgrade(req: Request, server: any) {
      const url = new URL(req.url)
      
      // Extract token from query params or headers
      const token = url.searchParams.get('token') || 
                   req.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return new Response('Authentication token required', { status: 401 })
      }
      
      // Validate the session token
      try {
        const session = await validateSessionToken(token)
        
        if (!session) {
          return new Response('Invalid or expired session token', { status: 401 })
        }
        
        // Prepare WebSocket data
        const wsData: WebSocketData = {
          sessionToken: session.token,
          userId: session.userId,
          isLoggedIn: session.isLoggedIn,
          socketId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        
        // Upgrade the connection
        const success = server.upgrade(req, {
          data: wsData
        })
        
        if (success) {
          return undefined // Connection upgraded
        }
        
        return new Response('WebSocket upgrade failed', { status: 500 })
      } catch (error) {
        console.error('WebSocket authentication error:', error)
        return new Response('Authentication failed', { status: 401 })
      }
    },
    
    /**
     * WebSocket handler configuration
     */
    websocket: {
      message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
        const data = ws.data
        
        try {
          // Parse message as JSON
          const messageStr = typeof message === 'string' ? message : message.toString()
          const parsed = JSON.parse(messageStr)
          
          // Handle different event types (same as Socket.IO)
          switch (parsed.event) {
            case 'ping':
              ws.send(JSON.stringify({
                event: 'pong',
                data: { timestamp: new Date().toISOString() }
              }))
              break
              
            case 'status':
              ws.send(JSON.stringify({
                event: 'status_response',
                data: {
                  server: {
                    name: 'YektaYar API Server',
                    version: '0.1.0',
                    status: 'running',
                    timestamp: new Date().toISOString()
                  },
                  connection: {
                    socketId: data.socketId,
                    sessionToken: data.sessionToken,
                    userId: data.userId,
                    isLoggedIn: data.isLoggedIn,
                    protocol: 'native-websocket'
                  }
                }
              }))
              break
              
            case 'echo':
              ws.send(JSON.stringify({
                event: 'echo_response',
                data: {
                  received: parsed.data,
                  timestamp: new Date().toISOString(),
                  socketId: data.socketId
                }
              }))
              break
              
            case 'info':
              ws.send(JSON.stringify({
                event: 'info_response',
                data: {
                  server: {
                    name: 'YektaYar API',
                    version: '0.1.0',
                    description: 'Backend API with native WebSocket real-time communication',
                    features: {
                      rest: true,
                      websocket: true,
                      authentication: true,
                      realtime: true,
                      protocol: 'native-websocket'
                    }
                  },
                  websocket: {
                    connected: true,
                    protocol: 'native-websocket'
                  },
                  session: {
                    authenticated: data.isLoggedIn,
                    userId: data.userId || 'anonymous',
                    sessionToken: data.sessionToken ? '***' + data.sessionToken.slice(-4) : null
                  },
                  timestamp: new Date().toISOString()
                }
              }))
              break
              
            case 'message':
              console.log(`Message received from ${data.socketId}:`, parsed.data)
              ws.send(JSON.stringify({
                event: 'message_received',
                data: {
                  success: true,
                  message: 'Message received successfully',
                  data: parsed.data,
                  timestamp: new Date().toISOString()
                }
              }))
              break
              
            case 'ai:chat':
              handleAIChat(ws, parsed.data, data)
              break
              
            default:
              ws.send(JSON.stringify({
                event: 'error',
                data: { error: `Unknown event type: ${parsed.event}` }
              }))
          }
        } catch (error) {
          console.error('WebSocket message handling error:', error)
          ws.send(JSON.stringify({
            event: 'error',
            data: { error: 'Failed to process message' }
          }))
        }
      },
      
      open(ws: ServerWebSocket<WebSocketData>) {
        const data = ws.data
        console.log(`Native WebSocket connected: ${data.socketId}`, {
          sessionToken: data.sessionToken,
          userId: data.userId,
          isLoggedIn: data.isLoggedIn
        })
        
        // Send welcome message
        ws.send(JSON.stringify({
          event: 'connected',
          data: {
            message: 'Connected to YektaYar server via native WebSocket',
            socketId: data.socketId,
            isLoggedIn: data.isLoggedIn,
            protocol: 'native-websocket'
          }
        }))
      },
      
      close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
        const data = ws.data
        console.log(`Native WebSocket disconnected: ${data.socketId}`, { code, reason })
      },
      
      drain(ws: ServerWebSocket<WebSocketData>) {
        // Handle backpressure
        console.log('WebSocket drain', ws.data.socketId)
      }
    }
  }
}

/**
 * Handle AI chat messages via native WebSocket
 */
async function handleAIChat(ws: ServerWebSocket<WebSocketData>, chatData: any, wsData: WebSocketData) {
  try {
    const { message, conversationHistory } = chatData
    const messageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`AI chat request from ${wsData.socketId}:`, message)
    
    // Emit start event
    ws.send(JSON.stringify({
      event: 'ai:response:start',
      data: { messageId }
    }))
    
    // Import AI service dynamically
    const { streamAIResponseChunks } = await import('../services/aiService')
    
    // Stream the response
    let fullResponse = ''
    for await (const chunk of streamAIResponseChunks(message, conversationHistory)) {
      fullResponse += chunk
      ws.send(JSON.stringify({
        event: 'ai:response:chunk',
        data: { messageId, chunk }
      }))
    }
    
    // Emit completion event
    ws.send(JSON.stringify({
      event: 'ai:response:complete',
      data: { messageId, fullResponse }
    }))
    
    console.log(`AI response completed for ${wsData.socketId}`)
  } catch (error) {
    console.error('AI chat error:', error)
    ws.send(JSON.stringify({
      event: 'ai:response:error',
      data: { error: 'Failed to generate response. Please try again.' }
    }))
  }
}
