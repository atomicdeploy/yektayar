# Custom Icons in YektaYar

## ✅ Correct Approach (Currently Used)

The YektaYar app uses **`<ion-icon>` with the `src` attribute** to display custom icons (the app logo). This is the recommended and working approach that leverages Ionic's icon system while supporting custom SVG files.

### Example

```vue
<!-- In WelcomeScreen.vue, HomePage.vue, and SplashScreen.vue -->
<ion-icon src="/logo-simple.svg" class="yektayar-icon"></ion-icon>
```

### CSS Styling

```css
.yektayar-icon {
  font-size: 50px;
  width: 50px;
  height: 50px;
  filter: brightness(0) invert(1); /* Makes gold icon appear white */
}
```

### Why This Works

- ✅ Leverages Ionic's icon system with proper shadow DOM
- ✅ SVG files served from `/public` directory
- ✅ Can use Ionic's size and color props when needed
- ✅ Can easily control size and color with CSS
- ✅ Works consistently across all browsers and frameworks
- ✅ Supports CSS filters for color transformations
- ✅ Properly integrates with Ionic components

## ❌ Deprecated Approaches

### Approach 1: Using `<img>` tags (Old)

Previously used simple img tags:

```vue
<!-- OLD - Don't use -->
<img src="/logo-simple.svg" alt="Logo" class="yektayar-icon" />
```

**Why we moved away:**
- ❌ Doesn't integrate with Ionic's icon system
- ❌ Can't use Ionic's built-in color/size props
- ❌ Less semantic in an Ionic app context

### Approach 2: Custom icon registration with addIcons() (Attempted but Failed)

We initially tried using Ionic's custom icon registration with `addIcons()`:

```typescript
// custom-icons.ts (NOT WORKING)
import { addIcons } from 'ionicons'
const yektayarIcon = '<svg>...</svg>'
addIcons({ 'yektayar': yektayarIcon })
```

```vue
<!-- In templates (NOT WORKING) -->
<ion-icon name="yektayar"></ion-icon>
```

**Why This Doesn't Work:**
- ❌ Results in **empty `icon-inner`** in shadow-root
- ❌ Icon doesn't display at all
- ❌ Complex registration process
- ❌ Unreliable - depends on correct SVG format, timing, etc.
- ❌ Difficult to debug

### Test Results

Navigate to `/icon-test` in the app to see live comparison:
- Built-in icons (star, heart, rocket) work with `<ion-icon :icon="iconName">`
- Custom icon with `src` attribute works: `<ion-icon src="/logo-simple.svg">`
- Custom icon with `name` attribute **fails**: `<ion-icon name="yektayar">` (empty shadow-root)

## 🔬 Technical Details

### Shadow DOM Inspection

For icons to render properly, the following must be true:

1. `ion-icon` element has a shadow-root
2. Shadow-root contains `.icon-inner` element  
3. `.icon-inner` has children (not empty!)
4. One of the children is an `<svg>` element with paths

**Working icons** (built-in and `src` attribute):
```
<ion-icon>
  #shadow-root
    <div class="icon-inner">
      <svg>...</svg>  ✅ Has content!
    </div>
</ion-icon>
```

**Failed icons** (`name` attribute with `addIcons()`):
```
<ion-icon>
  #shadow-root
    <div class="icon-inner">
      <!-- EMPTY! ❌ -->
    </div>
</ion-icon>
```

## 📁 File Structure

```
public/
├── logo-simple.svg      # Main logo file (used in app)
├── icon.svg             # App icon (light theme with background)
└── icon-dark.svg        # App icon (dark theme with background)

src/icons/
└── README.md            # This file (documentation only)
```

## 🧹 Changes Made

- ✅ Removed `custom-icons.ts` - The addIcons() approach doesn't work reliably
- ✅ Removed duplicate `logo.svg` files
- ✅ Removed `registerCustomIcons()` call from `main.ts`
- ✅ Updated all icon usage to use `<ion-icon src="...">` instead of `<img>`

## 🎯 Best Practices

### For Custom Logos/Branding (Recommended)

Use `<ion-icon>` with `src` attribute:

```vue
<ion-icon src="/logo-simple.svg" class="logo-icon"></ion-icon>
```

**Styling:**
```css
.logo-icon {
  font-size: 50px; /* Controls icon size */
  width: 50px;
  height: 50px;
  filter: brightness(0) invert(1); /* Color transformation */
}
```

### For Built-in Ionicons

Use the standard `:icon` prop with imports:

```vue
<script setup>
import { star, heart, rocket } from 'ionicons/icons'
</script>

<template>
  <ion-icon :icon="star" color="warning"></ion-icon>
</template>
```

### Color Control

For `<ion-icon src="...">`, use CSS filters for color:

```css
/* Make any color icon appear white */
.white-icon {
  filter: brightness(0) invert(1);
}

/* Make any color icon appear black */
.black-icon {
  filter: brightness(0);
}
```

Or use Ionic's color prop (may have limited effect on custom SVGs):

```vue
<ion-icon src="/logo-simple.svg" color="primary"></ion-icon>
```

## 📚 Resources

- [Custom Icons Test Page](/icon-test) - Live comparison and tests
- [custom-ionic-icon-sample](https://github.com/atomicdeploy/custom-ionic-icon-sample) - Reference implementation
- [Ionic Icons Documentation](https://ionicframework.com/docs/api/icon)
- [Ionicons Official Site](https://ionic.io/ionicons)

## 🐛 Troubleshooting

### Icon Not Showing

1. **Check file exists**: Verify SVG file is in `/public` directory
2. **Check path**: Use absolute path starting with `/`
3. **Check browser console**: Look for 404 errors
4. **Use ion-icon with src**: `<ion-icon src="/path/to/icon.svg">`

### Icon Wrong Color

Use CSS filters:

```css
/* Make any color icon appear white */
.white-icon {
  filter: brightness(0) invert(1);
}

/* Make any color icon appear black */
.black-icon {
  filter: brightness(0);
}

/* Adjust hue */
.custom-color-icon {
  filter: hue-rotate(90deg);
}
```

### Icon Wrong Size

For `<ion-icon>` with `src`:

```css
.icon {
  font-size: 50px; /* Primary size control */
  width: 50px;     /* Explicit width */
  height: 50px;    /* Explicit height */
}
```

Or use Ionic's size attribute:

```vue
<ion-icon src="/icon.svg" size="large"></ion-icon>
<!-- or custom size -->
<ion-icon src="/icon.svg" style="font-size: 64px;"></ion-icon>
```

---

**Last Updated:** November 2024  
**Status:** Production-ready, using `<ion-icon src="...">` approach  
**Test Page:** `/icon-test` for live verification
