/**
 * App Update Composable
 * Handles checking for updates, downloading, and installing updates for both Android and PWA
 */

import { ref, computed } from 'vue'
import { UpdateStatus, UpdatePlatform } from '@yektayar/shared'
import type { UpdateInfo, UpdateDownloadProgress } from '@yektayar/shared'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

export function useAppUpdate() {
  // State
  const updateInfo = ref<UpdateInfo | null>(null)
  const updateStatus = ref<UpdateStatus>(UpdateStatus.IDLE)
  const downloadProgress = ref<UpdateDownloadProgress>({
    bytesDownloaded: 0,
    totalBytes: 0,
    percentage: 0,
    speed: 0,
    estimatedTimeRemaining: 0,
    status: UpdateStatus.IDLE
  })
  const error = ref<string | null>(null)
  const isCheckingUpdate = ref(false)
  
  // Download state
  let downloadAbortController: AbortController | null = null
  let downloadStartTime = 0
  let lastProgressTime = 0
  let lastProgressBytes = 0
  
  // Computed
  const isUpdateAvailable = computed(() => updateInfo.value !== null && updateStatus.value !== UpdateStatus.UP_TO_DATE)
  const isDownloading = computed(() => updateStatus.value === UpdateStatus.DOWNLOADING)
  const isPaused = computed(() => updateStatus.value === UpdateStatus.PAUSED)
  const isDownloaded = computed(() => updateStatus.value === UpdateStatus.DOWNLOADED)
  const canPauseDownload = computed(() => isDownloading.value)
  const canResumeDownload = computed(() => isPaused.value)
  
  // Get current platform
  const platform = computed(() => {
    if (Capacitor.getPlatform() === 'android') {
      return UpdatePlatform.ANDROID
    } else if (Capacitor.getPlatform() === 'ios') {
      return UpdatePlatform.IOS
    } else {
      return UpdatePlatform.PWA
    }
  })

  /**
   * Check for available updates
   */
  async function checkForUpdate(currentVersion?: string): Promise<boolean> {
    try {
      isCheckingUpdate.value = true
      updateStatus.value = UpdateStatus.CHECKING
      error.value = null
      
      // Get current app version if not provided
      if (!currentVersion && Capacitor.isNativePlatform()) {
        try {
          const appInfo = await App.getInfo()
          currentVersion = appInfo.version
        } catch (err) {
          logger.warn('Failed to get app info, using default version', err)
        }
      }
      
      logger.info(`Checking for updates - Platform: ${platform.value}, Current version: ${currentVersion || 'unknown'}`)
      
      const response = await apiClient.get<{
        updateAvailable: boolean
        currentVersion: string
        latestVersion: string
        mandatory?: boolean
        update?: UpdateInfo
        message: string
      }>('/updates/check', {
        params: {
          platform: platform.value.toLowerCase(),
          currentVersion
        },
        skipAuth: true
      })
      
      if (response.success && response.data) {
        if (response.data.updateAvailable && response.data.update) {
          updateInfo.value = response.data.update
          updateStatus.value = UpdateStatus.AVAILABLE
          logger.success('Update available:', response.data.latestVersion)
          return true
        } else {
          updateStatus.value = UpdateStatus.UP_TO_DATE
          logger.info('App is up to date')
          return false
        }
      } else {
        throw new Error('Failed to check for updates')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check for updates'
      error.value = errorMessage
      updateStatus.value = UpdateStatus.FAILED
      logger.error('Update check failed:', err)
      return false
    } finally {
      isCheckingUpdate.value = false
    }
  }

  /**
   * Format bytes to human-readable format
   */
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Format time in seconds to human-readable format
   */
  function formatTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  /**
   * Download APK file for Android updates
   */
  async function downloadAndroidUpdate(): Promise<void> {
    if (!updateInfo.value || platform.value !== UpdatePlatform.ANDROID) {
      throw new Error('No update available or not on Android platform')
    }

    try {
      updateStatus.value = UpdateStatus.DOWNLOADING
      downloadStartTime = Date.now()
      lastProgressTime = downloadStartTime
      lastProgressBytes = 0
      error.value = null
      
      // Create abort controller for cancellation
      downloadAbortController = new AbortController()
      
      const downloadUrl = updateInfo.value.downloadUrl
      logger.info('Starting APK download:', downloadUrl)
      
      // Fetch with streaming support
      const response = await fetch(downloadUrl, {
        signal: downloadAbortController.signal
      })
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }
      
      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10)
      downloadProgress.value.totalBytes = totalBytes
      
      if (!response.body) {
        throw new Error('Response body is null')
      }
      
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let downloadedBytes = 0
      
      // Read stream
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        if (downloadAbortController.signal.aborted) {
          throw new Error('Download cancelled')
        }
        
        chunks.push(value)
        downloadedBytes += value.length
        
        // Update progress
        const now = Date.now()
        const timeDiff = (now - lastProgressTime) / 1000 // seconds
        const bytesDiff = downloadedBytes - lastProgressBytes
        
        if (timeDiff > 0.5) { // Update every 500ms
          const speed = bytesDiff / timeDiff
          const remainingBytes = totalBytes - downloadedBytes
          const eta = remainingBytes / speed
          
          downloadProgress.value = {
            bytesDownloaded: downloadedBytes,
            totalBytes,
            percentage: (downloadedBytes / totalBytes) * 100,
            speed,
            estimatedTimeRemaining: eta,
            status: UpdateStatus.DOWNLOADING
          }
          
          lastProgressTime = now
          lastProgressBytes = downloadedBytes
          
          logger.debug(`Download progress: ${downloadProgress.value.percentage.toFixed(1)}% (${formatBytes(downloadedBytes)}/${formatBytes(totalBytes)}) - Speed: ${formatBytes(speed)}/s - ETA: ${formatTime(eta)}`)
        }
      }
      
      // Combine chunks into single blob
      const blob = new Blob(chunks as BlobPart[], { type: 'application/vnd.android.package-archive' })
      
      // Save to filesystem using Capacitor Filesystem API
      // Note: In a real implementation, you would use Capacitor's Filesystem plugin
      // For now, we'll create a download link (works in browser/PWA)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `yektayar-${updateInfo.value.version}.apk`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      updateStatus.value = UpdateStatus.DOWNLOADED
      downloadProgress.value.status = UpdateStatus.DOWNLOADED
      downloadProgress.value.percentage = 100
      
      logger.success('APK download completed')
      
      // Report successful download (not installation yet)
      await reportUpdateInstall(updateInfo.value, 'downloaded')
      
    } catch (err) {
      if (err instanceof Error && err.message.includes('cancelled')) {
        updateStatus.value = UpdateStatus.PAUSED
        error.value = 'Download paused'
        logger.warn('Download paused by user')
      } else {
        updateStatus.value = UpdateStatus.FAILED
        error.value = err instanceof Error ? err.message : 'Download failed'
        logger.error('Download failed:', err)
      }
      throw err
    } finally {
      downloadAbortController = null
    }
  }

  /**
   * Pause download (Android only)
   */
  function pauseDownload(): void {
    if (downloadAbortController && isDownloading.value) {
      downloadAbortController.abort()
      updateStatus.value = UpdateStatus.PAUSED
      logger.info('Download paused')
    }
  }

  /**
   * Resume download (Android only)
   */
  async function resumeDownload(): Promise<void> {
    if (isPaused.value) {
      logger.info('Resuming download')
      await downloadAndroidUpdate()
    }
  }

  /**
   * Retry failed download
   */
  async function retryDownload(): Promise<void> {
    if (updateStatus.value === UpdateStatus.FAILED) {
      logger.info('Retrying download')
      await downloadUpdate()
    }
  }

  /**
   * Update PWA (service worker update)
   */
  async function updatePWA(): Promise<void> {
    try {
      updateStatus.value = UpdateStatus.INSTALLING
      logger.info('Updating PWA...')
      
      // Check if service worker is available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration) {
          // Check for update
          await registration.update()
          
          // If there's a waiting service worker, activate it
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            
            // Wait for the new service worker to activate
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              updateStatus.value = UpdateStatus.INSTALLED
              logger.success('PWA updated successfully')
              
              // Report successful installation
              if (updateInfo.value) {
                reportUpdateInstall(updateInfo.value, 'installed')
              }
              
              // Reload the page to apply the update
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            })
          } else {
            updateStatus.value = UpdateStatus.UP_TO_DATE
            logger.info('PWA is already up to date')
          }
        } else {
          throw new Error('No service worker registration found')
        }
      } else {
        throw new Error('Service worker not supported')
      }
    } catch (err) {
      updateStatus.value = UpdateStatus.FAILED
      error.value = err instanceof Error ? err.message : 'PWA update failed'
      logger.error('PWA update failed:', err)
      throw err
    }
  }

  /**
   * Download and prepare update
   */
  async function downloadUpdate(): Promise<void> {
    if (!updateInfo.value) {
      throw new Error('No update available')
    }
    
    if (platform.value === UpdatePlatform.ANDROID) {
      await downloadAndroidUpdate()
    } else if (platform.value === UpdatePlatform.PWA) {
      await updatePWA()
    } else {
      throw new Error(`Update not supported for platform: ${platform.value}`)
    }
  }

  /**
   * Install the downloaded update (Android only, PWA updates automatically)
   */
  async function installUpdate(): Promise<void> {
    if (!isDownloaded.value) {
      throw new Error('No update downloaded')
    }
    
    if (platform.value === UpdatePlatform.ANDROID) {
      updateStatus.value = UpdateStatus.INSTALLING
      logger.info('Installing Android update...')
      
      // Note: In a real Android app, you would use Capacitor plugins or native code
      // to install the APK. This requires specific Android permissions and intents.
      // For now, we'll just update the status
      
      // The actual installation would typically trigger the Android package installer
      // which requires user interaction to complete
      
      logger.warn('APK installation requires manual user action')
      
      // Report installation attempt
      if (updateInfo.value) {
        await reportUpdateInstall(updateInfo.value, 'installing')
      }
    }
  }

  /**
   * Report successful update installation to backend
   */
  async function reportUpdateInstall(update: UpdateInfo, status: 'downloaded' | 'installing' | 'installed'): Promise<void> {
    try {
      const deviceInfo: Record<string, any> = {
        platform: platform.value,
        status
      }
      
      if (Capacitor.isNativePlatform()) {
        try {
          const appInfo = await App.getInfo()
          deviceInfo.appVersion = appInfo.version
          deviceInfo.appBuild = appInfo.build
        } catch (err) {
          logger.warn('Failed to get app info for report', err)
        }
      }
      
      await apiClient.post('/updates/report-install', {
        updateId: update.id,
        version: update.version,
        platform: platform.value,
        deviceInfo,
        skipAuth: true
      })
      
      logger.info('Update installation reported to backend')
    } catch (err) {
      // Don't throw error, just log it
      logger.warn('Failed to report update installation:', err)
    }
  }

  /**
   * Clean up downloaded files
   */
  async function cleanupDownloadedFiles(): Promise<void> {
    try {
      // In a real implementation, this would delete the downloaded APK file
      // using Capacitor's Filesystem plugin
      logger.info('Cleaning up downloaded files')
      
      // Reset state
      updateInfo.value = null
      updateStatus.value = UpdateStatus.IDLE
      downloadProgress.value = {
        bytesDownloaded: 0,
        totalBytes: 0,
        percentage: 0,
        speed: 0,
        estimatedTimeRemaining: 0,
        status: UpdateStatus.IDLE
      }
      error.value = null
    } catch (err) {
      logger.error('Failed to cleanup downloaded files:', err)
    }
  }

  /**
   * Dismiss update notification
   */
  function dismissUpdate(): void {
    updateInfo.value = null
    updateStatus.value = UpdateStatus.IDLE
    error.value = null
  }

  return {
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
  }
}
