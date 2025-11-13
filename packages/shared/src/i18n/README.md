# Shared Internationalization (i18n)

This directory contains the shared internationalization resources for all YektaYar applications.

## Structure

```
i18n/
├── locales/
│   ├── en.ts       # English translations
│   ├── fa.ts       # Farsi/Persian translations
│   └── index.ts    # Exports all locales
├── translations.json  # Legacy JSON format (for reference)
└── README.md
```

## Usage

### In Admin Panel or Mobile App

```typescript
import { createI18n } from 'vue-i18n'
import { messages } from '@yektayar/shared'

const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  messages,
})
```

### Using Translations in Vue Components

```vue
<template>
  <div>
    <h1>{{ t('common.app_name') }}</h1>
    <p>{{ t('dashboard_page.welcome_message') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

## Translation Keys Organization

Translations are organized by functional area:

- **common**: Shared UI elements (buttons, labels, etc.)
- **auth**: Authentication and authorization
- **nav**: Navigation menus
- **dashboard_page**: Admin dashboard specific
- **users_page**: User management
- **messages**: User messages and notifications
- **appointments**: Appointment booking and management
- **error_screen**: Error screens and messages
- **roles**: User roles
- **status**: Status labels
- **theme**: Theme preferences

## Tree-Shaking and Bundle Optimization

### Current Approach

Vite (the build tool used by both admin-panel and mobile-app) performs automatic tree-shaking:

1. **Dead Code Elimination**: Unused imports are automatically removed
2. **Code Splitting**: Vite creates separate chunks for different routes/components
3. **Minification**: The production build is minified using esbuild

### Bundle Size Analysis

To analyze what's being included in your bundle:

```bash
# Build with bundle analysis
npm run build -w @yektayar/admin-panel -- --mode production
npm run build -w @yektayar/mobile-app -- --mode production
```

### Optimizing i18n Bundle Size

#### Option 1: Use the Full Messages Object (Current Implementation)

**Pros:**
- Simple implementation
- All translations available at runtime
- Easy to add new languages dynamically

**Cons:**
- Includes all translation keys even if not used
- Larger initial bundle size

```typescript
import { messages } from '@yektayar/shared'

const i18n = createI18n({
  locale: 'fa',
  fallbackLocale: 'en',
  messages, // All translations included
})
```

#### Option 2: Import Specific Locales (Future Optimization)

If bundle size becomes a concern, you can import only the locales you need:

```typescript
import { fa, en } from '@yektayar/shared'

const i18n = createI18n({
  locale: 'fa',
  fallbackLocale: 'en',
  messages: { fa, en }, // Only specific languages
})
```

#### Option 3: Dynamic Import for Lazy Loading (Advanced)

For very large applications, you can lazy-load translations:

```typescript
const i18n = createI18n({
  locale: 'fa',
  fallbackLocale: 'en',
  messages: {},
})

// Load translations dynamically
async function loadLocale(locale: string) {
  const messages = await import(`@yektayar/shared/i18n/locales/${locale}`)
  i18n.global.setLocaleMessage(locale, messages.default)
}
```

**Note:** This requires additional configuration in Vite to support dynamic imports.

## Adding New Translations

1. Add the key-value pair to both `en.ts` and `fa.ts`
2. Rebuild the shared package: `npm run build -w @yektayar/shared`
3. The translations will be automatically available in all apps

Example:

```typescript
// en.ts
export default {
  common: {
    app_name: 'YektaYar',
    welcome: 'Welcome',
    new_key: 'New Translation', // Add here
  },
  // ...
}

// fa.ts
export default {
  common: {
    app_name: 'یکتایار',
    welcome: 'خوش آمدید',
    new_key: 'ترجمه جدید', // Add here
  },
  // ...
}
```

## Best Practices

1. **Use Namespaces**: Organize keys by functional area (e.g., `nav.*`, `auth.*`)
2. **Consistent Naming**: Use snake_case for keys
3. **Avoid Duplication**: Check if a similar key exists before adding new ones
4. **Document Context**: Add comments for keys that might be ambiguous
5. **Keep Parallel Structure**: Ensure all languages have the same keys

## Build Performance

The shared package is built automatically as a postinstall hook:

```json
{
  "scripts": {
    "postinstall": "npm run build -w @yektayar/shared"
  }
}
```

This ensures that translations are always up-to-date when you install dependencies.
