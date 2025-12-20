/**
 * Seed script for AI quick suggestions
 * Run with: bun run seed-ai-suggestions.ts
 */

import { query } from '../src/services/database.js'
import { logger } from '@yektayar/shared'

const quickSuggestions = [
  {
    title: JSON.stringify({ fa: 'مدیریت استرس', en: 'Manage Stress' }),
    text: JSON.stringify({ fa: 'چگونه می‌توانم استرس را مدیریت کنم؟', en: 'How can I manage stress?' }),
    icon: 'help',
    order_index: 1
  },
  {
    title: JSON.stringify({ fa: 'بهبود خلق و خو', en: 'Improve Mood' }),
    text: JSON.stringify({ fa: 'نکاتی برای بهبود خلق و خو', en: 'Tips for improving mood' }),
    icon: 'happy',
    order_index: 2
  },
  {
    title: JSON.stringify({ fa: 'احساس اضطراب', en: 'Feeling Anxious' }),
    text: JSON.stringify({ fa: 'احساس اضطراب می‌کنم', en: 'I feel anxious' }),
    icon: 'sad',
    order_index: 3
  },
  {
    title: JSON.stringify({ fa: 'تکنیک‌های آرامش', en: 'Relaxation Techniques' }),
    text: JSON.stringify({ fa: 'تکنیک‌های آرامش', en: 'Relaxation techniques' }),
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
