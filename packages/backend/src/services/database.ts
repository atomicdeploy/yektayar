/**
 * PostgreSQL Database Service using pg library
 * Using pg library instead of postgres for better Bun compatibility
 * 
 * Note: The postgres library (postgres-js) has a known bug in Bun 1.1.35+ where
 * queries hang indefinitely in HTTP request handlers while working at startup.
 * See: https://github.com/oven-sh/bun/issues/15438
 */

import { Pool, PoolClient } from 'pg'
import bcrypt from 'bcrypt'
import { logger } from '@yektayar/shared'

// Initialize PostgreSQL connection using pg library
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/yektayar'

let pool: Pool | null = null

/**
 * Get database connection pool
 * Using pg library for better Bun compatibility
 */
export function getPool() {
  if (!pool) {
    logger.info(`Initializing PostgreSQL pool (pg library) to ${DATABASE_URL.replace(/:([^:@]+)@/, ':*****@')}`)
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 20000, // 20 seconds before idle connection is closed
      connectionTimeoutMillis: 10000, // 10 seconds to wait for connection
    })
    
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err)
    })
    
    logger.info('PostgreSQL connection pool initialized (pg library)')
  }
  return pool
}

/**
 * Execute a query with automatic client management
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

/**
 * Tagged template SQL function for backward compatibility with postgres library syntax
 * Converts tagged template calls to parameterized queries
 */
export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  // For immediate execution, return a thenable with the query
  const queryText = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : '')
  }, '')
  
  return query(queryText, values)
}

