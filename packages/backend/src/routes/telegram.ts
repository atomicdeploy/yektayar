import { Elysia } from 'elysia'
import {
  isBotInitialized,
  sendMessage,
  sendAdminNotification,
  sendChannelMessage,
  handleWebhookUpdate,
  verifyTelegramInitData
} from '../services/telegramService'
import { logger } from '@yektayar/shared'

export const telegramRoutes = new Elysia({ prefix: '/api/telegram' })
  // Get bot status
  .get('/status', () => {
    const isInitialized = isBotInitialized()
    return {
      success: true,
      data: {
        initialized: isInitialized,
        status: isInitialized ? 'active' : 'inactive'
      }
    }
  })

  // Send a message to a specific chat (admin only - would need auth middleware)
  .post('/send', async ({ body }) => {
    try {
      const { chatId, message, options } = body as {
        chatId: string | number
        message: string
        options?: any
      }

      if (!chatId || !message) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'chatId and message are required'
        }
      }

      const sent = await sendMessage(chatId, message, options)

      if (sent) {
        return {
          success: true,
          message: 'Message sent successfully'
        }
      } else {
        return {
          success: false,
          error: 'Failed to send message',
          message: 'Bot may not be initialized or chat ID is invalid'
        }
      }
    } catch (error) {
      logger.error('Error in /send endpoint:', error)
      return {
        success: false,
        error: 'Internal server error',
        message: String(error)
      }
    }
  })

  // Send admin notification
  .post('/notify-admin', async ({ body }) => {
    try {
      const { message, level } = body as {
        message: string
        level?: 'error' | 'warning' | 'info'
      }

      if (!message) {
        return {
          success: false,
          error: 'Missing required field',
          message: 'message is required'
        }
      }

      const sent = await sendAdminNotification(message, level || 'info')

      if (sent) {
        return {
          success: true,
          message: 'Admin notification sent successfully'
        }
      } else {
        return {
          success: false,
          error: 'Failed to send notification',
          message: 'Bot may not be initialized or admin chat ID not configured'
        }
      }
    } catch (error) {
      logger.error('Error in /notify-admin endpoint:', error)
      return {
        success: false,
        error: 'Internal server error',
        message: String(error)
      }
    }
  })

  // Send message to channel
  .post('/channel', async ({ body }) => {
    try {
      const { message, options } = body as {
        message: string
        options?: any
      }

      if (!message) {
        return {
          success: false,
          error: 'Missing required field',
          message: 'message is required'
        }
      }

      const sent = await sendChannelMessage(message, options)

      if (sent) {
        return {
          success: true,
          message: 'Channel message sent successfully'
        }
      } else {
        return {
          success: false,
          error: 'Failed to send channel message',
          message: 'Bot may not be initialized or channel ID not configured'
        }
      }
    } catch (error) {
      logger.error('Error in /channel endpoint:', error)
      return {
        success: false,
        error: 'Internal server error',
        message: String(error)
      }
    }
  })

  // Webhook endpoint for receiving Telegram updates
  .post('/webhook', async ({ body }) => {
    try {
      await handleWebhookUpdate(body as any)
      return {
        success: true
      }
    } catch (error) {
      logger.error('Error in webhook endpoint:', error)
      return {
        success: false,
        error: 'Failed to process webhook',
        message: String(error)
      }
    }
  })

  // Verify Telegram WebApp initData (security endpoint)
  .post('/verify-init-data', async ({ body }) => {
    try {
      const { initData } = body as { initData: string }

      if (!initData) {
        return {
          success: false,
          error: 'Missing initData',
          message: 'initData is required'
        }
      }

      const isValid = verifyTelegramInitData(initData)

      if (isValid) {
        return {
          success: true,
          message: 'initData verified successfully',
          valid: true
        }
      } else {
        return {
          success: false,
          error: 'Invalid initData',
          message: 'The provided initData could not be verified',
          valid: false
        }
      }
    } catch (error) {
      logger.error('Error in verify-init-data endpoint:', error)
      return {
        success: false,
        error: 'Internal server error',
        message: String(error)
      }
    }
  })
