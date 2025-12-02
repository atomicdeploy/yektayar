<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ locale === 'fa' ? 'ارزیابی‌ها' : 'Assessments' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'ارزیابی‌ها' : 'Assessments' }}</ion-title>
        </ion-toolbar>
      </ion-header>

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
          <!-- Hero Banner -->
          <div class="tests-hero">
            <div class="hero-icon-wrapper">
              <ion-icon :icon="documentText"></ion-icon>
            </div>
            <h2>{{ locale === 'fa' ? 'ارزیابی‌های روانشناختی' : 'Psychological Assessments' }}</h2>
            <p>{{ locale === 'fa' 
              ? 'شناخت بهتر خود با ارزیابی‌های تخصصی' 
              : 'Better self-understanding with specialized assessments' }}</p>
          </div>

          <!-- My Assessments History -->
          <div class="section" v-if="assessmentHistory.length > 0">
            <div class="section-header">
              <h2 class="section-title">{{ locale === 'fa' ? 'ارزیابی‌های من' : 'My Assessments' }}</h2>
              <ion-button fill="clear" size="small" @click="viewHistory">
                {{ locale === 'fa' ? 'مشاهده همه' : 'View All' }}
                <ion-icon :icon="locale === 'fa' ? chevronBack : chevronForward" slot="end"></ion-icon>
              </ion-button>
            </div>

            <div class="history-cards">
              <div 
                v-for="result in assessmentHistory.slice(0, 3)" 
                :key="result.id"
                class="history-card"
                @click="viewResult(result.id)"
              >
                <div class="history-icon">
                  <ion-icon :icon="checkmarkCircle"></ion-icon>
                </div>
                <div class="history-content">
                  <h4>{{ result.title }}</h4>
                  <p>{{ locale === 'fa' ? 'امتیاز:' : 'Score:' }} {{ result.score }}</p>
                  <span class="history-date">{{ formatDate(result.completed_at) }}</span>
                </div>
                <ion-icon :icon="chevronForward" class="history-arrow"></ion-icon>
              </div>
            </div>
          </div>

          <!-- Available Assessments -->
          <div class="section">
            <h2 class="section-title">{{ locale === 'fa' ? 'ارزیابی‌های در دسترس' : 'Available Assessments' }}</h2>
            
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <ion-spinner name="circular"></ion-spinner>
              <p>{{ locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...' }}</p>
            </div>

            <!-- Tests List -->
            <div v-else-if="assessments.length > 0" class="tests-list">
              <div 
                v-for="assessment in assessments" 
                :key="assessment.id"
                class="assessment-card"
                @click="startAssessment(assessment.id)"
              >
                <div class="assessment-icon-wrapper">
                  <ion-icon :icon="clipboard"></ion-icon>
                </div>
                <div class="assessment-content">
                  <h3>{{ assessment.title }}</h3>
                  <p>{{ assessment.description }}</p>
                  <div class="assessment-meta">
                    <div class="meta-item">
                      <ion-icon :icon="time"></ion-icon>
                      <span>{{ calculateDuration(assessment.question_count) }} {{ locale === 'fa' ? 'دقیقه' : 'min' }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="help"></ion-icon>
                      <span>{{ assessment.question_count || 0 }} {{ locale === 'fa' ? 'سوال' : 'questions' }}</span>
                    </div>
                  </div>
                </div>
                <ion-button fill="solid" color="primary" class="start-button">
                  <ion-icon :icon="play" slot="start"></ion-icon>
                  {{ locale === 'fa' ? 'شروع' : 'Start' }}
                </ion-button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && assessments.length === 0" class="empty-state">
              <ion-icon :icon="documentText"></ion-icon>
              <h3>{{ locale === 'fa' ? 'ارزیابی موجود نیست' : 'No assessments available' }}</h3>
              <p>{{ locale === 'fa' ? 'به زودی آزمون‌های جدید اضافه می‌شود' : 'New assessments will be added soon' }}</p>
            </div>
          </div>

          <!-- Info Card -->
          <div class="info-card">
            <div class="info-icon">
              <ion-icon :icon="informationCircle"></ion-icon>
            </div>
            <div class="info-content">
              <h4>{{ locale === 'fa' ? 'نکات مهم' : 'Important Notes' }}</h4>
              <ul>
                <li>{{ locale === 'fa' 
                  ? 'با دقت و صداقت به سوالات پاسخ دهید' 
                  : 'Answer questions carefully and honestly' }}</li>
                <li>{{ locale === 'fa' 
                  ? 'نتایج کاملاً محرمانه خواهند ماند' 
                  : 'Results will remain completely confidential' }}</li>
                <li>{{ locale === 'fa' 
                  ? 'می‌توانید ارزیابی را چندین بار تکرار کنید' 
                  : 'You can repeat assessments multiple times' }}</li>
              </ul>
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
  IonIcon,
  IonButton,
  IonSpinner,
} from '@ionic/vue'
import { 
  documentText,
  clipboard,
  time,
  help,
  play,
  checkmarkCircle,
  chevronForward,
  chevronBack,
  informationCircle,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api'
import { logger } from '@yektayar/shared'

const { locale } = useI18n()
const router = useRouter()

const assessments = ref<any[]>([])
const assessmentHistory = ref<any[]>([])
const loading = ref(true)

const fetchAssessments = async () => {
  try {
    loading.value = true
    const response = await apiClient.get('/api/assessments')
    
    if (response.success && response.data) {
      assessments.value = response.data
      logger.success(`Loaded ${assessments.value.length} assessments`)
    } else {
      logger.error('Failed to fetch assessments:', response.error || 'Unknown error')
      assessments.value = []
    }
  } catch (error) {
    logger.error('Failed to fetch assessments:', error)
    assessments.value = []
  } finally {
    loading.value = false
  }
}

const fetchAssessmentHistory = async () => {
  try {
    // TODO: Get userId from session store once authentication is fully implemented
    const userId = 1 // Placeholder for development
    const response = await apiClient.get(`/api/assessments/user/history?userId=${userId}`)
    
    if (response.success && response.data) {
      assessmentHistory.value = response.data
    } else {
      logger.error('Failed to fetch assessment history:', response.error || 'Unknown error')
      assessmentHistory.value = []
      return
    }
    
    if (response.success && response.data) {
      assessmentHistory.value = response.data
    } else {
      logger.error('Failed to fetch assessment history:', response.error || 'Unknown error')
      assessmentHistory.value = []
      return
    }
  } catch (error) {
    logger.error('Failed to fetch assessment history:', error)
    assessmentHistory.value = []
  }
}

const calculateDuration = (questionCount: number) => {
  if (!questionCount || typeof questionCount !== 'number') return 10
  // Estimate 30 seconds per question
  return Math.ceil(questionCount * 0.5)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US')
}

const startAssessment = (assessmentId: number) => {
  router.push(`/tabs/assessments/${assessmentId}`)
}

const viewResult = (resultId: number) => {
  router.push(`/tabs/assessments/results/${resultId}`)
}

const viewHistory = () => {
  router.push('/tabs/assessments/history')
}

onMounted(() => {
  fetchAssessments()
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
  padding-bottom: 2rem;
}

/* Hero Banner */
.tests-hero {
  background: var(--accent-gradient);
  padding: 2rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.tests-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.hero-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.hero-icon-wrapper ion-icon {
  font-size: 40px;
  color: white;
}

.tests-hero h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  position: relative;
  z-index: 1;
}

.tests-hero p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Section */
.section {
  padding: 1.5rem 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

/* History Cards */
.history-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-card {
  background: var(--surface-1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-card:active {
  transform: scale(0.98);
}

.history-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon ion-icon {
  font-size: 24px;
  color: white;
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
}

.history-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.history-arrow {
  font-size: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* RTL Support */
[dir="rtl"] .history-arrow {
  transform: scaleX(-1);
}

/* Tests List */
.tests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.test-card {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.test-card:active {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.test-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--secondary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--secondary-glow);
}

.test-icon-wrapper ion-icon {
  font-size: 28px;
  color: white;
}

.test-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--secondary-accent);
}

.test-content p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.test-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.meta-item ion-icon {
  font-size: 18px;
  color: var(--ion-color-primary);
}

.start-button {
  align-self: flex-start;
  --box-shadow: var(--secondary-glow);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.loading-container p {
  color: var(--text-secondary);
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state ion-icon {
  font-size: 64px;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Info Card */
.info-card {
  margin: 0 1rem 1rem;
  padding: 1.25rem;
  background: var(--glass-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  gap: 1rem;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon ion-icon {
  font-size: 24px;
  color: white;
}

.info-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.info-content ul {
  margin: 0;
  padding: 0 0 0 1.25rem;
  list-style-type: disc;
}

.info-content li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.info-content li:last-child {
  margin-bottom: 0;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
</style>
