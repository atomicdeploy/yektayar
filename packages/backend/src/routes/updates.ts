/**
 * Update Routes
 * Provides API endpoints for checking and managing app updates
 */

import { Elysia, t } from 'elysia'
import { logger } from '@yektayar/shared'
import { UpdatePlatform } from '@yektayar/shared'
import { getVersionFromPackageJson } from '@yektayar/shared'
import packageJson from '../../package.json'

// In a production environment, this would come from a database
// For now, we'll use a mock implementation
interface UpdateRecord {
  id: string
  version: string
  platform: string
  buildNumber?: number
  releaseDate: Date
  mandatory: boolean
  changelog: string
  downloadUrl: string
  fileSize: number
  checksum?: string
  minAppVersion?: string
  metadata?: Record<string, any>
}

// Mock update data - In production, this would be fetched from database
const mockUpdates: UpdateRecord[] = [
  {
    id: 'update-android-1.1.0',
    version: '1.1.0',
    platform: UpdatePlatform.ANDROID,
    buildNumber: 110,
    releaseDate: new Date('2024-12-05'),
    mandatory: false,
    changelog: `# What's New in v1.1.0

## 🎉 New Features
- Auto-update functionality for seamless app updates
- Enhanced user interface with improved animations
- Better offline support and caching

## 🐛 Bug Fixes
- Fixed crash on Android 12+ devices
- Improved memory management
- Fixed notification issues

## 🚀 Improvements
- Faster app startup time
- Reduced app size by 15%
- Better battery optimization`,
    downloadUrl: 'https://static.yektayar.ir/dl/android/yektayar-v1.1.0.apk',
    fileSize: 45 * 1024 * 1024, // 45 MB
    checksum: 'sha256:abcdef1234567890',
    minAppVersion: '1.0.0',
    metadata: {
      minSdkVersion: 24,
      targetSdkVersion: 33,
    }
  },
  {
    id: 'update-pwa-1.1.0',
    version: '1.1.0',
    platform: UpdatePlatform.PWA,
    releaseDate: new Date('2024-12-05'),
    mandatory: false,
    changelog: `# What's New in v1.1.0

## 🎉 New Features
- Auto-update functionality for seamless app updates
- Enhanced user interface with improved animations
- Better offline support and caching

## 🚀 Improvements
- Faster page load times
- Improved service worker caching
- Better mobile experience`,
    downloadUrl: '', // PWA updates don't need a download URL
    fileSize: 0,
    minAppVersion: '1.0.0',
  }
]

// Get current app version from package.json
const CURRENT_VERSION = getVersionFromPackageJson(packageJson)

