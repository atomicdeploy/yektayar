# Shared Components

This directory contains reusable UI components that ensure consistency across the admin panel.

## Components

### BaseModal

A modal dialog component with dark mode support and smooth animations.

**Props:**
- `modelValue: boolean` - Controls modal visibility (use with v-model)
- `title: string` - Modal title
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size (default: 'md')
- `showClose?: boolean` - Show close button (default: true)
- `closeOnOverlay?: boolean` - Close when clicking overlay (default: true)

**Slots:**
- `default` - Main content
- `footer` - Footer content (optional)

**Example:**
```vue
<template>
  <BaseModal v-model="showModal" title="عنوان مودال" size="lg">
    <p>محتوای مودال</p>
    
    <template #footer>
      <BaseButton @click="showModal = false">بستن</BaseButton>
      <BaseButton variant="primary" @click="save">ذخیره</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { BaseModal, BaseButton } from '@/components/shared'

const showModal = ref(false)
const save = () => {
  // Save logic
  showModal.value = false
}
</script>
```

### BaseButton

A button component with various styles and brand colors.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'` - Button style (default: 'primary')
- `size?: 'xs' | 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `type?: 'button' | 'submit' | 'reset'` - Button type (default: 'button')
- `disabled?: boolean` - Disabled state (default: false)
- `loading?: boolean` - Loading state (default: false)

**Example:**
```vue
<template>
  <BaseButton variant="primary" size="md" @click="handleClick">
    افزودن
  </BaseButton>
  
  <BaseButton variant="secondary" @click="cancel">
    انصراف
  </BaseButton>
  
  <BaseButton variant="danger" :loading="deleting" @click="deleteItem">
    حذف
  </BaseButton>
</template>

<script setup>
import { ref } from 'vue'
import { BaseButton } from '@/components/shared'

const deleting = ref(false)

const handleClick = () => {
  // Handle click
}

const cancel = () => {
  // Handle cancel
}

const deleteItem = async () => {
  deleting.value = true
  // Delete logic
  deleting.value = false
}
</script>
```

## Design Principles

1. **Dark Mode Support**: All components support both light and dark modes using CSS variables
2. **Brand Consistency**: Primary colors use the YektaYar brand palette (Gold #d4a43e)
3. **Accessibility**: Components include proper ARIA labels and keyboard navigation
4. **Responsive**: All components work well on mobile and desktop devices
5. **Type Safety**: Full TypeScript support with proper prop types

## CSS Variables

Components use these CSS variables (defined in `assets/main.scss`):

**Light Mode:**
- `--bg-primary`: #ffffff
- `--bg-secondary`: #f9fafb
- `--text-primary`: #111827
- `--text-secondary`: #6b7280
- `--border-color`: #e5e7eb
- `--primary-color`: #d4a43e

**Dark Mode:**
- `--bg-primary`: #1f2937
- `--bg-secondary`: #111827
- `--text-primary`: #f9fafb
- `--text-secondary`: #d1d5db
- `--border-color`: #374151
- `--primary-color`: #d4a43e

## Contributing

When adding new shared components:
1. Support both light and dark modes
2. Use brand colors from CSS variables
3. Include TypeScript prop types
4. Add examples to this README
5. Export from `index.ts`
