import { readFileSync } from 'fs'
import { join } from 'path'
import { sql } from './connection'

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('📦 Running database migrations...')
    
    // Read the schema file
    const schemaPath = join(import.meta.dir, 'schema.sql')
    const schemaSql = readFileSync(schemaPath, 'utf-8')
    
    // Split by semicolon and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      await sql.unsafe(statement)
    }
    
    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Seed database with initial data
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Seeding database...')
    
    // Read mock users data
    const mockUsersPath = join(import.meta.dir, '../../mock/users.json')
    const mockUsers = JSON.parse(readFileSync(mockUsersPath, 'utf-8'))
    
    // Check if users table is empty
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`
    const userCount = Number(existingUsers[0].count)
    
    if (userCount > 0) {
      console.log('ℹ️  Users table already has data, skipping seed')
      return
    }
    
    // Insert mock users
    for (const user of mockUsers) {
      await sql`
        INSERT INTO users (id, name, email, phone, role, status, created_at)
        VALUES (
          ${user.id}::uuid,
          ${user.name},
          ${user.email},
          ${user.phone},
          ${user.role},
          ${user.status},
          ${user.createdAt}::timestamp
        )
        ON CONFLICT (email) DO NOTHING
      `
    }
    
    console.log(`✅ Seeded ${mockUsers.length} users`)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

/**
 * Initialize database (run migrations and seed)
 */
export async function initializeDatabase(): Promise<void> {
  await runMigrations()
  await seedDatabase()
}
