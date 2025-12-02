import { Elysia } from 'elysia'
import { query } from '../services/database-pg'
import { logger } from '@yektayar/shared'

export const appointmentRoutes = new Elysia({ prefix: '/api/appointments' })
  .get('/', async ({ query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 10
      const offset = (page - 1) * limit
      const status = query.status as string || undefined
      const userId = query.userId as string || undefined

      let countQuery
      let appointmentsQuery

      if (status && userId) {
        countQuery = db`
          SELECT COUNT(*) FROM appointments 
          WHERE status = ${status} AND (patient_id = ${userId} OR psychologist_id = ${userId})
        `
        appointmentsQuery = db`
          SELECT a.*, 
                 p.name as patient_name, p.email as patient_email,
                 ps.name as psychologist_name, ps.email as psychologist_email
          FROM appointments a
          JOIN users p ON a.patient_id = p.id
          JOIN users ps ON a.psychologist_id = ps.id
          WHERE a.status = ${status} AND (a.patient_id = ${userId} OR a.psychologist_id = ${userId})
          ORDER BY a.scheduled_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (status) {
        countQuery = db`SELECT COUNT(*) FROM appointments WHERE status = ${status}`
        appointmentsQuery = db`
          SELECT a.*, 
                 p.name as patient_name, p.email as patient_email,
                 ps.name as psychologist_name, ps.email as psychologist_email
          FROM appointments a
          JOIN users p ON a.patient_id = p.id
          JOIN users ps ON a.psychologist_id = ps.id
          WHERE a.status = ${status}
          ORDER BY a.scheduled_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (userId) {
        countQuery = db`
          SELECT COUNT(*) FROM appointments 
          WHERE patient_id = ${userId} OR psychologist_id = ${userId}
        `
        appointmentsQuery = db`
          SELECT a.*, 
                 p.name as patient_name, p.email as patient_email,
                 ps.name as psychologist_name, ps.email as psychologist_email
          FROM appointments a
          JOIN users p ON a.patient_id = p.id
          JOIN users ps ON a.psychologist_id = ps.id
          WHERE a.patient_id = ${userId} OR a.psychologist_id = ${userId}
          ORDER BY a.scheduled_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        countQuery = db`SELECT COUNT(*) FROM appointments`
        appointmentsQuery = db`
          SELECT a.*, 
                 p.name as patient_name, p.email as patient_email,
                 ps.name as psychologist_name, ps.email as psychologist_email
          FROM appointments a
          JOIN users p ON a.patient_id = p.id
          JOIN users ps ON a.psychologist_id = ps.id
          ORDER BY a.scheduled_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }

      const [countResult, appointments] = await Promise.all([countQuery, appointmentsQuery])
      const total = parseInt(countResult[0].count)

      return {
        success: true,
        data: appointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Error fetching appointments:', error)
      return {
        success: false,
        error: 'Failed to fetch appointments',
        message: 'Could not retrieve appointment list'
      }
    }
  }, {
    detail: {
      tags: ['Appointments'],
      summary: 'List appointments',
      description: 'Get paginated list of appointments with optional filters',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] } },
        { name: 'userId', in: 'query', schema: { type: 'integer' } }
      ]
    }
  })
  .post('/', async ({ body }) => {
    try {
      const db = getDatabase()
      const { patientId, psychologistId, scheduledAt, duration = 60, notes } = body as any

      if (!patientId || !psychologistId || !scheduledAt) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Patient ID, Psychologist ID, and scheduled time are required'
        }
      }

      // Verify users exist and have correct types
      const users = await db`
        SELECT id, type FROM users 
        WHERE id IN (${patientId}, ${psychologistId})
      `

      if (users.length !== 2) {
        return {
          success: false,
          error: 'Invalid users',
          message: 'One or both user IDs are invalid'
        }
      }

      const patient = users.find(u => u.id === parseInt(patientId))
      const psychologist = users.find(u => u.id === parseInt(psychologistId))

      if (patient?.type !== 'patient') {
        return {
          success: false,
          error: 'Invalid patient',
          message: 'Patient ID must refer to a user with type "patient"'
        }
      }

      if (psychologist?.type !== 'psychologist') {
        return {
          success: false,
          error: 'Invalid psychologist',
          message: 'Psychologist ID must refer to a user with type "psychologist"'
        }
      }

      // Create appointment
      const result = await db`
        INSERT INTO appointments (patient_id, psychologist_id, scheduled_at, duration, notes, status)
        VALUES (${patientId}, ${psychologistId}, ${scheduledAt}, ${duration}, ${notes || null}, 'pending')
        RETURNING *
      `

      return {
        success: true,
        data: result[0],
        message: 'Appointment created successfully'
      }
    } catch (error) {
      logger.error('Error creating appointment:', error)
      return {
        success: false,
        error: 'Failed to create appointment',
        message: 'Could not create appointment'
      }
    }
  }, {
    detail: {
      tags: ['Appointments'],
      summary: 'Create appointment',
      description: 'Book a new appointment with a psychologist'
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    try {
      const db = getDatabase()
      const appointments = await db`
        SELECT a.*, 
               p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
               ps.name as psychologist_name, ps.email as psychologist_email, ps.specialization
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users ps ON a.psychologist_id = ps.id
        WHERE a.id = ${id}
      `

      if (appointments.length === 0) {
        return {
          success: false,
          error: 'Appointment not found',
          message: `No appointment found with ID ${id}`
        }
      }

      return {
        success: true,
        data: appointments[0]
      }
    } catch (error) {
      logger.error('Error fetching appointment:', error)
      return {
        success: false,
        error: 'Failed to fetch appointment',
        message: 'Could not retrieve appointment details'
      }
    }
  }, {
    detail: {
      tags: ['Appointments'],
      summary: 'Get appointment details',
      description: 'Retrieve detailed information about a specific appointment'
    }
  })
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const updateData = body as any

      const allowedFields = ['scheduled_at', 'duration', 'status', 'notes']
      const updates: string[] = []
      const values: any[] = []

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = $${values.length + 1}`)
          values.push(updateData[field])
        }
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

      const result = await db.unsafe(`
        UPDATE appointments
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
      `, values)

      if (result.length === 0) {
        return {
          success: false,
          error: 'Appointment not found',
          message: `No appointment found with ID ${id}`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Appointment updated successfully'
      }
    } catch (error) {
      logger.error('Error updating appointment:', error)
      return {
        success: false,
        error: 'Failed to update appointment',
        message: 'Could not update appointment'
      }
    }
  }, {
    detail: {
      tags: ['Appointments'],
      summary: 'Update appointment',
      description: 'Update appointment details including status'
    }
  })
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const db = getDatabase()
      
      // Instead of deleting, mark as cancelled
      const result = await db`
        UPDATE appointments
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `

      if (result.length === 0) {
        return {
          success: false,
          error: 'Appointment not found',
          message: `No appointment found with ID ${id}`
        }
      }

      return {
        success: true,
        message: 'Appointment cancelled successfully'
      }
    } catch (error) {
      logger.error('Error cancelling appointment:', error)
      return {
        success: false,
        error: 'Failed to cancel appointment',
        message: 'Could not cancel appointment'
      }
    }
  }, {
    detail: {
      tags: ['Appointments'],
      summary: 'Cancel appointment',
      description: 'Cancel an appointment (marks as cancelled rather than deleting)'
    }
  })
  .get('/professionals', async ({ query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 10
      const offset = (page - 1) * limit
      const specialization = query.specialization as string || undefined

      let countQuery
      let professionalsQuery

      if (specialization) {
        countQuery = db`
          SELECT COUNT(*) FROM users 
          WHERE type = 'psychologist' AND is_active = true AND specialization ILIKE ${`%${specialization}%`}
        `
        professionalsQuery = db`
          SELECT id, name, email, phone, avatar, bio, specialization, created_at
          FROM users
          WHERE type = 'psychologist' AND is_active = true AND specialization ILIKE ${`%${specialization}%`}
          ORDER BY name
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        countQuery = db`
          SELECT COUNT(*) FROM users 
          WHERE type = 'psychologist' AND is_active = true
        `
        professionalsQuery = db`
          SELECT id, name, email, phone, avatar, bio, specialization, created_at
          FROM users
          WHERE type = 'psychologist' AND is_active = true
          ORDER BY name
          LIMIT ${limit} OFFSET ${offset}
        `
      }

      const [countResult, professionals] = await Promise.all([countQuery, professionalsQuery])
      const total = parseInt(countResult[0].count)

      // Get appointment counts for each professional
      for (const prof of professionals) {
        const stats = await db`
          SELECT 
            COUNT(*) as total_appointments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments
          FROM appointments
          WHERE psychologist_id = ${prof.id}
        `
        prof.stats = stats[0]
      }

      return {
        success: true,
        data: professionals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Error fetching professionals:', error)
      return {
        success: false,
        error: 'Failed to fetch professionals',
        message: 'Could not retrieve professional list'
      }
    }
  }, {
    detail: {
      tags: ['Appointments'],
      summary: 'List professionals',
      description: 'Get list of available psychologists with their statistics',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'specialization', in: 'query', schema: { type: 'string' } }
      ]
    }
  })
