import { Elysia } from 'elysia'
import { query } from '../services/database'
import bcrypt from 'bcrypt'
import { 
  getUserPreferences, 
  updateUserPreferences 
} from '../services/preferencesService'
import { extractToken } from '../middleware/tokenExtractor'
import { logger } from '@yektayar/shared'

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', async ({ query: queryParams }) => {
    try {
      const page = parseInt(queryParams.page as string) || 1
      const limit = parseInt(queryParams.limit as string) || 10
      const offset = (page - 1) * limit
      const type = queryParams.type as string || undefined

      let countResult
      let users

      if (type) {
        countResult = await query<{ count: string }>('SELECT COUNT(*) FROM users WHERE type = $1', [type])
        users = await query(`
          SELECT id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
          FROM users
          WHERE type = $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [type, limit, offset])
      } else {
        countResult = await query<{ count: string }>('SELECT COUNT(*) FROM users')
        users = await query(`
          SELECT id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
          FROM users
          ORDER BY created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset])
      }

      const total = parseInt(countResult[0].count)

      return {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Error fetching users:', error)
      return {
        success: false,
        error: 'Failed to fetch users',
        message: 'Could not retrieve user list'
      }
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'List all users',
      description: 'Get paginated list of users with optional type filter',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'type', in: 'query', schema: { type: 'string', enum: ['patient', 'psychologist', 'admin'] } }
      ]
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    try {
      const users = await query(`
        SELECT id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
        FROM users
        WHERE id = $1
      `, [id])

      if (users.length === 0) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      return {
        success: true,
        data: users[0]
      }
    } catch (error) {
      logger.error('Error fetching user:', error)
      return {
        success: false,
        error: 'Failed to fetch user',
        message: 'Could not retrieve user details'
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

      // Build dynamic update query
      const allowedFields = ['name', 'email', 'phone', 'avatar', 'bio', 'specialization', 'is_active']
      const updates: string[] = []
      const values: any[] = []

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = $${values.length + 1}`)
          values.push(updateData[field])
        }
      }

      // Handle password update separately
      if (updateData.password) {
        const passwordHash = await bcrypt.hash(updateData.password, 10)
        updates.push(`password_hash = $${values.length + 1}`)
        values.push(passwordHash)
      }

      if (updates.length === 0) {
        return {
          success: false,
          error: 'No valid fields to update',
          message: 'Please provide at least one field to update'
        }
      }

      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      const result = await query(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
      `, values)

      if (result.length === 0) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'User updated successfully'
      }
    } catch (error) {
      logger.error('Error updating user:', error)
      return {
        success: false,
        error: 'Failed to update user',
        message: 'Could not update user details'
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
      const result = await query(`
        DELETE FROM users
        WHERE id = $1
        RETURNING id
      `, [id])

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
      const users = await query(`
        SELECT id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
        FROM users
        WHERE id = $1
      `, [id])

      if (users.length === 0) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with ID ${id}`
        }
      }

      // If psychologist, get their appointments count
      if (users[0].type === 'psychologist') {
        const appointmentStats = await query(`
          SELECT 
            COUNT(*) as total_appointments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments
          FROM appointments
          WHERE psychologist_id = $1
        `, [id])
        users[0].stats = appointmentStats[0]
      }

      // If patient, get their course enrollments
      if (users[0].type === 'patient') {
        const enrollmentStats = await query(`
          SELECT 
            COUNT(*) as total_enrollments,
            COUNT(CASE WHEN completed = true THEN 1 END) as completed_courses
          FROM course_enrollments
          WHERE user_id = $1
        `, [id])
        users[0].stats = enrollmentStats[0]
      }

      return {
        success: true,
        data: users[0]
      }
    } catch (error) {
      logger.error('Error fetching user profile:', error)
      return {
        success: false,
        error: 'Failed to fetch user profile',
        message: 'Could not retrieve user profile'
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
