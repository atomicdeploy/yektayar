<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ lesson.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleBookmark">
            <ion-icon :icon="isBookmarked ? bookmark : bookmarkOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <OverlayScrollbarsComponent
        class="scrollable-content"
        :options="{
          scrollbars: {
            theme: 'os-theme-yektayar-mobile',
            visibility: 'auto',
            autoHide: 'scroll',
            autoHideDelay: 1300
          }
        }"
        defer
      >
        <div class="content-wrapper">
          <!-- Lesson Content -->
          <div class="lesson-content">
            <!-- Video Player -->
            <div v-if="lesson.contentType === 'video'" class="video-container">
              <video
                ref="videoPlayer"
                class="video-player"
                controls
                :poster="lesson.thumbnailUrl"
                @timeupdate="handleVideoProgress"
                @ended="handleVideoEnd"
              >
                <source :src="lesson.mediaUrl" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div class="video-controls-overlay" v-if="showControls">
                <button class="control-btn" @click="seekBackward">
                  <ion-icon :icon="playBack"></ion-icon>
                  <span>-15s</span>
                </button>
                <button class="control-btn play-pause" @click="togglePlayPause">
                  <ion-icon :icon="isPlaying ? pause : play"></ion-icon>
                </button>
                <button class="control-btn" @click="seekForward">
                  <ion-icon :icon="playForward"></ion-icon>
                  <span>+15s</span>
                </button>
              </div>
            </div>

            <!-- Image Viewer -->
            <div v-else-if="lesson.contentType === 'image'" class="image-container">
              <img :src="lesson.mediaUrl" :alt="lesson.title" />
            </div>

            <!-- Text Content -->
            <div class="text-content">
              <div class="lesson-header">
                <div class="lesson-meta">
                  <ion-badge :color="getContentTypeColor(lesson.contentType)">
                    {{ t(`courses.${lesson.contentType}`) }}
                  </ion-badge>
                  <span class="lesson-duration">
                    <ion-icon :icon="time"></ion-icon>
                    {{ lesson.duration }} {{ t('courses.minutes') }}
                  </span>
                </div>
                <h1 class="lesson-title">{{ lesson.title }}</h1>
                <p class="lesson-description" v-if="lesson.description">{{ lesson.description }}</p>
              </div>

              <div class="lesson-body" v-html="formatContent(lesson.content)"></div>

              <!-- Downloadable Resources -->
              <div v-if="lesson.resources && lesson.resources.length > 0" class="resources-section">
                <h3>{{ locale === 'fa' ? 'منابع قابل دانلود' : 'Downloadable Resources' }}</h3>
                <div class="resources-list">
                  <div v-for="resource in lesson.resources" :key="resource.id" class="resource-item">
                    <div class="resource-info">
                      <ion-icon :icon="document"></ion-icon>
                      <div>
                        <h4>{{ resource.title }}</h4>
                        <p>{{ formatFileSize(resource.size) }}</p>
                      </div>
                    </div>
                    <ion-button fill="clear" @click="downloadResource(resource)">
                      <ion-icon :icon="downloadOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </div>

              <!-- Notes Section -->
              <div class="notes-section">
                <h3>{{ locale === 'fa' ? 'یادداشت‌های من' : 'My Notes' }}</h3>
                <textarea
                  v-model="userNotes"
                  :placeholder="locale === 'fa' ? 'یادداشت‌های خود را بنویسید...' : 'Write your notes...'"
                  rows="4"
                  class="notes-textarea"
                ></textarea>
                <ion-button size="small" @click="saveNotes">
                  {{ locale === 'fa' ? 'ذخیره یادداشت' : 'Save Notes' }}
                </ion-button>
              </div>
            </div>
          </div>

          <!-- Navigation Footer -->
          <div class="lesson-navigation">
            <ion-button
              v-if="previousLesson"
              expand="block"
              fill="outline"
              @click="navigateToLesson(previousLesson.id)"
            >
              <ion-icon :icon="chevronBack" slot="start"></ion-icon>
              {{ t('courses.previous_lesson') }}
            </ion-button>
            <ion-button
              v-if="!isCompleted"
              expand="block"
              color="success"
              @click="markAsComplete"
            >
              <ion-icon :icon="checkmarkCircle" slot="start"></ion-icon>
              {{ t('courses.mark_complete') }}
            </ion-button>
            <div v-else class="completed-badge">
              <ion-icon :icon="checkmarkCircle" color="success"></ion-icon>
              <span>{{ t('courses.completed') }}</span>
            </div>
            <ion-button
              v-if="nextLesson"
              expand="block"
              @click="navigateToLesson(nextLesson.id)"
            >
              {{ t('courses.next_lesson') }}
              <ion-icon :icon="chevronForward" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge
} from '@ionic/vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import {
  bookmark,
  bookmarkOutline,
  time,
  document,
  downloadOutline,
  checkmarkCircle,
  chevronBack,
  chevronForward,
  playBack,
  play,
  pause,
  playForward
} from 'ionicons/icons'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const videoPlayer = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const showControls = ref(true)
const isBookmarked = ref(false)
const isCompleted = ref(false)
const userNotes = ref('')
const currentTime = ref(0)
const duration = ref(0)

