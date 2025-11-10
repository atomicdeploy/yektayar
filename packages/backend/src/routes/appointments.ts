import { Elysia } from 'elysia'

export const appointmentRoutes = new Elysia({ prefix: '/api/appointments' })
  .get('/', async () => {
    // TODO: List appointments
    return {
      success: true,
      data: [],
      message: 'Appointment list endpoint - to be implemented'
    }
  })
  .post('/', async ({ body }) => {
    // TODO: Create appointment
    return {
      success: true,
      message: 'Create appointment endpoint - to be implemented'
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    // TODO: Get appointment details
    return {
      success: true,
      data: null,
      message: `Get appointment ${id} endpoint - to be implemented`
    }
  })
  .put('/:id', async ({ params: { id }, body }) => {
    // TODO: Update appointment
    return {
      success: true,
      message: `Update appointment ${id} endpoint - to be implemented`
    }
  })
  .get('/professionals', async () => {
    // TODO: List professionals
    return {
      success: true,
      data: [],
      message: 'Professional list endpoint - to be implemented'
    }
  })
