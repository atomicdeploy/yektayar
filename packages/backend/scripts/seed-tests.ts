/**
 * Seed script for sample test data
 * Run with: node --loader ts-node/esm seed-tests.ts
 * Or with Bun: bun run seed-tests.ts
 */

import postgres from 'postgres'
import { logger } from '@yektayar/shared'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://yektayar_user:yektayar_dev_password@localhost:5432/yektayar'
const db = postgres(DATABASE_URL)

const sampleTest = {
  title: 'آزمون ارزیابی رابطه زناشویی',
  titleEn: 'Marital Relationship Assessment Test',
  description: 'این پرسشنامه با هدف کمک به شما و همسرتان برای درک بهتر نقاط قوت و حوزه‌های قابل بهبود در رابطه طراحی شده است.',
  descriptionEn: 'This questionnaire is designed to help you and your spouse better understand strengths and areas for improvement in your relationship.',
  questions: [
    {
      id: 1,
      text: 'من و همسرم وقت کافی را با هم می‌گذرانیم.',
      textEn: 'My spouse and I spend enough quality time together.',
    },
    {
      id: 2,
      text: 'ما در مورد احساسات خود به راحتی با یکدیگر صحبت می‌کنیم.',
      textEn: 'We easily talk to each other about our feelings.',
    },
    {
      id: 3,
      text: 'احساس می‌کنم همسرم به خواسته‌ها و نیازهای من توجه دارد.',
      textEn: 'I feel my spouse pays attention to my wants and needs.',
    },
    {
      id: 4,
      text: 'ما در تصمیم‌گیری‌های مهم با یکدیگر مشورت می‌کنیم.',
      textEn: 'We consult with each other on important decisions.',
    },
    {
      id: 5,
      text: 'وقتی اختلاف نظر داریم، به راه حل مناسبی می‌رسیم.',
      textEn: 'When we disagree, we reach an appropriate solution.',
    },
    {
      id: 6,
      text: 'همسرم از کارها و تلاش‌های من قدردانی می‌کند.',
      textEn: 'My spouse appreciates my work and efforts.',
    },
    {
      id: 7,
      text: 'در رابطه ما اعتماد متقابل وجود دارد.',
      textEn: 'There is mutual trust in our relationship.',
    },
    {
      id: 8,
      text: 'ما فعالیت‌ها و سرگرمی‌های مشترک داریم.',
      textEn: 'We have shared activities and hobbies.',
    },
    {
      id: 9,
      text: 'همسرم در زمان‌های سخت از من حمایت می‌کند.',
      textEn: 'My spouse supports me during difficult times.',
    },
    {
      id: 10,
      text: 'من از رابطه زناشویی خود راضی هستم.',
      textEn: 'I am satisfied with my marital relationship.',
    },
    {
      id: 11,
      text: 'ما در مورد مسائل مالی به توافق می‌رسیم.',
      textEn: 'We agree on financial matters.',
    },
    {
      id: 12,
      text: 'همسرم به حریم شخصی من احترام می‌گذارد.',
      textEn: 'My spouse respects my personal space.',
    },
    {
      id: 13,
      text: 'ما در تربیت فرزندان هماهنگ هستیم.',
      textEn: 'We are coordinated in raising our children.',
    },
    {
      id: 14,
      text: 'احساس می‌کنم همسرم مرا درک می‌کند.',
      textEn: 'I feel my spouse understands me.',
    },
    {
      id: 15,
      text: 'ما برنامه‌های آینده مشترکی داریم.',
      textEn: 'We have shared future plans.',
    },
    {
      id: 16,
      text: 'همسرم به نظرات و پیشنهادات من گوش می‌دهد.',
      textEn: 'My spouse listens to my opinions and suggestions.',
    },
    {
      id: 17,
      text: 'در رابطه ما صداقت و رک‌گویی وجود دارد.',
      textEn: 'There is honesty and openness in our relationship.',
    },
    {
      id: 18,
      text: 'ما یکدیگر را در رسیدن به اهداف شخصی حمایت می‌کنیم.',
      textEn: 'We support each other in achieving personal goals.',
    },
    {
      id: 19,
      text: 'همسرم در کارهای خانه مشارکت دارد.',
      textEn: 'My spouse participates in household chores.',
    },
    {
      id: 20,
      text: 'احساس می‌کنم در این رابطه ارزشمند هستم.',
      textEn: 'I feel valued in this relationship.',
    },
  ],
}

async function seedTests() {
  try {
    logger.info('Starting test data seeding...')

    // Check if test already exists
    const existing = await db`
      SELECT id FROM assessments WHERE title = ${sampleTest.title}
    `

    if (existing.length > 0) {
      logger.warn('Sample test already exists, skipping...')
      return
    }

    // Insert the sample test
    const [test] = await db`
      INSERT INTO assessments (title, description, questions)
      VALUES (${sampleTest.title}, ${sampleTest.description}, ${JSON.stringify(sampleTest.questions)})
      RETURNING *
    `

    logger.success(`Sample test created with ID: ${test.id}`)
    logger.info(`Title: ${sampleTest.title}`)
    logger.info(`Questions: ${sampleTest.questions.length}`)
    
  } catch (error) {
    logger.error('Error seeding test data:', error)
    throw error
  } finally {
    await db.end()
  }
}

// Run the seed function
seedTests()
  .then(() => {
    logger.success('Test data seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    logger.error('Test data seeding failed:', error)
    process.exit(1)
  })
