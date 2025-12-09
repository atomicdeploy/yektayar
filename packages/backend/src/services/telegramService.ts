import { Telegraf, Context } from 'telegraf'
import { logger } from '@yektayar/shared'
import crypto from 'crypto'

let bot: Telegraf | null = null
let isInitialized = false

/**
 * Initialize the Telegram bot
 * @param token - Bot token from BotFather
 * @param useWebhook - Whether to use webhook or polling mode
 * @param webhookUrl - Webhook URL if using webhook mode
 */
export function initializeTelegramBot(
  token: string,
  useWebhook: boolean = false,
  webhookUrl?: string
): Telegraf | null {
  if (isInitialized && bot) {
    logger.info('Telegram bot already initialized')
    return bot
  }

  if (!token || token === 'your_telegram_bot_token_here') {
    logger.warn('Telegram bot token not configured. Bot functionality disabled.')
    return null
  }

  try {
    bot = new Telegraf(token)
    
    setupBotHandlers()

    if (useWebhook && webhookUrl) {
      // Webhook mode (for production)
      bot.telegram.setWebhook(webhookUrl)
      logger.info('Telegram bot initialized in webhook mode')
      logger.info(`Webhook URL: ${webhookUrl}`)
    } else {
      // Polling mode (for development)
      bot.launch()
      logger.info('Telegram bot initialized in polling mode')
    }

    isInitialized = true
    
    return bot
  } catch (error) {
    logger.error('Failed to initialize Telegram bot:', error)
    return null
  }
}

/**
 * Setup basic bot command handlers
 */
function setupBotHandlers(): void {
  if (!bot) return

  // /start command
  bot.command('start', async (ctx: Context) => {
    const welcomeMessage = `
🌟 به یکتایار خوش آمدید! / Welcome to YektaYar!

این ربات برای مدیریت و دریافت اعلان‌های پلتفرم سلامت روان یکتایار طراحی شده است.

This bot is designed for managing and receiving notifications from the YektaYar mental health platform.

دستورات موجود / Available commands:
/start - شروع ربات / Start the bot
/help - راهنما / Help
/status - وضعیت سیستم / System status
/chatid - دریافت شناسه چت / Get your chat ID
    `.trim()

    await ctx.reply(welcomeMessage)
  })

  // /help command
  bot.command('help', async (ctx: Context) => {
    const helpMessage = `
📚 راهنمای یکتایار / YektaYar Help

دستورات موجود / Available Commands:
• /start - شروع مجدد ربات / Restart bot
• /help - نمایش این راهنما / Show this help
• /status - وضعیت سیستم / System status
• /chatid - دریافت شناسه چت شما / Get your chat ID

برای دریافت پشتیبانی با تیم یکتایار تماس بگیرید.
For support, contact the YektaYar team.
    `.trim()

    await ctx.reply(helpMessage)
  })

  // /status command
  bot.command('status', async (ctx: Context) => {
    const statusMessage = `
✅ وضعیت سیستم / System Status

🟢 ربات: فعال / Bot: Active
⏰ زمان: ${new Date().toLocaleString('fa-IR')}
🔋 عملیات: عادی / Operations: Normal

سیستم یکتایار به درستی در حال اجرا است.
YektaYar system is running properly.
    `.trim()

    await ctx.reply(statusMessage)
  })

  // /chatid command - helps admins get their chat ID
  bot.command('chatid', async (ctx: Context) => {
    const chatId = ctx.chat?.id
    const user = ctx.from
    const chatIdMessage = `
🆔 اطلاعات چت / Chat Information

Chat ID: \`${chatId}\`
User ID: \`${user?.id}\`
Username: ${user?.username ? `@${user.username}` : 'N/A'}
Name: ${user?.first_name} ${user?.last_name || ''}

این شناسه را برای تنظیم دریافت اعلان‌های مدیریتی استفاده کنید.
Use this ID to configure admin notifications.
    `.trim()

    await ctx.replyWithMarkdown(chatIdMessage)
  })

  // Handle all other text messages
  bot.on('text', async (ctx: Context) => {
    // Skip if message is a command (already handled)
    if (ctx.message && 'text' in ctx.message && ctx.message.text.startsWith('/')) return

    const responseMessage = `
دریافت شد! پیام شما ثبت شد.
Received! Your message has been logged.

برای دستورات موجود از /help استفاده کنید.
Use /help to see available commands.
    `.trim()

    await ctx.reply(responseMessage)
  })
}

/**
 * Get the initialized bot instance
 */
export function getTelegramBot(): Telegraf | null {
  return bot
}

