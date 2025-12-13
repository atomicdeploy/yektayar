<template>
  <main class="main-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1>تنظیمات</h1>
        <p class="subtitle">مدیریت تنظیمات برنامه و اطلاعات تماس</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <LoadingSpinner size="48px" class="text-primary-500 mx-auto" />
      <p>در حال بارگذاری تنظیمات...</p>
    </div>

    <!-- Settings Form -->
    <div v-else class="card-grid">
      <!-- Contact Information -->
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">اطلاعات تماس</h2>
          
          <div class="form-group">
            <label>شماره تلفن</label>
            <input
              v-model="settings.contact_phone"
              type="text"
              placeholder="+98 21 1234 5678"
            />
          </div>

          <div class="form-group">
            <label>ایمیل</label>
            <input
              v-model="settings.contact_email"
              type="email"
              placeholder="info@yektayar.com"
            />
          </div>

          <div class="form-group">
            <label>آدرس (فارسی)</label>
            <textarea
              v-model="settings.contact_address"
              rows="2"
              placeholder="تهران، خیابان ولیعصر"
            ></textarea>
          </div>

          <div class="form-group">
            <label>آدرس (انگلیسی)</label>
            <textarea
              v-model="settings.contact_address_en"
              rows="2"
              placeholder="Tehran, Vali Asr Street"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Map Coordinates -->
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">موقعیت جغرافیایی</h2>
          
          <div class="form-group">
            <label>عرض جغرافیایی (Latitude)</label>
            <input
              v-model.number="settings.contact_map_lat"
              type="number"
              step="0.0001"
              placeholder="35.6892"
            />
          </div>

          <div class="form-group">
            <label>طول جغرافیایی (Longitude)</label>
            <input
              v-model.number="settings.contact_map_lng"
              type="number"
              step="0.0001"
              placeholder="51.3890"
            />
          </div>

          <div class="info-box">
            <p class="info-text">
              برای دریافت مختصات:
            </p>
            <ol class="info-list">
              <li>به Google Maps بروید</li>
              <li>روی موقعیت مورد نظر کلیک راست کنید</li>
              <li>مختصات را کپی کنید</li>
            </ol>
          </div>

          <div class="info-box-blue">
            <p class="info-box-blue-text">
              <strong>موقعیت فعلی:</strong><br />
              {{ settings.contact_map_lat }}, {{ settings.contact_map_lng }}
            </p>
            <a 
              :href="`https://www.google.com/maps/search/?api=1&query=${settings.contact_map_lat},${settings.contact_map_lng}`"
              target="_blank"
              class="info-link"
            >
              <ArrowTopRightOnSquareIcon class="w-4 h-4 ms-1" />
              مشاهده در نقشه
            </a>
          </div>
        </div>
      </div>

      <!-- Support Tickets -->
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">تیکت‌های پشتیبانی</h2>
          
          <div v-if="loadingTickets" class="loading-state">
            <LoadingSpinner size="32px" class="text-primary-500 mx-auto" />
          </div>

          <div v-else-if="tickets.length === 0" class="empty-state py-10 px-5">
            <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-400" />
            <p class="mt-2">تیکتی وجود ندارد</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div 
              v-for="ticket in tickets.slice(0, 5)" 
              :key="ticket.id"
              class="list-item"
            >
              <div class="ticket-header">
                <h4 class="ticket-title">{{ ticket.subject }}</h4>
                <span :class="['status-badge', ticket.status === 'open' ? 'draft' : 'published']">
                  {{ ticket.status === 'open' ? 'باز' : 'بسته' }}
                </span>
              </div>
              <p class="ticket-message">{{ ticket.message }}</p>
              <div class="ticket-footer">
                <span class="ticket-date">{{ formatDate(ticket.created_at) }}</span>
                <span :class="['status-badge', getPriorityClass(ticket.priority)]">
                  {{ getPriorityLabel(ticket.priority) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Pages -->
      <div class="card">
        <div class="card-body">
          <div class="page-header">
            <h2 class="card-title mb-0">صفحات اخیر</h2>
            <router-link
              to="/pages"
              class="link-primary"
            >
              مشاهده همه
            </router-link>
          </div>
          
          <div v-if="loadingPages" class="loading-state">
            <LoadingSpinner size="32px" class="text-primary-500 mx-auto" />
          </div>

          <div v-else-if="recentPages.length === 0" class="empty-state py-10 px-5">
            <DocumentTextIcon class="w-12 h-12 text-gray-400" />
            <p class="mt-2">صفحه‌ای وجود ندارد</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <router-link 
              v-for="page in recentPages.slice(0, 5)" 
              :key="page.id"
              to="/pages"
              class="list-item"
            >
              <h4 class="page-title">{{ page.title }}</h4>
              <p class="page-slug">{{ page.slug }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6">
      <button
        @click="saveSettings"
        :disabled="saving"
        class="btn btn-primary btn-lg"
      >
        <CheckIcon v-if="!saving" class="w-5 h-5" />
        <LoadingSpinner v-else size="20px" class="text-white" />
        {{ saving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  CheckIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

const loading = ref(true)
const saving = ref(false)
const loadingTickets = ref(true)
const loadingPages = ref(true)

const settings = ref({
  contact_phone: '',
  contact_email: '',
  contact_address: '',
  contact_address_en: '',
  contact_map_lat: 35.6892,
  contact_map_lng: 51.3890,
})

const tickets = ref<any[]>([])
const recentPages = ref<any[]>([])

async function loadSettings() {
  loading.value = true
  try {
    const response = await apiClient.get('/settings', { skipAuth: true })
    if (response.success && response.data) {
      settings.value = {
        contact_phone: response.data.contact_phone || '',
        contact_email: response.data.contact_email || '',
        contact_address: response.data.contact_address || '',
        contact_address_en: response.data.contact_address_en || '',
        contact_map_lat: parseFloat(response.data.contact_map_lat) || 35.6892,
        contact_map_lng: parseFloat(response.data.contact_map_lng) || 51.3890,
      }
    }
  } catch (error) {
    logger.error('Error loading settings:', error)
  } finally {
    loading.value = false
  }
}

/* TODO: use a elegant alternative with custom UI instead of `alert()` in the entire project */

async function saveSettings() {
  saving.value = true
  try {
    // Update each setting individually
    const settingsToUpdate = [
      { key: 'contact_phone', value: settings.value.contact_phone, type: 'string' },
      { key: 'contact_email', value: settings.value.contact_email, type: 'string' },
      { key: 'contact_address', value: settings.value.contact_address, type: 'string' },
      { key: 'contact_address_en', value: settings.value.contact_address_en, type: 'string' },
      { key: 'contact_map_lat', value: settings.value.contact_map_lat.toString(), type: 'number' },
      { key: 'contact_map_lng', value: settings.value.contact_map_lng.toString(), type: 'number' },
    ]

    for (const setting of settingsToUpdate) {
      await apiClient.put(`/settings/${setting.key}`, {
        value: setting.value,
        type: setting.type
      }, { skipAuth: true })
    }

    alert('تنظیمات با موفقیت ذخیره شد')
  } catch (error) {
    logger.error('Error saving settings:', error)
    alert('خطا در ذخیره تنظیمات')
  } finally {
    saving.value = false
  }
}

async function loadTickets() {
  loadingTickets.value = true
  try {
    const response = await apiClient.get('/support/tickets?status=open', { skipAuth: true })
    if (response.success) {
      tickets.value = response.data || []
    }
  } catch (error) {
    logger.error('Error loading tickets:', error)
  } finally {
    loadingTickets.value = false
  }
}

async function loadPages() {
  loadingPages.value = true
  try {
    const response = await apiClient.get('/pages', { skipAuth: true })
    if (response.success) {
      recentPages.value = response.data || []
    }
  } catch (error) {
    logger.error('Error loading pages:', error)
  } finally {
    loadingPages.value = false
  }
}

function getPriorityClass(priority: string) {
  const classes: Record<string, string> = {
    low: 'draft',
    normal: 'published',
    high: 'draft',
    urgent: 'blocked',
  }
  return classes[priority] || classes.normal
}

function getPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: 'کم',
    normal: 'متوسط',
    high: 'بالا',
    urgent: 'فوری',
  }
  return labels[priority] || priority
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadSettings()
  loadTickets()
  loadPages()
})
</script>
