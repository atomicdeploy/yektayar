<template>
  <ion-modal
    :is-open="isOpen"
    :backdrop-dismiss="!updateInfo?.mandatory"
    :can-dismiss="!updateInfo?.mandatory"
    @didDismiss="handleDismiss"
    class="update-modal"
  >
    <ion-content class="update-modal-content">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="icon-container">
            <ion-icon :icon="rocketOutline" class="update-icon"></ion-icon>
          </div>
          <h2 class="modal-title">
            {{ updateInfo?.mandatory ? $t('update.mandatoryTitle') : $t('update.availableTitle') }}
          </h2>
          <p class="modal-subtitle">
            {{ $t('update.subtitle', { version: updateInfo?.version || '' }) }}
          </p>
        </div>

        <!-- Changelog -->
        <div v-if="updateInfo && !isDownloading && !isPaused && !isDownloaded" class="changelog-section">
          <h3 class="section-title">{{ $t('update.whatsNew') }}</h3>
          <div class="changelog-content" v-html="renderMarkdown(updateInfo.changelog)"></div>
          
          <div class="update-info">
            <div class="info-item">
              <ion-icon :icon="calendarOutline" class="info-icon"></ion-icon>
              <span>{{ formatDate(updateInfo.releaseDate) }}</span>
            </div>
            <div class="info-item">
              <ion-icon :icon="downloadOutline" class="info-icon"></ion-icon>
              <span>{{ formatBytes(updateInfo.fileSize) }}</span>
            </div>
            <div v-if="updateInfo.buildNumber" class="info-item">
              <ion-icon :icon="codeSlashOutline" class="info-icon"></ion-icon>
              <span>{{ $t('update.build') }} {{ updateInfo.buildNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Download Progress -->
        <div v-if="isDownloading || isPaused || isDownloaded" class="download-section">
          <div class="progress-header">
            <h3 class="section-title">
              {{ isDownloaded ? $t('update.downloaded') : isPaused ? $t('update.paused') : $t('update.downloading') }}
            </h3>
            <span class="progress-percentage">{{ downloadProgress.percentage.toFixed(1) }}%</span>
          </div>
          
          <!-- Progress Bar -->
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${downloadProgress.percentage}%` }">
              <div class="progress-bar-shimmer"></div>
            </div>
          </div>
          
          <!-- Download Stats -->
          <div class="download-stats">
            <div class="stat-item">
              <span class="stat-label">{{ $t('update.downloaded') }}:</span>
              <span class="stat-value">{{ formatBytes(downloadProgress.bytesDownloaded) }} / {{ formatBytes(downloadProgress.totalBytes) }}</span>
            </div>
            <div v-if="isDownloading && downloadProgress.speed > 0" class="stat-item">
              <span class="stat-label">{{ $t('update.speed') }}:</span>
              <span class="stat-value">{{ formatBytes(downloadProgress.speed) }}/s</span>
            </div>
            <div v-if="isDownloading && downloadProgress.estimatedTimeRemaining > 0" class="stat-item">
              <span class="stat-label">{{ $t('update.remaining') }}:</span>
              <span class="stat-value">{{ formatTime(downloadProgress.estimatedTimeRemaining) }}</span>
            </div>
          </div>
          
          <!-- Error Message -->
          <ion-note v-if="error" color="danger" class="error-message">
            <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
            {{ error }}
          </ion-note>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <!-- Download/Install Actions -->
          <template v-if="!isDownloading && !isPaused && !isDownloaded">
            <ion-button
              expand="block"
              color="primary"
              size="large"
              @click="handleDownload"
              class="action-button primary-action"
            >
              <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
              {{ $t('update.download') }}
            </ion-button>
            
            <ion-button
              v-if="!updateInfo?.mandatory"
              expand="block"
              fill="clear"
              size="large"
              @click="handleDismiss"
              class="action-button secondary-action"
            >
              {{ $t('update.later') }}
            </ion-button>
          </template>

          <!-- Downloading Actions -->
          <template v-else-if="isDownloading">
            <ion-button
              expand="block"
              color="warning"
              size="large"
              @click="handlePause"
              class="action-button"
            >
              <ion-icon slot="start" :icon="pauseOutline"></ion-icon>
              {{ $t('update.pause') }}
            </ion-button>
          </template>

          <!-- Paused Actions -->
          <template v-else-if="isPaused">
            <ion-button
              expand="block"
              color="primary"
              size="large"
              @click="handleResume"
              class="action-button"
            >
              <ion-icon slot="start" :icon="playOutline"></ion-icon>
              {{ $t('update.resume') }}
            </ion-button>
            
            <ion-button
              expand="block"
              color="danger"
              fill="outline"
              size="large"
              @click="handleCancel"
              class="action-button"
            >
              <ion-icon slot="start" :icon="closeOutline"></ion-icon>
              {{ $t('update.cancel') }}
            </ion-button>
          </template>

          <!-- Downloaded Actions -->
          <template v-else-if="isDownloaded">
            <ion-button
              expand="block"
              color="success"
              size="large"
              @click="handleInstall"
              class="action-button primary-action"
            >
              <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
              {{ $t('update.install') }}
            </ion-button>
          </template>

          <!-- Error Actions -->
          <template v-if="error && updateStatus === 'failed'">
            <ion-button
              expand="block"
              color="primary"
              size="large"
              @click="handleRetry"
              class="action-button"
            >
              <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
              {{ $t('update.retry') }}
            </ion-button>
          </template>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonModal,
  IonContent,
  IonButton,
  IonIcon,
  IonNote
} from '@ionic/vue'
import {
  rocketOutline,
  downloadOutline,
  calendarOutline,
  codeSlashOutline,
  pauseOutline,
  playOutline,
  closeOutline,
  checkmarkCircleOutline,
  refreshOutline,
  alertCircleOutline
} from 'ionicons/icons'
import type { UpdateInfo, UpdateDownloadProgress } from '@yektayar/shared'
import { UpdateStatus } from '@yektayar/shared'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

// Props
interface Props {
  isOpen: boolean
  updateInfo: UpdateInfo | null
  updateStatus: UpdateStatus
  downloadProgress: UpdateDownloadProgress
  error: string | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  dismiss: []
  download: []
  pause: []
  resume: []
  cancel: []
  install: []
  retry: []
}>()

// Computed
const isDownloading = computed(() => props.updateStatus === UpdateStatus.DOWNLOADING)
const isPaused = computed(() => props.updateStatus === UpdateStatus.PAUSED)
const isDownloaded = computed(() => props.updateStatus === UpdateStatus.DOWNLOADED)

// Methods
function handleDismiss() {
  emit('dismiss')
}

function handleDownload() {
  emit('download')
}

function handlePause() {
  emit('pause')
}

function handleResume() {
  emit('resume')
}

function handleCancel() {
  emit('cancel')
}

function handleInstall() {
  emit('install')
}

function handleRetry() {
  emit('retry')
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}m ${secs}s`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function renderMarkdown(markdown: string): string {
  // Simple markdown rendering (you could use a library like marked.js for more features)
  return markdown
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
}
</script>

<style scoped lang="scss">
.update-modal {
  --backdrop-opacity: 0.6;
  
  &::part(content) {
    --border-radius: 24px;
    --width: 90%;
    --max-width: 500px;
    --height: auto;
    --max-height: 80vh;
  }
}

.update-modal-content {
  --background: var(--ion-background-color, #ffffff);
}

.modal-container {
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modal-header {
  text-align: center;
}

.icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(var(--ion-color-primary-rgb), 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 16px rgba(var(--ion-color-primary-rgb), 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(var(--ion-color-primary-rgb), 0.4);
  }
}

.update-icon {
  font-size: 40px;
  color: white;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}

.modal-subtitle {
  font-size: 16px;
  color: var(--ion-color-medium);
  margin: 0;
}

.changelog-section {
  max-height: 300px;
  overflow-y: auto;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--ion-text-color);
}

.changelog-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ion-color-medium);
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
  margin-bottom: 16px;

  :deep(h2), :deep(h3), :deep(h4) {
    margin-top: 16px;
    margin-bottom: 8px;
    color: var(--ion-text-color);
  }

  :deep(h2) {
    font-size: 18px;
  }

  :deep(h3) {
    font-size: 16px;
  }

  :deep(h4) {
    font-size: 14px;
  }

  :deep(li) {
    margin-left: 20px;
    margin-bottom: 4px;
  }

  :deep(strong) {
    color: var(--ion-text-color);
  }
}

.update-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ion-color-medium);
  padding: 8px 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.info-icon {
  font-size: 16px;
}

.download-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.progress-bar-container {
  height: 12px;
  background: var(--ion-color-light);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--ion-color-primary), var(--ion-color-secondary));
  border-radius: 6px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.download-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 12px;
  font-size: 13px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--ion-color-medium);
  font-weight: 500;
}

.stat-value {
  color: var(--ion-text-color);
  font-weight: 600;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.error-icon {
  font-size: 20px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.action-button {
  --border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  
  &.primary-action {
    --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
  }
  
  &.secondary-action {
    --color: var(--ion-color-medium);
  }
}
</style>
