/**
 * Git Management Utility
 * Provides functions for reading git information and issuing git commands
 * 
 * This utility provides two approaches:
 * 1. File-based parsing: Direct reading of .git directory files (read-only, no git command needed)
 * 2. Command-based: Executing git commands (requires git to be installed)
 * 
 * File-based methods are useful as fallbacks when git commands are not available
 * or for simple, efficient read-only operations.
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, access, readdir } from 'fs/promises'
import { join } from 'path'
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

// ============================================================================
// FILE-BASED PARSING METHODS
// These methods read and parse .git directory files directly without executing git commands
// Useful as fallbacks when git is not available or for simple read-only operations
// ============================================================================

/**
 * Get the .git directory path
 */
function getGitDir(cwd?: string): string {
  return join(cwd || process.cwd(), '.git')
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Read current branch name from .git/HEAD file
 * @param cwd - Working directory (optional)
 * @returns Branch name or null if not found
 */
export async function readBranchFromFile(cwd?: string): Promise<string | null> {
  try {
    const headPath = join(getGitDir(cwd), 'HEAD')
    const headContent = await readFile(headPath, 'utf-8')
    
    // HEAD file format: "ref: refs/heads/branch-name" or direct commit hash
    const match = headContent.trim().match(/^ref: refs\/heads\/(.+)$/)
    if (match) {
      return match[1]
    }
    
    // If HEAD contains a commit hash directly (detached HEAD state)
    if (/^[0-9a-f]{40}$/.test(headContent.trim())) {
      return 'HEAD (detached)'
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Read current commit hash from branch ref file
 * @param cwd - Working directory (optional)
 * @param branch - Branch name (optional, uses current branch if not specified)
 * @returns Commit hash or null if not found
 */
export async function readCommitFromFile(cwd?: string, branch?: string): Promise<string | null> {
  try {
    const gitDir = getGitDir(cwd)
    
    // If no branch specified, read from HEAD
    if (!branch) {
      const headPath = join(gitDir, 'HEAD')
      const headContent = await readFile(headPath, 'utf-8')
      
      // If HEAD points to a ref, read that ref
      const match = headContent.trim().match(/^ref: (.+)$/)
      if (match) {
        const refPath = join(gitDir, match[1])
        if (await fileExists(refPath)) {
          const commitHash = await readFile(refPath, 'utf-8')
          return commitHash.trim()
        }
      }
      
      // If HEAD contains a commit hash directly
      if (/^[0-9a-f]{40}$/.test(headContent.trim())) {
        return headContent.trim()
      }
    } else {
      // Read commit from specific branch ref
      const refPath = join(gitDir, 'refs', 'heads', branch)
      if (await fileExists(refPath)) {
        const commitHash = await readFile(refPath, 'utf-8')
        return commitHash.trim()
      }
    }
    
    // Try packed-refs file as fallback
    const packedRefsPath = join(gitDir, 'packed-refs')
    if (await fileExists(packedRefsPath)) {
      const packedContent = await readFile(packedRefsPath, 'utf-8')
      const refName = branch ? `refs/heads/${branch}` : 'HEAD'
      const lines = packedContent.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('#')) continue
        const [hash, ref] = line.split(' ')
        if (ref && ref.trim() === refName && hash) {
          return hash.trim()
        }
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Read remote URL from .git/config file
 * @param cwd - Working directory (optional)
 * @param remoteName - Remote name (default: 'origin')
 * @returns Remote URL or null if not found
 */
export async function readRemoteFromFile(cwd?: string, remoteName: string = 'origin'): Promise<string | null> {
  try {
    const configPath = join(getGitDir(cwd), 'config')
    const configContent = await readFile(configPath, 'utf-8')
    
    // Parse simple git config format
    // Looking for: [remote "origin"] followed by url = ...
    const lines = configContent.split('\n')
    let inRemoteSection = false
    let currentRemote = ''
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Check for remote section header: [remote "origin"]
      const remoteSectionMatch = trimmedLine.match(/^\[remote "(.+)"\]$/)
      if (remoteSectionMatch) {
        currentRemote = remoteSectionMatch[1]
        inRemoteSection = currentRemote === remoteName
        continue
      }
      
      // Check for new section (exit remote section)
      if (trimmedLine.startsWith('[')) {
        inRemoteSection = false
        continue
      }
      
      // If we're in the right remote section, look for url
      if (inRemoteSection) {
        const urlMatch = trimmedLine.match(/^url\s*=\s*(.+)$/)
        if (urlMatch) {
          return urlMatch[1].trim()
        }
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * List all local branches from .git/refs/heads directory
 * @param cwd - Working directory (optional)
 * @returns Array of branch names
 */
export async function readBranchesFromFile(cwd?: string): Promise<string[]> {
  try {
    const refsHeadsPath = join(getGitDir(cwd), 'refs', 'heads')
    
    async function readBranchesRecursive(dir: string, prefix: string = ''): Promise<string[]> {
      const branches: string[] = []
      
      try {
        const entries = await readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            // Recursively read subdirectories (for branches like feature/branch-name)
            const subBranches = await readBranchesRecursive(
              join(dir, entry.name),
              prefix ? `${prefix}/${entry.name}` : entry.name
            )
            branches.push(...subBranches)
          } else if (entry.isFile()) {
            const branchName = prefix ? `${prefix}/${entry.name}` : entry.name
            branches.push(branchName)
          }
        }
      } catch {
        // Ignore errors in subdirectories
      }
      
      return branches
    }
    
    return await readBranchesRecursive(refsHeadsPath)
  } catch {
    return []
  }
}

/**
 * List all tags from .git/refs/tags directory
 * @param cwd - Working directory (optional)
 * @returns Array of tag names
 */
export async function readTagsFromFile(cwd?: string): Promise<string[]> {
  try {
    const refsTagsPath = join(getGitDir(cwd), 'refs', 'tags')
    
    if (!(await fileExists(refsTagsPath))) {
      return []
    }
    
    const entries = await readdir(refsTagsPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isFile())
      .map(entry => entry.name)
  } catch {
    return []
  }
}

/**
 * Check if repository is a git repository by checking for .git directory
 * @param cwd - Working directory (optional)
 * @returns True if .git directory exists
 */
export async function isGitRepositoryFromFile(cwd?: string): Promise<boolean> {
  try {
    const gitDir = getGitDir(cwd)
    return await fileExists(gitDir)
  } catch {
    return false
  }
}

/**
 * Get basic git info from files (without executing git commands)
 * This is useful as a fallback when git commands are not available
 * @param cwd - Working directory (optional)
 * @returns Object with branch, commit, and remote information
 */
export async function getGitInfoFromFiles(cwd?: string): Promise<{
  branch: string | null
  commit: string | null
  shortCommit: string | null
  remote: string | null
  branches: string[]
  tags: string[]
  isRepository: boolean
}> {
  const isRepo = await isGitRepositoryFromFile(cwd)
  
  if (!isRepo) {
    return {
      branch: null,
      commit: null,
      shortCommit: null,
      remote: null,
      branches: [],
      tags: [],
      isRepository: false
    }
  }
  
  const [branch, commit, remote, branches, tags] = await Promise.all([
    readBranchFromFile(cwd),
    readCommitFromFile(cwd),
    readRemoteFromFile(cwd),
    readBranchesFromFile(cwd),
    readTagsFromFile(cwd)
  ])
  
  return {
    branch,
    commit,
    shortCommit: commit ? commit.substring(0, 7) : null,
    remote,
    branches,
    tags,
    isRepository: true
  }
}

/**
 * Get git info with fallback support
 * Tries file-based parsing first, falls back to git commands if needed
 * @param cwd - Working directory (optional)
 * @param preferFiles - If true, tries file-based methods first (default: true)
 * @returns Object with available git information
 */
export async function getGitInfoWithFallback(cwd?: string, preferFiles: boolean = true): Promise<{
  branch: string
  commit: string
  shortCommit: string
  remote: string
  fromFiles: boolean
}> {
  if (preferFiles) {
    // Try file-based approach first
    const fileInfo = await getGitInfoFromFiles(cwd)
    
    if (fileInfo.isRepository && fileInfo.branch && fileInfo.commit) {
      return {
        branch: fileInfo.branch,
        commit: fileInfo.commit,
        shortCommit: fileInfo.shortCommit || fileInfo.commit.substring(0, 7),
        remote: fileInfo.remote || 'unknown',
        fromFiles: true
      }
    }
  }
  
  // Fall back to git commands
  const [branch, commit, shortCommit, remote] = await Promise.all([
    getCurrentBranch(cwd),
    getCurrentCommit(cwd),
    getShortCommit(cwd),
    getRemoteUrl('origin', cwd)
  ])
  
  return {
    branch,
    commit,
    shortCommit,
    remote,
    fromFiles: false
  }
}

// ============================================================================
// COMMAND-BASED METHODS
// These methods execute git commands and require git to be installed
// ============================================================================

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
