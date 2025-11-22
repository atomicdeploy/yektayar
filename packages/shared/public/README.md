# Error Handler

## Overview

The `error-handler.js` file provides a global error handling mechanism that prevents white screens when the application encounters errors during initialization or runtime.

## Location

The canonical source is located at:
```
packages/shared/public/error-handler.js
```

This file is automatically copied to both apps during:
- `npm install` (postinstall hook)
- `npm run build` (prebuild hook)

## Copied To

- `packages/admin-panel/public/error-handler.js`
- `packages/mobile-app/public/error-handler.js`

## Features

### 1. Early Error Catching
The error handler loads **before** the main application module, ensuring it can catch errors that occur during:
- Module loading
- Import resolution
- Script parsing
- Initial app bootstrap

### 2. Dark Mode Support
The error screen automatically detects the user's preferred color scheme:
- Uses `window.matchMedia('(prefers-color-scheme: dark)')` for detection
- Provides appropriate colors for both light and dark modes

### 3. WCAG AA Compliant Colors

**Light Mode:**
- Background: `#f8f9fa`
- Title: `#c92a2a` (improved contrast)
- Message: `#212529` (darker text for better readability)
- Details background: `#f8f9fa`
- Details text: `#495057`

**Dark Mode:**
- Background: `#0a0f1a`
- Container: `#1a2332`
- Title: `#ff6b6b`
- Message: `#e8e9ed`
- Details background: `#0d1520`
- Details text: `#a0a3a8`

### 4. Error Types Handled

1. **Global JavaScript Errors** (`window.addEventListener('error')`)
   - Syntax errors
   - Reference errors
   - Module loading failures
   - Runtime errors

2. **Unhandled Promise Rejections** (`window.addEventListener('unhandledrejection')`)
   - Async operation failures
   - Promise rejections without catch handlers

## Display

The error screen shows:
- ❌ Large error icon
- **Title**: "Application Error" or "Promise Rejection"
- **Message**: User-friendly description
- **Details box**: Stack trace and error details in monospace font

## Maintenance

### Updating the Error Handler

To update the error handler for all apps:

1. Edit `packages/shared/public/error-handler.js`
2. Run: `npm run prebuild` or `node scripts/copy-error-handler.mjs`
3. The script will copy the updated file to both apps

### Manual Copy

If needed, you can manually copy the file:
```bash
node scripts/copy-error-handler.mjs
```

## Testing

To test the error handler:

1. **Module Error**: Create a syntax error in a Vue component
2. **Promise Rejection**: Add unhandled promise rejection in code
3. **Runtime Error**: Throw an error during app initialization

In all cases, you should see the error screen instead of a white screen.

## Integration

The error handler is loaded in `index.html`:
```html
<body>
  <div id="app"></div>
  <!-- Global error handler - must load before main module -->
  <script src="/error-handler.js"></script>
  <script type="module" src="/src/main.ts"></script>
</body>
```

## See Also

- Three-layer error handling architecture (see PR description)
- `@yektayar/shared` ErrorScreen components for application-level errors
- ErrorNotification components for runtime errors
