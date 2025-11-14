# Welcome Screen Hero Image

## Current State
The welcome screen uses a placeholder image saved as `welcome-hero.jpg` (SVG content).

## ⚠️ ACTION REQUIRED: Replace with Actual Image

The actual family photo is now available since the repository is public.

### Steps to Replace:

1. **Download the hero image**:
   ```bash
   cd packages/mobile-app/public
   curl -L -o welcome-hero.jpg "https://github.com/user-attachments/assets/9f7f4ee5-ac27-4415-9fe4-7f7e45588f92"
   ```

   Or manually:
   - Navigate to: https://github.com/atomicdeploy/yektayar/issues/70
   - Right-click the family photo and save as `welcome-hero.jpg`

2. **Verify the image**:
   ```bash
   file welcome-hero.jpg  # Should show: JPEG image data
   ```

3. **Build the app** (WebP will be auto-generated):
   ```bash
   npm run build
   # Or just optimize images:
   npm run optimize-images
   ```

## Automatic WebP Generation

The build process automatically:
- ✅ Converts JPG to WebP format (85% quality)
- ✅ Optimizes JPG files (90% quality, progressive)
- ✅ Shows size savings

The `<picture>` element in `WelcomeScreen.vue` serves WebP to modern browsers and falls back to JPG for older browsers.

## Image Specifications

- **Format**: JPG (source), WebP (auto-generated)
- **Recommended size**: 1200x800 pixels (3:2 aspect ratio)
- **Max file size**: Keep source under 500KB
- **Content**: Professional family photo showing warmth and care
- **WebP savings**: Typically 25-35% smaller than JPG

## Technical Details

### Build Integration
The image optimization runs automatically during:
- `npm run build` - Full build with WebP generation
- `npm run build:production` - Production build
- `npm run optimize-images` - Manual optimization only

### Component Usage
The `WelcomeScreen.vue` component uses:
```vue
<picture>
  <source srcset="/welcome-hero.webp" type="image/webp" />
  <img src="/welcome-hero.jpg" alt="خانواده شاد - یکتاکر" />
</picture>
```

This ensures:
- Modern browsers load lightweight WebP
- Older browsers fall back to optimized JPG
- Lazy loading for better performance
- Graceful error handling

## Troubleshooting

If the image doesn't display:
1. Check file exists: `ls -lh public/welcome-hero.jpg`
2. Verify file type: `file public/welcome-hero.jpg`
3. Check console for loading errors
4. Ensure file is not corrupt

## Development

For local development, the placeholder will work. The actual photo should be added before deployment.
