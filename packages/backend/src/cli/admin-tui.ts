#!/usr/bin/env -S npx tsx

/**
 * Backend Administration TUI (Text User Interface)
 * 
 * A comprehensive interactive console application for backend administration
 * and session management without requiring web API calls.
 * 
 * Features:
 * - Session management (list, view, delete, cleanup)
 * - User management (list, view, activate/deactivate)
 * - Database statistics and health checks
 * - System monitoring
 * - Interactive menu with colored output
 * - Direct database access (no REST API required)
 * 
 * Usage:
 *   npm run admin:tui            # From backend directory
 *   npm run admin:tui -w @yektayar/backend   # From root
 *   npx tsx src/cli/admin-tui.ts # Direct execution
 */

import { createInterface } from 'readline'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getDatabase, closeDatabase } from '../services/database.js'
import { cleanupExpiredSessions } from '../services/sessionService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '../../../../.env') })

// ANSI color codes and emojis for rich console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m'
}

const emojis = {
  rocket: '🚀',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  hourglass: '⏳',
  sparkles: '✨',
  fire: '🔥',
  tools: '🔧',
  chart: '📊',
  database: '💾',
  users: '👥',
  user: '👤',
  clock: '⏱️',
  calendar: '📅',
  trash: '🗑️',
  shield: '🛡️',
  key: '🔑',
  globe: '🌐',
  search: '🔍',
  list: '📋',
  stats: '📈',
  health: '🏥',
  lock: '🔒',
  unlock: '🔓',
  refresh: '🔄'
}

/**
 * Display styled header
 */
function displayHeader() {
  console.clear()
  console.log(`${colors.cyan}${colors.bright}`)
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║                                                               ║')
  console.log('║        Backend Administration TUI                             ║')
  console.log('║        YektaYar Platform                                      ║')
  console.log('║                                                               ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log(colors.reset)
}

/**
 * Print colored and styled message
 */
function print(message: string, color: string = 'white', emoji: string = '') {
  const colorCode = colors[color as keyof typeof colors] || colors.white
  const emojiStr = emoji ? `${emoji} ` : ''
  console.log(`${colorCode}${emojiStr}${message}${colors.reset}`)
}

/**
 * Print error message
 */
function printError(message: string, details?: string) {
  print(`ERROR: ${message}`, 'red', emojis.cross)
  if (details) {
    console.log(`${colors.dim}${details}${colors.reset}`)
  }
}

/**
 * Print success message
 */
function printSuccess(message: string) {
  print(message, 'green', emojis.check)
}

/**
 * Print info message
 */
function printInfo(message: string) {
  print(message, 'cyan', emojis.info)
}

/**
 * Print warning message
 */
function printWarning(message: string) {
  print(message, 'yellow', emojis.warning)
}

/**
 * Print section header
 */
function printSection(title: string) {
  console.log('')
  print(`═══ ${title} ═══`, 'cyan', emojis.sparkles)
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString()
}

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
}

/**
 * Get user input
 */
