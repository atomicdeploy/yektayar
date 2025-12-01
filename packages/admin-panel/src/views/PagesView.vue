<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          مدیریت صفحات
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          مشاهده و ویرایش محتوای صفحات
        </p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        @click="createNewPage"
      >
        <svg
          class="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        صفحه جدید
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>

    <!-- Pages List -->
    <div
      v-else-if="pages.length > 0"
      class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              عنوان
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Slug
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              تاریخ ایجاد
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              تاریخ بروزرسانی
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="page in pages"
            :key="page.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ page.title }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {{ page.slug }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {{ page.created_at ? formatDate(page.created_at) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {{ page.updated_at ? formatDate(page.updated_at) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <button
                class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 ml-4"
                @click="editPage(page)"
              >
                ویرایش
              </button>
              <button
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                @click="deletePage(page)"
              >
                حذف
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        صفحه‌ای وجود ندارد
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        برای شروع یک صفحه جدید ایجاد کنید
      </p>
      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          @click="createNewPage"
        >
          <svg
            class="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          صفحه جدید
        </button>
      </div>
    </div>

    <!-- Edit/Create Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showModal = false"
        />

        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ editingPage?.id ? 'ویرایش صفحه' : 'ایجاد صفحه جدید' }}
              </h3>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان</label>
                <input
                  v-model="editingPage.title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="عنوان صفحه"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <input
                  v-model="editingPage.slug"
                  type="text"
                  :disabled="!!editingPage.id"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  placeholder="about-us"
                >
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  URL slug (فقط حروف انگلیسی، اعداد و dash)
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">محتوا (Markdown)</label>
                <textarea
                  v-model="editingPage.content"
                  rows="12"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder="# عنوان&#10;&#10;محتوای صفحه..."
                />
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <button
              :disabled="saving"
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mr-3 sm:w-auto sm:text-sm disabled:opacity-50"
              @click="savePage"
            >
              {{ saving ? 'در حال ذخیره...' : 'ذخیره' }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
              @click="showModal = false"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

interface Page {
  id?: number
  slug: string
  title: string
  content: string
  metadata?: any
  created_at?: string
  updated_at?: string
}

const loading = ref(true)
const saving = ref(false)
const pages = ref<Page[]>([])
const showModal = ref(false)
const editingPage = ref<Partial<Page>>({
  slug: '',
  title: '',
  content: ''
})

async function loadPages() {
  loading.value = true
  try {
    const response = await apiClient.get('/api/pages', { skipAuth: true })
    if (response.success) {
      pages.value = response.data || []
    }
  } catch (error) {
    logger.error('Error loading pages:', error)
  } finally {
    loading.value = false
  }
}

function createNewPage() {
  editingPage.value = {
    slug: '',
    title: '',
    content: ''
  }
  showModal.value = true
}

function editPage(page: Page) {
  editingPage.value = { ...page }
  showModal.value = true
}

async function savePage() {
  if (!editingPage.value.slug || !editingPage.value.title || !editingPage.value.content) {
    alert('لطفاً تمام فیلدها را پر کنید')
    return
  }

  saving.value = true
  try {
    if (editingPage.value.id) {
      // Update existing page
      await apiClient.put(`/api/pages/${editingPage.value.slug}`, {
        title: editingPage.value.title,
        content: editingPage.value.content
      }, { skipAuth: true })
    } else {
      // Create new page
      await apiClient.post('/api/pages', editingPage.value, { skipAuth: true })
    }
    
    showModal.value = false
    await loadPages()
  } catch (error: any) {
    logger.error('Error saving page:', error)
    alert('خطا در ذخیره صفحه: ' + (error.message || 'خطای نامشخص'))
  } finally {
    saving.value = false
  }
}

async function deletePage(page: Page) {
  if (!confirm(`آیا از حذف صفحه "${page.title}" اطمینان دارید؟`)) {
    return
  }

  try {
    await apiClient.delete(`/api/pages/${page.slug}`, { skipAuth: true })
    await loadPages()
  } catch (error) {
    logger.error('Error deleting page:', error)
    alert('خطا در حذف صفحه')
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadPages()
})
</script>
