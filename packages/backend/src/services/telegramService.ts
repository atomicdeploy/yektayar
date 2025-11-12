import { Telegraf, Context } from 'telegraf'

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
    console.log('📱 Telegram bot already initialized')
    return bot
  }

  if (!token || token === 'your_telegram_bot_token_here') {
    console.warn('⚠️  Telegram bot token not configured. Bot functionality disabled.')
    return null
  }

  try {
    bot = new Telegraf(token)
    
    setupBotHandlers()

    if (useWebhook && webhookUrl) {
      // Webhook mode (for production)
      bot.telegram.setWebhook(webhookUrl)
      console.log('📱 Telegram bot initialized in webhook mode')
      console.log(`🔗 Webhook URL: ${webhookUrl}`)
    } else {
      // Polling mode (for development)
      bot.launch()
      console.log('📱 Telegram bot initialized in polling mode')
    }

    isInitialized = true
    
    return bot
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error)
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
    console.warn('⚠️  Telegram bot not initialized. Message not sent.')
    return false
  }

  try {
    await bot.telegram.sendMessage(chatId, message, options)
    return true
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error)
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
    console.warn('⚠️  Admin chat ID not configured. Notification not sent.')
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
    console.warn('⚠️  Channel ID not configured. Message not sent.')
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
    console.warn('⚠️  Bot not initialized. Cannot process webhook update.')
    return
  }

  try {
    await bot.handleUpdate(update)
  } catch (error) {
    console.error('❌ Failed to process webhook update:', error)
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
    console.log('📱 Telegram bot stopped')
  }
}
