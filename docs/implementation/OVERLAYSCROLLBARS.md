# OverlayScrollbars Implementation Guide

## Overview

This project uses [OverlayScrollbars](https://kingsora.github.io/OverlayScrollbars/) for custom, styleable scrollbars that provide a consistent cross-browser experience while preserving native scrolling functionality and accessibility.

## Why OverlayScrollbars?

OverlayScrollbars was chosen over native CSS scrollbars for several key reasons:

### Benefits

1. **Cross-Browser Consistency**: Native scrollbars look different across browsers and operating systems. OverlayScrollbars provides a unified appearance.

2. **Full Customization**: Complete control over scrollbar appearance using CSS variables, matching our brand colors and themes.

3. **Accessibility**: Maintains ARIA roles, keyboard navigation, and screen reader compatibility.

4. **Native Feel**: Preserves native scrolling behavior including:
   - Mouse wheel scrolling
   - Touch gestures and inertia
   - Keyboard navigation (arrow keys, page up/down, home/end)
   - Smooth momentum scrolling

5. **Performance**: Efficient rendering with automatic content change detection and minimal bundle size impact.

6. **RTL Support**: Full right-to-left language support, important for our Persian (Farsi) interface.

7. **Framework Integration**: Official Vue 3 wrapper with composable support.

## Installation

OverlayScrollbars is already installed in both the admin panel and mobile app:

```json
{
  "dependencies": {
    "overlayscrollbars": "^2.12.0",
    "overlayscrollbars-vue": "^0.5.9"
  }
}
```

## Configuration

### Admin Panel

Located in `packages/admin-panel/`:

#### 1. Global Registration (`src/main.ts`)

```typescript
import 'overlayscrollbars/overlayscrollbars.css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

// Register component globally
app.component('OverlayScrollbarsComponent', OverlayScrollbarsComponent)
```

#### 2. Theme Styling (`src/assets/main.css`)

Custom theme class: `os-theme-yektayar`

```css
/* Light Theme */
.os-theme-yektayar.os-scrollbar-horizontal,
.os-theme-yektayar.os-scrollbar-vertical {
  --os-size: 6px;
  --os-padding-perpendicular: 0px;
  --os-padding-axis: 0px;
  --os-track-border-radius: 9999px;
  --os-track-bg: rgb(243 244 246);
  --os-handle-border-radius: 9999px;
  --os-handle-bg: rgb(209 213 219);
  --os-handle-bg-hover: rgb(156 163 175);
  --os-handle-bg-active: rgb(156 163 175);
}

/* Dark Theme */
.dark .os-theme-yektayar.os-scrollbar-horizontal,
.dark .os-theme-yektayar.os-scrollbar-vertical {
  --os-track-bg: rgb(31 41 55);
  --os-handle-bg: rgb(75 85 99);
  --os-handle-bg-hover: rgb(107 114 128);
  --os-handle-bg-active: rgb(107 114 128);
}
```

### Mobile App

Located in `packages/mobile-app/`:

#### 1. Global Registration (`src/main.ts`)

```typescript
import 'overlayscrollbars/overlayscrollbars.css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

// Register component globally
app.component('OverlayScrollbarsComponent', OverlayScrollbarsComponent)
```

#### 2. Theme Styling (`src/theme/variables.css`)

Custom theme class: `os-theme-yektayar-mobile`

```css
.os-theme-yektayar-mobile.os-scrollbar-horizontal,
.os-theme-yektayar-mobile.os-scrollbar-vertical {
  --os-size: 8px;
  --os-padding-perpendicular: 0px;
  --os-padding-axis: 0px;
  --os-track-border-radius: 4px;
  --os-track-bg: transparent;
  --os-handle-border-radius: 4px;
  --os-handle-bg: var(--ion-color-primary);
  --os-handle-bg-hover: var(--ion-color-primary-shade);
  --os-handle-bg-active: var(--ion-color-primary-shade);
}
```

## Usage

### Basic Usage

Wrap any scrollable content with `OverlayScrollbarsComponent`:

```vue
<template>
  <OverlayScrollbarsComponent
    :options="{ scrollbars: { theme: 'os-theme-yektayar' } }"
    defer
  >
    <div>Your scrollable content here</div>
  </OverlayScrollbarsComponent>
</template>
```

### Admin Panel Example

From `AdminLayout.vue`:

```vue
<OverlayScrollbarsComponent
  class="flex-1 px-4 py-6"
  :options="{
    scrollbars: {
      theme: 'os-theme-yektayar',
      visibility: 'auto',
      autoHide: 'leave',
      autoHideDelay: 800
    }
  }"
  defer
>
  <nav>
    <ul class="space-y-2">
      <!-- Navigation items -->
    </ul>
  </nav>
</OverlayScrollbarsComponent>
```

### Mobile App Example

For mobile apps, use the mobile theme:

```vue
<OverlayScrollbarsComponent
  :options="{
    scrollbars: {
      theme: 'os-theme-yektayar-mobile',
      visibility: 'auto',
      autoHide: 'scroll',
      autoHideDelay: 1300
    }
  }"
  defer
>
  <ion-content>
    <!-- Your content -->
  </ion-content>
</OverlayScrollbarsComponent>
```

## Configuration Options

### Common Options

```typescript
{
  scrollbars: {
    theme: 'os-theme-yektayar',      // Custom theme class
    visibility: 'auto',               // 'visible', 'hidden', 'auto'
    autoHide: 'leave',                // 'never', 'scroll', 'leave', 'move'
    autoHideDelay: 800,               // Delay in ms before hiding
    dragScroll: true,                 // Enable drag scrolling
    clickScroll: false                // Disable click to scroll
  },
  overflow: {
    x: 'scroll',                      // 'scroll', 'hidden', 'visible'
    y: 'scroll'
  }
}
```

### Props

- `options`: Configuration object (see above)
- `defer`: Boolean - Initialize after mount (recommended)
- `element`: String - Which element to use ('viewport', 'padding', 'content')

### Events

The component emits Vue events for all OverlayScrollbars events:

```vue
<OverlayScrollbarsComponent
  @os-initialized="onInitialized"
  @os-updated="onUpdated"
  @os-scroll="onScroll"
>
  <!-- content -->
</OverlayScrollbarsComponent>
```

## Advanced Usage

### Using the Composable

For more control, use the `useOverlayScrollbars` composable:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOverlayScrollbars } from 'overlayscrollbars-vue'

