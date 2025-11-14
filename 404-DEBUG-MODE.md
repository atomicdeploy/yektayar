# 404 Page Debug Mode Feature

This document explains how to use the 404 page debug mode feature flag in both the mobile-app and admin-panel applications.

## Overview

The 404 error pages in both applications now support two rendering modes:

1. **Production Mode (Default)**: Styled pages matching the app/admin-panel design system
   - Mobile App: Ionic-styled with gradient animations
   - Admin Panel: Tailwind-styled with dark mode support
   - User-friendly with helpful navigation options

2. **Debug Mode**: Comprehensive debugging-oriented pages with detailed diagnostics
   - Full gradient background styling
   - Extensive request information (User Agent, Referrer, Query Params)
   - Debug information section (Route details, Hash)
   - Copy to clipboard functionality
   - Animated visual elements

## How to Enable Debug Mode

### Environment Variable

Set the `VITE_404_DEBUG_MODE` environment variable to `true` in your `.env` file:

```env
# Enable comprehensive debugging-oriented 404 pages
VITE_404_DEBUG_MODE=true
```

### For Development

1. **Create a `.env` file** (if it doesn't exist) in the application directory:
   - For Admin Panel: `packages/admin-panel/.env`
   - For Mobile App: `packages/mobile-app/.env`

2. **Add the debug mode flag**:
   ```env
   VITE_404_DEBUG_MODE=true
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

### For Production

Add the environment variable to your build configuration or deployment environment:

```bash
VITE_404_DEBUG_MODE=true npm run build
```

**Note**: It's recommended to keep debug mode **disabled** in production environments for better user experience.

## Differences Between Modes

### Production Mode (Default)

**Mobile App:**
- Ionic components and theming
- Animated gradient circle with 404 text
- Quick navigation buttons (Go Home, Go Back)
- Popular pages grid (Home, Chat, Appointments, Profile)
- Shows current path in a chip
- Matches app design system

**Admin Panel:**
- Tailwind CSS styling with dark mode
- Professional admin-focused design
- Request information card (URL, method, timestamp)
- Suggestions and quick links
- Search functionality
- Maintains admin layout with sidebar

### Debug Mode

**Mobile App:**
- Purple gradient background
- Animated phone icon with sad face
- Detailed error information
- Extended suggestions list
- Copy debug info button
- Independent page (no header/nav)

**Admin Panel:**
- Blue gradient background (1e3c72 to 2a5298)
- Large animated 404 with rotating X icon
- Comprehensive request information:
  - Path, Method, Timestamp
  - User Agent
  - Referrer
  - Query Parameters
- Dedicated debug information card:
  - Route Name
  - Matched Pattern
  - Full Path
  - Hash
- Action suggestions with icons
- Copy debug info button
- Independent page (no admin layout)

## Code Structure

### Admin Panel

- **Production**: `/packages/admin-panel/src/views/NotFoundView.vue`
- **Debug**: `/packages/admin-panel/src/views/NotFoundViewDebug.vue`

### Mobile App

- **Production**: `/packages/mobile-app/src/views/NotFoundPage.vue`
- **Debug**: `/packages/mobile-app/src/views/NotFoundPageDebug.vue`

Both production components check the `VITE_404_DEBUG_MODE` environment variable and conditionally render the appropriate component.

## Use Cases

### When to Use Debug Mode

- **Development**: When debugging routing issues
- **Testing**: When testing 404 error handling
- **Support**: When gathering diagnostic information from users
- **Integration Testing**: When validating error pages

### When to Use Production Mode

- **Production Deployment**: For end users
- **Staging**: For UAT and QA testing
- **Demo**: For presenting to stakeholders
- **Default**: When no specific debugging is needed

## Example Configurations

### Development with Debug Mode

```env
# packages/admin-panel/.env
API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_SKIP_API_VALIDATION=true
VITE_404_DEBUG_MODE=true
```

### Production Configuration

```env
# packages/admin-panel/.env.production
API_BASE_URL=https://api.yektayar.com
VITE_ENVIRONMENT=production
# VITE_404_DEBUG_MODE is not set (defaults to false)
```

## Troubleshooting

### Debug Mode Not Activating

1. **Check environment variable syntax**:
   - Must be exactly `VITE_404_DEBUG_MODE=true` (case-sensitive)
   - Value must be the string `'true'`, not a boolean

2. **Restart the dev server**:
   - Changes to `.env` files require a server restart
   - Stop and start: `npm run dev`

3. **Verify file location**:
   - `.env` file must be in the package root (not the monorepo root)

4. **Check build**:
   - Environment variables are evaluated at build time
   - For production builds, ensure the variable is set during build

### Debug Page Not Styled Correctly

- Debug pages have their own self-contained styles
- They do not use Tailwind or Ionic theming
- Styles are defined in `<style scoped>` sections

## Maintenance

When updating 404 pages:

1. **Production Mode**: Update `NotFoundView.vue` / `NotFoundPage.vue`
2. **Debug Mode**: Update `NotFoundViewDebug.vue` / `NotFoundPageDebug.vue`
3. **Translations**: Update i18n files if adding new text
4. **Feature Flag Logic**: The conditional rendering is in the main component

## Best Practices

1. **Keep debug mode disabled by default** in `.env.example`
2. **Document any new debug information** added to debug pages
3. **Maintain consistency** between mobile and admin debug pages
4. **Test both modes** when making routing changes
5. **Consider privacy** when displaying diagnostic information

## Technical Details

### Environment Variable Check

Both components use this pattern:

```typescript
const isDebugMode = computed(() => import.meta.env.VITE_404_DEBUG_MODE === 'true')
```

### Conditional Rendering

```vue
<template>
  <NotFoundPageDebug v-if="isDebugMode" />
  <ion-page v-else>
    <!-- Production content -->
  </ion-page>
</template>
```

This ensures:
- Only one component is rendered
- No overhead from unused component
- Clean separation of concerns
- Easy to maintain and extend