/**
 * Check if bot is initialized
 */
export function isBotInitialized(): boolean {
  return isInitialized && bot !== null
}

/**
 * Send a message to a specific chat
 * @param chatId - Telegram chat ID
 * @param message - Message text
 * @param options - Additional options (parse_mode, reply_markup, etc.)
 */
export async function sendMessage(
  chatId: string | number,
  message: string,
  options?: any
): Promise<boolean> {
  if (!bot || !isInitialized) {
    logger.warn('Telegram bot not initialized. Message not sent.')
    return false
  }

  try {
    await bot.telegram.sendMessage(chatId, message, options)
    return true
  } catch (error) {
    logger.error('Failed to send Telegram message:', error)
    return false
  }
}

/**
 * Send an admin notification (error, warning, info)
 * @param message - Message text
 * @param level - Notification level (error, warning, info)
 */
export async function sendAdminNotification(
  message: string,
  level: 'error' | 'warning' | 'info' = 'info'
): Promise<boolean> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!adminChatId || adminChatId === 'your_admin_chat_id_here') {
    logger.warn('Admin chat ID not configured. Notification not sent.')
    return false
  }

  const icons = {
    error: '🔴',
    warning: '🟡',
    info: '🔵'
  }

  const icon = icons[level]
  const timestamp = new Date().toLocaleString('fa-IR')
  const formattedMessage = `
${icon} *یکتایار - ${level.toUpperCase()}*

${message}

⏰ زمان: ${timestamp}
  `.trim()

  return sendMessage(adminChatId, formattedMessage, { parse_mode: 'Markdown' })
}

/**
 * Send a message to a channel
 * @param message - Message text
 * @param options - Additional options
 */
export async function sendChannelMessage(
  message: string,
  options?: any
): Promise<boolean> {
  const channelId = process.env.TELEGRAM_CHANNEL_ID

  if (!channelId) {
    logger.warn('Channel ID not configured. Message not sent.')
    return false
  }

  return sendMessage(channelId, message, options)
}

/**
 * Handle webhook updates
 * @param update - Telegram update object
 */
export async function handleWebhookUpdate(update: any): Promise<void> {
  if (!bot) {
    logger.warn('Bot not initialized. Cannot process webhook update.')
    return
  }

  try {
    await bot.handleUpdate(update)
  } catch (error) {
    logger.error('Failed to process webhook update:', error)
  }
}

/**
 * Stop the bot (cleanup)
 */
export async function stopTelegramBot(): Promise<void> {
  if (bot) {
    await bot.stop()
    bot = null
    isInitialized = false
    logger.info('Telegram bot stopped')
  }
}

/**
 * Verify Telegram WebApp init data using the bot token
 * 
 * SECURITY: This function must be called server-side to validate that the initData
 * string from a Telegram WebApp is authentic and hasn't been tampered with.
 * 
 * The verification uses HMAC-SHA256 with the bot token as the secret key, following
 * Telegram's official specification: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * 
 * @param initData - The initData string from Telegram WebApp (e.g., "query_id=...&user=...&hash=...")
 * @returns true if the initData is valid and authentic, false otherwise
 * 
 * @example
 * const isValid = verifyTelegramInitData(request.body.initData)
 * if (!isValid) {
 *   return { error: 'Invalid Telegram user' }
 * }
 */
export function verifyTelegramInitData(initData: string): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken || botToken === 'your_telegram_bot_token_here') {
    logger.warn('Bot token not configured. Cannot verify initData.')
    return false
  }

  try {
    // Parse initData into key-value pairs
    const params = new URLSearchParams(initData)
    const data: Record<string, string> = {}
    const hash = params.get('hash')

    if (!hash) {
      logger.warn('No hash found in initData')
      return false
    }

    // Collect all parameters except hash
    params.forEach((value, key) => {
      if (key !== 'hash') {
        data[key] = value
      }
    })

    // Create data_check_string by sorting keys lexicographically and joining "key=value\n"
    const dataCheckString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n')

    // Calculate secret_key = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    // Calculate data hash = HMAC_SHA256(secret_key, data_check_string)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    const isValid = calculatedHash === hash

    if (!isValid) {
      // In development, provide minimal context for debugging
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Invalid Telegram initData hash - verification failed (check auth_date)')
      } else {
        logger.warn('Invalid Telegram initData hash - verification failed')
      }
    } else {
      logger.success('Telegram initData verified successfully')
    }

    return isValid
  } catch (error) {
    logger.error('Error verifying Telegram initData:', error)
    return false
  }
}