/**
 * Compare version strings (semver-like)
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(n => parseInt(n, 10) || 0)
  const parts2 = v2.split('.').map(n => parseInt(n, 10) || 0)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

export const updateRoutes = new Elysia({ prefix: '/api/updates' })
  .get('/check', async ({ query, set }) => {
    try {
      const { platform, currentVersion } = query
      
      if (!platform) {
        set.status = 400
        return {
          success: false,
          error: 'Missing required parameter: platform',
          message: 'Platform parameter is required (android, ios, pwa, web)'
        }
      }

      logger.info(`Checking for updates - Platform: ${platform}, Current version: ${currentVersion || 'unknown'}`)
      
      // Find the latest update for the specified platform
      const platformUpdates = mockUpdates
        .filter(update => update.platform.toLowerCase() === platform.toLowerCase())
        .sort((a, b) => compareVersions(b.version, a.version))
      
      if (platformUpdates.length === 0) {
        logger.info(`No updates available for platform: ${platform}`)
        return {
          success: true,
          data: {
            updateAvailable: false,
            currentVersion: currentVersion || CURRENT_VERSION,
            latestVersion: currentVersion || CURRENT_VERSION,
            message: 'You are running the latest version'
          }
        }
      }

      const latestUpdate = platformUpdates[0]
      const checkVersion = currentVersion || CURRENT_VERSION
      
      // Check if update is available
      const updateAvailable = compareVersions(latestUpdate.version, checkVersion) > 0
      
      if (!updateAvailable) {
        logger.info(`App is up to date - Current: ${checkVersion}, Latest: ${latestUpdate.version}`)
        return {
          success: true,
          data: {
            updateAvailable: false,
            currentVersion: checkVersion,
            latestVersion: latestUpdate.version,
            message: 'You are running the latest version'
          }
        }
      }

      // Check if current version meets minimum requirements
      if (latestUpdate.minAppVersion && compareVersions(checkVersion, latestUpdate.minAppVersion) < 0) {
        logger.warn(`Current version ${checkVersion} is below minimum required version ${latestUpdate.minAppVersion}`)
        return {
          success: true,
          data: {
            updateAvailable: true,
            currentVersion: checkVersion,
            latestVersion: latestUpdate.version,
            mandatory: true,
            update: {
              id: latestUpdate.id,
              version: latestUpdate.version,
              platform: latestUpdate.platform,
              buildNumber: latestUpdate.buildNumber,
              releaseDate: latestUpdate.releaseDate,
              mandatory: true,
              changelog: latestUpdate.changelog,
              downloadUrl: latestUpdate.downloadUrl,
              fileSize: latestUpdate.fileSize,
              checksum: latestUpdate.checksum,
              minAppVersion: latestUpdate.minAppVersion,
              metadata: latestUpdate.metadata,
            },
            message: 'Critical update required'
          }
        }
      }

      logger.info(`Update available - Current: ${checkVersion}, Latest: ${latestUpdate.version}`)
      
      return {
        success: true,
        data: {
          updateAvailable: true,
          currentVersion: checkVersion,
          latestVersion: latestUpdate.version,
          mandatory: latestUpdate.mandatory,
          update: {
            id: latestUpdate.id,
            version: latestUpdate.version,
            platform: latestUpdate.platform,
            buildNumber: latestUpdate.buildNumber,
            releaseDate: latestUpdate.releaseDate,
            mandatory: latestUpdate.mandatory,
            changelog: latestUpdate.changelog,
            downloadUrl: latestUpdate.downloadUrl,
            fileSize: latestUpdate.fileSize,
            checksum: latestUpdate.checksum,
            minAppVersion: latestUpdate.minAppVersion,
            metadata: latestUpdate.metadata,
          },
          message: 'New update available'
        }
      }
    } catch (error) {
      logger.error('Error checking for updates:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to check for updates'
      }
    }
  }, {
    detail: {
      tags: ['Updates'],
      summary: 'Check for available updates',
      description: 'Check if there is a newer version available for the specified platform'
    },
    query: t.Object({
      platform: t.String({ 
        description: 'Platform to check updates for (android, ios, pwa, web)',
        examples: ['android', 'pwa']
      }),
      currentVersion: t.Optional(t.String({ 
        description: 'Current app version (semver format)',
        examples: ['1.0.0', '0.1.0']
      }))
    })
  })
  .post('/report-install', async ({ body, set }) => {
    try {
      const { updateId, version, platform, previousVersion, userId, deviceInfo } = body
      
      logger.success(`Update installed successfully - Version: ${version}, Platform: ${platform}`)
      logger.info('Update install report:', {
        updateId,
        version,
        platform,
        previousVersion,
        userId: userId || 'anonymous',
        deviceInfo: deviceInfo || 'not provided'
      })
      
      // In production, this would store the report in the database
      // For analytics, monitoring, and tracking purposes
      
      return {
        success: true,
        data: {
          message: 'Update installation reported successfully',
          reportedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      logger.error('Error reporting update installation:', error)
      set.status = 500
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to report update installation'
      }
    }
  }, {
    detail: {
      tags: ['Updates'],
      summary: 'Report successful update installation',
      description: 'Report that an update has been successfully installed (for analytics and monitoring)'
    },
    body: t.Object({
      updateId: t.String({ description: 'Update ID' }),
      version: t.String({ description: 'Installed version' }),
      platform: t.String({ description: 'Platform (android, ios, pwa, web)' }),
      previousVersion: t.Optional(t.String({ description: 'Previous version before update' })),
      userId: t.Optional(t.String({ description: 'User ID (if available)' })),
      deviceInfo: t.Optional(t.Any({ description: 'Device information' }))
    })
  })
  .get('/info', async () => {
    try {
      return {
        success: true,
        data: {
          serverVersion: CURRENT_VERSION,
          supportedPlatforms: Object.values(UpdatePlatform),
          updateCheckEndpoint: '/api/updates/check',
          reportInstallEndpoint: '/api/updates/report-install',
          description: 'Auto-update service for YektaYar applications'
        }
      }
    } catch (error) {
      logger.error('Error fetching update info:', error)
      return {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch update information'
      }
    }
  }, {
    detail: {
      tags: ['Updates'],
      summary: 'Get update service information',
      description: 'Get information about the update service and supported platforms'
    }
  })
