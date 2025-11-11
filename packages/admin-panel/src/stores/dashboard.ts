import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSessionStore } from './session'

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
      const response = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${sessionStore.sessionToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      if (data.success) {
        stats.value = data.data
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set mock data for development
      stats.value = {
        totalUsers: 1234,
        activeSessions: 42,
        totalAppointments: 567,
        pendingAppointments: 23,
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserGrowth() {
    try {
      const response = await fetch('http://localhost:3000/api/dashboard/user-growth', {
        headers: {
          Authorization: `Bearer ${sessionStore.sessionToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user growth data')
      }

      const data = await response.json()
      if (data.success) {
        userGrowthData.value = data.data
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error)
      // Set mock data for development
      userGrowthData.value = {
        labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
        data: [120, 190, 300, 500, 800, 1234],
      }
    }
  }

  async function fetchAppointmentStats() {
    try {
      const response = await fetch('http://localhost:3000/api/dashboard/appointment-stats', {
        headers: {
          Authorization: `Bearer ${sessionStore.sessionToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch appointment stats')
      }

      const data = await response.json()
      if (data.success) {
        appointmentStatsData.value = data.data
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error)
      // Set mock data for development
      appointmentStatsData.value = {
        labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
        data: [12, 19, 15, 25, 22, 18, 8],
      }
    }
  }

  async function fetchRecentActivities() {
    try {
      const response = await fetch('http://localhost:3000/api/dashboard/recent-activities', {
        headers: {
          Authorization: `Bearer ${sessionStore.sessionToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recent activities')
      }

      const data = await response.json()
      if (data.success) {
        recentActivities.value = data.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      // Set mock data for development
      recentActivities.value = [
        {
          id: '1',
          type: 'user_registered',
          description: 'کاربر جدید ثبت‌نام کرد',
          timestamp: new Date(Date.now() - 5 * 60000),
        },
        {
          id: '2',
          type: 'appointment_created',
          description: 'نوبت جدید ایجاد شد',
          timestamp: new Date(Date.now() - 15 * 60000),
        },
        {
          id: '3',
          type: 'appointment_completed',
          description: 'نوبت تکمیل شد',
          timestamp: new Date(Date.now() - 30 * 60000),
        },
      ]
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
