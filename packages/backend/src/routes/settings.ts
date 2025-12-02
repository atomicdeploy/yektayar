import { Elysia } from 'elysia'
import { query, getDatabase } from '../services/database-pg'
import { logger } from '@yektayar/shared'

export const settingsRoutes = new Elysia({ prefix: '/api/settings' })
  .get('/', async ({ set }) => {
    try {
      const db = getDatabase()
      const settings = await db`
        SELECT key, value, type
        FROM settings
        ORDER BY key
      `

      // Convert to key-value object
      const settingsObj: Record<string, any> = {}
      for (const setting of settings) {
        let value = setting.value
        
        // Convert type if needed
        if (setting.type === 'number') {
          value = parseFloat(value)
        } else if (setting.type === 'boolean') {
          value = value === 'true'
        } else if (setting.type === 'json') {
          try {
            value = JSON.parse(value)
          } catch (_e) {
            logger.error(`Failed to parse JSON for setting ${setting.key}`)
          }
        }
        
        settingsObj[setting.key] = value
      }

      return {
        success: true,
        data: settingsObj
      }
    } catch (error) {
      logger.error('Error fetching settings:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch settings'
      }
    }
  })
  .get('/:key', async ({ params: { key }, set }) => {
    try {
      const db = getDatabase()
      const settings = await db`
        SELECT key, value, type
        FROM settings
        WHERE key = ${key}
      `

      if (settings.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Setting not found',
          message: `Setting with key '${key}' does not exist`
        }
      }

      let value = settings[0].value
      const type = settings[0].type

      // Convert type if needed
      if (type === 'number') {
        value = parseFloat(value)
      } else if (type === 'boolean') {
        value = value === 'true'
      } else if (type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (_e) {
          logger.error(`Failed to parse JSON for setting ${key}`)
        }
      }

      return {
        success: true,
        data: {
          key: settings[0].key,
          value,
          type
        }
      }
    } catch (error) {
      logger.error('Error fetching setting:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch setting'
      }
    }
  })
  .post('/', async ({ body, set }) => {
    try {
      const { key, value, type } = body as any

      if (!key || value === undefined) {
        set.status = 400
        return {
          success: false,
          error: 'Missing required fields',
          message: 'key and value are required'
        }
      }

      const db = getDatabase()
      
      // Convert value to string for storage
      let stringValue = value
      if (type === 'json' || typeof value === 'object') {
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value)
      }

      const result = await db`
        INSERT INTO settings (key, value, type)
        VALUES (${key}, ${stringValue}, ${type || 'string'})
        RETURNING key, value, type, created_at, updated_at
      `

      return {
        success: true,
        data: result[0],
        message: 'Setting created successfully'
      }
    } catch (error: any) {
      logger.error('Error creating setting:', error)
      
      if (error.code === '23505') { // Unique constraint violation
        set.status = 409
        return {
          success: false,
          error: 'Duplicate key',
          message: 'A setting with this key already exists'
        }
      }

      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create setting'
      }
    }
  })
  .put('/:key', async ({ params: { key }, body, set }) => {
    try {
      const { value, type } = body as any

      if (value === undefined) {
        set.status = 400
        return {
          success: false,
          error: 'Missing required field',
          message: 'value is required'
        }
      }

      const db = getDatabase()
      
      // Convert value to string for storage
      let stringValue = value
      const settingType = type || 'string'
      
      if (settingType === 'json' || typeof value === 'object') {
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value)
      }

      const result = await db`
        UPDATE settings
        SET 
          value = ${stringValue},
          type = ${settingType},
          updated_at = CURRENT_TIMESTAMP
        WHERE key = ${key}
        RETURNING key, value, type, created_at, updated_at
      `

      if (result.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Setting not found',
          message: `Setting with key '${key}' does not exist`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Setting updated successfully'
      }
    } catch (error) {
      logger.error('Error updating setting:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update setting'
      }
    }
  })
  .delete('/:key', async ({ params: { key }, set }) => {
    try {
      const db = getDatabase()
      const result = await db`
        DELETE FROM settings
        WHERE key = ${key}
        RETURNING key
      `

      if (result.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Setting not found',
          message: `Setting with key '${key}' does not exist`
        }
      }

      return {
        success: true,
        message: 'Setting deleted successfully'
      }
    } catch (error) {
      logger.error('Error deleting setting:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete setting'
      }
    }
  })
