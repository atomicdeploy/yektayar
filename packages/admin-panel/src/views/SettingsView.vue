<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">تنظیمات</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">مدیریت تنظیمات برنامه و اطلاعات تماس</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Settings Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Contact Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">اطلاعات تماس</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تلفن</label>
            <input
              v-model="settings.contact_phone"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+98 21 1234 5678"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
            <input
              v-model="settings.contact_email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="info@yektayar.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس (فارسی)</label>
            <textarea
              v-model="settings.contact_address"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="تهران، خیابان ولیعصر"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس (انگلیسی)</label>
            <textarea
              v-model="settings.contact_address_en"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tehran, Vali Asr Street"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Map Coordinates -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">موقعیت جغرافیایی</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عرض جغرافیایی (Latitude)</label>
            <input
              v-model.number="settings.contact_map_lat"
              type="number"
              step="0.0001"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="35.6892"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">طول جغرافیایی (Longitude)</label>
            <input
              v-model.number="settings.contact_map_lng"
              type="number"
              step="0.0001"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="51.3890"
            />
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              برای دریافت مختصات:
            </p>
            <ol class="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>به Google Maps بروید</li>
              <li>روی موقعیت مورد نظر کلیک راست کنید</li>
              <li>مختصات را کپی کنید</li>
            </ol>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p class="text-sm text-blue-800 dark:text-blue-300">
              <strong>موقعیت فعلی:</strong><br />
              {{ settings.contact_map_lat }}, {{ settings.contact_map_lng }}
            </p>
            <a 
              :href="`https://www.google.com/maps/search/?api=1&query=${settings.contact_map_lat},${settings.contact_map_lng}`"
              target="_blank"
              class="inline-flex items-center mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              مشاهده در نقشه
            </a>
          </div>
        </div>
      </div>

      <!-- Support Tickets -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">تیکت‌های پشتیبانی</h2>
        
        <div v-if="loadingTickets" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="tickets.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">تیکتی وجود ندارد</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="ticket in tickets.slice(0, 5)" 
            :key="ticket.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-medium text-gray-900 dark:text-white text-sm">{{ ticket.subject }}</h4>
              <span :class="['text-xs px-2 py-1 rounded', getStatusClass(ticket.status)]">
                {{ ticket.status === 'open' ? 'باز' : 'بسته' }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ ticket.message }}</p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-gray-500">{{ formatDate(ticket.created_at) }}</span>
              <span :class="['text-xs px-2 py-1 rounded', getPriorityClass(ticket.priority)]">
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Pages -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">صفحات اخیر</h2>
          <button
            @click="$router.push('/pages')"
            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            مشاهده همه
          </button>
        </div>
        
        <div v-if="loadingPages" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="recentPages.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">صفحه‌ای وجود ندارد</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="page in recentPages.slice(0, 5)" 
            :key="page.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            @click="$router.push('/pages')"
          >
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">{{ page.title }}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{{ page.slug }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6">
      <button
        @click="saveSettings"
        :disabled="saving"
        class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        <svg v-if="!saving" class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div v-else class="w-5 h-5 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ saving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api'

const router = useRouter()

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
    const response = await apiClient.get('/api/settings', { skipAuth: true })
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
    console.error('Error loading settings:', error)
  } finally {
    loading.value = false
  }
}

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
      await apiClient.put(`/api/settings/${setting.key}`, {
        value: setting.value,
        type: setting.type
      }, { skipAuth: true })
    }

    alert('تنظیمات با موفقیت ذخیره شد')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('خطا در ذخیره تنظیمات')
  } finally {
    saving.value = false
  }
}

async function loadTickets() {
  loadingTickets.value = true
  try {
    const response = await apiClient.get('/api/support/tickets?status=open', { skipAuth: true })
    if (response.success) {
      tickets.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading tickets:', error)
  } finally {
    loadingTickets.value = false
  }
}

async function loadPages() {
  loadingPages.value = true
  try {
    const response = await apiClient.get('/api/pages', { skipAuth: true })
    if (response.success) {
      recentPages.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading pages:', error)
  } finally {
    loadingPages.value = false
  }
}

function getStatusClass(status: string) {
  return status === 'open' 
    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
}

function getPriorityClass(priority: string) {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
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
