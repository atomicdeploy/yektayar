import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSessionStore } from './session'
import { logger } from '@yektayar/shared'
import apiClient from '@/api'

export interface DashboardStats {
  totalUsers: number
  activeSessions: number
  totalAppointments: number
  pendingAppointments: number
}

export interface ActivityItem {
  id: string
  type: 'user_registered' | 'appointment_created' | 'appointment_completed' | 'message_sent'
  description: string
  timestamp: Date
  userId?: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  const sessionStore = useSessionStore()

  // State
  const stats = ref<DashboardStats>({
    totalUsers: 0,
    activeSessions: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  })

  const userGrowthData = ref<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  })

  const appointmentStatsData = ref<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  })

  const recentActivities = ref<ActivityItem[]>([])
  const isLoading = ref(false)

  // Computed
  const hasData = computed(() => stats.value.totalUsers > 0)

  // Actions
  async function fetchStats() {
    isLoading.value = true
    try {
      const response = await apiClient.get<DashboardStats>('/api/dashboard/stats')
      
      if (response.success && response.data) {
        stats.value = response.data
      } else {
        throw new Error('Failed to fetch stats')
      }
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserGrowth() {
    try {
      const response = await apiClient.get<{ labels: string[]; data: number[] }>('/api/dashboard/user-growth')
      
      if (response.success && response.data) {
        userGrowthData.value = response.data
      } else {
        throw new Error('Failed to fetch user growth data')
      }
    } catch (error) {
      logger.error('Error fetching user growth data:', error)
      throw error
    }
  }

  async function fetchAppointmentStats() {
    try {
      const response = await apiClient.get<{ labels: string[]; data: number[] }>('/api/dashboard/appointment-stats')
      
      if (response.success && response.data) {
        appointmentStatsData.value = response.data
      } else {
        throw new Error('Failed to fetch appointment stats')
      }
    } catch (error) {
      logger.error('Error fetching appointment stats:', error)
      throw error
    }
  }

  async function fetchRecentActivities() {
    try {
      const response = await apiClient.get<ActivityItem[]>('/api/dashboard/recent-activities')
      
      if (response.success && response.data) {
        recentActivities.value = response.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      } else {
        throw new Error('Failed to fetch recent activities')
      }
    } catch (error) {
      logger.error('Error fetching recent activities:', error)
      throw error
    }
  }

  function updateStatsFromSocket(newStats: Partial<DashboardStats>) {
    stats.value = { ...stats.value, ...newStats }
  }

  function addActivity(activity: ActivityItem) {
    recentActivities.value.unshift(activity)
    if (recentActivities.value.length > 10) {
      recentActivities.value.pop()
    }
  }

  async function refreshAll() {
    await Promise.all([
      fetchStats(),
      fetchUserGrowth(),
      fetchAppointmentStats(),
      fetchRecentActivities(),
    ])
  }

  // Setup Socket.IO listeners
  function setupSocketListeners() {
    const socket = sessionStore.socket
    if (!socket) return

    socket.on('dashboard:stats', (data: Partial<DashboardStats>) => {
      updateStatsFromSocket(data)
    })

    socket.on('dashboard:activity', (activity: ActivityItem) => {
      addActivity({
        ...activity,
        timestamp: new Date(activity.timestamp),
      })
    })
  }

  return {
    // State
    stats,
    userGrowthData,
    appointmentStatsData,
    recentActivities,
    isLoading,

    // Computed
    hasData,

    // Actions
    fetchStats,
    fetchUserGrowth,
    fetchAppointmentStats,
    fetchRecentActivities,
    refreshAll,
    updateStatsFromSocket,
    addActivity,
    setupSocketListeners,
  }
})
