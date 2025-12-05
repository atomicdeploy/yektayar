/**
 * Git Management Utility
 * Provides functions for reading git information and issuing git commands
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from './logger.js'

const execAsync = promisify(exec)

/**
 * Git repository information
 */
export interface GitInfo {
  branch: string
  commit: string
  shortCommit: string
  remote: string
  status: string
  isDirty: boolean
  ahead: number
  behind: number
  lastCommitMessage: string
  lastCommitAuthor: string
  lastCommitDate: string
  tags: string[]
}

/**
 * Git command result
 */
export interface GitCommandResult {
  success: boolean
  output: string
  error?: string
}

/**
 * Execute a git command
 */
async function executeGitCommand(command: string, cwd?: string): Promise<GitCommandResult> {
  try {
    const { stdout, stderr } = await execAsync(command, { 
      cwd: cwd || process.cwd(),
      maxBuffer: 1024 * 1024 // 1MB buffer
    })
    return {
      success: true,
      output: stdout.trim(),
      error: stderr.trim() || undefined
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message
    }
  }
}

/**
 * Get current git branch name
 */
export async function getCurrentBranch(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git rev-parse --abbrev-ref HEAD', cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get current commit hash
 */
export async function getCurrentCommit(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git rev-parse HEAD', cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get short commit hash (7 characters)
 */
export async function getShortCommit(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git rev-parse --short HEAD', cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get remote URL
 */
export async function getRemoteUrl(remoteName: string = 'origin', cwd?: string): Promise<string> {
  const result = await executeGitCommand(`git remote get-url ${remoteName}`, cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get git status
 */
export async function getStatus(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git status --porcelain', cwd)
  return result.output
}

/**
 * Check if repository has uncommitted changes
 */
export async function isDirty(cwd?: string): Promise<boolean> {
  const status = await getStatus(cwd)
  return status.length > 0
}

/**
 * Get number of commits ahead of remote
 */
export async function getCommitsAhead(cwd?: string): Promise<number> {
  const result = await executeGitCommand('git rev-list --count @{u}..HEAD', cwd)
  return result.success ? parseInt(result.output) || 0 : 0
}

/**
 * Get number of commits behind remote
 */
export async function getCommitsBehind(cwd?: string): Promise<number> {
  const result = await executeGitCommand('git rev-list --count HEAD..@{u}', cwd)
  return result.success ? parseInt(result.output) || 0 : 0
}

/**
 * Get last commit message
 */
export async function getLastCommitMessage(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git log -1 --pretty=%B', cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get last commit author
 */
export async function getLastCommitAuthor(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git log -1 --pretty=%an', cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get last commit date
 */
export async function getLastCommitDate(cwd?: string): Promise<string> {
  const result = await executeGitCommand('git log -1 --pretty=%ai', cwd)
  return result.success ? result.output : 'unknown'
}

/**
 * Get tags pointing to current commit
 */
export async function getCurrentTags(cwd?: string): Promise<string[]> {
  const result = await executeGitCommand('git tag --points-at HEAD', cwd)
  return result.success && result.output ? result.output.split('\n').filter(Boolean) : []
}

/**
 * Get comprehensive git repository information
 */
export async function getGitInfo(cwd?: string): Promise<GitInfo> {
  const [
    branch,
    commit,
    shortCommit,
    remote,
    status,
    dirty,
    ahead,
    behind,
    lastCommitMessage,
    lastCommitAuthor,
    lastCommitDate,
    tags
  ] = await Promise.all([
    getCurrentBranch(cwd),
    getCurrentCommit(cwd),
    getShortCommit(cwd),
    getRemoteUrl('origin', cwd),
    getStatus(cwd),
    isDirty(cwd),
    getCommitsAhead(cwd),
    getCommitsBehind(cwd),
    getLastCommitMessage(cwd),
    getLastCommitAuthor(cwd),
    getLastCommitDate(cwd),
    getCurrentTags(cwd)
  ])

  return {
    branch,
    commit,
    shortCommit,
    remote,
    status,
    isDirty: dirty,
    ahead,
    behind,
    lastCommitMessage,
    lastCommitAuthor,
    lastCommitDate,
    tags
  }
}

/**
 * Display git information using logger
 */
export async function displayGitInfo(cwd?: string): Promise<void> {
  const info = await getGitInfo(cwd)
  
  const separator = '─'.repeat(60)
  logger.custom('📦', 'Git Repository Information', 'cyan')
  logger.info(separator)
  
  logger.custom('🌿', `Branch: ${info.branch}`, 'green')
  logger.custom('📌', `Commit: ${info.shortCommit} (${info.commit.substring(0, 16)}...)`, 'cyan')
  
  if (info.tags.length > 0) {
    logger.custom('🏷️', `Tags: ${info.tags.join(', ')}`, 'yellow')
  }
  
  logger.custom('🔗', `Remote: ${info.remote}`, 'cyan')
  logger.custom(info.isDirty ? '⚠️' : '✅', `Status: ${info.isDirty ? 'Dirty (uncommitted changes)' : 'Clean'}`, info.isDirty ? 'yellow' : 'green')
  
  if (info.ahead > 0) {
    logger.custom('⬆️', `Ahead: ${info.ahead} commit(s)`, 'yellow')
  }
  
  if (info.behind > 0) {
    logger.custom('⬇️', `Behind: ${info.behind} commit(s)`, 'yellow')
  }
  
  logger.info(separator)
  logger.custom('💬', `Last Commit: ${info.lastCommitMessage}`, 'cyan')
  logger.custom('👤', `Author: ${info.lastCommitAuthor}`, 'cyan')
  logger.custom('⏰', `Date: ${info.lastCommitDate}`, 'cyan')
  logger.info(separator)
}

/**
 * Fetch updates from remote
 */
export async function fetch(cwd?: string): Promise<GitCommandResult> {
  logger.info('Fetching updates from remote...')
  const result = await executeGitCommand('git fetch', cwd)
  
  if (result.success) {
    logger.success('Successfully fetched updates')
  } else {
    logger.error('Failed to fetch updates', result.error)
  }
  
  return result
}

/**
 * Pull updates from remote
 */
export async function pull(cwd?: string): Promise<GitCommandResult> {
  logger.info('Pulling updates from remote...')
  const result = await executeGitCommand('git pull', cwd)
  
  if (result.success) {
    logger.success('Successfully pulled updates')
  } else {
    logger.error('Failed to pull updates', result.error)
  }
  
  return result
}

/**
 * Switch to a different branch
 */
export async function switchBranch(branchName: string, cwd?: string): Promise<GitCommandResult> {
  logger.info(`Switching to branch: ${branchName}`)
  const result = await executeGitCommand(`git checkout ${branchName}`, cwd)
  
  if (result.success) {
    logger.success(`Successfully switched to branch: ${branchName}`)
  } else {
    logger.error(`Failed to switch to branch: ${branchName}`, result.error)
  }
  
  return result
}

/**
 * Create and switch to a new branch
 */
export async function createBranch(branchName: string, cwd?: string): Promise<GitCommandResult> {
  logger.info(`Creating new branch: ${branchName}`)
  const result = await executeGitCommand(`git checkout -b ${branchName}`, cwd)
  
  if (result.success) {
    logger.success(`Successfully created and switched to branch: ${branchName}`)
  } else {
    logger.error(`Failed to create branch: ${branchName}`, result.error)
  }
  
  return result
}

/**
 * List all branches
 */
export async function listBranches(cwd?: string): Promise<string[]> {
  const result = await executeGitCommand('git branch -a', cwd)
  
  if (result.success) {
    return result.output
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
  }
  
  return []
}

/**
 * Get list of modified files
 */
export async function getModifiedFiles(cwd?: string): Promise<string[]> {
  const result = await executeGitCommand('git diff --name-only', cwd)
  
  if (result.success) {
    return result.output.split('\n').filter(Boolean)
  }
  
  return []
}

/**
 * Get list of staged files
 */
export async function getStagedFiles(cwd?: string): Promise<string[]> {
  const result = await executeGitCommand('git diff --cached --name-only', cwd)
  
  if (result.success) {
    return result.output.split('\n').filter(Boolean)
  }
  
  return []
}

/**
 * Check if directory is a git repository
 */
export async function isGitRepository(cwd?: string): Promise<boolean> {
  const result = await executeGitCommand('git rev-parse --is-inside-work-tree', cwd)
  return result.success && result.output === 'true'
}
