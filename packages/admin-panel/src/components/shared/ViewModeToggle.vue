<template>
  <div class="view-mode-toggle">
    <button
      :class="['toggle-btn', { active: modelValue === 'card' }]"
      @click="$emit('update:modelValue', 'card')"
      :title="t('view_mode.card_view')"
      :aria-label="t('view_mode.card_view')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    </button>
    <button
      :class="['toggle-btn', { active: modelValue === 'table' }]"
      @click="$emit('update:modelValue', 'table')"
      :title="t('view_mode.table_view')"
      :aria-label="t('view_mode.table_view')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  modelValue: 'card' | 'table'
}>()

defineEmits<{
  (e: 'update:modelValue', value: 'card' | 'table'): void
}>()
</script>

<style scoped lang="scss">
.view-mode-toggle {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  .icon {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  &.active {
    background: var(--primary-color);
    color: white;

    &:hover {
      background: var(--primary-color);
    }
  }
}
</style>
