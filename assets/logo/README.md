# YektaYar Logo and Icon Assets

This directory contains the source logo and icon files for the YektaYar platform.

## Files

- **`logo.svg`**: The main YektaYar logo without background. Use this for in-app branding, headers, and places where you want the logo on a colored or transparent background.
- **`icon.svg`**: The app icon with a white card-like background, gradient, and shadow effects. This is the source file for generating app icons.

## Logo Color

The logo uses the YektaYar brand color: `#d4a43e` (golden/amber).

## Generating Icons

### Web Icons (Favicons and PWA)

To generate web icons for the admin panel and mobile app:

```bash
npm run generate:icons
```

This script generates:
- Favicon sizes: 16x16, 32x32, 48x48, 64x64
- PWA/App icon sizes: 128x128, 192x192, 256x256, 512x512
- Copies logo.svg and icon.svg to public directories

Output directories:
- `packages/admin-panel/public/`
- `packages/mobile-app/public/`

### Android Assets (App Icons and Splash Screens)

To generate Android app icons and splash screens:

```bash
npm run generate:android-assets
```

This uses `@capacitor/assets` to generate:
- Adaptive icons (foreground and background) for all densities (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Standard launcher icons for all densities
- Splash screens for all orientations and densities
- Dark mode splash screens

Output directory: `packages/mobile-app/android/app/src/main/res/`

## Usage

### In README.md

The logo is already included in the main README:

```markdown
<div align="center">
  <img src="assets/logo/logo.svg" alt="YektaYar Logo" width="150" />
</div>
```

### In Admin Panel

The admin panel uses:
- Favicons: Multiple sizes automatically served by the browser
- Logo: Available at `/logo.svg` for use in the UI
- PWA manifest: `/manifest.json` with all icon sizes

### In Mobile App

The mobile app uses:
- Android launcher icons: Generated in all required densities
- Splash screens: Generated for all orientations and densities
- PWA icons: Available for web view
- Logo: Available at `/logo.svg` for use in the UI

### In Application Code

To use the logo in Vue components:

```vue
<template>
  <img src="/logo.svg" alt="YektaYar" />
</template>
```

Or for a larger icon with background:

```vue
<template>
  <img src="/icon.svg" alt="YektaYar" />
</template>
```

## Customization

If you need to modify the logo or icon:

1. Edit `logo.svg` or `icon.svg` in this directory
2. Run the generation scripts to update all derived assets:
   ```bash
   npm run generate:icons
   npm run generate:android-assets
   ```

## Notes

- The icon.svg includes a white background with subtle gradient and shadow effects, designed to look like a card
- The background color can be modified in icon.svg by editing the gradient colors
- The logo color (#d4a43e) should remain consistent across all branding materials
- PWA manifests use the theme color #d4a43e for consistency
