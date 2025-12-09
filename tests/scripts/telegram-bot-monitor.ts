#!/usr/bin/env node
/**
 * Telegram Bot Update Monitor and Handler
 * 
 * This script:
 * 1. Monitors incoming Telegram updates
 * 2. Processes and responds to messages
 * 3. Shows real-time interaction with the bot
 */

import { Telegraf, Context } from 'telegraf'
import * as fs from 'fs'

const BOT_TOKEN = process.env.TELEGRAM_API_KEY || process.env.TELEGRAM_BOT_TOKEN
const OFFSET_FILE = '/tmp/telegram_offset.txt'

if (!BOT_TOKEN) {
  console.error('❌ Bot token not found!')
  process.exit(1)
}

// Track last update ID to avoid processing duplicates
let lastUpdateId = 0
if (fs.existsSync(OFFSET_FILE)) {
  lastUpdateId = parseInt(fs.readFileSync(OFFSET_FILE, 'utf8')) || 0
}

function saveOffset(updateId: number) {
  fs.writeFileSync(OFFSET_FILE, updateId.toString())
  lastUpdateId = updateId
}

async function processUpdates() {
  console.log('🤖 Telegram Bot Update Monitor\n')
  console.log('Monitoring for new messages...')
  console.log('Press Ctrl+C to stop\n')
  console.log('='.repeat(60))

  const bot = new Telegraf(BOT_TOKEN)

  // Set up handlers for different command types
  
  // /start command
  bot.command('start', async (ctx: Context) => {
    const chatType = ctx.chat?.type
    const userName = ctx.from?.first_name || 'User'
    
    console.log('\n📨 Received /start command')
    console.log(`   From: ${userName}`)
    console.log(`   Chat type: ${chatType}`)
    
    const welcomeMessage = `
🌟 سلام ${userName}! به یکتایار خوش آمدید
Hello ${userName}! Welcome to YektaYar!

این ربات برای ارائه خدمات پلتفرم سلامت روان یکتایار طراحی شده است.
This bot is designed for the YektaYar mental health platform.

✨ *امکانات / Features:*
• دریافت اعلان‌ها / Receive notifications
• ارتباط با متخصصان / Connect with specialists
• یادآوری نوبت‌ها / Appointment reminders
• پشتیبانی / Support

📱 *دستورات موجود / Available commands:*
/help - راهنما / Help
/status - وضعیت / Status
/chatid - شناسه چت / Chat ID

برای مشاهده راهنما از /help استفاده کنید.
Use /help to see the guide.
    `.trim()

    await ctx.replyWithMarkdown(welcomeMessage)
    console.log('   ✅ Response sent')
  })

  // /help command
  bot.command('help', async (ctx: Context) => {
    const userName = ctx.from?.first_name || 'User'
    
    console.log('\n📨 Received /help command')
    console.log(`   From: ${userName}`)
    
    const helpMessage = `
📚 راهنمای یکتایار / YektaYar Help

سلام ${userName}! 👋

*دستورات موجود / Available Commands:*

/start - شروع استفاده از ربات
       Start using the bot

/help - نمایش این راهنما
      Show this help guide

/status - بررسی وضعیت سیستم
        Check system status

/chatid - دریافت شناسه چت
        Get your chat ID

*درباره یکتایار / About YektaYar:*
پلتفرم سلامت روان یکتایار با هدف ارائه خدمات مشاوره و روانشناسی طراحی شده است.

YektaYar mental health platform provides counseling and psychology services.

*پشتیبانی / Support:*
برای دریافت پشتیبانی با تیم ما تماس بگیرید.
Contact our team for support.
    `.trim()

    await ctx.replyWithMarkdown(helpMessage)
    console.log('   ✅ Response sent')
  })

  // /status command
  bot.command('status', async (ctx: Context) => {
    const userName = ctx.from?.first_name || 'User'
    
    console.log('\n📨 Received /status command')
    console.log(`   From: ${userName}`)
    
    const statusMessage = `
✅ *وضعیت سیستم / System Status*

🟢 *ربات: فعال*
   Bot: Active

🟢 *سرورها: آنلاین*
   Servers: Online

⏰ *زمان / Time:*
   ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}
   ${new Date().toLocaleString('en-US')}

📊 *عملیات: عادی*
   Operations: Normal

✨ همه سیستم‌ها به درستی کار می‌کنند
✨ All systems operational
    `.trim()

    await ctx.replyWithMarkdown(statusMessage)
    console.log('   ✅ Response sent')
  })

  // /chatid command
  bot.command('chatid', async (ctx: Context) => {
    const userName = ctx.from?.first_name || 'User'
    const chatId = ctx.chat?.id
    const userId = ctx.from?.id
    const username = ctx.from?.username
    const chatType = ctx.chat?.type
    
    console.log('\n📨 Received /chatid command')
    console.log(`   From: ${userName}`)
    console.log(`   Chat ID: ${chatId}`)
    
    const chatIdMessage = `
🆔 *اطلاعات چت / Chat Information*

*Chat ID:* \`${chatId}\`
*User ID:* \`${userId}\`
*Username:* ${username ? `@${username}` : 'N/A'}
*Name:* ${userName}
*Chat Type:* ${chatType}

این شناسه‌ها را برای تنظیمات ربات استفاده کنید.
Use these IDs for bot configuration.

*نکته:* برای دریافت اعلان‌های مدیریتی، Chat ID را در تنظیمات سیستم وارد کنید.
*Note:* To receive admin notifications, add the Chat ID to system settings.
    `.trim()

    await ctx.replyWithMarkdown(chatIdMessage)
    console.log('   ✅ Response sent')
  })

  // Handle unknown commands
  bot.on('text', async (ctx: Context) => {
    const text = 'text' in ctx.message ? ctx.message.text : ''
    const userName = ctx.from?.first_name || 'User'
    
    // Skip if it's a known command
    if (text.startsWith('/start') || text.startsWith('/help') || 
        text.startsWith('/status') || text.startsWith('/chatid')) {
      return
    }
    
    console.log('\n💬 Received text message')
    console.log(`   From: ${userName}`)
    console.log(`   Text: ${text}`)
    
    // Check if it's a command we don't recognize
    if (text.startsWith('/')) {
      const responseMessage = `
⚠️ دستور ناشناخته / Unknown Command

دستور "${text}" شناخته نشده است.
Command "${text}" is not recognized.

لطفاً از /help برای مشاهده دستورات موجود استفاده کنید.
Please use /help to see available commands.

*دستورات موجود / Available:*
/start, /help, /status, /chatid
      `.trim()

      await ctx.replyWithMarkdown(responseMessage)
      console.log('   ✅ Unknown command response sent')
    } else {
      // Regular text message
      const responseMessage = `
سلام ${userName}! 👋

پیام شما دریافت شد:
"${text}"

من ربات یکتایار هستم. برای استفاده از امکانات، لطفاً از دستورات استفاده کنید.

I'm the YektaYar bot. Your message was received. Please use commands to interact with me.

📱 دستورات: /help
      `.trim()

      await ctx.reply(responseMessage)
      console.log('   ✅ Response sent')
    }
  })

  // Handle edited messages
  bot.on('edited_message', async (ctx: Context) => {
    const userName = ctx.from?.first_name || 'User'
    const text = 'text' in ctx.editedMessage ? ctx.editedMessage.text : ''
    
    console.log('\n✏️  Message edited')
    console.log(`   From: ${userName}`)
    console.log(`   New text: ${text}`)
    
    await ctx.reply('✏️ پیام شما ویرایش شد / Your message was edited\n\nI see you edited your message. How can I help you?')
    console.log('   ✅ Edit acknowledgment sent')
  })

  // Launch bot in polling mode
  console.log('\n🚀 Starting bot in polling mode...\n')
  await bot.launch()

  // Enable graceful stop
  process.once('SIGINT', () => {
    console.log('\n\n🛑 Stopping bot...')
    bot.stop('SIGINT')
  })
  process.once('SIGTERM', () => {
    console.log('\n\n🛑 Stopping bot...')
    bot.stop('SIGTERM')
  })

  console.log('✅ Bot is running and processing updates!\n')
}

processUpdates().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
