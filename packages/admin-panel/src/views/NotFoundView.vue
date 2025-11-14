<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12">
    <div class="max-w-4xl w-full">
      <!-- Main 404 Section -->
      <div class="text-center mb-12">
        <!-- Animated 404 Icon -->
        <div class="relative inline-block mb-8">
          <div class="relative">
            <!-- Gradient Circle Background -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            
            <!-- Main Circle -->
            <div class="relative w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div class="text-center">
                <div class="text-7xl font-black text-white mb-2">{{ t('not_found.error_code') }}</div>
                <MagnifyingGlassIcon class="w-12 h-12 text-white/70 mx-auto animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        <!-- Title and Description -->
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('not_found.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          {{ t('not_found.description') }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            @click="goToDashboard"
            class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <HomeIcon class="w-5 h-5 ml-2" />
            {{ t('not_found.go_home') }}
          </button>
          <button
            @click="goBack"
            class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <ArrowLeftIcon class="w-5 h-5 ml-2" />
            {{ t('not_found.go_back') }}
          </button>
        </div>
      </div>

      <!-- Request Information Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <InformationCircleIcon class="w-6 h-6 text-primary-600 dark:text-primary-400 ml-2" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ t('not_found.request_info') }}
            </h2>
          </div>
          <button
            @click="copyDebugInfo"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            :title="t('not_found.copy_debug_info')"
          >
            <DocumentDuplicateIcon class="w-4 h-4" />
            {{ t('not_found.copy_debug_info') }}
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- Requested URL -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.requested_url') }}:
            </span>
            <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ currentPath }}
            </code>
          </div>

          <!-- Request Method -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.request_method') }}:
            </span>
            <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium inline-block">
              GET
            </span>
          </div>

          <!-- Timestamp -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.timestamp') }}:
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ timestamp }}
            </span>
          </div>

          <!-- User Agent -->
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {{ t('not_found.user_agent') }}:
            </span>
            <code class="px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ userAgent }}
            </code>
          </div>

          <!-- Referrer -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.referrer') }}:
            </span>
            <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ referrer || t('not_found.direct_access') }}
            </code>
          </div>

          <!-- Query Parameters -->
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {{ t('not_found.query_params') }}:
            </span>
            <code class="px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ queryParams }}
            </code>
          </div>
        </div>
      </div>

      <!-- Debug Information Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center mb-4">
          <CodeBracketIcon class="w-6 h-6 text-purple-600 dark:text-purple-400 ml-2" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ t('not_found.debug_info') }}
          </h2>
        </div>
        
        <div class="space-y-4">
          <!-- Route Name -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.route_name') }}:
            </span>
            <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ String(route.name) || 'N/A' }}
            </code>
          </div>

          <!-- Matched Pattern -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.matched_pattern') }}:
            </span>
            <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              :pathMatch(.*)*
            </code>
          </div>

          <!-- Full Path -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.full_path') }}:
            </span>
            <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ route.fullPath }}
            </code>
          </div>

          <!-- Hash -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">
              {{ t('not_found.hash') }}:
            </span>
            <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono break-all border border-gray-200 dark:border-gray-700">
              {{ route.hash || 'N/A' }}
            </code>
          </div>
        </div>
      </div>

      <!-- Suggestions Grid -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Suggestions Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center mb-4">
            <LightBulbIcon class="w-6 h-6 text-yellow-500 dark:text-yellow-400 ml-2" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ t('not_found.suggestions') }}
            </h3>
          </div>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{{ t('not_found.suggestion_1') }}</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{{ t('not_found.suggestion_2') }}</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{{ t('not_found.suggestion_3') }}</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{{ t('not_found.suggestion_4') }}</span>
            </li>
          </ul>
        </div>

        <!-- Quick Links Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center mb-4">
            <LinkIcon class="w-6 h-6 text-primary-600 dark:text-primary-400 ml-2" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ t('not_found.helpful_links') }}
            </h3>
          </div>
          <div class="space-y-2">
            <router-link
              v-for="link in quickLinks"
              :key="link.path"
              :to="link.path"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <component 
                :is="link.icon" 
                class="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" 
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ t(link.label) }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Search Section -->
      <div class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-primary-200 dark:border-gray-700">
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <MagnifyingGlassIcon class="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="flex-1">
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="performSearch"
              :placeholder="t('not_found.search_placeholder')"
              class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            @click="performSearch"
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            {{ locale === 'fa' ? 'جستجو' : 'Search' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  LightBulbIcon,
  CheckCircleIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  CodeBracketIcon,
} from '@heroicons/vue/24/outline'
import {
  Squares2X2Icon,
  UsersIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const searchQuery = ref('')
const userAgent = ref('')
const referrer = ref('')

const currentPath = computed(() => route.fullPath)
const timestamp = computed(() => {
  const date = new Date()
  return date.toLocaleString(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const queryParams = computed(() => {
  if (Object.keys(route.query).length === 0) {
    return t('not_found.none')
  }
  return JSON.stringify(route.query, null, 2)
})

onMounted(() => {
  userAgent.value = navigator.userAgent
  referrer.value = document.referrer
})

const quickLinks = [
  { path: '/dashboard', label: 'nav.dashboard', icon: Squares2X2Icon },
  { path: '/users', label: 'nav.users', icon: UsersIcon },
  { path: '/appointments', label: 'nav.appointments', icon: CalendarDaysIcon },
  { path: '/messages', label: 'nav.messages', icon: ChatBubbleLeftRightIcon },
  { path: '/settings', label: 'nav.settings', icon: Cog6ToothIcon },
]

const goToDashboard = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.back()
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // In a real application, you would implement search functionality here
    console.log('Searching for:', searchQuery.value)
    // For now, just redirect to dashboard
    goToDashboard()
  }
}

const copyDebugInfo = async () => {
  const debugInfo = `
404 Error Debug Information
===========================
Requested URL: ${currentPath.value}
Method: GET
Timestamp: ${timestamp.value}
User Agent: ${userAgent.value}
Referrer: ${referrer.value || t('not_found.direct_access')}
Query Parameters: ${queryParams.value}

Debug Information:
Route Name: ${String(route.name) || 'N/A'}
Matched Pattern: :pathMatch(.*)*
Full Path: ${route.fullPath}
Hash: ${route.hash || 'N/A'}
  `.trim()
  
  try {
    await navigator.clipboard.writeText(debugInfo)
    alert(t('not_found.debug_info_copied'))
  } catch (err) {
    console.error('Failed to copy debug info:', err)
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}
</style>