const scrollContainer = ref<HTMLElement>()
const [initialize, getInstance] = useOverlayScrollbars({
  defer: true,
  options: {
    scrollbars: { theme: 'os-theme-yektayar' }
  }
})

onMounted(() => {
  initialize(scrollContainer.value!)
})

// Access instance methods
function scrollToTop() {
  const instance = getInstance()
  if (instance) {
    instance.elements().viewport.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div ref="scrollContainer">
    <!-- content -->
  </div>
</template>
```

## Styling Tips

### Customizing Scrollbar Size

```css
.os-theme-custom {
  --os-size: 10px;  /* Scrollbar thickness */
}
```

### Transparent Track

```css
.os-theme-custom {
  --os-track-bg: transparent;
}
```

### Adding Padding

```css
.os-theme-custom {
  --os-padding-perpendicular: 2px;  /* Space from edge */
  --os-padding-axis: 4px;           /* Space from top/bottom or left/right */
}
```

### Animation Duration

```css
.os-theme-custom {
  --os-handle-interactive-area-offset: 4px;
  --os-handle-min-size: 33px;
}
```

## Browser Compatibility

OverlayScrollbars supports all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Opera

Mobile browsers:
- iOS Safari
- Chrome Mobile
- Firefox Mobile

## Performance Considerations

1. **Use `defer` prop**: Delays initialization until after component mount
2. **Avoid nesting**: Don't nest multiple OverlayScrollbars unnecessarily
3. **Dynamic content**: The library automatically detects content changes
4. **SSR/SSG**: Fully compatible with server-side rendering

## Migration from Native Scrollbars

Previous implementation used native CSS scrollbars with webkit pseudo-elements:

```css
/* Old approach - removed */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
```

Now replaced with OverlayScrollbars for better cross-browser support and features.

## Troubleshooting

### Scrollbar Not Appearing

1. Check that content is actually overflowing
2. Verify the theme class is correct
3. Check CSS import order
4. Use `visibility: 'visible'` for debugging

### Content Jumping

1. Set explicit container height
2. Use `defer` prop
3. Check for conflicting CSS overflow properties

### Touch Scrolling Issues

1. Ensure no conflicting touch-action CSS
2. Check Ionic gesture configurations
3. Verify mobile theme is being used

## Resources

- [Official Documentation](https://kingsora.github.io/OverlayScrollbars/)
- [Vue Wrapper Docs](https://www.npmjs.com/package/overlayscrollbars-vue)
- [GitHub Repository](https://github.com/KingSora/OverlayScrollbars)
- [Configuration Options](https://kingsora.github.io/OverlayScrollbars/docs/api/options/)

## Support

For issues specific to YektaYar implementation, check:
- Admin Panel: `packages/admin-panel/src/layouts/AdminLayout.vue`
- Mobile App: `packages/mobile-app/src/theme/variables.css`
- Theme Configs: `main.css` and `variables.css` files
