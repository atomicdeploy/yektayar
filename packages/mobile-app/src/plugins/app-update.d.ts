/**
 * App Update Plugin Interface
 * 
 * TypeScript definitions for the native AppUpdatePlugin
 */

export interface VersionInfo {
  updateAvailable: boolean
  latestVersion?: string
  latestBuildNumber?: number
  downloadUrl?: string
  releaseNotes?: string
  mandatory?: boolean
  minVersion?: string
  message?: string
}

export interface DownloadStatus {
  status: 'started' | 'progress' | 'completed' | 'failed' | 'installReady'
  progress?: number
  filePath?: string
  message?: string
  error?: string
}

export interface AppUpdatePlugin {
  /**
   * Download an APK update from the specified URL
   */
  downloadUpdate(options: { downloadUrl: string; version: string }): Promise<{
    success: boolean
    downloadId?: number
    message: string
  }>
  
  /**
   * Get the current download progress
   */
  getDownloadProgress(): Promise<{
    success: boolean
    progress: number
  }>
  
  /**
   * Install a downloaded APK
   */
  installUpdate(options: { filePath: string }): Promise<{
    success: boolean
    message: string
  }>
  
  /**
   * Cancel the current download
   */
  cancelDownload(): Promise<{
    success: boolean
    message: string
  }>
  
  /**
   * Add listener for download status events
   */
  addListener(
    eventName: 'downloadStatus',
    listenerFunc: (status: DownloadStatus) => void
  ): Promise<void>
}
