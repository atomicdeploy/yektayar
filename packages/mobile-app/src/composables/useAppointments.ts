import { ref, computed } from 'vue'
import { apiClient } from '@/api'
import { logger } from '@yektayar/shared'
import type { Appointment, AppointmentStatus } from '@yektayar/shared'

// Extended appointment type with additional fields from backend
export interface AppointmentWithDetails extends Appointment {
  patient_name?: string
  patient_email?: string
  patient_phone?: string
  psychologist_name?: string
  psychologist_email?: string
  specialization?: string
  appointment_type?: 'video' | 'in-person' | 'group'
}

export interface AppointmentsFilter {
  status?: AppointmentStatus
  userId?: string | number
  page?: number
  limit?: number
}

export function useAppointments() {
  const appointments = ref<AppointmentWithDetails[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch appointments with filters
  const fetchAppointments = async (filters?: AppointmentsFilter) => {
    try {
      loading.value = true
      error.value = null

      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.userId) params.append('userId', String(filters.userId))
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))

      const queryString = params.toString()
      const url = `/appointments${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get(url)
      
      if (response.success && response.data) {
        appointments.value = response.data
        logger.success(`Loaded ${appointments.value.length} appointments`)
        return appointments.value
      } else if (Array.isArray(response)) {
        appointments.value = response
        logger.success(`Loaded ${appointments.value.length} appointments`)
        return appointments.value
      } else {
        error.value = response.error || 'Failed to fetch appointments'
        logger.error('Failed to fetch appointments:', error.value)
        return []
      }
    } catch (err) {
      error.value = 'Failed to fetch appointments'
      logger.error('Failed to fetch appointments:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch a single appointment by ID
  const fetchAppointment = async (id: string | number) => {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.get(`/appointments/${id}`)
      
      if (response.success && response.data) {
        logger.success('Loaded appointment details')
        return response.data
      } else {
        error.value = response.error || 'Failed to fetch appointment'
        logger.error('Failed to fetch appointment:', error.value)
        return null
      }
    } catch (err) {
      error.value = 'Failed to fetch appointment'
      logger.error('Failed to fetch appointment:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (id: string | number, status: AppointmentStatus) => {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.put(`/appointments/${id}`, { status })
      
      if (response.success) {
        logger.success('Appointment status updated')
        return true
      } else {
        error.value = response.error || 'Failed to update appointment'
        logger.error('Failed to update appointment:', error.value)
        return false
      }
    } catch (err) {
      error.value = 'Failed to update appointment'
      logger.error('Failed to update appointment:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Cancel appointment
  const cancelAppointment = async (id: string | number) => {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.delete(`/appointments/${id}`)
      
      if (response.success) {
        logger.success('Appointment cancelled')
        return true
      } else {
        error.value = response.error || 'Failed to cancel appointment'
        logger.error('Failed to cancel appointment:', error.value)
        return false
      }
    } catch (err) {
      error.value = 'Failed to cancel appointment'
      logger.error('Failed to cancel appointment:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Group appointments by status
  const upcomingAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(
      (apt) => {
        const scheduledDate = new Date(apt.scheduledAt)
        return (apt.status === 'confirmed' || apt.status === 'pending') && scheduledDate >= now
      }
    ).sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime()
      const dateB = new Date(b.scheduledAt).getTime()
      return dateA - dateB
    })
  })

  const pastAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(
      (apt) => {
        const scheduledDate = new Date(apt.scheduledAt)
        return apt.status === 'completed' || scheduledDate < now
      }
    ).sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime()
      const dateB = new Date(b.scheduledAt).getTime()
      return dateB - dateA // Most recent first
    })
  })

  return {
    appointments,
    loading,
    error,
    upcomingAppointments,
    pastAppointments,
    fetchAppointments,
    fetchAppointment,
    updateAppointmentStatus,
    cancelAppointment,
  }
}
