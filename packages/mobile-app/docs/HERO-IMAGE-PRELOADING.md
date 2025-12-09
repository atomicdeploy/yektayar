# Hero Image Preloading Implementation

## Overview
This document explains the hero image preloading implementation that ensures the welcome screen hero image is loaded before the splash screen finishes.

## Problem Statement
Previously, when first-time users navigated from the splash screen to the welcome screen, they would see a loading spinner while the hero image loaded. This created a suboptimal user experience with a noticeable delay.

## Solution
The splash screen now preloads the welcome hero image in the background while performing other initialization tasks (session acquisition, API version fetching). By the time the user navigates to the welcome screen, the image is already cached and displays instantly.

## Implementation Details

### 1. Splash Screen (SplashScreen.vue)

#### Preload Function
```typescript
const preloadHeroImage = async () => {
  // Detects WebP support
  // Loads /welcome-hero.webp (45KB) or /welcome-hero.jpg (175KB)
  // Times out after 1.5 seconds to prevent blocking
  // Handles errors gracefully
}
```

#### Execution Flow
1. Fonts are loaded first (`checkFontsLoaded()`)
2. Hero image preloading starts in parallel (`preloadHeroImage()`)
3. Session acquisition runs concurrently
4. API version fetch runs concurrently
5. Before navigating to welcome screen, waits for preload to complete
6. After 2-second delay, navigates to appropriate screen

### 2. Welcome Screen (WelcomeScreen.vue)

#### LazyImage Component
```vue
<LazyImage
  src="/welcome-hero.jpg"
  :webp-srcset="..."
  loading="eager"
/>
```

The `loading="eager"` attribute tells the LazyImage component to:
- Not use lazy loading (load immediately)
- Check if the image is already cached (`imageRef.value?.complete`)
- Skip the loading spinner if cached

### 3. WebP Optimization

#### Browser Support Detection
```typescript
const supportsWebP = await new Promise<boolean>((resolve) => {
  const webpImg = new Image()
  webpImg.onload = () => resolve(true)
  webpImg.onerror = () => resolve(false)
  webpImg.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
})
```

This test loads a minimal WebP data URI to detect browser support.

#### Size Comparison
- **JPG**: 175KB (`/welcome-hero.jpg`)
- **WebP**: 45KB (`/welcome-hero.webp`)
- **Savings**: ~74% reduction in file size

## Performance Benefits

### First-Time Users
- ✅ No loading spinner on welcome screen
- ✅ Instant image display
- ✅ Smoother transition from splash to welcome
- ✅ 74% faster loading with WebP (45KB vs 175KB)

### Returning Users
- ✅ Zero performance impact (preloading skipped)
- ✅ Direct navigation to home screen
- ✅ No unnecessary network requests

### Network Resilience
- ✅ 1.5-second timeout prevents indefinite blocking
- ✅ Errors are handled gracefully
- ✅ App never gets stuck on image loading
- ✅ Logs provide debugging information

## Testing

### Manual Testing Steps
1. Clear browser cache
2. Navigate to the app (splash screen loads)
3. Observe browser network tab:
   - Should see preload request for hero image
   - Should complete before 2-second splash delay
4. Navigate to welcome screen:
   - Hero image should display instantly
   - No loading spinner should appear

### Browser DevTools
Check console logs for:
- `"Welcome hero image preloaded successfully"` (success case)
- `"Failed to preload welcome hero image"` (error case)

### Network Tab Verification
- Hero image request starts during splash screen
- Request completes with 200 status
- When welcome screen loads, image is served from cache

## Future Enhancements

### Potential Improvements
1. **Progressive Loading**: Preload thumbnail first, then full image
2. **Multiple Resolutions**: Preload appropriate resolution based on device
3. **Service Worker**: Cache images across sessions
4. **Predictive Preloading**: Preload other screens based on user patterns

### Monitoring
Consider adding:
- Analytics to track preload success rate
- Performance metrics (preload duration)
- Error tracking for failed preloads

## Code Locations

### Modified Files
- `packages/mobile-app/src/views/SplashScreen.vue`
  - Added `preloadHeroImage()` function
  - Added `heroImageLoaded` ref
  - Updated `onMounted()` lifecycle hook

### Related Files
- `packages/mobile-app/src/components/LazyImage.vue`
  - Already supports eager loading
  - Detects cached images automatically

### Assets
- `packages/mobile-app/public/welcome-hero.jpg` (175KB)
- `packages/mobile-app/public/welcome-hero.webp` (45KB)
- `packages/mobile-app/public/welcome-hero@2x.jpg`
- `packages/mobile-app/public/welcome-hero@2x.webp`
- `packages/mobile-app/public/welcome-hero@3x.jpg`
- `packages/mobile-app/public/welcome-hero@3x.webp`

## Browser Compatibility

### WebP Support
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Safari 14+
- ✅ Edge 18+
- ✅ Opera 12.1+

### Fallback
Browsers without WebP support automatically fall back to JPG format.

## Conclusion
The hero image preloading implementation provides a smooth, professional user experience for first-time users while maintaining optimal performance for returning users. The solution is robust, handles errors gracefully, and uses modern web optimization techniques like WebP format detection.
