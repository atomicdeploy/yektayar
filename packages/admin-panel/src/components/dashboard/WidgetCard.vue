<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all',
      isExpanded ? 'col-span-2 row-span-2' : '',
    ]"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <component :is="icon" class="w-6 h-6 text-primary-500" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('toggle-expand')"
          class="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          :title="isExpanded ? 'Collapse' : 'Expand'"
        >
          <ArrowsPointingOutIcon v-if="!isExpanded" class="w-5 h-5" />
          <ArrowsPointingInIcon v-else class="w-5 h-5" />
        </button>
        <button
          v-if="collapsible"
          @click="$emit('toggle-collapse')"
          class="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          :title="isCollapsed ? 'Show' : 'Hide'"
        >
          <ChevronUpIcon v-if="!isCollapsed" class="w-5 h-5" />
          <ChevronDownIcon v-else class="w-5 h-5" />
        </button>
        <button
          class="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-move"
          :class="{ 'cursor-grab': !isDragging, 'cursor-grabbing': isDragging }"
          @mousedown="isDragging = true"
          @mouseup="isDragging = false"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
      </div>
    </div>
    
    <div v-show="!isCollapsed" class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  icon: any
  isExpanded?: boolean
  isCollapsed?: boolean
  collapsible?: boolean
}

withDefaults(defineProps<Props>(), {
  isExpanded: false,
  isCollapsed: false,
  collapsible: true,
})

defineEmits<{
  'toggle-expand': []
  'toggle-collapse': []
}>()

const isDragging = ref(false)
</script>
