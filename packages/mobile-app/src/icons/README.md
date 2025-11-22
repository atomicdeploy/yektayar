# Custom Icons in YektaYar

## ✅ Correct Approach (Currently Used)

The YektaYar app uses **simple `<img>` tags** to display custom icons (the app logo). This is the recommended and working approach.

### Example

```vue
<!-- In WelcomeScreen.vue and HomePage.vue -->
<img src="/logo-simple.svg" alt="YektaYar Logo" class="yektayar-icon" />
```

### CSS Styling

```css
.yektayar-icon {
  width: 50px;
  height: 50px;
  filter: brightness(0) invert(1); /* Makes gold icon appear white */
}
```

### Why This Works

- ✅ Simple and reliable
- ✅ No registration or configuration needed
- ✅ SVG files served from `/public` directory
- ✅ Can easily control size and color with CSS
- ✅ Works consistently across all browsers and frameworks
- ✅ Same approach used successfully in SplashScreen

## ❌ Incorrect Approach (Attempted but Failed)

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

### Why This Doesn't Work

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
├── logo.svg             # Full logo with text
└── icon.svg             # App icon

src/icons/
├── custom-icons.ts      # ⚠️ NOT USED - kept for reference only
├── logo.svg             # ⚠️ Duplicate - not needed
└── README.md            # This file
```

## 🧹 Cleanup Recommendations

The following files can be removed as they're not used:
- `src/icons/custom-icons.ts` - The addIcons() approach doesn't work
- `src/icons/logo.svg` - Duplicate of `/public/logo-simple.svg`
- Remove `registerCustomIcons()` call from `main.ts`
- Remove import statement from `main.ts`

However, they're kept temporarily for:
1. Reference and documentation purposes
2. Testing and comparison in `/icon-test` page
3. Future investigation if needed

## 🎯 Best Practices

### For Custom Logos/Branding

Use simple `<img>` tags:

```vue
<img src="/logo-simple.svg" alt="Logo" class="logo-icon" />
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

### For SVG Files as ion-icons

If you need to use an SVG file with `ion-icon` (e.g., for color props), use the `src` attribute:

```vue
<ion-icon src="/logo-simple.svg" size="large" color="warning"></ion-icon>
```

**Note:** This works better than `addIcons()` and renders properly in shadow-root.

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
4. **Use img tag**: Instead of ion-icon, use `<img src="/path/to/icon.svg">`

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

For `<img>` tags:

```css
.icon {
  width: 50px;
  height: 50px;
}
```

For `<ion-icon>` with `src`:

```vue
<ion-icon src="/icon.svg" size="large"></ion-icon>
<!-- or -->
<ion-icon src="/icon.svg" style="font-size: 64px;"></ion-icon>
```

---

**Last Updated:** 2025-11-22  
**Status:** Production-ready, using simple `<img>` tag approach  
**Test Page:** `/icon-test` for live verification
