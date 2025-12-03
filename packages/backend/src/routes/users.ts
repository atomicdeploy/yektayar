import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'
import bcrypt from 'bcrypt'
import { 
  getUserPreferences, 
  updateUserPreferences 
} from '../services/preferencesService'
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  getUserProfile
} from '../services/userService'
import { extractToken } from '../middleware/tokenExtractor'
import { logger } from '@yektayar/shared'

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', async ({ query }) => {
    try {
      const filters = {
        type: query.type as string | undefined,
        search: query.search as string | undefined,
        page: parseInt(query.page as string) || 1,
        limit: parseInt(query.limit as string) || 10
      }
      
      const result = await getAllUsers(filters)
      
      return {
        success: true,
        data: result.users,
        pagination: result.pagination
      }
    } catch (error) {
      logger.error('Error fetching users:', error)
      return {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Could not retrieve user list'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'List all users',
      description: 'Get paginated list of users with optional filters',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'type', in: 'query', schema: { type: 'string', enum: ['patient', 'psychologist', 'admin'] } },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, email, or phone' }
      ]
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    try {
      const user = await getUserByIdService(id)

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      return {
        success: true,
        data: user
      }
    } catch (error) {
      logger.error('Error fetching user:', error)
      return {
        success: false,
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Could not retrieve user details'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Get user by ID',
      description: 'Retrieve detailed information about a specific user'
    }
  })
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const updateData = body as any

      // Handle password update separately
      if (updateData.password) {
        const db = getDatabase()
        const passwordHash = await bcrypt.hash(updateData.password, 10)
        await db`
          UPDATE users
          SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `
        delete updateData.password
      }

      // Use service for other updates
      const user = await updateUserService(id, {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        avatar: updateData.avatar,
        bio: updateData.bio,
        specialization: updateData.specialization,
        isActive: updateData.is_active
      })

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      return {
        success: true,
        data: user,
        message: 'User updated successfully'
      }
    } catch (error) {
      logger.error('Error updating user:', error)
      return {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Could not update user details'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Update user',
      description: 'Update user information by ID'
    }
  })
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const db = getDatabase()
      const result = await db`
        DELETE FROM users
        WHERE id = ${id}
        RETURNING id
      `

      if (result.length === 0) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      return {
        success: true,
        message: 'User deleted successfully'
      }
    } catch (error) {
      logger.error('Error deleting user:', error)
      return {
        success: false,
        error: 'Failed to delete user',
        message: 'Could not delete user'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Delete user',
      description: 'Delete a user by ID'
    }
  })
  .get('/:id/profile', async ({ params: { id } }) => {
    try {
      const user = await getUserProfile(id)

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      return {
        success: true,
        data: user
      }
    } catch (error) {
      logger.error('Error fetching user profile:', error)
      return {
        success: false,
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Could not retrieve user profile'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Get user profile',
      description: 'Get detailed user profile with statistics'
    }
  })
  .get('/preferences', async ({ headers, query, cookie }) => {
    try {
      const token = extractToken({ headers, query, cookie })
      
      if (!token) {
        return {
          success: false,
          error: 'No token provided'
        }
      }

      const preferences = await getUserPreferences(token)
      
      return {
        success: true,
        data: preferences
      }
    } catch (error) {
      logger.error('Error fetching user preferences:', error)
      return {
        success: false,
        error: 'Failed to fetch preferences'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Get user preferences',
      description: 'Get current user preferences'
    }
  })
  .post('/preferences', async ({ headers, query, cookie, body }) => {
    try {
      const token = extractToken({ headers, query, cookie })
      
      if (!token) {
        return {
          success: false,
          error: 'No token provided'
        }
      }

      const preferences = await updateUserPreferences(token, body as Record<string, any>)
      
      return {
        success: true,
        data: preferences
      }
    } catch (error) {
      logger.error('Error updating user preferences:', error)
      return {
        success: false,
        error: 'Failed to update preferences'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Update user preferences',
      description: 'Update current user preferences'
    }
  })
