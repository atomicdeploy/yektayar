/**
 * Seed script for AI quick suggestions
 * Run with: bun run seed-ai-suggestions.ts
 */

import { query, createI18nField } from '../src/services/database.js'
import { logger } from '@yektayar/shared'

const quickSuggestions = [
  {
    title: createI18nField('مدیریت استرس', 'Manage Stress'),
    text: createI18nField('چگونه می‌توانم استرس را مدیریت کنم؟', 'How can I manage stress?'),
    icon: 'help',
    order_index: 1
  },
  {
    title: createI18nField('بهبود خلق و خو', 'Improve Mood'),
    text: createI18nField('نکاتی برای بهبود خلق و خو', 'Tips for improving mood'),
    icon: 'happy',
    order_index: 2
  },
  {
    title: createI18nField('احساس اضطراب', 'Feeling Anxious'),
    text: createI18nField('احساس اضطراب می‌کنم', 'I feel anxious'),
    icon: 'sad',
    order_index: 3
  },
  {
    title: createI18nField('تکنیک‌های آرامش', 'Relaxation Techniques'),
    text: createI18nField('تکنیک‌های آرامش', 'Relaxation techniques'),
    icon: 'heart',
    order_index: 4
  }
]

async function seedAISuggestions() {
  try {
    logger.info('Starting AI quick suggestions seeding...')

    // Check if table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ai_quick_suggestions'
      )
    `)

    if (!tableExists[0]?.exists) {
      logger.error('Table ai_quick_suggestions does not exist. Please run database initialization first.')
      process.exit(1)
    }

    // Clear existing suggestions
    await query('DELETE FROM ai_quick_suggestions')
    logger.info('Cleared existing quick suggestions')

    // Insert new suggestions
    for (const suggestion of quickSuggestions) {
      await query(
        `INSERT INTO ai_quick_suggestions (title, text, icon, order_index, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [suggestion.title, suggestion.text, suggestion.icon, suggestion.order_index, true]
      )
    }

    logger.success(`Successfully seeded ${quickSuggestions.length} quick suggestions`)
    process.exit(0)
    
  } catch (error) {
    logger.error('Error seeding AI quick suggestions:', error)
    process.exit(1)
  }
}

// Run the seed function
seedAISuggestions()