function getUserInput(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * Display database connection status
 */
async function checkDatabaseConnection() {
  printSection('Database Connection Status')
  
  try {
    const db = getDatabase()
    
    // Test query
    const result = await db`SELECT NOW() as current_time, version() as version`
    
    if (result.length > 0) {
      printSuccess('Database connection is healthy')
      print(`Server time: ${formatDate(result[0].current_time)}`, 'dim')
      print(`PostgreSQL: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`, 'dim')
      
      // Get database size
      const sizeResult = await db`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `
      print(`Database size: ${sizeResult[0].size}`, 'dim')
      
      return true
    }
  } catch (error: any) {
    printError('Failed to connect to database', error.message)
    return false
  }
}

/**
 * List all sessions with filtering
 */
async function listSessions(filter: string = 'all') {
  printSection(`Sessions List (${filter})`)
  
  try {
    const db = getDatabase()
    
    let query
    if (filter === 'active') {
      query = db`
        SELECT 
          id, token, user_id, is_logged_in, 
          created_at, expires_at, last_activity_at,
          metadata
        FROM sessions 
        WHERE expires_at > NOW()
        ORDER BY last_activity_at DESC
        LIMIT 50
      `
    } else if (filter === 'expired') {
      query = db`
        SELECT 
          id, token, user_id, is_logged_in, 
          created_at, expires_at, last_activity_at,
          metadata
        FROM sessions 
        WHERE expires_at <= NOW()
        ORDER BY expires_at DESC
        LIMIT 50
      `
    } else if (filter === 'logged-in') {
      query = db`
        SELECT 
          id, token, user_id, is_logged_in, 
          created_at, expires_at, last_activity_at,
          metadata
        FROM sessions 
        WHERE is_logged_in = true AND expires_at > NOW()
        ORDER BY last_activity_at DESC
        LIMIT 50
      `
    } else {
      query = db`
        SELECT 
          id, token, user_id, is_logged_in, 
          created_at, expires_at, last_activity_at,
          metadata
        FROM sessions 
        ORDER BY created_at DESC
        LIMIT 50
      `
    }
    
    const sessions = await query
    
    if (sessions.length === 0) {
      printWarning('No sessions found')
      return
    }
    
    print(`Found ${sessions.length} session(s)`, 'dim')
    console.log('')
    
    // Display sessions in a table-like format
    console.log(`${colors.dim}${'ID'.padEnd(6)} ${'Token'.padEnd(20)} ${'User ID'.padEnd(8)} ${'Logged In'.padEnd(10)} ${'Created'.padEnd(20)} ${'Status'.padEnd(10)}${colors.reset}`)
    console.log(`${colors.dim}${'─'.repeat(100)}${colors.reset}`)
    
    for (const session of sessions) {
      const isExpired = new Date(session.expires_at) <= new Date()
      const statusColor = isExpired ? 'red' : 'green'
      const status = isExpired ? '❌ Expired' : '✅ Active'
      const loggedIn = session.is_logged_in ? '✓' : '✗'
      
      const id = String(session.id).padEnd(6)
      const token = session.token.substring(0, 18) + '...'
      const userId = session.user_id ? String(session.user_id).padEnd(8) : 'N/A'.padEnd(8)
      const isLoggedIn = loggedIn.padEnd(10)
      const created = formatRelativeTime(session.created_at).padEnd(20)
      
      console.log(`${id} ${token} ${userId} ${isLoggedIn} ${created} ${colors[statusColor as keyof typeof colors]}${status}${colors.reset}`)
    }
    
    console.log('')
  } catch (error: any) {
    printError('Failed to list sessions', error.message)
  }
}

/**
 * View detailed session information
 */
async function viewSessionDetails(sessionId: string) {
  printSection('Session Details')
  
  try {
    const db = getDatabase()
    
    const sessions = await db`
      SELECT 
        s.id, s.token, s.user_id, s.is_logged_in, 
        s.created_at, s.expires_at, s.last_activity_at,
        s.metadata,
        u.name as user_name, u.email as user_email, u.type as user_type
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ${parseInt(sessionId)}
    `
    
    if (sessions.length === 0) {
      printError('Session not found')
      return
    }
    
    const session = sessions[0]
    const isExpired = new Date(session.expires_at) <= new Date()
    
    console.log('')
    console.log(`${colors.bright}Session ID:${colors.reset} ${session.id}`)
    console.log(`${colors.bright}Token:${colors.reset} ${session.token}`)
    console.log(`${colors.bright}Status:${colors.reset} ${isExpired ? colors.red + '❌ Expired' : colors.green + '✅ Active'}${colors.reset}`)
    console.log(`${colors.bright}Logged In:${colors.reset} ${session.is_logged_in ? '✓ Yes' : '✗ No'}`)
    console.log('')
    console.log(`${colors.bright}User Information:${colors.reset}`)
    if (session.user_id) {
      console.log(`  ID: ${session.user_id}`)
      console.log(`  Name: ${session.user_name || 'N/A'}`)
      console.log(`  Email: ${session.user_email || 'N/A'}`)
      console.log(`  Type: ${session.user_type || 'N/A'}`)
    } else {
      console.log(`  ${colors.dim}Anonymous session${colors.reset}`)
    }
    console.log('')
    console.log(`${colors.bright}Timestamps:${colors.reset}`)
    console.log(`  Created: ${formatDate(session.created_at)} (${formatRelativeTime(session.created_at)})`)
    console.log(`  Expires: ${formatDate(session.expires_at)}`)
    console.log(`  Last Activity: ${formatDate(session.last_activity_at)} (${formatRelativeTime(session.last_activity_at)})`)
    console.log('')
    
    if (session.metadata && Object.keys(session.metadata).length > 0) {
      console.log(`${colors.bright}Metadata:${colors.reset}`)
      console.log(JSON.stringify(session.metadata, null, 2))
      console.log('')
    }
  } catch (error: any) {
    printError('Failed to view session details', error.message)
  }
}

/**
 * Delete/invalidate a session
 */
async function deleteSession(sessionId: string) {
  printSection('Delete Session')
  
  try {
    const db = getDatabase()
    
    const confirmation = await getUserInput(`Are you sure you want to delete session ${sessionId}? (yes/no):`)
    
    if (confirmation.toLowerCase() !== 'yes') {
      printInfo('Operation cancelled')
      return
    }
    
    const result = await db`
      DELETE FROM sessions 
      WHERE id = ${parseInt(sessionId)}
      RETURNING id
    `
    
    if (result.length > 0) {
      printSuccess(`Session ${sessionId} deleted successfully`)
    } else {
      printWarning('Session not found or already deleted')
    }
  } catch (error: any) {
    printError('Failed to delete session', error.message)
  }
}

/**
 * Clean up expired sessions
 */
async function cleanupSessions() {
  printSection('Cleanup Expired Sessions')
  
  try {
    print('Cleaning up expired sessions...', 'cyan', emojis.hourglass)
    
    const count = await cleanupExpiredSessions()
    
    if (count > 0) {
      printSuccess(`Cleaned up ${count} expired session(s)`)
    } else {
      printInfo('No expired sessions to clean up')
    }
  } catch (error: any) {
    printError('Failed to cleanup sessions', error.message)
  }
}

/**
 * Display session statistics
 */
async function displaySessionStats() {
  printSection('Session Statistics')
  
  try {
    const db = getDatabase()
    
    // Total sessions
    const totalResult = await db`SELECT COUNT(*) as count FROM sessions`
    const total = parseInt(totalResult[0].count)
    
    // Active sessions
    const activeResult = await db`SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()`
    const active = parseInt(activeResult[0].count)
    
    // Expired sessions
    const expiredResult = await db`SELECT COUNT(*) as count FROM sessions WHERE expires_at <= NOW()`
    const expired = parseInt(expiredResult[0].count)
    
    // Logged in sessions
    const loggedInResult = await db`SELECT COUNT(*) as count FROM sessions WHERE is_logged_in = true AND expires_at > NOW()`
    const loggedIn = parseInt(loggedInResult[0].count)
    
    // Anonymous sessions
    const anonymousResult = await db`SELECT COUNT(*) as count FROM sessions WHERE is_logged_in = false AND expires_at > NOW()`
    const anonymous = parseInt(anonymousResult[0].count)
    
    // Sessions created today
    const todayResult = await db`SELECT COUNT(*) as count FROM sessions WHERE created_at >= CURRENT_DATE`
    const today = parseInt(todayResult[0].count)
    
    // Sessions created this week
    const weekResult = await db`SELECT COUNT(*) as count FROM sessions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    const week = parseInt(weekResult[0].count)
    
    console.log('')
    print('Overview:', 'bright')
    console.log(`  Total Sessions: ${total}`)
    console.log(`  ${colors.green}Active: ${active}${colors.reset}`)
    console.log(`  ${colors.red}Expired: ${expired}${colors.reset}`)
    console.log('')
    print('Active Sessions Breakdown:', 'bright')
    console.log(`  Logged In: ${loggedIn}`)
    console.log(`  Anonymous: ${anonymous}`)
    console.log('')
    print('Recent Activity:', 'bright')
    console.log(`  Created Today: ${today}`)
    console.log(`  Created This Week: ${week}`)
    console.log('')
  } catch (error: any) {
    printError('Failed to get session statistics', error.message)
  }
}

/**
 * List users
 */
async function listUsers() {
  printSection('Users List')
  
  try {
    const db = getDatabase()
    
    const users = await db`
      SELECT id, name, email, phone, type, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `
    
    if (users.length === 0) {
      printWarning('No users found')
      return
    }
    
    print(`Found ${users.length} user(s)`, 'dim')
    console.log('')
    
    // Display users in a table-like format
    console.log(`${colors.dim}${'ID'.padEnd(6)} ${'Name'.padEnd(25)} ${'Email'.padEnd(30)} ${'Type'.padEnd(15)} ${'Active'.padEnd(8)}${colors.reset}`)
    console.log(`${colors.dim}${'─'.repeat(100)}${colors.reset}`)
    
    for (const user of users) {
      const id = String(user.id).padEnd(6)
      const name = user.name.substring(0, 23).padEnd(25)
      const email = (user.email || user.phone || 'N/A').substring(0, 28).padEnd(30)
      const type = user.type.padEnd(15)
      const active = user.is_active ? '✅ Yes' : '❌ No'
      
      console.log(`${id} ${name} ${email} ${type} ${active}`)
    }
    
    console.log('')
  } catch (error: any) {
    printError('Failed to list users', error.message)
  }
}

/**
 * View user details
 */
async function viewUserDetails(userId: string) {
  printSection('User Details')
  
  try {
    const db = getDatabase()
    
    const users = await db`
      SELECT 
        id, name, email, phone, type, avatar, bio, 
        specialization, is_active, created_at, updated_at
      FROM users
      WHERE id = ${parseInt(userId)}
    `
    
    if (users.length === 0) {
      printError('User not found')
      return
    }
    
    const user = users[0]
    
    console.log('')
    console.log(`${colors.bright}User ID:${colors.reset} ${user.id}`)
    console.log(`${colors.bright}Name:${colors.reset} ${user.name}`)
    console.log(`${colors.bright}Email:${colors.reset} ${user.email || 'N/A'}`)
    console.log(`${colors.bright}Phone:${colors.reset} ${user.phone || 'N/A'}`)
    console.log(`${colors.bright}Type:${colors.reset} ${user.type}`)
    console.log(`${colors.bright}Active:${colors.reset} ${user.is_active ? '✅ Yes' : '❌ No'}`)
    console.log('')
    
    if (user.bio) {
      console.log(`${colors.bright}Bio:${colors.reset} ${user.bio}`)
      console.log('')
    }
    
    if (user.specialization) {
      console.log(`${colors.bright}Specialization:${colors.reset} ${user.specialization}`)
      console.log('')
    }
    
    console.log(`${colors.bright}Timestamps:${colors.reset}`)
    console.log(`  Created: ${formatDate(user.created_at)}`)
    console.log(`  Updated: ${formatDate(user.updated_at)}`)
    console.log('')
    
    // Get user's active sessions
    const sessions = await db`
      SELECT COUNT(*) as count 
      FROM sessions 
      WHERE user_id = ${parseInt(userId)} AND expires_at > NOW()
    `
    console.log(`${colors.bright}Active Sessions:${colors.reset} ${sessions[0].count}`)
    console.log('')
  } catch (error: any) {
    printError('Failed to view user details', error.message)
  }
}

/**
 * Display system health
 */
async function displaySystemHealth() {
  printSection('System Health')
  
  try {
    const db = getDatabase()
    
    // Check database tables
    const tables = await db`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    printSuccess(`Database tables: ${tables.length}`)
    print(tables.map(t => t.tablename).join(', '), 'dim')
    console.log('')
    
    // Check total records in main tables
    const usersCount = await db`SELECT COUNT(*) as count FROM users`
    const sessionsCount = await db`SELECT COUNT(*) as count FROM sessions`
    const appointmentsCount = await db`SELECT COUNT(*) as count FROM appointments`
    const coursesCount = await db`SELECT COUNT(*) as count FROM courses`
    
    console.log(`${colors.bright}Records:${colors.reset}`)
    console.log(`  Users: ${usersCount[0].count}`)
    console.log(`  Sessions: ${sessionsCount[0].count}`)
    console.log(`  Appointments: ${appointmentsCount[0].count}`)
    console.log(`  Courses: ${coursesCount[0].count}`)
    console.log('')
    
    // Check for database issues
    const expiredSessions = await db`SELECT COUNT(*) as count FROM sessions WHERE expires_at <= NOW()`
    if (parseInt(expiredSessions[0].count) > 0) {
      printWarning(`${expiredSessions[0].count} expired sessions need cleanup`)
    }
    
    printSuccess('System is healthy')
  } catch (error: any) {
    printError('Failed to check system health', error.message)
  }
}

/**
 * Display interactive menu
 */
function displayMenu() {
  console.log('')
  print('═══ Available Actions ═══', 'cyan', emojis.tools)
  console.log('')
  print('Session Management:', 'bright')
  console.log(`  ${colors.bright}1${colors.reset} - List all sessions`)
  console.log(`  ${colors.bright}2${colors.reset} - List active sessions`)
  console.log(`  ${colors.bright}3${colors.reset} - List expired sessions`)
  console.log(`  ${colors.bright}4${colors.reset} - List logged-in sessions`)
  console.log(`  ${colors.bright}5${colors.reset} - View session details`)
  console.log(`  ${colors.bright}6${colors.reset} - Delete session`)
  console.log(`  ${colors.bright}7${colors.reset} - Cleanup expired sessions`)
  console.log(`  ${colors.bright}8${colors.reset} - Session statistics`)
  console.log('')
  print('User Management:', 'bright')
  console.log(`  ${colors.bright}9${colors.reset} - List users`)
  console.log(`  ${colors.bright}10${colors.reset} - View user details`)
  console.log('')
  print('System:', 'bright')
  console.log(`  ${colors.bright}11${colors.reset} - Database connection status`)
  console.log(`  ${colors.bright}12${colors.reset} - System health check`)
  console.log('')
  console.log(`  ${colors.bright}h${colors.reset} - Show this menu`)
  console.log(`  ${colors.bright}q${colors.reset} - Quit`)
  console.log('')
}

/**
 * Process user command
 */
async function processCommand(command: string): Promise<boolean> {
  switch (command) {
    case '1':
      await listSessions('all')
      break
      
    case '2':
      await listSessions('active')
      break
      
    case '3':
      await listSessions('expired')
      break
      
    case '4':
      await listSessions('logged-in')
      break
      
    case '5': {
      const sessionId = await getUserInput('Enter session ID:')
      if (sessionId) {
        await viewSessionDetails(sessionId)
      }
      break
    }
      
    case '6': {
      const sessionId = await getUserInput('Enter session ID to delete:')
      if (sessionId) {
        await deleteSession(sessionId)
      }
      break
    }
      
    case '7':
      await cleanupSessions()
      break
      
    case '8':
      await displaySessionStats()
      break
      
    case '9':
      await listUsers()
      break
      
    case '10': {
      const userId = await getUserInput('Enter user ID:')
      if (userId) {
        await viewUserDetails(userId)
      }
      break
    }
      
    case '11':
      await checkDatabaseConnection()
      break
      
    case '12':
      await displaySystemHealth()
      break
      
    case 'h':
      displayMenu()
      break
      
    case 'q':
      return false
      
    default:
      printWarning('Unknown command. Type "h" for help.')
  }
  
  return true
}

/**
 * Main interactive loop
 */
async function interactiveLoop() {
  displayMenu()
  
  let running = true
  while (running) {
    const command = await getUserInput('Enter command (h for help):')
    running = await processCommand(command)
  }
}

/**
 * Cleanup and exit
 */
async function cleanup() {
  print('Cleaning up...', 'yellow', emojis.tools)
  
  try {
    await closeDatabase()
    printSuccess('Database connection closed')
  } catch (error) {
    // Ignore cleanup errors
  }
  
  printSuccess('Goodbye!')
  process.exit(0)
}

/**
 * Main function
 */
async function main() {
  // Handle graceful shutdown
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  displayHeader()
  
  printInfo('Backend Administration TUI')
  printInfo('Direct database access - no REST API required')
  console.log('')
  
  // Check database connection
  const dbConnected = await checkDatabaseConnection()
  
  if (!dbConnected) {
    printError('Cannot proceed without database connection')
    printInfo('Please check your DATABASE_URL environment variable')
    process.exit(1)
  }
  
  console.log('')
  
  // Enter interactive mode
  await interactiveLoop()
  
  // Cleanup
  await cleanup()
}

// Run the application
main().catch((error) => {
  printError('Fatal error', error.message)
  console.error(error)
  process.exit(1)
})
