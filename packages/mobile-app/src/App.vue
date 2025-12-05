<template>
  <ion-app :dir="locale === 'fa' ? 'rtl' : 'ltr'">
    <ion-router-outlet />
    
    <!-- Update Modal -->
    <UpdateModal
      :is-open="showUpdateModal"
      :update-info="updateInfo"
      :update-status="updateStatus"
      :download-progress="downloadProgress"
      :error="updateError"
      @dismiss="handleDismissUpdate"
      @download="handleDownloadUpdate"
      @pause="handlePauseUpdate"
      @resume="handleResumeUpdate"
      @cancel="handleCancelUpdate"
      @install="handleInstallUpdate"
      @retry="handleRetryUpdate"
    />
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from './composables/useTheme'
import { useAppUpdate } from './composables/useAppUpdate'
import UpdateModal from './components/UpdateModal.vue'
import { logger } from '@yektayar/shared'
import { App as CapApp } from '@capacitor/app'

const { locale } = useI18n()

// Initialize theme system
useTheme()

// Initialize update system
const {
  updateInfo,
  updateStatus,
  downloadProgress,
  error: updateError,
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  pauseDownload,
  resumeDownload,
  retryDownload,
  dismissUpdate,
  cleanupDownloadedFiles
} = useAppUpdate()

const showUpdateModal = ref(false)

// Check for updates on app startup
onMounted(async () => {
  try {
    // Wait a bit before checking for updates to avoid blocking app startup
    setTimeout(async () => {
      logger.info('Checking for app updates...')
      const hasUpdate = await checkForUpdate()
      
      if (hasUpdate) {
        showUpdateModal.value = true
        logger.success('Update available, showing modal')
      }
    }, 3000) // Check after 3 seconds
    
    // Also check for updates when app resumes from background
    CapApp.addListener('resume', async () => {
      logger.info('App resumed, checking for updates...')
      const hasUpdate = await checkForUpdate()
      
      if (hasUpdate && !showUpdateModal.value) {
        showUpdateModal.value = true
      }
    })
  } catch (error) {
    logger.error('Error setting up update checks:', error)
  }
})

// Update modal handlers
function handleDismissUpdate() {
  if (updateInfo.value?.mandatory) {
    logger.warn('Cannot dismiss mandatory update')
    return
  }
  
  showUpdateModal.value = false
  dismissUpdate()
}

async function handleDownloadUpdate() {
  try {
    await downloadUpdate()
  } catch (error) {
    logger.error('Failed to download update:', error)
  }
}

function handlePauseUpdate() {
  pauseDownload()
}

async function handleResumeUpdate() {
  try {
    await resumeDownload()
  } catch (error) {
    logger.error('Failed to resume download:', error)
  }
}

async function handleCancelUpdate() {
  showUpdateModal.value = false
  await cleanupDownloadedFiles()
}

async function handleInstallUpdate() {
  try {
    await installUpdate()
  } catch (error) {
    logger.error('Failed to install update:', error)
  }
}

async function handleRetryUpdate() {
  try {
    await retryDownload()
  } catch (error) {
    logger.error('Failed to retry download:', error)
  }
}
</script>
