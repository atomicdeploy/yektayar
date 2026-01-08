/**
 * Git Management Routes
 * Provides API endpoints for git repository management
 */

import { Elysia, t } from 'elysia'
import { gitService } from '../services/gitService'
import { logger } from '@yektayar/shared'

export const gitRoutes = new Elysia({ prefix: '/api/git' })
  /**
   * Get git repository information
   */
  .get('/info', async () => {
    try {
      const isRepo = await gitService.isRepository()
      
      if (!isRepo) {
        return {
          success: false,
          error: 'Not a git repository'
        }
      }

      const info = await gitService.getInfo()
      
      return {
        success: true,
        data: info
      }
    } catch (error: any) {
      logger.error('Failed to get git info', error)
      return {
        success: false,
        error: error.message || 'Failed to get git information'
      }
    }
  }, {
    detail: {
      tags: ['Git'],
      summary: 'Get git repository information',
      description: 'Returns comprehensive information about the current git repository including branch, commit, status, and more'
    }
  })

  /**
   * Fetch updates from remote
   */
  .post('/fetch', async () => {
    try {
      const result = await gitService.fetch()
      
      return {
        success: result.success,
        output: result.output,
        error: result.error
      }
    } catch (error: any) {
      logger.error('Failed to fetch updates', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch updates'
      }
    }
  }, {
    detail: {
      tags: ['Git'],
      summary: 'Fetch updates from remote',
      description: 'Fetches updates from the remote repository without merging'
    }
  })

  /**
   * Pull updates from remote
   */
  .post('/pull', async () => {
    try {
      const result = await gitService.pull()
      
      return {
        success: result.success,
        output: result.output,
        error: result.error
      }
    } catch (error: any) {
      logger.error('Failed to pull updates', error)
      return {
        success: false,
        error: error.message || 'Failed to pull updates'
      }
    }
  }, {
    detail: {
      tags: ['Git'],
      summary: 'Pull updates from remote',
      description: 'Pulls and merges updates from the remote repository'
    }
  })

  /**
   * Switch to a different branch
   */
  .post('/branch/switch', async ({ body }) => {
    try {
      const { branchName } = body
      
      if (!branchName) {
        return {
          success: false,
          error: 'Branch name is required'
        }
      }

      const result = await gitService.switchBranch(branchName)
      
      return {
        success: result.success,
        output: result.output,
        error: result.error
      }
    } catch (error: any) {
      logger.error('Failed to switch branch', error)
      return {
        success: false,
        error: error.message || 'Failed to switch branch'
      }
    }
  }, {
    body: t.Object({
      branchName: t.String()
    }),
    detail: {
      tags: ['Git'],
      summary: 'Switch to a different branch',
      description: 'Switches to the specified branch'
    }
  })

  /**
   * Create a new branch
   */
  .post('/branch/create', async ({ body }) => {
    try {
      const { branchName } = body
      
      if (!branchName) {
        return {
          success: false,
          error: 'Branch name is required'
        }
      }

      const result = await gitService.createBranch(branchName)
      
      return {
        success: result.success,
        output: result.output,
        error: result.error
      }
    } catch (error: any) {
      logger.error('Failed to create branch', error)
      return {
        success: false,
        error: error.message || 'Failed to create branch'
      }
    }
  }, {
    body: t.Object({
      branchName: t.String()
    }),
    detail: {
      tags: ['Git'],
      summary: 'Create a new branch',
      description: 'Creates and switches to a new branch'
    }
  })

  /**
   * List all branches
   */
  .get('/branches', async () => {
    try {
      const branches = await gitService.listBranches()
      
      return {
        success: true,
        data: branches
      }
    } catch (error: any) {
      logger.error('Failed to list branches', error)
      return {
        success: false,
        error: error.message || 'Failed to list branches'
      }
    }
  }, {
    detail: {
      tags: ['Git'],
      summary: 'List all branches',
      description: 'Returns a list of all branches in the repository'
    }
  })

  /**
   * Get modified files
   */
  .get('/files/modified', async () => {
    try {
      const files = await gitService.getModifiedFiles()
      
      return {
        success: true,
        data: files
      }
    } catch (error: any) {
      logger.error('Failed to get modified files', error)
      return {
        success: false,
        error: error.message || 'Failed to get modified files'
      }
    }
  }, {
    detail: {
      tags: ['Git'],
      summary: 'Get modified files',
      description: 'Returns a list of modified files in the working directory'
    }
  })

  /**
   * Get staged files
   */
  .get('/files/staged', async () => {
    try {
      const files = await gitService.getStagedFiles()
      
      return {
        success: true,
        data: files
      }
    } catch (error: any) {
      logger.error('Failed to get staged files', error)
      return {
        success: false,
        error: error.message || 'Failed to get staged files'
      }
    }
  }, {
    detail: {
      tags: ['Git'],
      summary: 'Get staged files',
      description: 'Returns a list of staged files ready to be committed'
    }
  })
