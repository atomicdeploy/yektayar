import { Elysia, t } from 'elysia'
import { streamAIResponse } from '../services/aiService'

export const aiRoutes = new Elysia({ prefix: '/api/ai' })
  .post('/chat', async ({ body, set }) => {
    try {
      const { message, conversationHistory } = body as {
        message: string
        conversationHistory?: Array<{ role: string; content: string }>
      }

      if (!message || typeof message !== 'string') {
        set.status = 400
        return {
          success: false,
          error: 'Message is required'
        }
      }

      // Get AI response from pollinations.ai
      const response = await streamAIResponse(message, conversationHistory)

      return {
        success: true,
        response: response,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('AI chat error:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to get AI response',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    body: t.Object({
      message: t.String({ minLength: 1, maxLength: 2000 }),
      conversationHistory: t.Optional(t.Array(t.Object({
        role: t.String(),
        content: t.String()
      })))
    }),
    detail: {
      tags: ['AI'],
      summary: 'Send a message to the AI counselor',
      description: 'Sends a message to the AI and receives a response using pollinations.ai'
    }
  })
  .get('/status', () => {
    return {
      success: true,
      status: 'operational',
      provider: 'pollinations.ai',
      timestamp: new Date().toISOString()
    }
  }, {
    detail: {
      tags: ['AI'],
      summary: 'Check AI service status',
      description: 'Returns the current status of the AI service'
    }
  })
