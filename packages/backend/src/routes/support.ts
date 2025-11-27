import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'
import { logger } from '@yektayar/shared'

export const supportRoutes = new Elysia({ prefix: '/api/support' })
  // Create a new support ticket
  .post('/tickets', async ({ body, set }) => {
    try {
      const { user_id, subject, message, priority } = body as any

      if (!subject || !message) {
        set.status = 400
        return {
          success: false,
          error: 'Missing required fields',
          message: 'subject and message are required'
        }
      }

      const db = getDatabase()
      const result = await db`
        INSERT INTO support_tickets (user_id, subject, message, priority, status)
        VALUES (
          ${user_id || null},
          ${subject},
          ${message},
          ${priority || 'normal'},
          'open'
        )
        RETURNING id, user_id, subject, message, status, priority, created_at, updated_at
      `

      // Add initial message to support_messages
      await db`
        INSERT INTO support_messages (ticket_id, sender_type, message)
        VALUES (${result[0].id}, 'user', ${message})
      `

      return {
        success: true,
        data: result[0],
        message: 'Support ticket created successfully'
      }
    } catch (error) {
      logger.error('Error creating support ticket:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create support ticket'
      }
    }
  })
  // Get all tickets (optionally filter by user_id or status)
  .get('/tickets', async ({ query, set }) => {
    try {
      const { user_id, status } = query as any
      const db = getDatabase()

      let tickets
      if (user_id && status) {
        tickets = await db`
          SELECT id, user_id, subject, message, status, priority, created_at, updated_at
          FROM support_tickets
          WHERE user_id = ${user_id} AND status = ${status}
          ORDER BY created_at DESC
        `
      } else if (user_id) {
        tickets = await db`
          SELECT id, user_id, subject, message, status, priority, created_at, updated_at
          FROM support_tickets
          WHERE user_id = ${user_id}
          ORDER BY created_at DESC
        `
      } else if (status) {
        tickets = await db`
          SELECT id, user_id, subject, message, status, priority, created_at, updated_at
          FROM support_tickets
          WHERE status = ${status}
          ORDER BY created_at DESC
        `
      } else {
        tickets = await db`
          SELECT id, user_id, subject, message, status, priority, created_at, updated_at
          FROM support_tickets
          ORDER BY created_at DESC
        `
      }

      return {
        success: true,
        data: tickets
      }
    } catch (error) {
      logger.error('Error fetching support tickets:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch support tickets'
      }
    }
  })
  // Get a specific ticket with all messages
  .get('/tickets/:id', async ({ params: { id }, set }) => {
    try {
      const db = getDatabase()
      const tickets = await db`
        SELECT id, user_id, subject, message, status, priority, created_at, updated_at
        FROM support_tickets
        WHERE id = ${id}
      `

      if (tickets.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Ticket not found',
          message: `Ticket with id '${id}' does not exist`
        }
      }

      // Get all messages for this ticket
      const messages = await db`
        SELECT id, sender_type, message, created_at
        FROM support_messages
        WHERE ticket_id = ${id}
        ORDER BY created_at ASC
      `

      const ticket = {
        ...tickets[0],
        messages
      }

      return {
        success: true,
        data: ticket
      }
    } catch (error) {
      logger.error('Error fetching support ticket:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch support ticket'
      }
    }
  })
  // Add a message to a ticket
  .post('/tickets/:id/messages', async ({ params: { id }, body, set }) => {
    try {
      const { message, sender_type } = body as any

      if (!message || !sender_type) {
        set.status = 400
        return {
          success: false,
          error: 'Missing required fields',
          message: 'message and sender_type are required'
        }
      }

      const db = getDatabase()
      
      // Check if ticket exists
      const tickets = await db`
        SELECT id FROM support_tickets WHERE id = ${id}
      `

      if (tickets.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Ticket not found',
          message: `Ticket with id '${id}' does not exist`
        }
      }

      const result = await db`
        INSERT INTO support_messages (ticket_id, sender_type, message)
        VALUES (${id}, ${sender_type}, ${message})
        RETURNING id, ticket_id, sender_type, message, created_at
      `

      // Update ticket's updated_at timestamp
      await db`
        UPDATE support_tickets
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `

      return {
        success: true,
        data: result[0],
        message: 'Message added successfully'
      }
    } catch (error) {
      logger.error('Error adding message to ticket:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to add message'
      }
    }
  })
  // Update ticket status
  .patch('/tickets/:id', async ({ params: { id }, body, set }) => {
    try {
      const { status, priority } = body as any

      const db = getDatabase()
      const result = await db`
        UPDATE support_tickets
        SET 
          status = COALESCE(${status}, status),
          priority = COALESCE(${priority}, priority),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, user_id, subject, message, status, priority, created_at, updated_at
      `

      if (result.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Ticket not found',
          message: `Ticket with id '${id}' does not exist`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Ticket updated successfully'
      }
    } catch (error) {
      logger.error('Error updating ticket:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update ticket'
      }
    }
  })
  // Delete a ticket
  .delete('/tickets/:id', async ({ params: { id }, set }) => {
    try {
      const db = getDatabase()
      const result = await db`
        DELETE FROM support_tickets
        WHERE id = ${id}
        RETURNING id
      `

      if (result.length === 0) {
        set.status = 404
        return {
          success: false,
          error: 'Ticket not found',
          message: `Ticket with id '${id}' does not exist`
        }
      }

      return {
        success: true,
        message: 'Ticket deleted successfully'
      }
    } catch (error) {
      logger.error('Error deleting ticket:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete ticket'
      }
    }
  })