// Make sql callable with unsafe for dynamic queries
sql.unsafe = (queryText: string, params: any[]): Promise<any[]> => {
  return query(queryText, params)
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Get database connection instance
 * Returns sql tagged template function for backward compatibility
 */
export function getDatabase() {
  getPool() // Ensure pool is initialized
  return sql
}

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  const pool = getPool()

  try {
    // Create users table
    await pool.query(`
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
    `)

    // Create sessions table
    await pool.query(`
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
    `)

    // Create appointments table
    await pool.query(`
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
    `)

    // Create courses table
    await pool.query(`
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
    `)

    // Create course_enrollments table
    await pool.query(`
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
    `)

    // Create assessments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create assessment_results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB NOT NULL,
        score INTEGER,
        personality_type VARCHAR(100),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create message_threads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_threads (
        id SERIAL PRIMARY KEY,
        participants INTEGER[] NOT NULL,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create settings table  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create support_tickets table
    await pool.query(`
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
    `)

    // Create support_messages table (for ticket conversations)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        sender_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
      )
    `)

    // Create user_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR(255) PRIMARY KEY,
        welcome_screen_shown BOOLEAN DEFAULT FALSE,
        language VARCHAR(10) DEFAULT 'fa',
        theme VARCHAR(20) DEFAULT 'auto',
        notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create ai_quick_suggestions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_quick_suggestions (
        id SERIAL PRIMARY KEY,
        title JSONB NOT NULL,
        text JSONB NOT NULL,
        icon VARCHAR(100),
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    logger.success('Database tables initialized successfully')

    // Insert default data
    await insertDefaultAboutUsPage()
    await insertDefaultContactSettings()
    await insertDefaultUsers()
    await insertDefaultQuickSuggestions()

  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Insert default about-us page
 */
async function insertDefaultAboutUsPage() {
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
    const existing = await query(
      `SELECT id FROM pages WHERE slug = $1`,
      ['about-us']
    )
    
    if (existing.length === 0) {
      await query(
        `INSERT INTO pages (slug, title, content, metadata)
         VALUES ($1, $2, $3, $4)`,
        [
          'about-us',
          'درباره ما',
          aboutUsContent,
          JSON.stringify({
            titleEn: 'About Us',
            description: 'Learn about YektaYar mental health platform',
            descriptionFa: 'آشنایی با پلتفرم سلامت روان یکتایار'
          })
        ]
      )
      logger.success('Default about-us page created')
    }
  } catch (error) {
    logger.error('Failed to create default about-us page:', error)
  }
}

/**
 * Insert default contact settings
 */
async function insertDefaultContactSettings() {
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
      const existing = await query(
        `SELECT id FROM settings WHERE key = $1`,
        [setting.key]
      )
      
      if (existing.length === 0) {
        await query(
          `INSERT INTO settings (key, value, type)
           VALUES ($1, $2, $3)`,
          [setting.key, setting.value, setting.type]
        )
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
async function insertDefaultUsers() {
  try {
    // Check if admin user exists
    const existingAdmin = await query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@yektayar.ir']
    )
    
    if (existingAdmin.length === 0) {
      const password = process.env.ADMIN_PASSWORD || 'admin123'
      const adminPassword = await bcrypt.hash(password, 10)
      const psychPassword = await bcrypt.hash('psych123', 10)
      const patientPassword = await bcrypt.hash('patient123', 10)
      
      await query(
        `INSERT INTO users (email, name, password_hash, type, bio, is_active)
         VALUES 
           ($1, $2, $3, $4, $5, $6),
           ($7, $8, $9, $10, $11, $12),
           ($13, $14, $15, $16, $17, $18)`,
        [
          'admin@yektayar.ir', 'Admin User', adminPassword, 'admin', 'System Administrator', true,
          'psychologist@yektayar.ir', 'Dr. Sara Mohammadi', psychPassword, 'psychologist', 'Licensed Clinical Psychologist with 10 years of experience', true,
          'patient@yektayar.ir', 'Ali Ahmadi', patientPassword, 'patient', null, true
        ]
      )
      logger.success('Default admin user created: admin@yektayar.ir')
      logger.warn(`Default admin password: ${password} - PLEASE CHANGE THIS!`)
      logger.success('Additional test users created: psychologist@yektayar.ir / psych123, patient@yektayar.ir / patient123')
    }
  } catch (error) {
    logger.error('Failed to create default users:', error)
  }
}

/**
 * Insert default quick suggestions
 */
async function insertDefaultQuickSuggestions() {
  try {
    // Check if quick suggestions already exist
    const existing = await query(
      `SELECT COUNT(*) as count FROM ai_quick_suggestions`
    )
    
    if (existing[0]?.count > 0) {
      logger.info('Quick suggestions already exist, skipping...')
      return
    }

    const quickSuggestions = [
      {
        title: { fa: 'مدیریت استرس', en: 'Manage Stress' },
        text: { fa: 'چگونه می‌توانم استرس را مدیریت کنم؟', en: 'How can I manage stress?' },
        icon: 'help',
        order_index: 1
      },
      {
        title: { fa: 'بهبود خلق و خو', en: 'Improve Mood' },
        text: { fa: 'نکاتی برای بهبود خلق و خو', en: 'Tips for improving mood' },
        icon: 'happy',
        order_index: 2
      },
      {
        title: { fa: 'احساس اضطراب', en: 'Feeling Anxious' },
        text: { fa: 'احساس اضطراب می‌کنم', en: 'I feel anxious' },
        icon: 'sad',
        order_index: 3
      },
      {
        title: { fa: 'تکنیک‌های آرامش', en: 'Relaxation Techniques' },
        text: { fa: 'تکنیک‌های آرامش', en: 'Relaxation techniques' },
        icon: 'heart',
        order_index: 4
      }
    ]

    for (const suggestion of quickSuggestions) {
      await query(
        `INSERT INTO ai_quick_suggestions (title, text, icon, order_index, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [suggestion.title, suggestion.text, suggestion.icon, suggestion.order_index, true]
      )
    }

    logger.success('Default quick suggestions created')
  } catch (error) {
    logger.error('Failed to create default quick suggestions:', error)
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end()
    pool = null
    logger.info('PostgreSQL connection pool closed')
  }
}
