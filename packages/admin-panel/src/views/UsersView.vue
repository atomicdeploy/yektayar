<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('users_page.title') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('users_page.list_title') }}</p>
      </div>
      <button
        v-if="permissionsStore.hasPermission('edit_users')"
        class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
      >
        <PlusIcon class="w-5 h-5" />
        {{ t('users_page.add_user') }}
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1 relative">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('users_page.search_placeholder')"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterRole"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">همه نقش‌ها</option>
          <option value="admin">{{ t('roles.admin') }}</option>
          <option value="psychologist">{{ t('roles.psychologist') }}</option>
          <option value="user">{{ t('roles.user') }}</option>
          <option value="moderator">{{ t('roles.moderator') }}</option>
        </select>
        <select
          v-model="filterStatus"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="active">{{ t('status.active') }}</option>
          <option value="inactive">{{ t('status.inactive') }}</option>
          <option value="blocked">{{ t('status.blocked') }}</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <LoadingSpinner size="48px" class="text-primary-500 mx-auto" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">{{ t('loading') }}</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        {{ t('users_page.no_users') }}
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.name') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.email') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.phone') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.role') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.status') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.created_at') }}
            </th>
            <th v-if="permissionsStore.hasPermission('edit_users')" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('users_page.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr
            v-for="user in paginatedUsers"
            :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span class="text-primary-600 dark:text-primary-400 font-medium">
                    {{ getInitials(user.name) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.phone }}</p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getRoleBadgeClass(user.role),
                ]"
              >
                {{ t(`roles.${user.role}`) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusBadgeClass(user.status),
                ]"
              >
                {{ t(`status.${user.status}`) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(user.createdAt) }}</p>
            </td>
            <td v-if="permissionsStore.hasPermission('edit_users')" class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <button
                  @click="editUser(user.id)"
                  class="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  :title="t('edit')"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  v-if="permissionsStore.hasPermission('delete_users')"
                  @click="deleteUser(user.id)"
                  class="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  :title="t('delete')"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        نمایش {{ startIndex + 1 }} تا {{ Math.min(endIndex, filteredUsers.length) }} از {{ filteredUsers.length }} کاربر
      </p>
      <div class="flex gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          قبلی
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-4 py-2 rounded-lg font-medium',
            page === currentPage
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          بعدی
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { usePermissionsStore } from '@/stores/permissions'
import { logger } from '@yektayar/shared'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const { t } = useI18n()
const permissionsStore = usePermissionsStore()

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'psychologist' | 'user' | 'moderator'
  status: 'active' | 'inactive' | 'blocked'
  createdAt: Date
}

const isLoading = ref(false)
const users = ref<User[]>([])
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const filteredUsers = computed(() => {
  let result = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
    )
  }

  // Apply role filter
  if (filterRole.value) {
    result = result.filter((user) => user.role === filterRole.value)
  }

  // Apply status filter
  if (filterStatus.value) {
    result = result.filter((user) => user.status === filterStatus.value)
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    psychologist: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    moderator: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    user: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  }
  return classes[role] || classes.user
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    blocked: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return classes[status] || classes.inactive
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function editUser(id: string) {
  logger.info('Edit user:', id)
  // TODO: Implement edit user modal
}

function deleteUser(id: string) {
  logger.info('Delete user:', id)
  // TODO: Implement delete confirmation
}

async function fetchUsers() {
  isLoading.value = true
  try {
    // Fetch users from API
    const response = await fetch(`${API_BASE_URL}/api/users`)
    const result = await response.json()
    
    if (result.success && result.data) {
      // Convert createdAt strings to Date objects
      users.value = result.data.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }))
    } else {
      logger.error('Failed to fetch users:', result.error || result.message)
      users.value = []
    }
  } catch (error) {
    logger.error('Error fetching users:', error)
    users.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