// Mock data - replace with API calls
const lesson = ref({
  id: route.params.lessonId as string,
  courseId: route.params.id as string,
  title: locale.value === 'fa' ? 'تکنیک تنفس عمیق' : 'Deep Breathing Technique',
  description: locale.value === 'fa' 
    ? 'در این درس یاد می‌گیرید چگونه از تکنیک تنفس عمیق برای کاهش اضطراب استفاده کنید.'
    : 'In this lesson, you will learn how to use deep breathing techniques to reduce anxiety.',
  contentType: 'video',
  content: locale.value === 'fa'
    ? `
      <h2>مقدمه</h2>
      <p>تنفس عمیق یکی از مؤثرترین روش‌ها برای کاهش اضطراب و استرس است. این تکنیک ساده می‌تواند در هر زمان و مکانی انجام شود.</p>
      
      <h2>مراحل تمرین</h2>
      <ol>
        <li>در یک مکان آرام بنشینید یا دراز بکشید</li>
        <li>یک دست را روی سینه و دست دیگر را روی شکم قرار دهید</li>
        <li>به آرامی از بینی نفس بکشید و بگذارید شکم شما باد کند</li>
        <li>به مدت 4 ثانیه نفس را نگه دارید</li>
        <li>به آرامی از دهان نفس را بیرون دهید</li>
        <li>این چرخه را 5-10 بار تکرار کنید</li>
      </ol>

      <h2>نکات مهم</h2>
      <ul>
        <li>تمرکز خود را روی حرکت شکم قرار دهید</li>
        <li>نفس‌های خود را عمیق و آرام نگه دارید</li>
        <li>اگر سرگیجه احساس کردید، سرعت تنفس را کم کنید</li>
      </ul>
    `
    : `
      <h2>Introduction</h2>
      <p>Deep breathing is one of the most effective methods to reduce anxiety and stress. This simple technique can be performed anytime, anywhere.</p>
      
      <h2>Exercise Steps</h2>
      <ol>
        <li>Sit or lie down in a quiet place</li>
        <li>Place one hand on your chest and the other on your abdomen</li>
        <li>Breathe in slowly through your nose, allowing your abdomen to expand</li>
        <li>Hold your breath for 4 seconds</li>
        <li>Exhale slowly through your mouth</li>
        <li>Repeat this cycle 5-10 times</li>
      </ol>

      <h2>Important Tips</h2>
      <ul>
        <li>Focus on the movement of your abdomen</li>
        <li>Keep your breaths deep and calm</li>
        <li>If you feel dizzy, slow down your breathing</li>
      </ul>
    `,
  mediaUrl: 'https://example.com/video.mp4',
  thumbnailUrl: '',
  duration: 12,
  resources: [
    {
      id: '1',
      title: locale.value === 'fa' ? 'برگه تمرین تنفس' : 'Breathing Exercise Sheet',
      url: 'https://example.com/resource.pdf',
      size: 245760
    }
  ]
})

const previousLesson = ref({
  id: '1-1',
  title: locale.value === 'fa' ? 'اضطراب چیست؟' : 'What is Anxiety?'
})

const nextLesson = ref({
  id: '2-2',
  title: locale.value === 'fa' ? 'آرامش عضلانی پیشرونده' : 'Progressive Muscle Relaxation'
})

const getContentTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'primary'
    case 'text':
      return 'secondary'
    case 'image':
      return 'tertiary'
    case 'quiz':
      return 'warning'
    default:
      return 'medium'
  }
}

const formatContent = (content: string) => {
  // Basic HTML formatting
  return content
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const togglePlayPause = () => {
  if (!videoPlayer.value) return
  
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
    isPlaying.value = true
  } else {
    videoPlayer.value.pause()
    isPlaying.value = false
  }
}

const seekBackward = () => {
  if (!videoPlayer.value) return
  videoPlayer.value.currentTime = Math.max(0, videoPlayer.value.currentTime - 15)
}

const seekForward = () => {
  if (!videoPlayer.value) return
  videoPlayer.value.currentTime = Math.min(
    videoPlayer.value.duration,
    videoPlayer.value.currentTime + 15
  )
}

