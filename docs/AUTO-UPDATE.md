# Auto-Update Feature Documentation

## Overview

The YektaYar platform now includes a comprehensive auto-update system that allows users to seamlessly update their applications. The system supports both Android APK updates and PWA (Progressive Web App) updates through service worker cache updates.

## Architecture

The auto-update feature spans three main components:

1. **Backend API** - Manages update information and tracks installations
2. **Shared Types** - Type definitions and utilities shared across the platform
3. **Mobile App** - User interface and update management logic

## Backend API

### Endpoints

#### `GET /api/updates/check`

Check if an update is available for the specified platform.

**Query Parameters:**
- `platform` (required): Platform to check updates for (`android`, `ios`, `pwa`, `web`)
- `currentVersion` (optional): Current app version in semver format (e.g., `1.0.0`)

**Response:**
```json
{
  "success": true,
  "data": {
    "updateAvailable": true,
    "currentVersion": "1.0.0",
    "latestVersion": "1.1.0",
    "mandatory": false,
    "update": {
      "id": "update-android-1.1.0",
      "version": "1.1.0",
      "platform": "android",
      "buildNumber": 110,
      "releaseDate": "2024-12-05T00:00:00.000Z",
      "mandatory": false,
      "changelog": "# What's New in v1.1.0...",
      "downloadUrl": "https://static.yektayar.ir/dl/android/yektayar-v1.1.0.apk",
      "fileSize": 47185920,
      "checksum": "sha256:abcdef1234567890",
      "minAppVersion": "1.0.0",
      "metadata": {
        "minSdkVersion": 24,
        "targetSdkVersion": 33
      }
    },
    "message": "New update available"
  }
}
```

#### `POST /api/updates/report-install`

Report successful update installation (for analytics and monitoring).

**Request Body:**
```json
{
  "updateId": "update-android-1.1.0",
  "version": "1.1.0",
  "platform": "android",
  "previousVersion": "1.0.0",
  "userId": "user-123",
  "deviceInfo": {
    "platform": "android",
    "appVersion": "1.1.0",
    "appBuild": "110"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Update installation reported successfully",
    "reportedAt": "2024-12-05T12:00:00.000Z"
  }
}
```

#### `GET /api/updates/info`

Get information about the update service.

**Response:**
```json
{
  "success": true,
  "data": {
    "serverVersion": "0.1.0",
    "supportedPlatforms": ["android", "ios", "pwa", "web"],
    "updateCheckEndpoint": "/api/updates/check",
    "reportInstallEndpoint": "/api/updates/report-install",
    "description": "Auto-update service for YektaYar applications"
  }
}
```

## Mobile App Integration

### Composable: `useAppUpdate()`

The `useAppUpdate` composable provides all the functionality needed to manage app updates.

#### Usage

```typescript
import { useAppUpdate } from '@/composables/useAppUpdate'

const {
  // State
  updateInfo,
  updateStatus,
  downloadProgress,
  error,
  isCheckingUpdate,
  
  // Computed
  isUpdateAvailable,
  isDownloading,
  isPaused,
  isDownloaded,
  canPauseDownload,
  canResumeDownload,
  platform,
  
  // Methods
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  pauseDownload,
  resumeDownload,
  retryDownload,
  cleanupDownloadedFiles,
  dismissUpdate,
  formatBytes,
  formatTime
} = useAppUpdate()

// Check for updates
const hasUpdate = await checkForUpdate('1.0.0')

if (hasUpdate) {
  // Download the update
  await downloadUpdate()
  
  // Install the update (Android only, PWA updates automatically)
  await installUpdate()
}
```

#### State Properties

- `updateInfo`: Information about the available update
- `updateStatus`: Current status of the update process
- `downloadProgress`: Download progress information (bytes, speed, ETA)
- `error`: Error message if any operation failed
- `isCheckingUpdate`: Whether currently checking for updates

#### Computed Properties

- `isUpdateAvailable`: Whether an update is available
- `isDownloading`: Whether currently downloading
- `isPaused`: Whether download is paused
- `isDownloaded`: Whether download is complete
- `canPauseDownload`: Whether download can be paused
- `canResumeDownload`: Whether download can be resumed
- `platform`: Current platform (android, ios, pwa)

#### Methods

- `checkForUpdate(currentVersion?)`: Check if an update is available
- `downloadUpdate()`: Download the available update
- `installUpdate()`: Install the downloaded update
- `pauseDownload()`: Pause the download (Android only)
- `resumeDownload()`: Resume the paused download
- `retryDownload()`: Retry a failed download
- `cleanupDownloadedFiles()`: Clean up downloaded files
- `dismissUpdate()`: Dismiss the update notification
- `formatBytes(bytes)`: Format bytes to human-readable format
- `formatTime(seconds)`: Format time to human-readable format

### Component: `UpdateModal`

The `UpdateModal` component provides an elegant UI for managing updates.

#### Props

```typescript
interface Props {
  isOpen: boolean
  updateInfo: UpdateInfo | null
  updateStatus: UpdateStatus
  downloadProgress: UpdateDownloadProgress
  error: string | null
}
```

#### Events

- `@dismiss`: User dismissed the modal
- `@download`: User clicked download button
- `@pause`: User paused the download
- `@resume`: User resumed the download
- `@cancel`: User cancelled the download
- `@install`: User clicked install button
- `@retry`: User clicked retry button

#### Features

