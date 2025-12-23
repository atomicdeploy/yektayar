#!/usr/bin/env node

/**
 * Git Management TUI (Text User Interface)
 * 
 * A feature-rich console application for managing git repository information
 * and issuing git commands.
 * 
 * Features:
 * - Display current repository information (branch, commit, status)
 * - Manage branches (list, switch, create)
 * - Update repository (fetch, pull)
 * - View modified and staged files
 * - Colorized output with emojis for better UX
 * 
 * Usage:
 *   npm run git:tui                    # Run in current directory
 *   node scripts/git-tui.js            # Run in current directory
 */

import { createInterface } from 'readline'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { 
  getGitInfo, 
  displayGitInfo, 
  fetch, 
  pull, 
  switchBranch, 
  createBranch, 
  listBranches,
  getModifiedFiles,
  getStagedFiles,
  isGitRepository
} from '../packages/shared/dist/utils/git.js'
import { logger } from '../packages/shared/dist/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get repository path from argument or use parent directory
const repoPath = process.argv[2] || join(__dirname, '..')

// ANSI color codes for styling
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
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

/**
 * Display the main menu
 */
function displayMenu() {
  logger.info('\n' + '═'.repeat(60))
  logger.custom('📦', 'Git Management TUI', 'cyan')
  logger.info('═'.repeat(60))
  
  console.log(`
${colors.cyan}${colors.bright}Main Menu:${colors.reset}

  ${colors.green}1.${colors.reset} Display repository information
  ${colors.green}2.${colors.reset} List all branches
  ${colors.green}3.${colors.reset} Switch branch
  ${colors.green}4.${colors.reset} Create new branch
  ${colors.green}5.${colors.reset} Fetch updates from remote
  ${colors.green}6.${colors.reset} Pull updates from remote
  ${colors.green}7.${colors.reset} View modified files
  ${colors.green}8.${colors.reset} View staged files
  ${colors.red}9.${colors.reset} Exit

${colors.dim}Repository: ${repoPath}${colors.reset}
  `)
}

/**
 * Display list of branches
 */
async function displayBranches() {
  logger.info('\n' + '─'.repeat(60))
  logger.custom('🌿', 'Branches', 'green')
  logger.info('─'.repeat(60))
  
  const branches = await listBranches(repoPath)
  
  branches.forEach(branch => {
    const isCurrent = branch.startsWith('*')
    const cleanName = branch.replace(/^\*\s+/, '').trim()
    
    if (isCurrent) {
      console.log(`${colors.green}${colors.bright}  → ${cleanName}${colors.reset} (current)`)
    } else if (cleanName.startsWith('remotes/')) {
      console.log(`${colors.cyan}    ${cleanName}${colors.reset}`)
    } else {
      console.log(`    ${cleanName}`)
    }
  })
  
  logger.info('─'.repeat(60))
}

/**
 * Display modified files
 */
async function displayModifiedFiles() {
  logger.info('\n' + '─'.repeat(60))
  logger.custom('📝', 'Modified Files', 'yellow')
  logger.info('─'.repeat(60))
  
  const files = await getModifiedFiles(repoPath)
  
  if (files.length === 0) {
    logger.success('No modified files')
  } else {
    files.forEach(file => {
      console.log(`${colors.yellow}  • ${file}${colors.reset}`)
    })
  }
  
  logger.info('─'.repeat(60))
}

/**
 * Display staged files
 */
async function displayStagedFiles() {
  logger.info('\n' + '─'.repeat(60))
  logger.custom('📦', 'Staged Files', 'green')
  logger.info('─'.repeat(60))
  
  const files = await getStagedFiles(repoPath)
  
  if (files.length === 0) {
    logger.info('No staged files')
  } else {
    files.forEach(file => {
      console.log(`${colors.green}  • ${file}${colors.reset}`)
    })
  }
  
  logger.info('─'.repeat(60))
}

/**
 * Prompt user for input
 */
function prompt(rl, question) {
  return new Promise(resolve => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, resolve)
  })
}

/**
 * Handle menu option
 */
async function handleMenuOption(option, rl) {
  switch (option) {
    case '1':
      // Display repository information
      await displayGitInfo(repoPath)
      break
      
    case '2':
      // List all branches
      await displayBranches()
      break
      
    case '3':
      // Switch branch
      await displayBranches()
      const branchToSwitch = await prompt(rl, '\nEnter branch name to switch to:')
      if (branchToSwitch) {
        await switchBranch(branchToSwitch.trim(), repoPath)
      }
      break
      
    case '4':
      // Create new branch
      const newBranchName = await prompt(rl, 'Enter new branch name:')
      if (newBranchName) {
        await createBranch(newBranchName.trim(), repoPath)
      }
      break
      
    case '5':
      // Fetch updates
      await fetch(repoPath)
      break
      
    case '6':
      // Pull updates
      await pull(repoPath)
      break
      
    case '7':
      // View modified files
      await displayModifiedFiles()
      break
      
    case '8':
      // View staged files
      await displayStagedFiles()
      break
      
    case '9':
      // Exit
      logger.info('\nGoodbye! 👋')
      return false
      
    default:
      logger.warn('Invalid option. Please choose 1-9.')
  }
  
  return true
}

/**
 * Main application loop
 */
async function main() {
  // Check if directory is a git repository
  const isRepo = await isGitRepository(repoPath)
  
  if (!isRepo) {
    logger.error(`Not a git repository: ${repoPath}`)
    logger.info('Please run this script from within a git repository or provide a path to one.')
    process.exit(1)
  }
  
  // Display welcome message
  logger.custom('🚀', 'Git Management TUI Started', 'magenta')
  logger.info(`Working directory: ${repoPath}\n`)
  
  // Display initial git info
  await displayGitInfo(repoPath)
  
  const rl = createReadlineInterface()
  let continueRunning = true
  
  while (continueRunning) {
    displayMenu()
    const option = await prompt(rl, 'Choose an option:')
    continueRunning = await handleMenuOption(option.trim(), rl)
  }
  
  rl.close()
  process.exit(0)
}

// Run the application
main().catch(error => {
  logger.error('Application error:', error)
  process.exit(1)
})
