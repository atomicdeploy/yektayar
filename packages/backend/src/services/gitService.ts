/**
 * Git Service for Backend
 * Provides git information and management capabilities
 */

import { 
  getGitInfo, 
  fetch, 
  pull, 
  switchBranch, 
  createBranch, 
  listBranches,
  getModifiedFiles,
  getStagedFiles,
  isGitRepository,
  displayGitInfo
} from '@yektayar/shared'
import type { GitInfo, GitCommandResult } from '@yektayar/shared'

/**
 * Git service for managing repository operations
 */
export class GitService {
  private repoPath: string

  constructor(repoPath?: string) {
    this.repoPath = repoPath || process.cwd()
  }

  /**
   * Get comprehensive git information
   */
  async getInfo(): Promise<GitInfo> {
    return await getGitInfo(this.repoPath)
  }

  /**
   * Display git information in console
   */
  async displayInfo(): Promise<void> {
    await displayGitInfo(this.repoPath)
  }

  /**
   * Fetch updates from remote
   */
  async fetch(): Promise<GitCommandResult> {
    return await fetch(this.repoPath)
  }

  /**
   * Pull updates from remote
   */
  async pull(): Promise<GitCommandResult> {
    return await pull(this.repoPath)
  }

  /**
   * Switch to a different branch
   */
  async switchBranch(branchName: string): Promise<GitCommandResult> {
    return await switchBranch(branchName, this.repoPath)
  }

  /**
   * Create and switch to a new branch
   */
  async createBranch(branchName: string): Promise<GitCommandResult> {
    return await createBranch(branchName, this.repoPath)
  }

  /**
   * List all branches
   */
  async listBranches(): Promise<string[]> {
    return await listBranches(this.repoPath)
  }

  /**
   * Get modified files
   */
  async getModifiedFiles(): Promise<string[]> {
    return await getModifiedFiles(this.repoPath)
  }

  /**
   * Get staged files
   */
  async getStagedFiles(): Promise<string[]> {
    return await getStagedFiles(this.repoPath)
  }

  /**
   * Check if directory is a git repository
   */
  async isRepository(): Promise<boolean> {
    return await isGitRepository(this.repoPath)
  }
}

// Export singleton instance
export const gitService = new GitService()
