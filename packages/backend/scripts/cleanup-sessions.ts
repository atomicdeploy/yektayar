/**
 * Cleanup expired sessions script
 * Run with: npx tsx scripts/cleanup-sessions.ts
 */

import { cleanupExpiredSessions } from '../src/services/sessionService'
import { closeDb } from '../src/db/connection'

async function main() {
  try {
    console.log('Starting session cleanup...')
    const deletedCount = await cleanupExpiredSessions()
    console.log(`✓ Cleaned up ${deletedCount} expired sessions`)
    
    // Close database connection
    await closeDb()
    process.exit(0)
  } catch (error) {
    console.error('Error during cleanup:', error)
    await closeDb()
    process.exit(1)
  }
}

main()
