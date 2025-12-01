# i18n Key Validation

This document describes the infrastructure for validating i18n translation keys in the YektaYar project.

## Overview

The YektaYar project uses `vue-i18n` for internationalization. To ensure translation quality and prevent runtime errors, we have implemented two mechanisms:

1. **Static Validation (CI/CD)**: A script that validates all used translation keys exist in locale files
2. **Runtime Detection**: A handler that logs missing keys during development

## Static Validation

### Running the Validation

To validate i18n keys, run:

```bash
npm run validate:i18n
```

This will:
- Scan all Vue and TypeScript files for `t('...')` calls
- Check if each key exists in all locale files (en.ts, fa.ts)
- Report any missing keys

For strict mode (also checking unused keys):

```bash
npm run validate:i18n:strict
```

### Example Output

```
YektaYar i18n Key Validation
============================================================

Validating admin-panel...
Loaded 200 keys for en
Loaded 193 keys for fa
Scanning 25 source files...
Found 37 unique keys in use
✅ All used keys are available

============================================================
Summary:
  Missing keys: 0

✅ Validation passed!
```

### CI/CD Integration

Add this to your CI/CD pipeline:

```yaml
- name: Validate i18n keys
  run: npm run validate:i18n
```

This will fail the build if any translation keys are missing.

## Runtime Detection

### How It Works

In development mode, the application uses a custom `missingHandler` that:
1. Detects when a translation key is accessed but not found
2. Logs a warning using the logger utility
3. Tracks all missing keys in the session
4. Returns the key itself as a fallback value

### Viewing Missing Keys

During development, missing keys are automatically logged to the console:

```
⚠️ Missing i18n key: "user.profile.title" for locale "en"
```

To see a summary of all missing keys, open the browser console and run:

```javascript
window.__i18nMissingKeysSummary()
```

This will display a grouped list of all missing keys:

```
⚠️ Found 3 missing i18n key(s):

  en:
    - user.profile.title
    - settings.notifications

  fa:
    - user.profile.title
```

## Best Practices

### 1. Use Static Keys

Always use static string keys instead of dynamic ones when possible:

```typescript
// ✅ Good - static key
t('user.profile.title')

// ❌ Avoid - dynamic key (can't be validated statically)
t(`user.${section}.title`)
```

### 2. Add Keys Before Using Them

Before using a new translation key:
1. Add it to both `en.ts` and `fa.ts` locale files
2. Run `npm run validate:i18n` to verify
3. Test in the browser to ensure it displays correctly

### 3. Run Validation Before Committing

Always run validation before committing code:

```bash
npm run validate:i18n
```

### 4. Check Console for Missing Keys

During development, check the browser console regularly for missing key warnings.

## File Structure

```
packages/
├── shared/
│   └── src/
│       └── i18n/
│           ├── missingHandler.ts    # Runtime detection
│           └── validateKeys.ts      # Validation utilities
├── admin-panel/
│   └── src/
│       ├── locales/
│       │   ├── en.ts               # English translations
│       │   ├── fa.ts               # Persian translations
│       │   └── index.ts
│       └── main.ts                  # Configured with missing handler
└── mobile-app/
    └── src/
        └── main.ts                  # Configured with missing handler

scripts/
└── validate-i18n-keys.mjs          # CLI validation script
```

## API Reference

### missingHandler

```typescript
function missingHandler(locale: string, key: string, vm?: any): string
```

Called by vue-i18n when a translation key is not found.

**Parameters:**
- `locale` - The current locale (e.g., 'en', 'fa')
- `key` - The missing translation key
- `vm` - The Vue component instance (optional)

**Returns:** The key itself as fallback

### getMissingKeys

```typescript
function getMissingKeys(): string[]
```

Returns an array of all missing keys detected in the current session.

### clearMissingKeys

```typescript
function clearMissingKeys(): void
```

Clears the list of detected missing keys.

### printMissingKeysSummary

```typescript
function printMissingKeysSummary(): void
```

Prints a formatted summary of all missing keys, grouped by locale.

## Troubleshooting

### False Positives

If the validation script reports false positives (keys that actually exist), it may be due to:

1. **Dynamic keys**: Keys using template literals (e.g., `` t(`key.${variable}`) ``)
   - These are intentionally skipped by the validator
   - Ensure the base keys exist (e.g., `key.option1`, `key.option2`)

2. **Nested objects**: Keys in deeply nested objects
   - Verify the key path is correct in the locale files
   - Check for typos in the nesting structure

### Keys Not Being Detected

If missing keys are not being logged:

1. Verify the missing handler is installed (check `main.ts`)
2. Ensure you're in development mode (`import.meta.env.DEV`)
3. Check that vue-i18n is properly configured with the `missing` option

## Contributing

When adding new features that require translations:

1. Add translation keys to all locale files
2. Run `npm run validate:i18n` to verify
3. Test in both English and Persian
4. Document any special translation considerations

## References

- [vue-i18n Documentation](https://vue-i18n.intlify.dev/)
- [YektaYar Logger Utility](../packages/shared/src/utils/logger.ts)
- [Code Standards](./LINTING-TESTING-SUMMARY.md)
