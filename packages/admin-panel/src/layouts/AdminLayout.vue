<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300',
        isRTL ? 'right-0' : 'left-0',
        isSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full',
        'lg:translate-x-0',
      ]"
    >
      <div class="flex h-full flex-col bg-white dark:bg-gray-800 shadow-lg">
        <!-- Logo/Header -->
        <div class="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span class="text-white font-bold text-lg">ی</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('admin_panel') }}</h1>
          </div>
          <button
            @click="toggleSidebar"
            class="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Navigation -->
        <OverlayScrollbarsComponent
          class="flex-1 px-4 py-6"
          :options="{ scrollbars: { theme: 'os-theme-yektayar', visibility: 'auto', autoHide: 'leave', autoHideDelay: 800 } }"
          defer
        >
          <nav>
            <ul class="space-y-2">
              <li v-for="item in visibleNavItems" :key="item.to">
                <router-link
                  :to="item.to"
                  :class="[
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive(item.to)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                  ]"
                >
                  <component :is="item.icon" class="w-5 h-5" />
                  <span class="font-medium">{{ t(item.label) }}</span>
                </router-link>
              </li>
            </ul>
          </nav>
        </OverlayScrollbarsComponent>

        <!-- User section -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-3 px-2 py-2">
            <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <UserIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">مدیر سیستم</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ permissionsStore.userRole }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Main content -->
    <div
      :class="[
        'transition-all duration-300',
        isRTL ? 'lg:mr-64' : 'lg:ml-64',
      ]"
    >
      <!-- Header -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-6 shadow-sm">
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Bars3Icon class="w-6 h-6" />
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ pageTitle }}</h2>
        </div>

        <div class="flex items-center gap-4">
          <!-- Theme toggle -->
          <button
            @click="toggleTheme()"
            :title="currentTheme === 'auto' ? 'سیستم (پیش‌فرض)' : currentTheme === 'dark' ? 'حالت تاریک' : 'حالت روشن'"
            class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ComputerDesktopIcon v-if="currentTheme === 'auto'" class="w-5 h-5" />
            <MoonIcon v-else-if="currentTheme === 'dark'" class="w-5 h-5" />
            <SunIcon v-else class="w-5 h-5" />
          </button>

          <!-- Connection status -->
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                isSocketConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ isSocketConnected ? 'متصل' : 'قطع شده' }}
            </span>
          </div>

          <!-- Logout button -->
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {{ t('logout') }}
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ComputerDesktopIcon,
} from '@heroicons/vue/24/outline'
import { useSessionStore } from '@/stores/session'
import { usePermissionsStore } from '@/stores/permissions'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const permissionsStore = usePermissionsStore()

const { currentTheme, toggleTheme } = useTheme()

const isSidebarOpen = ref(false)
const isRTL = computed(() => locale.value === 'fa')
const isSocketConnected = computed(() => sessionStore.isSocketConnected)

const pageTitle = computed(() => {
  return route.meta.title as string || t('dashboard')
})

// Navigation items with permissions
const navItems = [
  {
    to: '/dashboard',
    label: 'nav.dashboard',
    icon: HomeIcon,
    permission: 'view_dashboard' as const,
  },
  {
    to: '/users',
    label: 'nav.users',
    icon: UsersIcon,
    permission: 'view_users' as const,
  },
  {
    to: '/appointments',
    label: 'nav.appointments',
    icon: CalendarDaysIcon,
    permission: 'view_appointments' as const,
  },
  {
    to: '/messages',
    label: 'nav.messages',
    icon: ChatBubbleLeftRightIcon,
    permission: 'view_messages' as const,
  },
  {
    to: '/courses',
    label: 'nav.courses',
    icon: AcademicCapIcon,
    permission: 'view_courses' as const,
  },
  {
    to: '/tests',
    label: 'nav.tests',
    icon: ClipboardDocumentCheckIcon,
    permission: 'view_tests' as const,
  },
  {
    to: '/pages',
    label: 'nav.pages',
    icon: DocumentTextIcon,
    permission: 'view_pages' as const,
  },
  {
    to: '/reports',
    label: 'nav.reports',
    icon: ChartBarIcon,
    permission: 'view_reports' as const,
  },
  {
    to: '/settings',
    label: 'nav.settings',
    icon: Cog6ToothIcon,
    permission: 'view_settings' as const,
  },
]

// Filter navigation items based on permissions
const visibleNavItems = computed(() => {
  return navItems.filter((item) => permissionsStore.hasPermission(item.permission))
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

async function handleLogout() {
  await sessionStore.logout()
  router.push('/')
}
</script>
