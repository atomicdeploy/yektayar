#!/usr/bin/env node
/**
 * Telegram Bot Testing and Setup Script
 * 
 * This script:
 * 1. Tests bot connection
 * 2. Sets up bot profile (name, description, photo)
 * 3. Sends test messages to the group
 */

import { Telegraf } from 'telegraf'
import * as fs from 'fs'
import * as path from 'path'
import { InputFile } from 'telegraf/types'

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_API_KEY || process.env.TELEGRAM_BOT_TOKEN
const GROUP_CHAT_ID = '-1002716125555' // The group chat ID
const PROFILE_PICTURE_URL = 'http://tmpfiles.org/dl/14760311/38f45ea9-68ad-4f71-ad18-37961a5a42e2.png'
const PROFILE_PICTURE_PATH = '/tmp/bot_profile.png'

// Bot information
const BOT_NAME = 'یکتایار • YektaYar'
const BOT_DESCRIPTION = `
🌟 ربات یکتایار - سلامت روان

این ربات برای ارائه خدمات پلتفرم سلامت روان یکتایار طراحی شده است.

✨ ویژگی‌ها:
• دریافت اعلان‌های سیستم
• ارتباط با متخصصان
• دریافت یادآورها
• مدیریت نوبت‌ها

برای شروع از دستور /start استفاده کنید.
`.trim()

const BOT_SHORT_DESCRIPTION = 'ربات رسمی پلتفرم سلامت روان یکتایار'

const BOT_COMMANDS = [
  { command: 'start', description: 'شروع استفاده از ربات / Start using the bot' },
  { command: 'help', description: 'راهنمای استفاده / Help guide' },
  { command: 'status', description: 'وضعیت سیستم / System status' },
  { command: 'chatid', description: 'دریافت شناسه چت / Get chat ID' },
]

async function downloadProfilePicture(): Promise<void> {
  console.log('📥 Downloading profile picture...')
  const response = await fetch(PROFILE_PICTURE_URL)
  const buffer = await response.arrayBuffer()
  fs.writeFileSync(PROFILE_PICTURE_PATH, Buffer.from(buffer))
  console.log('✅ Profile picture downloaded')
}

async function setupBot(bot: Telegraf): Promise<void> {
  console.log('\n🔧 Setting up bot profile...\n')

  try {
    // Get current bot info
    const botInfo = await bot.telegram.getMe()
    console.log('📱 Bot Info:', {
      id: botInfo.id,
      username: botInfo.username,
      first_name: botInfo.first_name,
    })

    // Set bot description
    console.log('\n📝 Setting bot description...')
    await bot.telegram.callApi('setMyDescription', {
      description: BOT_DESCRIPTION,
      language_code: 'fa'
    })
    await bot.telegram.callApi('setMyDescription', {
      description: BOT_DESCRIPTION.replace(/[\u0600-\u06FF]/g, '').replace(/[•✨]/g, '').trim(),
      language_code: 'en'
    })
    console.log('✅ Bot description set')

    // Set short description
    console.log('\n📝 Setting bot short description...')
    await bot.telegram.callApi('setMyShortDescription', {
      short_description: BOT_SHORT_DESCRIPTION,
      language_code: 'fa'
    })
    await bot.telegram.callApi('setMyShortDescription', {
      short_description: 'Official bot of YektaYar mental health platform',
      language_code: 'en'
    })
    console.log('✅ Bot short description set')

    // Set bot commands
    console.log('\n📝 Setting bot commands...')
    await bot.telegram.setMyCommands(BOT_COMMANDS)
    console.log('✅ Bot commands set:', BOT_COMMANDS.length, 'commands')

    // Set profile picture if it exists
    if (fs.existsSync(PROFILE_PICTURE_PATH)) {
      console.log('\n📸 Setting profile picture...')
      try {
        // Note: Setting profile photo via Bot API requires special permissions
        // The bot owner needs to do this manually via BotFather
        console.log('⚠️  Profile picture must be set manually via @BotFather')
        console.log('   Use /setuserpic command in BotFather and upload the picture')
        console.log('   Picture location:', PROFILE_PICTURE_PATH)
      } catch (error) {
        console.log('⚠️  Could not set profile picture via API (expected)')
        console.log('   Please set it manually via @BotFather')
      }
    }

  } catch (error) {
    console.error('❌ Error setting up bot:', error)
    throw error
  }
}

