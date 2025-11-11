<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('dashboard_page.title') }}</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('dashboard_page.welcome_message') }}</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
    <div class="mb-8">
      <draggable
        v-model="widgets"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
              :data="{
                labels: dashboardStore.userGrowthData.labels,
                datasets: [{
                  label: t('dashboard_page.user_growth'),
                  data: dashboardStore.userGrowthData.data,
                  borderColor: 'rgb(212, 164, 62)',
                  backgroundColor: 'rgba(212, 164, 62, 0.1)',
                  fill: true,
                  tension: 0.4,
                }]
              }"
            />

            <!-- Appointment Stats Chart -->
            <ChartWidget
              v-if="element.id === 'appointment-stats'"
              type="bar"
              :data="{
                labels: dashboardStore.appointmentStatsData.labels,
                datasets: [{
                  label: t('dashboard_page.appointment_stats'),
                  data: dashboardStore.appointmentStatsData.data,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: 'rgb(59, 130, 246)',
                  borderWidth: 1,
                }]
              }"
            />

            <!-- Recent Activities -->
            <div v-if="element.id === 'recent-activities'" class="space-y-3">
              <div
                v-for="activity in dashboardStore.recentActivities"
                :key="activity.id"
                class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div
                  :class="[
                    'w-2 h-2 rounded-full mt-2',
                    getActivityColor(activity.type),
                  ]"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ formatTimestamp(activity.timestamp) }}
                  </p>
                </div>
              </div>
              <div v-if="dashboardStore.recentActivities.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                {{ t('dashboard_page.no_activities') }}
              </div>
            </div>

            <!-- System Status -->
            <div v-if="element.id === 'system-status'" class="space-y-4">
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">API Server</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">آنلاین</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div class="flex items-center gap-3">
                  <div :class="['w-3 h-3 rounded-full', sessionStore.isSocketConnected ? 'bg-green-500' : 'bg-red-500']"></div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">WebSocket</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ sessionStore.isSocketConnected ? 'متصل' : 'قطع شده' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">آنلاین</span>
              </div>
            </div>
          </WidgetCard>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
