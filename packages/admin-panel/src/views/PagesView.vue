<template>
  <main class="main-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('pages_page.title') }}</h1>
        <p class="subtitle">{{ t('pages_page.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button
          @click="createNewPage"
          class="btn btn-primary"
        >
          <PlusIcon class="w-5 h-5" />
          {{ t('pages_page.add_page') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <LoadingSpinner size="48px" class="text-primary-500 mx-auto" />
      <p>{{ t('pages_page.loading') }}</p>
    </div>

    <!-- Pages List -->
    <div v-else-if="pages.length > 0" class="data-table">
      <table>
        <thead>
          <tr>
            <th>{{ t('pages_page.page_title') }}</th>
            <th>{{ t('pages_page.slug') }}</th>
            <th>{{ t('pages_page.created_at') }}</th>
            <th>{{ t('pages_page.updated_at') }}</th>
            <th>{{ t('pages_page.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="page in pages" :key="page.id" class="clickable" @click="editPage(page)">
            <td>
              <strong>{{ page.title }}</strong>
            </td>
            <td>
              <span class="slug-text">{{ page.slug }}</span>
            </td>
            <td>{{ page.created_at ? formatDate(page.created_at) : '-' }}</td>
            <td>{{ page.updated_at ? formatDate(page.updated_at) : '-' }}</td>
            <td @click.stop>
              <div class="action-buttons">
                <button
                  @click="editPage(page)"
                  class="btn-icon"
                  :title="t('pages_page.edit')"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  @click="deletePage(page)"
                  class="btn-icon btn-danger"
                  :title="t('pages_page.delete')"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <DocumentTextIcon class="w-16 h-16 text-gray-400" />
      <h3>{{ t('pages_page.no_pages') }}</h3>
      <p>{{ t('pages_page.no_pages_message') }}</p>
      <button
        @click="createNewPage"
        class="btn btn-primary"
      >
        <PlusIcon class="w-5 h-5" />
        {{ t('pages_page.add_page') }}
      </button>
    </div>

    <!-- Edit/Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>{{ editingPage?.id ? t('pages_page.edit_page') : t('pages_page.create_page') }}</h2>
          <button class="btn-close" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="savePage">
            <div class="form-group">
              <label>{{ t('pages_page.page_title') }}</label>
              <input
                v-model="editingPage.title"
                type="text"
                required
                :placeholder="t('pages_page.title_placeholder')"
              />
            </div>

            <div class="form-group">
              <label>{{ t('pages_page.slug') }}</label>
              <input
                v-model="editingPage.slug"
                type="text"
                required
                :disabled="!!editingPage.id"
                :placeholder="t('pages_page.slug_placeholder')"
              />
              <p class="helper-text">
                {{ t('pages_page.slug_hint') }}
              </p>
            </div>

            <div class="form-group">
              <label>{{ t('pages_page.content') }}</label>
              <textarea
                v-model="editingPage.content"
                rows="12"
                required
                :placeholder="t('pages_page.content_placeholder')"
                class="modal-textarea"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showModal = false">
                {{ t('pages_page.cancel') }}
              </button>
              <button type="submit" class="btn btn-info" :disabled="saving">
                {{ saving ? t('loading') : t('pages_page.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

const { t } = useI18n()

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
    const response = await apiClient.get('/pages', { skipAuth: true })
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
      await apiClient.put(`/pages/${editingPage.value.slug}`, {
        title: editingPage.value.title,
        content: editingPage.value.content
      }, { skipAuth: true })
    } else {
      // Create new page
      await apiClient.post('/pages', editingPage.value, { skipAuth: true })
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
