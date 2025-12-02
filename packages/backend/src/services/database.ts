/**
 * PostgreSQL Database Service
 * Handles database connections and queries
 */

import postgres from 'postgres'
import bcrypt from 'bcrypt'
import { logger } from '@yektayar/shared'

// Initialize PostgreSQL connection
// Normalize localhost to 127.0.0.1 to avoid IPv6/IPv4 resolution issues
// This ensures consistent behavior across different system configurations
const DATABASE_URL = (process.env.DATABASE_URL || 'postgresql://localhost:5432/yektayar')
  .replace(/\/\/localhost:/, '//127.0.0.1:')
  .replace(/\/\/localhost\//, '//127.0.0.1/')

let sql: ReturnType<typeof postgres> | null = null

/**
 * Get database connection instance
 * Configured with timeouts and connection pooling for reliability
 */
export function getDatabase() {
  if (!sql) {
    sql = postgres(DATABASE_URL, {
      max: 10, // Maximum connections in pool
      idle_timeout: 20, // Seconds before idle connection is closed
      connect_timeout: 10, // Seconds to wait for connection
      onnotice: () => {}, // Suppress PostgreSQL notices
      // Prefer IPv4 to avoid resolution delays
      host_rewrite: (host: string) => host === 'localhost' ? '127.0.0.1' : host,
    })
  }
  return sql
}

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  const db = getDatabase()

  try {
    // Create users table
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        type VARCHAR(50) NOT NULL DEFAULT 'patient',
        avatar VARCHAR(500),
        bio TEXT,
        specialization VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create sessions table
    await db`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_logged_in BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create appointments table
    await db`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        psychologist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scheduled_at TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL DEFAULT 60,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create courses table
    await db`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        duration INTEGER NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'beginner',
        thumbnail_url VARCHAR(500),
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create course_enrollments table
    await db`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        UNIQUE(user_id, course_id)
      )
    `

    // Create assessments table
    await db`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create assessment_results table
    await db`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB NOT NULL,
        score INTEGER,
        personality_type VARCHAR(100),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create message_threads table
    await db`
      CREATE TABLE IF NOT EXISTS message_threads (
        id SERIAL PRIMARY KEY,
        participants INTEGER[] NOT NULL,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create messages table
    await db`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create pages table
    await db`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create settings table
    await db`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create support_tickets table
    await db`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create support_messages table (for ticket conversations)
    await db`
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        sender_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
      )
    `

    // Create user_preferences table
    await db`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR(255) PRIMARY KEY,
        welcome_screen_shown BOOLEAN DEFAULT FALSE,
        language VARCHAR(10) DEFAULT 'fa',
        theme VARCHAR(20) DEFAULT 'auto',
        notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    logger.success('Database tables initialized successfully')

    // Insert default data
    await insertDefaultAboutUsPage(db)
    await insertDefaultContactSettings(db)
    await insertDefaultUsers(db)

  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Insert default about-us page
 */
async function insertDefaultAboutUsPage(db: ReturnType<typeof postgres>) {
  const aboutUsContent = `
# درباره ما – یکتایار

یکتایار یک همراه دیجیتالی برای سلامت روان خانوادههاست. ما باور داریم که آرامش و امنیت روانی، زیربنای یک زندگی سالم و روابط پایدار است.

در یکتایار میتوانید خیلی راحت مشکلات خود را مطرح کنید و مطمئن باشید که مسیر درست برایتان مشخص میشود.

## خدمات ما

### مشاوره و رواندرمانی خانوادهمحور
پایش هیجانی و حمایت فوری در بحرانها

### پیشگیری و مداخله در آسیبهای اجتماعی
مثل خشونت خانگی، خیانت زناشویی یا افکار آسیبزننده

### توانمندسازی زنان و زوجها
با دورههای آموزشی دیجیتال در زمینه عزتنفس، روابط عاطفی و حل تعارضات

### تحلیل روانسنجی
ارائه مسیر درمانی شخصیسازیشده

### خدمات درمانی دیجیتال
برای کلینیکها و مراکز تخصصی

### آموزش عمومی و فرهنگسازی
سلامت روان برای ارتقاء سواد روانی جامعه

### پایش و تحلیل دادهها
رفتاری کاربران برای بهبود تجربه و اثربخشی درمان

---

یکتایار با رویکردی علمی، فناورانه و اجتماعی ساخته شده تا بستری ملی برای تحول در خدمات سلامت روان و تحکیم بنیان خانواده باشد.
`.trim()

  try {
    const existing = await db`
      SELECT id FROM pages WHERE slug = 'about-us'
    `
    
    if (existing.length === 0) {
      await db`
        INSERT INTO pages (slug, title, content, metadata)
        VALUES (
          'about-us',
          'درباره ما',
          ${aboutUsContent},
          ${JSON.stringify({
            titleEn: 'About Us',
            description: 'Learn about YektaYar mental health platform',
            descriptionFa: 'آشنایی با پلتفرم سلامت روان یکتایار'
          })}
        )
      `
      logger.success('Default about-us page created')
    }
  } catch (error) {
    logger.error('Failed to create default about-us page:', error)
  }
}

/**
 * Insert default contact settings
 */
async function insertDefaultContactSettings(db: ReturnType<typeof postgres>) {
  const defaultSettings = [
    { key: 'contact_phone', value: '+98 21 1234 5678', type: 'string' },
    { key: 'contact_email', value: 'info@yektayar.com', type: 'string' },
    { key: 'contact_address', value: 'تهران، خیابان ولیعصر', type: 'string' },
    { key: 'contact_address_en', value: 'Tehran, Vali Asr Street', type: 'string' },
    { key: 'contact_map_lat', value: '35.6892', type: 'number' },
    { key: 'contact_map_lng', value: '51.3890', type: 'number' },
  ]

  try {
    for (const setting of defaultSettings) {
      const existing = await db`
        SELECT id FROM settings WHERE key = ${setting.key}
      `
      
      if (existing.length === 0) {
        await db`
          INSERT INTO settings (key, value, type)
          VALUES (${setting.key}, ${setting.value}, ${setting.type})
        `
      }
    }
    logger.success('Default contact settings created')
  } catch (error) {
    logger.error('Failed to create default contact settings:', error)
  }
}

/**
 * Insert default users for testing
 */
async function insertDefaultUsers(db: ReturnType<typeof postgres>) {
  try {
    // Check if admin user exists
    const existingAdmin = await db`
      SELECT id FROM users WHERE email = 'admin@yektayar.com'
    `
    
    if (existingAdmin.length === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10)
      
      await db`
        INSERT INTO users (email, name, password_hash, type, bio)
        VALUES 
          ('admin@yektayar.com', 'Admin User', ${adminPassword}, 'admin', 'System Administrator'),
          ('psychologist@yektayar.com', 'Dr. Sara Mohammadi', ${await bcrypt.hash('psych123', 10)}, 'psychologist', 'Licensed Clinical Psychologist with 10 years of experience'),
          ('patient@yektayar.com', 'Ali Ahmadi', ${await bcrypt.hash('patient123', 10)}, 'patient', NULL)
      `
      logger.success('Default users created (admin@yektayar.com / admin123, psychologist@yektayar.com / psych123, patient@yektayar.com / patient123)')
    }
  } catch (error) {
    logger.error('Failed to create default users:', error)
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (sql) {
    await sql.end()
    sql = null
  }
}
