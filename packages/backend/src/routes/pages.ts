import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'
import { logger } from '@yektayar/shared'

export const pageRoutes = new Elysia({ prefix: '/api/pages' })
  .get('/:slug', async ({ params: { slug }, set }) => {
    try {
      const db = getDatabase()
      const pages = await db`
        SELECT id, slug, title, content, metadata, created_at, updated_at
        FROM pages
        WHERE slug = ${slug}
      `

      if (pages.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Page not found',
          message: `Page with slug '${slug}' does not exist`
        }
      }

      return {
        success: true,
        data: pages[0]
      }
    } catch (error) {
      logger.error('Error fetching page:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch page'
      }
    }
  })
  .get('/', async ({ set }) => {
    try {
      const db = getDatabase()
      const pages = await db`
        SELECT id, slug, title, metadata, created_at, updated_at
        FROM pages
        ORDER BY created_at DESC
      `

      return {
        success: true,
        data: pages
      }
    } catch (error) {
      logger.error('Error fetching pages:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch pages'
      }
    }
  })
  .post('/', async ({ body, set }) => {
    try {
      const { slug, title, content, metadata } = body as any

      if (!slug || !title || !content) {
        set.status = 400
        return {
          success: false,
          error: 'Missing required fields',
          message: 'slug, title, and content are required'
        }
      }

      const db = getDatabase()
      const result = await db`
        INSERT INTO pages (slug, title, content, metadata)
        VALUES (${slug}, ${title}, ${content}, ${metadata || {}})
        RETURNING id, slug, title, content, metadata, created_at, updated_at
      `

      return {
        success: true,
        data: result[0],
        message: 'Page created successfully'
      }
    } catch (error: any) {
      logger.error('Error creating page:', error)
      
      if (error.code === '23505') { // Unique constraint violation
        set.status = 409
        return {
          success: false,
          error: 'Duplicate slug',
          message: 'A page with this slug already exists'
        }
      }

      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create page'
      }
    }
  })
  .put('/:slug', async ({ params: { slug }, body, set }) => {
    try {
      const { title, content, metadata } = body as any

      const db = getDatabase()
      const result = await db`
        UPDATE pages
        SET 
          title = COALESCE(${title}, title),
          content = COALESCE(${content}, content),
          metadata = COALESCE(${metadata}, metadata),
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${slug}
        RETURNING id, slug, title, content, metadata, created_at, updated_at
      `

      if (result.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Page not found',
          message: `Page with slug '${slug}' does not exist`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Page updated successfully'
      }
    } catch (error) {
      logger.error('Error updating page:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update page'
      }
    }
  })
  .delete('/:slug', async ({ params: { slug }, set }) => {
    try {
      const db = getDatabase()
      const result = await db`
        DELETE FROM pages
        WHERE slug = ${slug}
        RETURNING id
      `

      if (result.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Page not found',
          message: `Page with slug '${slug}' does not exist`
        }
      }

      return {
        success: true,
        message: 'Page deleted successfully'
      }
    } catch (error) {
      logger.error('Error deleting page:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete page'
      }
    }
  })
