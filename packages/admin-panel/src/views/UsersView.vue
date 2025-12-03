<template>
  <main class="users-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('users_page.title') }}</h1>
        <p class="subtitle">{{ t('users_page.list_title') }}</p>
      </div>
      <div class="header-actions">
        <ViewModeToggle v-model="viewMode" />
        <button
          v-if="permissionsStore.hasPermission('edit_users')"
          class="btn btn-primary"
        >
          <PlusIcon class="w-5 h-5" />
          {{ t('users_page.add_user') }}
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="filters-section">
      <div class="filter-group flex-1 relative">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('users_page.search_placeholder')"
          class="search-input"
        />
      </div>
      <div class="filter-group flex gap-2">
        <select
          v-model="filterRole"
          class="filter-select"
        >
          <option value="">همه نقش‌ها</option>
          <option value="admin">{{ t('roles.admin') }}</option>
          <option value="psychologist">{{ t('roles.psychologist') }}</option>
          <option value="user">{{ t('roles.user') }}</option>
          <option value="moderator">{{ t('roles.moderator') }}</option>
        </select>
        <select
          v-model="filterStatus"
          class="filter-select"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="active">{{ t('status.active') }}</option>
          <option value="inactive">{{ t('status.inactive') }}</option>
          <option value="blocked">{{ t('status.blocked') }}</option>
        </select>
      </div>
    </div>

    <!-- Users Table (Default view) -->
    <div v-if="viewMode === 'table'" class="users-table">
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

    <!-- Users Card View -->
    <div v-else class="users-grid">
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner size="48px" class="text-primary-500 mx-auto" />
        <p>{{ t('loading') }}</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        {{ t('users_page.no_users') }}
      </div>

      <div v-else v-for="user in paginatedUsers" :key="user.id" class="user-card">
        <div class="user-card-header">
          <div class="user-avatar">
            <span>{{ getInitials(user.name) }}</span>
          </div>
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <span
              :class="[
                'status-badge',
                getStatusBadgeClass(user.status),
              ]"
            >
              {{ t(`status.${user.status}`) }}
            </span>
          </div>
        </div>
        <div class="user-card-body">
          <div class="user-detail">
            <span class="label">{{ t('users_page.email') }}</span>
            <span class="value">{{ user.email }}</span>
          </div>
          <div class="user-detail">
            <span class="label">{{ t('users_page.phone') }}</span>
            <span class="value">{{ user.phone }}</span>
          </div>
          <div class="user-detail">
            <span class="label">{{ t('users_page.role') }}</span>
            <span
              :class="[
                'role-badge',
                getRoleBadgeClass(user.role),
              ]"
            >
              {{ t(`roles.${user.role}`) }}
            </span>
          </div>
          <div class="user-detail">
            <span class="label">{{ t('users_page.created_at') }}</span>
            <span class="value">{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
        <div v-if="permissionsStore.hasPermission('edit_users')" class="user-card-actions">
          <button
            @click="editUser(user.id)"
            class="btn-icon"
            :title="t('edit')"
          >
            <PencilIcon class="w-5 h-5" />
          </button>
          <button
            v-if="permissionsStore.hasPermission('delete_users')"
            @click="deleteUser(user.id)"
            class="btn-icon btn-danger"
            :title="t('delete')"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
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
  </main>
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
import { useViewMode } from '@/composables/useViewMode'
import { logger } from '@yektayar/shared'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'

const { t } = useI18n()
const permissionsStore = usePermissionsStore()
const { viewMode } = useViewMode('users-view-mode', 'table') // Default to table view for users

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

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'علی محمدی',
    email: 'ali@example.com',
    phone: '09121234567',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'سارا احمدی',
    email: 'sara@example.com',
    phone: '09129876543',
    role: 'psychologist',
    status: 'active',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'محمد رضایی',
    email: 'mohammad@example.com',
    phone: '09135551234',
    role: 'user',
    status: 'active',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'فاطمه کریمی',
    email: 'fatemeh@example.com',
    phone: '09141112233',
    role: 'moderator',
    status: 'active',
    createdAt: new Date('2024-03-25'),
  },
  {
    id: '5',
    name: 'رضا حسینی',
    email: 'reza@example.com',
    phone: '09151234567',
    role: 'user',
    status: 'inactive',
    createdAt: new Date('2024-04-05'),
  },
]

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
    // TODO: Fetch from API
    // For now, use mock data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    users.value = mockUsers
  } catch (error) {
    logger.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.users-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  .header-content {
    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .subtitle {
      margin: 0;
      font-size: 16px;
      color: var(--text-secondary);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.filters-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .filter-group {
    &.flex-1 {
      position: relative;
    }

    &.flex {
      display: flex;
      gap: 8px;
    }
  }

  .search-input,
  .filter-select {
    width: 100%;
    padding: 12px 16px;
    padding-left: 40px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    }
  }

  .filter-select {
    padding-left: 16px;
  }
}

.users-table {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .loading-state,
  .empty-state {
    padding: 60px 20px;
    text-align: center;
    color: var(--text-secondary);
  }

  table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background: var(--bg-secondary);
      border-bottom: 2px solid var(--border-color);

      th {
        padding: 16px 24px;
        text-align: right;
        font-weight: 600;
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--bg-secondary);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 16px 24px;
        color: var(--text-primary);
        font-size: 14px;
      }
    }
  }
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .loading-state,
  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 20px;
    text-align: center;
    color: var(--text-secondary);
  }
}

.user-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .user-card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--primary-gradient);
    color: white;

    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
    }

    .user-info {
      flex: 1;

      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .user-card-body {
    padding: 20px;

    .user-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .value {
        font-size: 14px;
        color: var(--text-primary);
      }

      .role-badge,
      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
    }
  }

  .user-card-actions {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);

    .btn-icon {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      &.btn-danger:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
        color: #ef4444;
      }
    }
  }
}

.status-badge,
.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &.btn-primary {
    background: var(--primary-gradient);
    color: white;

    &:hover {
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
      transform: translateY(-2px);
    }
  }
}
</style>
