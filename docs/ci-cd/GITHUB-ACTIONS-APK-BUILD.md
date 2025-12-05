# GitHub Actions APK Build with Secure Upload

## Overview

The GitHub Actions workflow `build-android-apk.yml` now automatically:
1. Builds the Android APK (debug or release)
2. Creates a password-protected ZIP containing only the APK (no directory structure)
3. Uploads the ZIP to tmpfiles.org for easy temporary access
4. Posts the download link and password as a PR comment

## Triggering the Workflow

### Manual Trigger (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **Build Android APK** workflow
3. Click **Run workflow**
4. Choose build type: `debug` or `release`
5. Click **Run workflow**

### Automatic Trigger

The workflow also runs automatically when:
- Pushing to `main` or `develop` branches
- Changes are made to `packages/mobile-app/**` or the workflow file itself

## Workflow Output

### 1. GitHub Actions Artifacts

Permanent artifacts uploaded to GitHub (retained for 30 days):
- APK file (debug or release)
- APK analysis report
- Build logs

Access via: Actions → Workflow Run → Artifacts section

### 2. Temporary Secure Download

Password-protected ZIP uploaded to tmpfiles.org:
- **Direct download link** (no login required)
- **Password**: Current build datetime in ISO format (`YYYY-MM-DDTHH:MM:SSZ`)
- **Contents**: APK file only (no folders)
- **Expiration**: Temporary (typically 1-7 days)

### 3. PR Comment (for Pull Requests)

When triggered on a PR, the workflow posts a comment with:
- 📥 Quick download link with password
- 📦 Artifact download link
- 📊 APK analysis details
- 📖 Installation instructions

## Using the Secure ZIP

### Extract the APK

```bash
# Using unzip with password
unzip -P "2025-12-05T02:22:40Z" yektayar-app-debug-secure.zip

# Using 7zip
7z x yektayar-app-debug-secure.zip -p"2025-12-05T02:22:40Z"
```

The extracted file will be:
- `app-debug.apk` (for debug builds)
- `app-release-unsigned.apk` (for release builds)

### Install on Device

```bash
# Via ADB
adb install app-debug.apk

# Or transfer to device and install manually
```

## Security Features

1. **AES-256 Encryption**: ZIP files are encrypted with strong encryption
2. **Time-based Passwords**: Passwords are unique to each build (ISO datetime)
3. **No Directory Structure**: ZIP contains only the APK file for easy extraction
4. **Temporary Links**: Links expire automatically to prevent long-term exposure
5. **Checksum Verification**: MD5 checksum provided to verify file integrity

## Workflow Steps

The workflow performs these steps:

1. ✅ Checkout code
2. ✅ Setup Node.js and Java
3. ✅ Install dependencies
4. ✅ Build web assets (production mode)
5. ✅ Sync Capacitor
6. ✅ Build APK (debug or release)
7. ✅ Analyze APK (size, methods, etc.)
8. ✅ **Create password-protected ZIP (no folders)**
9. ✅ **Upload ZIP to tmpfiles.org**
10. ✅ Upload artifacts to GitHub
11. ✅ **Post download info to PR (if applicable)**

## Environment Variables

Configure these secrets in GitHub repository settings:

- `API_BASE_URL`: Backend API URL (optional, defaults to `https://api.yektayar.ir`)

## Build Types

### Debug Build
- Signed with debug certificate
- Includes debugging information
- Larger file size
- For testing only

### Release Build
- Unsigned (needs signing for distribution)
- Optimized and minified
- Smaller file size
- For production preparation

## Troubleshooting

### Upload Failed
If tmpfiles.org upload fails:
1. Check the Actions logs for error details
2. Download from GitHub Artifacts instead
3. The workflow will still complete successfully

### Password Not Working
- Ensure you copy the exact password from the PR comment or workflow output
- Passwords are case-sensitive and include exact timestamps
- Use quotes around the password in command line

### APK Not Installing
- Enable "Install from Unknown Sources" on Android device
- Check minimum Android version (5.1 / API 22+)
- Verify APK checksum matches the provided MD5

## Local Build Script

You can also use the local build script with secure ZIP creation:

```bash
# Standard build
./scripts/build-apk.sh

# Build with secure ZIP creation
CREATE_SECURE_ZIP=true ./scripts/build-apk.sh
```

## Benefits

1. **Easy Distribution**: Share temporary links without managing file storage
2. **Secure Transfer**: Password-protected files with automatic expiration
3. **Clean Structure**: No nested folders, just the APK file
4. **Automated Process**: No manual upload or file management needed
5. **Multiple Options**: Both permanent (GitHub) and temporary (tmpfiles.org) downloads

## Limitations

- Temporary links expire after a period (check tmpfiles.org for details)
- File size limit: Typically 100MB+ (APK is ~6.5MB, well within limits)
- Download speed may vary based on tmpfiles.org capacity
- Password must be shared securely with intended recipients

---

**Last Updated**: 2024-12-05  
**Workflow Version**: 2.0 (with secure upload feature)