async function testBotMessages(bot: Telegraf): Promise<void> {
  console.log('\n📨 Sending test messages to group...\n')

  try {
    // Test message 1: Simple text
    console.log('Sending message 1: Welcome message...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🎉 سلام! من ربات یکتایار هستم

Hello! I am the YektaYar bot

✅ ربات با موفقیت راه‌اندازی شد
✅ Bot successfully initialized

⏰ ${new Date().toLocaleString('fa-IR')}
    `.trim())
    console.log('✅ Message 1 sent')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test message 2: Formatted message with Markdown
    console.log('Sending message 2: Formatted message...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
*🌟 تست قابلیت‌های ربات / Bot Features Test*

✨ *ویژگی‌های فعال / Active Features:*
• پشتیبانی از زبان فارسی و انگلیسی
• ارسال اعلان‌های سیستم
• پاسخگویی به دستورات
• مدیریت گروه‌ها و کانال‌ها

📱 *دستورات موجود / Available Commands:*
/start - شروع
/help - راهنما  
/status - وضعیت
/chatid - شناسه چت

🔔 برای استفاده از ربات، دستور /start را ارسال کنید
    `.trim(), {
      parse_mode: 'Markdown'
    })
    console.log('✅ Message 2 sent')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test message 3: HTML formatted
    console.log('Sending message 3: HTML formatted message...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
<b>🚀 تست پیشرفته / Advanced Test</b>

<i>این پیام با فرمت HTML ارسال شده است</i>
<i>This message is sent with HTML formatting</i>

<code>System Status: Online ✓</code>
<code>سرورها: آنلاین ✓</code>

<b>آماده ارائه خدمات هستیم! 🎯</b>
<b>Ready to serve! 🎯</b>
    `.trim(), {
      parse_mode: 'HTML'
    })
    console.log('✅ Message 3 sent')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test message 4: Admin notification style
    console.log('Sending message 4: Admin notification...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🔵 *یکتایار - INFO*

تست سیستم اعلان‌های مدیریتی
Admin notification system test

ℹ️ *پیام تست*
این یک پیام تست برای سیستم اعلان‌های مدیریتی است.
This is a test message for the admin notification system.

✅ سیستم آماده دریافت و ارسال اعلان‌ها است
✅ System is ready to receive and send notifications

⏰ زمان: ${new Date().toLocaleString('fa-IR')}
    `.trim(), {
      parse_mode: 'Markdown'
    })
    console.log('✅ Message 4 sent')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test message 5: Error notification style
    console.log('Sending message 5: Error notification test...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🔴 *یکتایار - ERROR TEST*

⚠️ این یک تست اعلان خطا است
⚠️ This is an error notification test

<b>نوع خطا / Error Type:</b> Test Error
<b>جزئیات / Details:</b> Testing error notification system

✅ سیستم اعلان خطاها فعال است
✅ Error notification system is active

⏰ Time: ${new Date().toISOString()}
    `.trim(), {
      parse_mode: 'HTML'
    })
    console.log('✅ Message 5 sent')

    console.log('\n✅ All test messages sent successfully!')

  } catch (error) {
    console.error('❌ Error sending messages:', error)
    throw error
  }
}

async function verifyGroupAccess(bot: Telegraf): Promise<void> {
  console.log('\n🔍 Verifying group access...\n')

  try {
    // Try to get chat info
    const chat = await bot.telegram.getChat(GROUP_CHAT_ID)
    console.log('✅ Bot has access to the group!')
    console.log('📋 Group Info:', {
      id: chat.id,
      type: chat.type,
      title: 'title' in chat ? chat.title : 'N/A',
    })
  } catch (error) {
    console.error('❌ Bot does not have access to the group')
    console.error('   Please add the bot to the group first')
    throw error
  }
}

async function main() {
  console.log('🤖 YektaYar Telegram Bot Test & Setup\n')
  console.log('=' .repeat(50))

  if (!BOT_TOKEN) {
    console.error('❌ Bot token not found!')
    console.error('   Set TELEGRAM_API_KEY or TELEGRAM_BOT_TOKEN environment variable')
    process.exit(1)
  }

  try {
    // Download profile picture
    await downloadProfilePicture()

    // Initialize bot (without launching polling)
    const bot = new Telegraf(BOT_TOKEN)

    // Setup bot profile (this doesn't require group access)
    await setupBot(bot)

    // Try to verify group access
    console.log('\n🔍 Verifying group access...\n')
    try {
      await verifyGroupAccess(bot)
      
      // If we have access, send test messages
      await testBotMessages(bot)

      console.log('\n' + '='.repeat(50))
      console.log('✅ All tests completed successfully!')
    } catch (error) {
      console.log('\n⚠️  Bot is not in the group yet')
      console.log('\n📝 To add the bot to the group:')
      console.log('   1. Open Telegram and go to your group')
      console.log('   2. Click on the group name to open group info')
      console.log('   3. Click "Add Members"')
      console.log('   4. Search for: @YektaYar_Bot')
      console.log('   5. Add the bot to the group')
      console.log('   6. Run this script again to send test messages')
      console.log('\n   Group Chat ID:', GROUP_CHAT_ID)
      console.log('\n   Note: The correct group ID is -1002716125555 (with 100 prefix)')
    }

    console.log('\n📝 Bot Profile Setup Complete:')
    console.log('   ✅ Bot commands configured')
    console.log('   ✅ Bot description set (Persian & English)')
    console.log('   ✅ Bot short description set')
    console.log('\n📝 Manual Steps Required:')
    console.log('   1. Set bot profile picture via @BotFather:')
    console.log('      - Send /setuserpic to @BotFather')
    console.log('      - Select your bot')
    console.log('      - Upload:', PROFILE_PICTURE_PATH)
    console.log('   2. Add bot to the group (if not already done)')
    console.log('   3. Run this script again to test messaging')
    console.log('\n🎉 Bot profile setup complete!')

  } catch (error) {
    console.error('\n❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
