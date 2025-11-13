# Welcome Screen Hero Image

## Current State
The welcome screen currently uses a placeholder image (`welcome-hero.jpg` - an SVG file).

## ⚠️ ACTION REQUIRED: Replace with Actual Image

The actual family photo needs to be manually added to this directory.

### Steps to Replace:

1. **Obtain the actual photo**: The family photo is shown in the GitHub issue but the asset URL is not publicly accessible:
   - Issue URL: https://github.com/atomicdeploy/yektayar/issues/70
   - Asset URL: https://github.com/user-attachments/assets/9f7f4ee5-ac27-4415-9fe4-7f7e45588f92
   - The image shows a warm family scene with parents and children on a couch with plants in the background

2. **Download the image**:
   - You'll need to be logged into GitHub and have access to the repository
   - Navigate to the issue and save the image directly from there
   - Or use the GH_PAT token with curl:
     ```bash
     curl -L -H "Authorization: token $GH_PAT" -o welcome-hero.jpg \
       "https://github.com/user-attachments/assets/9f7f4ee5-ac27-4415-9fe4-7f7e45588f92"
     ```

3. **Replace the placeholder**:
   - Save the actual photo as `welcome-hero.jpg` in this directory (`packages/mobile-app/public/`)
   - The placeholder will be automatically overwritten

4. **Verify**:
   - The `WelcomeScreen.vue` component is already configured to use `/welcome-hero.jpg`
   - Test the app to ensure the image displays correctly

## Image Specifications

- **Current placeholder**: SVG illustration with family silhouettes
- **Required format**: JPG (preferred) or PNG
- **Recommended size**: 1200x800 pixels (or similar 3:2 aspect ratio)
- **Max file size**: Keep under 500KB for optimal mobile performance
- **Content**: The specific family photo from the GitHub issue showing warmth, care, and togetherness

## Technical Details

The image is referenced in:
- `src/views/WelcomeScreen.vue` as `/welcome-hero.jpg`
- Displays with rounded corners and shadow
- Max height of 400px on mobile devices
- Responsive and works in both light and dark modes
