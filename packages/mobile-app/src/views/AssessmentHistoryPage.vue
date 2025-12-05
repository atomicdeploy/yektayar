<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'تاریخچه ارزیابی‌ها' : 'Assessment History' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
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
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <ion-spinner name="circular"></ion-spinner>
            <p>{{ locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...' }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="assessmentHistory.length === 0" class="empty-state">
            <div class="empty-icon">
              <ion-icon :icon="documentText"></ion-icon>
            </div>
            <h3>{{ locale === 'fa' ? 'تاریخچه‌ای وجود ندارد' : 'No History Available' }}</h3>
            <p>{{ locale === 'fa' 
              ? 'هنوز ارزیابی را تکمیل نکرده‌اید' 
              : "You haven't completed any assessments yet" }}</p>
            <ion-button @click="goBack">
              {{ locale === 'fa' ? 'بازگشت' : 'Go Back' }}
            </ion-button>
          </div>

          <!-- History List -->
          <div v-else class="history-list">
            <div 
              v-for="result in assessmentHistory" 
              :key="result.id"
              class="history-card"
              @click="viewResult(result.id)"
            >
              <div class="history-icon">
                <ion-icon :icon="checkmarkCircle"></ion-icon>
              </div>
              <div class="history-content">
                <h3>{{ result.title }}</h3>
                <div class="history-meta">
                  <div class="meta-item">
                    <ion-icon :icon="statsChart"></ion-icon>
                    <span>{{ locale === 'fa' ? 'امتیاز:' : 'Score:' }} {{ result.score }}/{{ result.max_score }}</span>
                  </div>
                  <div class="meta-item">
                    <ion-icon :icon="calendar"></ion-icon>
                    <span>{{ formatDate(result.completed_at) }}</span>
                  </div>
                </div>
                <div class="personality-badge" :class="getPersonalityClass(result.personality_type)">
                  {{ getPersonalityLabel(result.personality_type) }}
                </div>
              </div>
              <ion-icon :icon="chevronForward" class="history-arrow" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
            </div>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import { 
  documentText,
  checkmarkCircle,
  chevronForward,
  statsChart,
  calendar,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api'
import { logger } from '@yektayar/shared'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const { locale } = useI18n()
const router = useRouter()

const assessmentHistory = ref<any[]>([])
const loading = ref(true)

const fetchAssessmentHistory = async () => {
  try {
    loading.value = true
    // TODO: Get userId from session store once authentication is fully implemented
    const userId = 1 // Placeholder for development
    const response = await apiClient.get(`/assessments/user/history?userId=${userId}`)
    
    if (response.success && response.data) {
      assessmentHistory.value = response.data
      logger.success(`Loaded ${assessmentHistory.value.length} assessment history items`)
    } else if (Array.isArray(response)) {
      // Handle direct array response
      assessmentHistory.value = response
      logger.success(`Loaded ${assessmentHistory.value.length} assessment history items`)
    } else {
      logger.error('Failed to fetch assessment history:', response.error || 'Unknown error')
      assessmentHistory.value = []
    }
  } catch (error) {
    logger.error('Failed to fetch assessment history:', error)
    assessmentHistory.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US')
}

const getPersonalityClass = (type: string) => {
  if (type === 'high') return 'badge-high'
  if (type === 'medium') return 'badge-medium'
  return 'badge-low'
}

const getPersonalityLabel = (type: string) => {
  if (locale.value === 'fa') {
    if (type === 'high') return 'عالی'
    if (type === 'medium') return 'خوب'
    return 'نیاز به بهبود'
  } else {
    if (type === 'high') return 'Excellent'
    if (type === 'medium') return 'Good'
    return 'Needs Improvement'
  }
}

const viewResult = (resultId: number) => {
  router.push(`/tabs/assessments/results/${resultId}`)
}

const goBack = () => {
  router.back()
}

const handleRefresh = async (event: CustomEvent) => {
  try {
    await fetchAssessmentHistory()
  } catch (error) {
    logger.error('Failed to refresh assessment history:', error)
  } finally {
    (event.target as HTMLIonRefresherElement)?.complete()
  }
}

onMounted(() => {
  fetchAssessmentHistory()
})
</script>

<style scoped lang="scss">
/* OverlayScrollbars container */
.scrollable-content {
  height: 100%;
  width: 100%;
}

.content-wrapper {
  min-height: 100%;
  padding: 1rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  ion-spinner {
    width: 48px;
    height: 48px;
    color: var(--ion-color-primary);
  }

  p {
    color: var(--ion-color-medium);
    margin: 0;
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--ion-color-light-tint);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;

    ion-icon {
      font-size: 40px;
      color: var(--ion-color-medium);
    }
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ion-text-color);
    margin: 0 0 0.5rem 0;
  }

  p {
    color: var(--ion-color-medium);
    margin: 0 0 1.5rem 0;
  }

  ion-button {
    margin-top: 1rem;
  }
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
}

.history-card {
  background: var(--ion-card-background);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ion-border-color);

  &:active {
    transform: scale(0.98);
  }

  .history-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--ion-color-success);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    ion-icon {
      font-size: 28px;
      color: white;
    }
  }

  .history-content {
    flex: 1;
    min-width: 0;

    h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ion-text-color);
      margin: 0 0 0.5rem 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .history-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 0.5rem;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--ion-color-medium);

        ion-icon {
          font-size: 16px;
        }
      }
    }

    .personality-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;

      &.badge-high {
        background: var(--ion-color-success-tint);
        color: var(--ion-color-success-shade);
      }

      &.badge-medium {
        background: var(--ion-color-warning-tint);
        color: var(--ion-color-warning-shade);
      }

      &.badge-low {
        background: var(--ion-color-danger-tint);
        color: var(--ion-color-danger-shade);
      }
    }
  }

  .history-arrow {
    font-size: 24px;
    color: var(--ion-color-medium);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  &:hover .history-arrow {
    transform: translateX(4px);
  }
}
</style>
