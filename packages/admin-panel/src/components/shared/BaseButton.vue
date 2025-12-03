<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClass,
      variantClass,
    ]"
  >
    <span v-if="loading" class="animate-spin">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const sizeClass = computed(() => {
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return sizes[props.size]
})

const variantClass = computed(() => {
  const variants = {
    primary: [
      'bg-gradient-to-r from-primary-500 to-primary-600',
      'hover:from-primary-600 hover:to-primary-700',
      'text-white shadow-md hover:shadow-lg',
      'focus:ring-primary-500',
      'transform hover:-translate-y-0.5',
    ].join(' '),
    secondary: [
      'bg-gray-100 dark:bg-gray-700',
      'hover:bg-gray-200 dark:hover:bg-gray-600',
      'text-gray-700 dark:text-gray-200',
      'focus:ring-gray-500',
    ].join(' '),
    danger: [
      'bg-red-500 hover:bg-red-600',
      'text-white shadow-md hover:shadow-lg',
      'focus:ring-red-500',
      'transform hover:-translate-y-0.5',
    ].join(' '),
    success: [
      'bg-green-500 hover:bg-green-600',
      'text-white shadow-md hover:shadow-lg',
      'focus:ring-green-500',
      'transform hover:-translate-y-0.5',
    ].join(' '),
    ghost: [
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
      'text-gray-700 dark:text-gray-300',
      'focus:ring-gray-500',
    ].join(' '),
  }
  return variants[props.variant]
})
</script>
