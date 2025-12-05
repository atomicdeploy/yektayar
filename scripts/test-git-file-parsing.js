#!/usr/bin/env node

/**
 * Test script for file-based git parsing methods
 * Tests that the new file-based methods work correctly
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  readBranchFromFile,
  readCommitFromFile,
  readRemoteFromFile,
  readBranchesFromFile,
  readTagsFromFile,
  getGitInfoFromFiles,
  getGitInfoWithFallback,
  isGitRepositoryFromFile
} from '../packages/shared/dist/utils/git.js'
import { logger } from '../packages/shared/dist/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoPath = join(__dirname, '..')

async function testFileParsing() {
  logger.custom('🧪', 'Testing File-Based Git Parsing Methods', 'cyan')
  logger.info('═'.repeat(60))
  
  // Test 1: Check if repository
  logger.info('\n1. Testing isGitRepositoryFromFile...')
  const isRepo = await isGitRepositoryFromFile(repoPath)
  logger.custom(isRepo ? '✅' : '❌', `Is Git Repository: ${isRepo}`, isRepo ? 'green' : 'red')
  
  // Test 2: Read branch from file
  logger.info('\n2. Testing readBranchFromFile...')
  const branch = await readBranchFromFile(repoPath)
  logger.custom(branch ? '✅' : '❌', `Current Branch: ${branch}`, branch ? 'green' : 'yellow')
  
  // Test 3: Read commit from file
  logger.info('\n3. Testing readCommitFromFile...')
  const commit = await readCommitFromFile(repoPath)
  logger.custom(commit ? '✅' : '❌', `Current Commit: ${commit?.substring(0, 7)}... (${commit})`, commit ? 'green' : 'yellow')
  
  // Test 4: Read remote from file
  logger.info('\n4. Testing readRemoteFromFile...')
  const remote = await readRemoteFromFile(repoPath)
  logger.custom(remote ? '✅' : '❌', `Remote URL: ${remote}`, remote ? 'green' : 'yellow')
  
  // Test 5: List branches
  logger.info('\n5. Testing readBranchesFromFile...')
  const branches = await readBranchesFromFile(repoPath)
  logger.custom(branches.length > 0 ? '✅' : '⚠️', `Found ${branches.length} local branch(es)`, branches.length > 0 ? 'green' : 'yellow')
  if (branches.length > 0 && branches.length <= 10) {
    branches.forEach(b => logger.info(`  - ${b}`))
  }
  
  // Test 6: List tags
  logger.info('\n6. Testing readTagsFromFile...')
  const tags = await readTagsFromFile(repoPath)
  logger.custom('ℹ️', `Found ${tags.length} tag(s)`, 'cyan')
  if (tags.length > 0 && tags.length <= 10) {
    tags.forEach(t => logger.info(`  - ${t}`))
  }
  
  // Test 7: Get all info from files
  logger.info('\n7. Testing getGitInfoFromFiles...')
  const fileInfo = await getGitInfoFromFiles(repoPath)
  logger.success('Complete git info from files:')
  logger.info(`  Branch: ${fileInfo.branch}`)
  logger.info(`  Commit: ${fileInfo.commit}`)
  logger.info(`  Short Commit: ${fileInfo.shortCommit}`)
  logger.info(`  Remote: ${fileInfo.remote}`)
  logger.info(`  Branches: ${fileInfo.branches.length}`)
  logger.info(`  Tags: ${fileInfo.tags.length}`)
  logger.info(`  Is Repository: ${fileInfo.isRepository}`)
  
  // Test 8: Test fallback mechanism
  logger.info('\n8. Testing getGitInfoWithFallback (file-first)...')
  const fallbackInfo = await getGitInfoWithFallback(repoPath, true)
  logger.success('Git info with fallback:')
  logger.info(`  Branch: ${fallbackInfo.branch}`)
  logger.info(`  Commit: ${fallbackInfo.commit}`)
  logger.info(`  Short Commit: ${fallbackInfo.shortCommit}`)
  logger.info(`  Remote: ${fallbackInfo.remote}`)
  logger.info(`  Source: ${fallbackInfo.fromFiles ? 'File-based ✅' : 'Command-based ⚙️'}`)
  
  logger.info('\n' + '═'.repeat(60))
  logger.success('All file-based parsing tests completed!')
}

// Run tests
testFileParsing().catch(error => {
  logger.error('Test failed:', error)
  process.exit(1)
})
