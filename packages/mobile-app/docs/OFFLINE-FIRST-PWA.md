# Offline-First PWA Implementation

This document describes the offline-first PWA capabilities implemented in the YektaYar mobile app.

## Overview

The mobile app now features comprehensive offline-first capabilities using Progressive Web App (PWA) technologies. The implementation ensures a native-like, fast, and reliable experience with instant navigation between tabs and offline functionality.

## Key Features

### 1. Service Worker with Intelligent Caching

The app uses Vite PWA plugin with Workbox to generate an optimized service worker that handles:

- **Precaching**: All static assets (JS, CSS, HTML, images, fonts) are precached during installation
- **API Caching**: NetworkFirst strategy for API calls with 1-hour expiration
- **Image Caching**: CacheFirst strategy for images with 30-day expiration
- **Font Caching**: CacheFirst strategy for fonts with 1-year expiration
- **Automatic Updates**: Service worker checks for updates every hour

### 2. Route Prefetching

Critical routes (tab pages) are prefetched to enable instant navigation:

- **Initial Load**: All main tab routes are prefetched after app initialization
- **Adjacent Tab Prefetching**: When navigating to a tab, adjacent tabs are prefetched
- **Smart Caching**: Routes are cached only once to avoid redundant network requests

### 3. Network Status Monitoring

The app monitors network connectivity in real-time:

- **Online/Offline Detection**: Displays banner when offline or when connection is restored
- **Visual Feedback**: Users see clear indicators of their connection status
- **Graceful Degradation**: App continues to work offline with cached content

### 4. No Server-Side Rendering (SSR)

The mobile app is completely client-side rendered:

- All content is prefetched and cached on the client
- No dependency on server for rendering
- Faster load times and better offline experience

## Technical Implementation

### Files Modified/Created

1. **vite.config.ts**: Added VitePWA plugin configuration
2. **main.ts**: Service worker registration with lifecycle hooks
3. **router/index.ts**: Critical route prefetching logic
4. **App.vue**: Network status indicators
5. **composables/useNetworkStatus.ts**: Network monitoring composable
6. **composables/useRoutePrefetch.ts**: Route prefetching composable
7. **vite-env.d.ts**: PWA type definitions

### Caching Strategies

#### NetworkFirst (API Calls)
```typescript
{
  urlPattern: /^https?:\/\/.*\/api\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 3600 // 1 hour
    },
    networkTimeoutSeconds: 10
  }
}
```

#### CacheFirst (Images)
```typescript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'image-cache',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 2592000 // 30 days
    }
  }
}
```

#### CacheFirst (Fonts)
```typescript
{
  urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'font-cache',
    expiration: {
      maxEntries: 30,
      maxAgeSeconds: 31536000 // 1 year
    }
  }
}
```

## Usage

### Development

The service worker is enabled in development mode for testing:

```bash
npm run dev
```

Navigate to http://localhost:8100 and check the browser's Application tab to see:
- Service Worker registered and active
- Cache Storage with precached assets
- Network tab showing cached responses

### Production Build

```bash
npm run build
```

The build process generates:
- `dist/sw.js`: Service worker with precache manifest
- `dist/workbox-*.js`: Workbox runtime
- `dist/manifest.webmanifest`: PWA manifest

### Testing Offline Mode

1. Open the app in a browser
2. Open DevTools > Application > Service Workers
3. Check "Offline" to simulate offline mode
4. Navigate between tabs - they should load instantly from cache
5. Refresh the page - it should load from cache

## Performance Benefits

### Before Implementation
- Tab switches required loading new components
- No caching of API responses
- Slower navigation experience

### After Implementation
- ✅ Instant tab navigation (components prefetched)
- ✅ Offline functionality
- ✅ Cached API responses (1-hour TTL)
- ✅ Faster subsequent page loads
- ✅ Native app-like experience

## Browser Support

The PWA features work in all modern browsers:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11.3+)

## Cache Management

The service worker automatically manages cache:
- Cleans up outdated caches on update
- Enforces max entry limits per cache
- Expires entries based on age
- Updates to new versions automatically

## Monitoring

Service worker lifecycle events are logged using the shared logger:

```typescript
logger.success('Service Worker registered successfully')
logger.info('New content available, updating...')
logger.success('App ready to work offline')
logger.error('Service Worker registration failed:', error)
```

## Future Enhancements

Potential improvements for the future:
- Background sync for offline actions
- Push notifications
- Periodic background sync
- Advanced offline UI
- Offline form submission queue

## Troubleshooting

### Service Worker Not Registering

Check browser console for errors. Common issues:
- HTTPS required (except localhost)
- Browser doesn't support service workers
- Scope issues

### Stale Content

Force update by:
1. Unregister service worker in DevTools
2. Clear cache storage
3. Hard refresh (Ctrl+Shift+R)

### Cache Not Working

Verify:
- Service worker is active
- Cache storage is enabled
- Network patterns match expected URLs