- **Elegant Design**: Modern, animated UI with gradient backgrounds
- **Changelog Display**: Markdown-formatted changelog with proper styling
- **Progress Tracking**: Real-time download progress with speed and ETA
- **Download Control**: Pause, resume, and retry functionality for Android
- **Mandatory Updates**: Cannot be dismissed if the update is mandatory
- **Localization**: Full support for Persian and English languages

## Features

### Android Updates

1. **APK Download**: Downloads APK files from the specified URL
2. **Streaming Download**: Uses fetch API with streaming for efficient downloads
3. **Progress Tracking**: Real-time progress with download speed and ETA
4. **Pause/Resume**: Ability to pause and resume downloads
5. **Retry on Failure**: Automatic retry mechanism for failed downloads
6. **Installation**: Triggers Android package installer after download

### PWA Updates

1. **Service Worker Update**: Updates the service worker cache
2. **Automatic Activation**: Activates the new service worker automatically
3. **Page Reload**: Reloads the page to apply the update
4. **No Download Tracking**: PWA updates don't require separate download tracking

### Common Features

1. **Update Check**: Automatic check on app startup and resume
2. **Manual Check**: Option to manually check for updates in settings
3. **Mandatory Updates**: Force users to update for critical releases
4. **Changelog Display**: Show release notes in markdown format
5. **Analytics**: Report successful installations to the backend
6. **Cleanup**: Automatic cleanup of temporary files after update

## Integration Points

### App Startup

Updates are automatically checked when the app starts:

```typescript
// App.vue
onMounted(async () => {
  setTimeout(async () => {
    const hasUpdate = await checkForUpdate()
    if (hasUpdate) {
      showUpdateModal.value = true
    }
  }, 3000) // Check after 3 seconds to avoid blocking startup
})
```

### App Resume

Updates are also checked when the app resumes from background:

```typescript
CapApp.addListener('resume', async () => {
  const hasUpdate = await checkForUpdate()
  if (hasUpdate && !showUpdateModal.value) {
    showUpdateModal.value = true
  }
})
```

### Settings

Users can manually check for updates in the Profile/Settings page:

```typescript
async function handleCheckForUpdates() {
  const hasUpdate = await checkForUpdate()
  // Show toast notification with result
}
```

## Localization

All update-related text is fully localized in Persian (fa) and English (en):

```json
{
  "update": {
    "availableTitle": "New Update Available",
    "mandatoryTitle": "Critical Update Required",
    "subtitle": "Version {version} is now available",
    "whatsNew": "What's New",
    "download": "Download Update",
    "pause": "Pause",
    "resume": "Resume",
    "install": "Install",
    "retry": "Retry"
  }
}
```

## Production Deployment

### Backend Configuration

1. Update the `mockUpdates` array in `/packages/backend/src/routes/updates.ts` to point to your actual update files
2. In production, replace the mock data with database queries
3. Set up a CDN or static file server to host APK files
4. Configure proper CORS headers for the download URLs

### Mobile App Configuration

1. Ensure the app version is properly set in `package.json`
2. Configure Capacitor for Android builds
3. Set up service worker for PWA updates
4. Test the update flow in both development and production environments

### Security Considerations

1. **Checksum Verification**: Implement SHA-256 checksum verification for downloaded APKs
2. **HTTPS Only**: Always use HTTPS for update downloads
3. **Code Signing**: Sign Android APKs with proper certificates
4. **Version Validation**: Validate version numbers to prevent downgrade attacks
5. **Rate Limiting**: Implement rate limiting on update check endpoints

## Testing

### Backend Testing

```bash
# Test update check endpoint
curl "http://localhost:3000/api/updates/check?platform=android&currentVersion=1.0.0"

# Test report install endpoint
curl -X POST http://localhost:3000/api/updates/report-install \
  -H "Content-Type: application/json" \
  -d '{"updateId":"update-android-1.1.0","version":"1.1.0","platform":"android"}'
```

### Mobile App Testing

1. **Update Check**: Open the app and wait for automatic update check
2. **Manual Check**: Go to Profile > Check for Updates
3. **Download**: Click "Download Update" and monitor progress
4. **Pause/Resume**: Test pause and resume functionality (Android)
5. **Install**: Complete the installation process
6. **Mandatory Update**: Test with mandatory update scenario

## Future Enhancements

1. **Delta Updates**: Implement differential updates to reduce download size
2. **Background Downloads**: Download updates in the background
3. **Update Scheduling**: Allow users to schedule updates
4. **Rollback Mechanism**: Add ability to rollback to previous version
5. **A/B Testing**: Implement staged rollouts with A/B testing
6. **In-App Updates (Android)**: Use Google Play In-App Updates API
7. **TestFlight Integration (iOS)**: Integrate with TestFlight for iOS updates

## Troubleshooting

### Update Check Fails

- Check network connectivity
- Verify backend API is accessible
- Check CORS configuration
- Verify API endpoint paths

### Download Fails

- Check download URL is accessible
- Verify file exists on the server
- Check device storage space
- Verify network stability

### Installation Fails (Android)

- Check if APK is properly signed
- Verify "Install from unknown sources" permission
- Check Android version compatibility
- Verify APK is not corrupted (checksum)

### PWA Update Not Applying

- Check if service worker is registered
- Verify service worker update logic
- Clear browser cache
- Check console for service worker errors

## Support

For issues or questions about the auto-update feature, please:

1. Check this documentation
2. Review the code in the repository
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
