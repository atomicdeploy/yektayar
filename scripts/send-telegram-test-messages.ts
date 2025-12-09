#!/usr/bin/env node
/**
 * Simple script to send test messages to the Telegram group
 * Run this after the bot has been added to the group
 */

import { Telegraf } from 'telegraf'

const BOT_TOKEN = process.env.TELEGRAM_API_KEY || process.env.TELEGRAM_BOT_TOKEN
const GROUP_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '-2716125555'

if (!BOT_TOKEN) {
  console.error('❌ Bot token not found!')
  process.exit(1)
}

async function sendTestMessages() {
  console.log('📨 Sending test messages to group', GROUP_CHAT_ID, '\n')

  const bot = new Telegraf(BOT_TOKEN)

  try {
    // Verify bot can access the group
    const chat = await bot.telegram.getChat(GROUP_CHAT_ID)
    console.log('✅ Bot has access to:', 'title' in chat ? chat.title : chat.type)
    console.log('')

    // Message 1: Welcome
    console.log('Sending message 1...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🎉 سلام! من ربات یکتایار هستم
Hello! I am the YektaYar bot

✅ ربات با موفقیت راه‌اندازی شد
✅ Bot successfully initialized

⏰ ${new Date().toLocaleString('fa-IR')}
    `.trim())
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Message 2: Features
    console.log('Sending message 2...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
*🌟 تست قابلیت‌های ربات*

✨ *ویژگی‌های فعال:*
• پشتیبانی از فارسی و انگلیسی
• ارسال اعلان‌های سیستم
• پاسخگویی به دستورات
• مدیریت گروه‌ها

📱 *دستورات:*
/start - شروع
/help - راهنما  
/status - وضعیت
/chatid - شناسه چت
    `.trim(), { parse_mode: 'Markdown' })
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Message 3: Admin notification test
    console.log('Sending message 3...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🔵 *یکتایار - INFO*

تست سیستم اعلان‌های مدیریتی

✅ سیستم آماده است
✅ System is ready

⏰ ${new Date().toLocaleString('fa-IR')}
    `.trim(), { parse_mode: 'Markdown' })
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Message 4: Error notification test
    console.log('Sending message 4...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🟡 *یکتایار - WARNING TEST*

⚠️ تست اعلان هشدار
Test warning notification

✅ سیستم اعلان‌ها فعال است
    `.trim(), { parse_mode: 'Markdown' })
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Message 5: Success
    console.log('Sending message 5...')
    await bot.telegram.sendMessage(GROUP_CHAT_ID, `
🟢 *تست کامل شد*

✅ All 5 test messages sent successfully!
✅ همه ۵ پیام تست با موفقیت ارسال شد!

🎯 ربات یکتایار آماده است
🎯 YektaYar Bot is ready

⏰ ${new Date().toISOString()}
    `.trim(), { parse_mode: 'Markdown' })

    console.log('\n✅ All messages sent successfully!')
    console.log('\n📱 Check the group for the messages')
    console.log('🎉 Bot is working correctly!\n')

  } catch (error) {
    if (error.response && error.response.error_code === 400) {
      console.error('\n❌ Bot cannot access the group!')
      console.error('   Make sure the bot is added to the group')
      console.error('   Bot: @YektaYar_Bot')
      console.error('   Group ID:', GROUP_CHAT_ID)
      console.error('\n   Error:', error.response.description)
    } else {
      console.error('\n❌ Error:', error)
    }
    process.exit(1)
  }
}

sendTestMessages().catch(console.error)
