# IranNastaliq Font Installation Required

The YektaYar splash screen uses the IranNastaliq font for the Persian tagline: «تا خانواده با عشق و آرامش پابرجا بماند»

## Installation Steps

### Option 1: From Temp Branch (Recommended)

1. **Download the font** from the temp branch:
   ```bash
   # If you have access to the temp branch
   git fetch origin temp
   git checkout origin/temp -- IranNastaliq-Font.zip
   unzip IranNastaliq-Font.zip
   ```

2. **Copy font files**:
   ```bash
   cp IranNastaliq.woff2 public/fonts/
   cp IranNastaliq.woff public/fonts/
   ```

3. **Remove the README**:
   ```bash
   rm public/fonts/IranNastaliq-README.md
   ```

### Option 2: From Official Repository

1. **Download from GitHub**:
   - Visit: https://github.com/rastikerdar/iran-nastaliq-font
   - Download the latest release
   - Extract the webfonts folder

2. **Copy required files**:
   ```bash
   cp fonts/webfonts/IranNastaliq.woff2 packages/mobile-app/public/fonts/
   cp fonts/webfonts/IranNastaliq.woff packages/mobile-app/public/fonts/
   ```

3. **Remove the README**:
   ```bash
   rm packages/mobile-app/public/fonts/IranNastaliq-README.md
   ```

### Verify Installation

After copying the fonts, rebuild the app:
```bash
cd packages/mobile-app
npm run build
```

The build warnings about IranNastaliq fonts should disappear.

## Font Details

- **Font Family**: IranNastaliq
- **Style**: Traditional Persian Nastaliq calligraphy
- **Files Required**: 
  - `IranNastaliq.woff2` (primary, modern browsers)
  - `IranNastaliq.woff` (fallback, older browsers)
- **Usage**: Splash screen Persian tagline only
- **Font Loading**: Uses `font-display: block` to prevent FOUT (Flash of Unstyled Text)

## Font License

IranNastaliq font is typically free for personal and commercial use under the SIL Open Font License.
Check the license in the official repository for full details.

## Fallback Behavior

If the font is not installed:
- ✅ The app will still work normally
- ✅ The tagline will use the Sahel font as fallback
- ⚠️ Build warnings will appear (safe to ignore during development)
- ⚠️ The traditional calligraphic style will be lost

## Why This Font?

IranNastaliq provides an authentic Persian calligraphic style that:
- Represents traditional Persian culture
- Adds elegance and sophistication to the splash screen
- Enhances the premium brand perception of YektaYar
- Creates visual distinction from standard sans-serif fonts

## Troubleshooting

**Build warnings persist:**
- Ensure font files are in the correct directory: `public/fonts/`
- Check file names match exactly: `IranNastaliq.woff2` and `IranNastaliq.woff`
- Verify files are valid font files (not HTML error pages)

**Font not displaying:**
- Check browser console for font loading errors
- Verify font files are being served (check Network tab)
- Ensure `fonts.css` is imported in the app
- Clear browser cache and rebuild

**Permission issues:**
- Font files should have read permissions
- Ensure public directory is being copied during build

## Support

For issues with font installation, refer to:
- Project README.md
- Branding guidelines: `assets/branding/BRANDING-GUIDE.md`
- Issue tracker on GitHub
