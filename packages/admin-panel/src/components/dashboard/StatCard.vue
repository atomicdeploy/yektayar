<template>
  <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ formattedValue }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1 mt-2">
          <ArrowTrendingUpIcon v-if="change > 0" class="w-4 h-4 text-green-500" />
          <ArrowTrendingDownIcon v-else-if="change < 0" class="w-4 h-4 text-red-500" />
          <span
            :class="[
              'text-sm font-medium',
              change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500',
            ]"
          >
            {{ changeText }}
          </span>
        </div>
      </div>
      <div
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center',
          bgColor,
        ]"
      >
        <component :is="icon" :class="['w-8 h-8', iconColor]" />
      </div>
    </div>
    <div v-if="loading" class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
      <LoadingSpinner size="32px" class="text-primary-500" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/solid'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

interface Props {
  label: string
  value: number | string
  icon: any
  change?: number
  bgColor?: string
  iconColor?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: 'bg-primary-100 dark:bg-primary-900/30',
  iconColor: 'text-primary-600 dark:text-primary-400',
  loading: false,
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('fa-IR')
  }
  return props.value
})

const changeText = computed(() => {
  if (props.change === undefined) return ''
  const absChange = Math.abs(props.change)
  const prefix = props.change > 0 ? '+' : '-'
  return `${prefix}${absChange.toFixed(1)}%`
})
</script>
