import { Elysia } from 'elysia'
import { getAllUsers, getUserById, updateUser } from '../services/userService'

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', async ({ query }) => {
    try {
      // Extract filter parameters
      const filters = {
        role: query.role as string | undefined,
        status: query.status as string | undefined,
        search: query.search as string | undefined,
      }
      
      const users = await getAllUsers(filters)
      
      return {
        success: true,
        data: users,
      }
    } catch (error) {
      console.error('Error in GET /api/users:', error)
      return {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    try {
      const user = await getUserById(id)
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`,
        }
      }
      
      return {
        success: true,
        data: user,
      }
    } catch (error) {
      console.error('Error in GET /api/users/:id:', error)
      return {
        success: false,
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const user = await updateUser(id, body as any)
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`,
        }
      }
      
      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      }
    } catch (error) {
      console.error('Error in PUT /api/users/:id:', error)
      return {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
  .get('/:id/profile', async ({ params: { id } }) => {
    try {
      const user = await getUserById(id)
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`,
        }
      }
      
      // Return user profile (for now, same as user data)
      return {
        success: true,
        data: user,
      }
    } catch (error) {
      console.error('Error in GET /api/users/:id/profile:', error)
      return {
        success: false,
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
