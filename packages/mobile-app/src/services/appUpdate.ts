/**
 * App Update Service
 * 
 * Handles checking for updates, downloading APKs, and managing the update process.
 * This service runs in the background and logs update events.
 */

import { Capacitor, registerPlugin } from '@capacitor/core'
import { logger } from '@yektayar/shared'
import type { AppUpdatePlugin, VersionInfo, DownloadStatus } from '../plugins/app-update'
import { apiClient } from '../api/index'

// Register the native plugin
const AppUpdate = registerPlugin<AppUpdatePlugin>('AppUpdate')

/**
 * Check for app updates from the server
 * 
 * @returns Version information including whether an update is available
 */
export async function checkForUpdates(): Promise<VersionInfo | null> {
  try {
    // Only check for updates on native Android platform
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      logger.info('Update check skipped - not on Android native platform')
      return null
    }
    
    logger.info('Checking for app updates...')
    
    const response = await apiClient.get<VersionInfo>('/version/latest', {
      skipAuth: true
    })
    
    if (!response.success || !response.data) {
      logger.error('Failed to check for updates:', response.error)
      return null
    }
    
    const versionInfo = response.data
    
    if (versionInfo.updateAvailable) {
      logger.success('Update available!', {
        currentVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
        latestVersion: versionInfo.latestVersion,
        mandatory: versionInfo.mandatory
      })
    } else {
      logger.info('App is up to date')
    }
    
    return versionInfo
  } catch (error) {
    logger.error('Error checking for updates:', error)
    return null
  }
}

/**
 * Download an app update
 * 
 * @param downloadUrl URL to download the APK from
 * @param version Version string for logging
 * @returns Promise that resolves when download starts
 */
export async function downloadUpdate(downloadUrl: string, version: string): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      logger.warn('Download skipped - not on Android native platform')
      return false
    }
    
    logger.info('Starting update download:', { downloadUrl, version })
    
    // Set up download status listener
    await AppUpdate.addListener('downloadStatus', (status: DownloadStatus) => {
      handleDownloadStatus(status)
    })
    
    // Start download
    const result = await AppUpdate.downloadUpdate({ downloadUrl, version })
    
    if (result.success) {
      logger.success('Download started successfully', result)
      return true
    } else {
      logger.error('Failed to start download:', result.message)
      return false
    }
  } catch (error) {
    logger.error('Error starting download:', error)
    return false
  }
}

/**
 * Handle download status updates
 * 
 * @param status Download status event
 */
function handleDownloadStatus(status: DownloadStatus) {
  switch (status.status) {
    case 'started':
      logger.info('📥 Download started')
      break
      
    case 'progress':
      logger.info(`📥 Download progress: ${status.progress}%`)
      break
      
    case 'completed':
      logger.success('✅ Download completed!', {
        filePath: status.filePath
      })
      break
      
    case 'failed':
      logger.error('❌ Download failed:', status.error)
      break
      
    case 'installReady':
      logger.success('🚀 Update ready to install!', {
        filePath: status.filePath
      })
      // Note: Installation will be triggered automatically by the native plugin
      // User must approve the installation through system dialog
      break
  }
}

/**
 * Get current download progress
 * 
 * @returns Progress percentage (0-100) or -1 if no download in progress
 */
export async function getDownloadProgress(): Promise<number> {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return -1
    }
    
    const result = await AppUpdate.getDownloadProgress()
    return result.success ? result.progress : -1
  } catch (error) {
    logger.error('Error getting download progress:', error)
    return -1
  }
}

/**
 * Install a downloaded update
 * 
 * @param filePath Path to the downloaded APK file
 * @returns Promise that resolves when installation is initiated
 */
export async function installUpdate(filePath: string): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      logger.warn('Installation skipped - not on Android native platform')
      return false
    }
    
    logger.info('Initiating update installation:', filePath)
    
    const result = await AppUpdate.installUpdate({ filePath })
    
    if (result.success) {
      logger.success('Installation initiated - user approval required')
      return true
    } else {
      logger.error('Failed to initiate installation:', result.message)
      return false
    }
  } catch (error) {
    logger.error('Error installing update:', error)
    return false
  }
}

/**
 * Cancel ongoing download
 * 
 * @returns Promise that resolves when download is cancelled
 */
export async function cancelDownload(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return false
    }
    
    const result = await AppUpdate.cancelDownload()
    
    if (result.success) {
      logger.info('Download cancelled')
      return true
    }
    
    return false
  } catch (error) {
    logger.error('Error cancelling download:', error)
    return false
  }
}

/**
 * Check for updates and automatically download if available
 * This function is designed to be called periodically (e.g., on app start)
 */
export async function autoCheckAndDownload(): Promise<void> {
  try {
    const versionInfo = await checkForUpdates()
    
    if (!versionInfo || !versionInfo.updateAvailable) {
      return
    }
    
    logger.info('Update available - automatic download initiated')
    
    if (versionInfo.downloadUrl) {
      await downloadUpdate(versionInfo.downloadUrl, versionInfo.latestVersion || 'unknown')
    }
  } catch (error) {
    logger.error('Error in auto check and download:', error)
  }
}
