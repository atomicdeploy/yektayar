import { Elysia, t } from 'elysia'
import { streamAIResponse, checkAIServiceHealth } from '../services/aiService'
import { logger } from '@yektayar/shared'

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'

export const aiRoutes = new Elysia({ prefix: '/api/ai' })
  .post('/chat', async ({ body, set }) => {
    try {
      const { message, conversationHistory, locale } = body as {
        message: string
        conversationHistory?: Array<{ role: string; content: string }>
        locale?: string
      }

      if (!message || typeof message !== 'string') {
        set.status = 400
        return {
          success: false,
          error: 'Message is required'
        }
      }

      // Get AI response from pollinations.ai with locale support
      const result = await streamAIResponse(message, conversationHistory, locale || 'en')

      const response: any = {
        success: true,
        response: result.response,
        timestamp: new Date().toISOString()
      }

      // Include metadata if available (x-* headers)
      if (result.metadata) {
        response.metadata = result.metadata
      }

      // Only include debug info in development mode
      if (IS_DEVELOPMENT && result.debug) {
        response.debug = result.debug
      }

      return response
    } catch (error) {
      logger.error('AI chat error:', error)
      set.status = 500
      
      const errorResponse: any = {
        success: false,
        error: 'Failed to get AI response',
        message: error instanceof Error ? error.message : 'Unknown error'
      }

      // Only include debug info in development mode
      if (IS_DEVELOPMENT) {
        errorResponse.debug = {
          error: 'Route handler exception',
          errorDetails: error instanceof Error ? error.stack : String(error)
        }
      }

      return errorResponse
    }
  }, {
    body: t.Object({
      message: t.String({ minLength: 1, maxLength: 2000 }),
      conversationHistory: t.Optional(t.Array(t.Object({
        role: t.String(),
        content: t.String()
      }))),
      locale: t.Optional(t.String())
    }),
    detail: {
      tags: ['AI'],
      summary: 'Send a message to the AI counselor',
      description: 'Sends a message to the AI and receives a response using pollinations.ai with locale support (en/fa)'
    }
  })
  .get('/status', async () => {
    // Actually check if the AI service is operational
    const isOperational = await checkAIServiceHealth()
    
    return {
      success: true,
      status: isOperational ? 'operational' : 'degraded',
      provider: 'pollinations.ai',
      timestamp: new Date().toISOString()
    }
  }, {
    detail: {
      tags: ['AI'],
      summary: 'Check AI service status',
      description: 'Returns the current status of the AI service by making a test request to Pollinations API'
    }
  })
