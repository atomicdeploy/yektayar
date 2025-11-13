# Welcome Screen Hero Image

## Current State
The welcome screen currently uses a placeholder SVG image (`welcome-hero.svg`).

## Replacing with Actual Image

To use the actual family photo from the issue, replace the placeholder:

1. Download the hero image from: https://github.com/user-attachments/assets/9f7f4ee5-ac27-4415-9fe4-7f7e45588f92
2. Save it as `welcome-hero.jpg` in this directory (`packages/mobile-app/public/`)
3. Update the image source in `src/views/WelcomeScreen.vue` from:
   ```vue
   <img src="/welcome-hero.svg" ...>
   ```
   to:
   ```vue
   <img src="/welcome-hero.jpg" ...>
   ```
4. Delete or rename the placeholder `welcome-hero.svg`

## Image Specifications
- **Recommended format**: JPG or WebP
- **Recommended size**: 800x600 pixels or similar aspect ratio
- **Max file size**: Keep under 500KB for optimal mobile performance
- **Content**: Family photo showing warmth, care, and togetherness

## Note
The image URL from GitHub may require authentication. If it's not publicly accessible, you may need to:
- Download it from the GitHub issue while logged in
- Or contact the repository owner to get the image file directly
