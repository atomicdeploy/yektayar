import { getDatabase } from './connection.js'
import { REQUIRED_TABLES, OPTIONAL_TABLES, ALL_TABLES, type TableDefinition } from './schema.js'

interface VerificationResult {
  success: boolean
  existingTables: string[]
  missingRequiredTables: string[]
  missingOptionalTables: string[]
  totalTables: number
  message: string
}

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName: string): Promise<boolean> {
  const sql = getDatabase()
  
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) as exists
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error)
    return false
  }
}

/**
 * Get all tables in the public schema
 */
async function getAllDatabaseTables(): Promise<string[]> {
  const sql = getDatabase()
  
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    return result.map((row: any) => row.table_name)
  } catch (error) {
    console.error('Error fetching database tables:', error)
    return []
  }
}

/**
 * Verify all required tables exist in the database
 */
export async function verifyTables(): Promise<VerificationResult> {
  const sql = getDatabase()
  
  try {
    // Get all existing tables
    const allDatabaseTables = await getAllDatabaseTables()
    
    // Check which expected tables exist
    const existingTables: string[] = []
    const missingRequiredTables: string[] = []
    const missingOptionalTables: string[] = []
    
    // Check required tables
    for (const table of REQUIRED_TABLES) {
      const exists = await tableExists(table.name)
      if (exists) {
        existingTables.push(table.name)
      } else {
        missingRequiredTables.push(table.name)
      }
    }
    
    // Check optional tables
    for (const table of OPTIONAL_TABLES) {
      const exists = await tableExists(table.name)
      if (exists) {
        existingTables.push(table.name)
      } else {
        missingOptionalTables.push(table.name)
      }
    }
    
    // Determine success (all required tables must exist)
    const success = missingRequiredTables.length === 0
    
    // Build message
    let message = ''
    if (success) {
      message = `✅ All ${REQUIRED_TABLES.length} required tables exist`
      if (existingTables.length > REQUIRED_TABLES.length) {
        message += ` (${existingTables.length}/${ALL_TABLES.length} total tables found)`
      }
    } else {
      message = `❌ Missing ${missingRequiredTables.length} required table(s): ${missingRequiredTables.join(', ')}`
    }
    
    return {
      success,
      existingTables,
      missingRequiredTables,
      missingOptionalTables,
      totalTables: allDatabaseTables.length,
      message,
    }
  } catch (error) {
    return {
      success: false,
      existingTables: [],
      missingRequiredTables: REQUIRED_TABLES.map(t => t.name),
      missingOptionalTables: OPTIONAL_TABLES.map(t => t.name),
      totalTables: 0,
      message: `❌ Error verifying tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Print a detailed report of table verification
 */
export async function printTableVerificationReport(): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log('📊 DATABASE TABLE VERIFICATION REPORT')
  console.log('='.repeat(60))
  
  const result = await verifyTables()
  
  console.log(`\n${result.message}`)
  
  if (result.existingTables.length > 0) {
    console.log('\n✅ Existing Tables:')
    result.existingTables.forEach(table => {
      const tableDef = ALL_TABLES.find(t => t.name === table)
      console.log(`   - ${table}${tableDef ? ` (${tableDef.description})` : ''}`)
    })
  }
  
  if (result.missingRequiredTables.length > 0) {
    console.log('\n❌ Missing Required Tables:')
    result.missingRequiredTables.forEach(table => {
      const tableDef = REQUIRED_TABLES.find(t => t.name === table)
      console.log(`   - ${table}${tableDef ? ` (${tableDef.description})` : ''}`)
    })
    console.log('\n⚠️  WARNING: The application may not function correctly without these tables!')
  }
  
  if (result.missingOptionalTables.length > 0) {
    console.log('\n⚠️  Missing Optional Tables:')
    result.missingOptionalTables.forEach(table => {
      const tableDef = OPTIONAL_TABLES.find(t => t.name === table)
      console.log(`   - ${table}${tableDef ? ` (${tableDef.description})` : ''}`)
    })
    console.log('\nNote: These tables are optional but some features may be unavailable.')
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
}

/**
 * Verify tables and throw an error if required tables are missing
 */
export async function verifyTablesOrFail(): Promise<void> {
  const result = await verifyTables()
  
  if (!result.success) {
    throw new Error(
      `Database verification failed: Missing required tables: ${result.missingRequiredTables.join(', ')}`
    )
  }
}