const handleVideoProgress = () => {
  if (!videoPlayer.value) return
  currentTime.value = videoPlayer.value.currentTime
  duration.value = videoPlayer.value.duration
  
  // Auto-save progress
  saveProgress()
}

const handleVideoEnd = () => {
  isPlaying.value = false
  // Auto-mark as complete when video ends
  if (!isCompleted.value) {
    markAsComplete()
  }
}

const saveProgress = () => {
  // TODO: API call to save progress
  // Progress will be auto-saved during video playback
}

const markAsComplete = () => {
  // TODO: API call to mark lesson as complete
  isCompleted.value = true
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  // TODO: API call to save bookmark
}

const saveNotes = () => {
  // TODO: API call to save notes
  if (!userNotes.value.trim()) return
  // Notes saved successfully
}

const downloadResource = (resource: any) => {
  // TODO: Implement download functionality
  window.open(resource.url, '_blank')
}

const navigateToLesson = (lessonId: string) => {
  router.push(`/tabs/courses/${lesson.value.courseId}/lessons/${lessonId}`)
}

let controlsTimeout: number | null = null

const hideControls = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
  controlsTimeout = window.setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

const showControlsTemporarily = () => {
  showControls.value = true
  hideControls()
}

onMounted(() => {
  // TODO: Fetch lesson details from API
  // TODO: Load user progress
  if (typeof window !== 'undefined') {
    window.document.addEventListener('mousemove', showControlsTemporarily)
    window.document.addEventListener('touchstart', showControlsTemporarily)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.document.removeEventListener('mousemove', showControlsTemporarily)
    window.document.removeEventListener('touchstart', showControlsTemporarily)
  }
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
})
</script>

<style scoped lang="scss">
.content-wrapper {
  padding-bottom: env(safe-area-inset-bottom);
}

.lesson-content {
  .video-container {
    position: relative;
    width: 100%;
    background: #000;

    .video-player {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
    }

    .video-controls-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      gap: 24px;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;

      &.show {
        opacity: 1;
        pointer-events: all;
      }

      .control-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        transition: all 0.3s ease;

        ion-icon {
          font-size: 28px;
        }

        span {
          font-size: 10px;
        }

        &.play-pause {
          width: 80px;
          height: 80px;

          ion-icon {
            font-size: 40px;
          }
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
      }
    }
  }

  .image-container {
    width: 100%;
    background: #000;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .text-content {
    padding: 24px 20px;

    .lesson-header {
      margin-bottom: 32px;

      .lesson-meta {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;

        .lesson-duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: var(--ion-color-medium);

          ion-icon {
            font-size: 16px;
          }
        }
      }

      .lesson-title {
        margin: 0 0 12px 0;
        font-size: 28px;
        font-weight: 700;
        color: var(--ion-text-color);
      }

      .lesson-description {
        margin: 0;
        font-size: 16px;
        line-height: 1.6;
        color: var(--ion-color-medium);
      }
    }

    .lesson-body {
      margin-bottom: 32px;
      line-height: 1.8;
      color: var(--ion-color-step-600);

      :deep(h2) {
        margin: 32px 0 16px 0;
        font-size: 22px;
        font-weight: 700;
        color: var(--ion-text-color);
      }

      :deep(h3) {
        margin: 24px 0 12px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--ion-text-color);
      }

      :deep(p) {
        margin: 0 0 16px 0;
      }

      :deep(ul),
      :deep(ol) {
        margin: 0 0 16px 0;
        padding-left: 24px;

        li {
          margin-bottom: 8px;
        }
      }
    }
  }
}

.resources-section,
.notes-section {
  padding: 24px;
  background: var(--ion-color-step-50, var(--ion-color-light));
  border-radius: 16px;
  margin-bottom: 24px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--ion-text-color);
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .resources-section,
  .notes-section {
    background: var(--ion-color-step-100);
  }
}

.resources-list {
  .resource-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--ion-background-color);
    border-radius: 12px;
    margin-bottom: 12px;

    .resource-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      ion-icon {
        font-size: 32px;
        color: var(--ion-color-primary);
      }

      h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--ion-text-color);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--ion-color-medium);
      }
    }
  }
}

.notes-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 12px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);

  &:focus {
    outline: none;
    border-color: var(--ion-color-primary);
  }
}

.lesson-navigation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 20px;
  background: var(--ion-color-light);
  border-top: 1px solid var(--ion-border-color);

  .completed-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--ion-background-color);
    border-radius: 8px;
    font-weight: 600;
    color: var(--ion-color-success);

    ion-icon {
      font-size: 24px;
    }
  }
}

// RTL Support
[dir='rtl'] {
  .lesson-body {
    :deep(ul),
    :deep(ol) {
      padding-left: 0;
      padding-right: 24px;
    }
  }
}
</style>
