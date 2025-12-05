<template>
  <main class="main-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('dashboard_page.title') }}</h1>
        <p class="subtitle">{{ t('dashboard_page.welcome_message') }}</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px;">
      <StatCard
        :label="t('dashboard_page.total_users')"
        :value="dashboardStore.stats.totalUsers"
        :icon="UsersIcon"
        :change="12.5"
        :loading="dashboardStore.isLoading"
      />
      <StatCard
        :label="t('dashboard_page.active_sessions')"
        :value="dashboardStore.stats.activeSessions"
        :icon="GlobeAltIcon"
        :change="5.2"
        bg-color="bg-green-100 dark:bg-green-900/30"
        icon-color="text-green-600 dark:text-green-400"
        :loading="dashboardStore.isLoading"
      />
      <StatCard
        :label="t('dashboard_page.total_appointments')"
        :value="dashboardStore.stats.totalAppointments"
        :icon="CalendarDaysIcon"
        :change="8.1"
        bg-color="bg-blue-100 dark:bg-blue-900/30"
        icon-color="text-blue-600 dark:text-blue-400"
        :loading="dashboardStore.isLoading"
      />
      <StatCard
        :label="t('dashboard_page.pending_appointments')"
        :value="dashboardStore.stats.pendingAppointments"
        :icon="ClockIcon"
        :change="-3.4"
        bg-color="bg-orange-100 dark:bg-orange-900/30"
        icon-color="text-orange-600 dark:text-orange-400"
        :loading="dashboardStore.isLoading"
      />
    </div>

    <!-- Draggable Widgets Grid -->
    <div>
      <draggable
        v-model="widgets"
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px;"
        :item-key="(item: Widget) => item.id"
        handle=".cursor-move"
        @start="isDragging = true"
        @end="isDragging = false"
      >
        <template #item="{ element }">
          <WidgetCard
            :key="element.id"
            :title="t(element.title)"
            :icon="element.icon"
            :is-expanded="element.expanded"
            :is-collapsed="element.collapsed"
            @toggle-expand="toggleExpand(element.id)"
            @toggle-collapse="toggleCollapse(element.id)"
          >
            <!-- User Growth Chart -->
            <ChartWidget
              v-if="element.id === 'user-growth'"
              type="line"
              :data="userGrowthChartData"
            />

            <!-- Appointment Stats Chart -->
            <ChartWidget
              v-if="element.id === 'appointment-stats'"
              type="bar"
              :data="appointmentStatsChartData"
            />

            <!-- Recent Activities -->
            <div v-if="element.id === 'recent-activities'" style="display: flex; flex-direction: column; gap: 12px;">
              <div
                v-for="activity in dashboardStore.recentActivities"
                :key="activity.id"
                style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 8px; background: var(--bg-secondary);"
              >
                <div
                  :class="['activity-indicator', getActivityColor(activity.type)]"
                ></div>
                <div style="flex: 1; min-width: 0;">
                  <p style="font-size: 14px; color: var(--text-primary);">{{ activity.description }}</p>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    {{ formatTimestamp(activity.timestamp) }}
                  </p>
                </div>
              </div>
              <div v-if="dashboardStore.recentActivities.length === 0" class="empty-state" style="padding: 40px 20px;">
                {{ t('dashboard_page.no_activities') }}
              </div>
            </div>

            <!-- System Status -->
            <div v-if="element.id === 'system-status'" style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 8px; background: var(--bg-secondary);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
                  <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">API Server</span>
                </div>
                <span style="font-size: 12px; color: var(--text-secondary);">آنلاین</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 8px; background: var(--bg-secondary);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div :style="{ width: '12px', height: '12px', borderRadius: '50%', background: sessionStore.isSocketConnected ? '#10b981' : '#ef4444' }"></div>
                  <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">WebSocket</span>
                </div>
                <span style="font-size: 12px; color: var(--text-secondary);">
                  {{ sessionStore.isSocketConnected ? 'متصل' : 'قطع شده' }}
                </span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 8px; background: var(--bg-secondary);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
                  <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Database</span>
                </div>
                <span style="font-size: 12px; color: var(--text-secondary);">آنلاین</span>
              </div>
            </div>
          </WidgetCard>
        </template>
      </draggable>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import {
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  BellAlertIcon,
  ServerIcon,
} from '@heroicons/vue/24/outline'
import { GlobeAltIcon } from '@heroicons/vue/24/solid'
import StatCard from '@/components/dashboard/StatCard.vue'
import WidgetCard from '@/components/dashboard/WidgetCard.vue'
import ChartWidget from '@/components/dashboard/ChartWidget.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useSessionStore } from '@/stores/session'

const { t } = useI18n()
const dashboardStore = useDashboardStore()
const sessionStore = useSessionStore()

// Create non-reactive chart data to prevent Chart.js reactivity issues
const userGrowthChartData = computed(() => ({
  labels: [...dashboardStore.userGrowthData.labels],
  datasets: [{
    label: t('dashboard_page.user_growth'),
    data: [...dashboardStore.userGrowthData.data],
    borderColor: 'rgb(212, 164, 62)',
    backgroundColor: 'rgba(212, 164, 62, 0.1)',
    fill: true,
    tension: 0.4,
  }]
}))

const appointmentStatsChartData = computed(() => ({
  labels: [...dashboardStore.appointmentStatsData.labels],
  datasets: [{
    label: t('dashboard_page.appointment_stats'),
    data: [...dashboardStore.appointmentStatsData.data],
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: 1,
  }]
}))

interface Widget {
  id: string
  title: string
  icon: any
  expanded: boolean
  collapsed: boolean
}

const widgets = ref<Widget[]>([
  {
    id: 'user-growth',
    title: 'dashboard_page.user_growth',
    icon: ChartBarIcon,
    expanded: false,
    collapsed: false,
  },
  {
    id: 'appointment-stats',
    title: 'dashboard_page.appointment_stats',
    icon: CalendarDaysIcon,
    expanded: false,
    collapsed: false,
  },
  {
    id: 'recent-activities',
    title: 'dashboard_page.recent_activities',
    icon: BellAlertIcon,
    expanded: false,
    collapsed: false,
  },
  {
    id: 'system-status',
    title: 'dashboard_page.system_status',
    icon: ServerIcon,
    expanded: false,
    collapsed: false,
  },
])

const isDragging = ref(false)
let refreshInterval: number | null = null

function toggleExpand(id: string) {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.expanded = !widget.expanded
  }
}

function toggleCollapse(id: string) {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.collapsed = !widget.collapsed
  }
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    user_registered: 'bg-green-500',
    appointment_created: 'bg-blue-500',
    appointment_completed: 'bg-purple-500',
    message_sent: 'bg-orange-500',
  }
  return colors[type] || 'bg-gray-500'
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

  if (diff < 60) return 'همین الان'
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`
  return `${Math.floor(diff / 86400)} روز پیش`
}

onMounted(async () => {
  // Initial data fetch
  await dashboardStore.refreshAll()
  
  // Setup Socket.IO listeners for real-time updates
  dashboardStore.setupSocketListeners()
  
  // Refresh data every 30 seconds
  refreshInterval = window.setInterval(() => {
    dashboardStore.fetchStats()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
