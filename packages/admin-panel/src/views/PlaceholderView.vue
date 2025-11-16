<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center max-w-md px-6">
      <div class="mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <component 
            :is="icon" 
            class="w-10 h-10 text-gray-400 dark:text-gray-600"
          />
        </div>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {{ title }}
      </h1>
      
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ t('placeholder.coming_soon_message') }}
      </p>
      
      <router-link
        to="/dashboard"
        class="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
      >
        <ArrowLeftIcon class="w-5 h-5 ml-2" />
        {{ t('placeholder.back_to_dashboard') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const route = useRoute()

const routeIconMap: Record<string, any> = {
  appointments: CalendarDaysIcon,
  messages: ChatBubbleLeftRightIcon,
  courses: AcademicCapIcon,
  reports: ChartBarIcon,
  settings: Cog6ToothIcon,
}

const icon = computed(() => {
  return routeIconMap[route.name as string] || WrenchScrewdriverIcon
})

const title = computed(() => {
  return route.meta?.title as string || t('placeholder.page_title')
})
</script>
