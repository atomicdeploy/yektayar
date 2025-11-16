import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'

export const messageRoutes = new Elysia({ prefix: '/api/messages' })
  .get('/threads', async ({ query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 10
      const offset = (page - 1) * limit
      const userId = query.userId as string || undefined
      const status = query.status as string || undefined

      let countQuery
      let threadsQuery

      if (userId && status) {
        countQuery = db`
          SELECT COUNT(*) FROM message_threads 
          WHERE ${userId}::INTEGER = ANY(participants) AND status = ${status}
        `
        threadsQuery = db`
          SELECT * FROM message_threads
          WHERE ${userId}::INTEGER = ANY(participants) AND status = ${status}
          ORDER BY updated_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (userId) {
        countQuery = db`
          SELECT COUNT(*) FROM message_threads 
          WHERE ${userId}::INTEGER = ANY(participants)
        `
        threadsQuery = db`
          SELECT * FROM message_threads
          WHERE ${userId}::INTEGER = ANY(participants)
          ORDER BY updated_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (status) {
        countQuery = db`SELECT COUNT(*) FROM message_threads WHERE status = ${status}`
        threadsQuery = db`
          SELECT * FROM message_threads
          WHERE status = ${status}
          ORDER BY updated_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        countQuery = db`SELECT COUNT(*) FROM message_threads`
        threadsQuery = db`
          SELECT * FROM message_threads
          ORDER BY updated_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }

      const [countResult, threads] = await Promise.all([countQuery, threadsQuery])
      const total = parseInt(countResult[0].count)

      // Get last message for each thread
      for (const thread of threads) {
        const lastMessage = await db`
          SELECT m.*, u.name as sender_name
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.thread_id = ${thread.id}
          ORDER BY m.created_at DESC
          LIMIT 1
        `
        thread.last_message = lastMessage[0] || null

        // Get unread count
        const unreadCount = await db`
          SELECT COUNT(*) as count
          FROM messages
          WHERE thread_id = ${thread.id} AND is_read = false
        `
        thread.unread_count = parseInt(unreadCount[0].count)
      }

      return {
        success: true,
        data: threads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      return {
        success: false,
        error: 'Failed to fetch threads',
        message: 'Could not retrieve thread list'
      }
    }
  }, {
    detail: {
      tags: ['Messages'],
      summary: 'List message threads',
      description: 'Get paginated list of message threads with optional filters',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'userId', in: 'query', schema: { type: 'integer' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'closed'] } }
      ]
    }
  })
  .post('/threads', async ({ body }) => {
    try {
      const db = getDatabase()
      const { participants, category, initialMessage } = body as any

      if (!participants || participants.length < 2) {
        return {
          success: false,
          error: 'Invalid participants',
          message: 'At least 2 participants are required'
        }
      }

      if (!initialMessage) {
        return {
          success: false,
          error: 'Missing initial message',
          message: 'An initial message is required to create a thread'
        }
      }

      // Verify all participants exist
      const users = await db`
        SELECT id FROM users WHERE id = ANY(${participants}::INT[])
      `

      if (users.length !== participants.length) {
        return {
          success: false,
          error: 'Invalid participants',
          message: 'One or more participant IDs are invalid'
        }
      }

      // Create thread
      const threadResult = await db`
        INSERT INTO message_threads (participants, category, status)
        VALUES (${participants}, ${category || null}, 'open')
        RETURNING *
      `

      const thread = threadResult[0]

      // Create initial message
      const messageResult = await db`
        INSERT INTO messages (thread_id, sender_id, content, is_read)
        VALUES (${thread.id}, ${participants[0]}, ${initialMessage}, false)
        RETURNING *
      `

      return {
        success: true,
        data: {
          thread: thread,
          message: messageResult[0]
        },
        message: 'Thread created successfully'
      }
    } catch (error) {
      console.error('Error creating thread:', error)
      return {
        success: false,
        error: 'Failed to create thread',
        message: 'Could not create message thread'
      }
    }
  }, {
    detail: {
      tags: ['Messages'],
      summary: 'Create message thread',
      description: 'Create a new message thread with initial message'
    }
  })
  .get('/threads/:id', async ({ params: { id }, query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 50
      const offset = (page - 1) * limit

      // Get thread details
      const threads = await db`
        SELECT * FROM message_threads WHERE id = ${id}
      `

      if (threads.length === 0) {
        return {
          success: false,
          error: 'Thread not found',
          message: `No thread found with ID ${id}`
        }
      }

      const thread = threads[0]

      // Get messages in thread
      const countQuery = db`
        SELECT COUNT(*) FROM messages WHERE thread_id = ${id}
      `
      const messagesQuery = db`
        SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.thread_id = ${id}
        ORDER BY m.created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `

      const [countResult, messages] = await Promise.all([countQuery, messagesQuery])
      const total = parseInt(countResult[0].count)

      return {
        success: true,
        data: {
          thread,
          messages,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching thread messages:', error)
      return {
        success: false,
        error: 'Failed to fetch messages',
        message: 'Could not retrieve thread messages'
      }
    }
  }, {
    detail: {
      tags: ['Messages'],
      summary: 'Get thread messages',
      description: 'Retrieve all messages in a thread with pagination',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
      ]
    }
  })
  .post('/threads/:id/messages', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const { senderId, content } = body as any

      if (!senderId || !content) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Sender ID and message content are required'
        }
      }

      // Verify thread exists
      const threads = await db`
        SELECT id, participants FROM message_threads WHERE id = ${id}
      `

      if (threads.length === 0) {
        return {
          success: false,
          error: 'Thread not found',
          message: `No thread found with ID ${id}`
        }
      }

      // Verify sender is a participant
      const thread = threads[0]
      if (!thread.participants.includes(parseInt(senderId))) {
        return {
          success: false,
          error: 'Unauthorized',
          message: 'Sender is not a participant in this thread'
        }
      }

      // Create message
      const result = await db`
        INSERT INTO messages (thread_id, sender_id, content, is_read)
        VALUES (${id}, ${senderId}, ${content}, false)
        RETURNING *
      `

      // Update thread updated_at
      await db`
        UPDATE message_threads
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `

      return {
        success: true,
        data: result[0],
        message: 'Message sent successfully'
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return {
        success: false,
        error: 'Failed to send message',
        message: 'Could not send message'
      }
    }
  }, {
    detail: {
      tags: ['Messages'],
      summary: 'Send message',
      description: 'Send a message in a thread'
    }
  })
  .put('/threads/:id', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const { status } = body as any

      if (!status) {
        return {
          success: false,
          error: 'Missing status',
          message: 'Thread status is required'
        }
      }

      const result = await db`
        UPDATE message_threads
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

      if (result.length === 0) {
        return {
          success: false,
          error: 'Thread not found',
          message: `No thread found with ID ${id}`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Thread status updated successfully'
      }
    } catch (error) {
      console.error('Error updating thread:', error)
      return {
        success: false,
        error: 'Failed to update thread',
        message: 'Could not update thread status'
      }
    }
  }, {
    detail: {
      tags: ['Messages'],
      summary: 'Update thread status',
      description: 'Update thread status (open/closed)'
    }
  })
  .post('/chat', async ({ body }) => {
    // AI chat endpoint - placeholder for now
    return {
      success: true,
      message: 'AI chat endpoint - to be integrated with AI service',
      response: 'Mock AI response'
    }
  }, {
    detail: {
      tags: ['Messages'],
      summary: 'AI chat',
      description: 'Send message to AI counselor (to be implemented with AI service)'
    }
  })
