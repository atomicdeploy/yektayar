import { Elysia } from 'elysia'
import { 
  getUserPreferences, 
  updateUserPreferences 
} from '../services/preferencesService'
import { extractToken } from '../middleware/tokenExtractor'

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', async () => {
    // TODO: List users (admin only)
    return {
      success: true,
      data: [],
      message: 'User list endpoint - to be implemented'
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    // TODO: Get user by ID
    return {
      success: true,
      data: null,
      message: `Get user ${id} endpoint - to be implemented`
    }
  })
  .put('/:id', async ({ params: { id }, body }) => {
    // TODO: Update user
    return {
      success: true,
      message: `Update user ${id} endpoint - to be implemented`
    }
  })
  .get('/:id/profile', async ({ params: { id } }) => {
    // TODO: Get user profile
    return {
      success: true,
      data: null,
      message: `Get user ${id} profile endpoint - to be implemented`
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
      console.error('Error fetching user preferences:', error)
      return {
        success: false,
        error: 'Failed to fetch preferences'
      }
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
      console.error('Error updating user preferences:', error)
      return {
        success: false,
        error: 'Failed to update preferences'
      }
    }
  })
