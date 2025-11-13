/**
 * PostgreSQL Database Service
 * Handles database connections and queries
 */

import postgres from 'postgres'

// Initialize PostgreSQL connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/yektayar'

let sql: ReturnType<typeof postgres> | null = null

/**
 * Get database connection instance
 */
export function getDatabase() {
  if (!sql) {
    sql = postgres(DATABASE_URL, {
      max: 10, // Maximum connections
      idle_timeout: 20,
      connect_timeout: 10,
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
        user_id INTEGER,
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

    console.log('✅ Database tables initialized successfully')

    // Insert default about-us page if not exists
    await insertDefaultAboutUsPage(db)
    
    // Insert default contact settings if not exist
    await insertDefaultContactSettings(db)

  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
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
      console.log('✅ Default about-us page created')
    }
  } catch (error) {
    console.error('❌ Failed to create default about-us page:', error)
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
    console.log('✅ Default contact settings created')
  } catch (error) {
    console.error('❌ Failed to create default contact settings:', error)
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
