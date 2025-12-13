<template>
  <main class="main-view">
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
        <!-- TODO: avoid using "left" and "right" style CSS, use "inline" instead; to support both RTL and LTR correctly -->
        <!-- TODO: make this into re-usable component with selectable icon to make code DRY -->
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('users_page.search_placeholder')"
          class="search-input"
          style="padding-left: 3em"
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
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            @click="openUserEdit(user)"
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
              <div class="flex items-center gap-2" @click.stop>
                <button
                  @click="editUser(user)"
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

      <div v-else v-for="user in paginatedUsers" :key="user.id" class="user-card" @click="openUserEdit(user)">
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
        <div v-if="permissionsStore.hasPermission('edit_users')" class="user-card-actions" @click.stop>
          <button
            @click="editUser(user)"
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

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ t('users_page.edit_user') }}</h2>
          <button class="btn-close" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>{{ t('users_page.name') }} *</label>
              <input
                type="text"
                v-model="userForm.name"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>{{ t('users_page.email') }} *</label>
              <input
                type="email"
                v-model="userForm.email"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>{{ t('users_page.phone') }}</label>
              <input
                type="tel"
                v-model="userForm.phone"
                class="form-control"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('users_page.role') }} *</label>
                <select v-model="userForm.role" required class="form-control">
                  <option value="admin">{{ t('roles.admin') }}</option>
                  <option value="psychologist">{{ t('roles.psychologist') }}</option>
                  <option value="user">{{ t('roles.user') }}</option>
                  <option value="moderator">{{ t('roles.moderator') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('users_page.status') }} *</label>
                <select v-model="userForm.status" required class="form-control">
                  <option value="active">{{ t('status.active') }}</option>
                  <option value="inactive">{{ t('status.inactive') }}</option>
                  <option value="blocked">{{ t('status.blocked') }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeEditModal">
                <span>{{ t('cancel') }}</span>
                <!-- <kbd class="kbd">Esc</kbd> -->
              </button>
              <button type="submit" class="btn btn-info">
                <span>{{ t('save') }}</span>
                <!-- <kbd class="kbd">Ctrl+⏎</kbd> -->
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import apiClient from '@/api'

const { t } = useI18n()
const permissionsStore = usePermissionsStore()
const { viewMode } = useViewMode('main-view-mode', 'table') // Default to table view for users

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

const showEditModal = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({
  name: '',
  email: '',
  phone: '',
  role: 'user' as User['role'],
  status: 'active' as User['status'],
})

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

function openUserEdit(user: User) {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  }
  showEditModal.value = true
}

function editUser(user: User) {
  openUserEdit(user)
}

function closeEditModal() {
  showEditModal.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
  }
}

function saveUser() {
  if (editingUser.value) {
    // Update existing user
    const index = users.value.findIndex((u) => u.id === editingUser.value!.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...userForm.value,
      }
    }
    logger.info('User updated:', editingUser.value.id)
  }
  closeEditModal()
}

function deleteUser(id: string) {
  if (confirm(t('messages.confirm_delete'))) {
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
    logger.info('User deleted:', id)
  }
}

// Handle keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (showEditModal.value && event.key === 'Escape') {
    closeEditModal()
  }
  if (showEditModal.value && event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    saveUser()
  }
}

onMounted(() => {
  fetchUsers()
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

async function fetchUsers() {
  isLoading.value = true
  try {
    const response = await apiClient.get<any[]>('/api/users')
    
    if (response.success && response.data) {
      // Map backend data to frontend User interface
      users.value = response.data.map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: mapTypeToRole(user.type),
        status: user.is_active ? 'active' : 'inactive',
        createdAt: new Date(user.created_at),
      }))
    } else {
      throw new Error('Failed to fetch users')
    }
  } catch (error) {
    logger.error('Error fetching users:', error)
    users.value = []
  } finally {
    isLoading.value = false
  }
}

// Map backend user type to frontend role
function mapTypeToRole(type: string): 'admin' | 'psychologist' | 'user' | 'moderator' {
  const mapping: Record<string, 'admin' | 'psychologist' | 'user' | 'moderator'> = {
    'admin': 'admin',
    'psychologist': 'psychologist',
    'patient': 'user',
    'moderator': 'moderator',
  }
  return mapping[type] || 'user'
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
/* TODO: use our application's appropriate colors instead of hard coded ones below */
.users-table {
  table thead {
    background: rgb(249 250 251);
    border-bottom: 1px solid rgb(229 231 235);

    @media (prefers-color-scheme: dark) {
      background: rgb(55 65 81);
      border-bottom-color: rgb(75 85 99);
    }

    th {
      color: rgb(107 114 128);

      @media (prefers-color-scheme: dark) {
        color: rgb(156 163 175);
      }
    }
  }

  table tbody tr {
    border-bottom: 1px solid rgb(229 231 235);

    @media (prefers-color-scheme: dark) {
      border-bottom-color: rgb(75 85 99);
    }

    &:hover {
      background: rgb(249 250 251);

      @media (prefers-color-scheme: dark) {
        background: rgba(55, 65, 81, 0.5);
      }
    }
  }
}

.users-grid {
  .loading-state,
  .empty-state {
    grid-column: 1 / -1;
  }
}

.user-card {
  .user-avatar {
    font-size: 20px;
  }

  .user-card-body {
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
    }
  }

  .user-card-actions {
    display: flex;
    gap: 8px;

    .btn-icon {
      flex: 1;
    }
  }
}

</style>
