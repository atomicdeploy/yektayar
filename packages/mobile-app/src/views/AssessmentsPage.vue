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
            <div class="section-header">
              <h2 class="section-title">
                {{ locale === 'fa' ? 'ارزیابی‌های در دسترس' : 'Available Assessments' }}
                <span class="count-badge">{{ assessments.length }}</span>
              </h2>
              <div class="view-toggle">
                <ion-button 
                  fill="clear" 
                  size="small" 
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  <ion-icon :icon="grid"></ion-icon>
                </ion-button>
                <ion-button 
                  fill="clear" 
                  size="small" 
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  <ion-icon :icon="list"></ion-icon>
                </ion-button>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <ion-spinner name="circular"></ion-spinner>
              <p>{{ locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...' }}</p>
            </div>

            <!-- Assessments Grid View -->
            <div v-else-if="assessments.length > 0 && viewMode === 'grid'" class="assessments-list">
              <div 
                v-for="(assessment, index) in assessments" 
                :key="assessment.id"
                class="assessment-card"
                :class="`assessment-card-${index % 3}`"
                @click="startAssessment(assessment.id)"
              >
                <div class="card-shine"></div>
                <div class="assessment-header">
                  <div class="assessment-icon-wrapper">
                    <div class="icon-glow"></div>
                    <ion-icon :icon="clipboard"></ion-icon>
                  </div>
                  <div class="assessment-badge">
                    <ion-icon :icon="star"></ion-icon>
                    <span>{{ locale === 'fa' ? 'پرطرفدار' : 'Popular' }}</span>
                  </div>
                </div>
                <div class="assessment-content">
                  <h3>{{ assessment.title }}</h3>
                  <p class="description">{{ assessment.description }}</p>
                  <p class="tagline" v-if="assessment.tagline">{{ assessment.tagline }}</p>
                  <div class="assessment-meta">
                    <div class="meta-item">
                      <div class="meta-icon">
                        <ion-icon :icon="time"></ion-icon>
                      </div>
                      <span>{{ calculateDuration(assessment.question_count) }} {{ locale === 'fa' ? 'دقیقه' : 'min' }}</span>
                    </div>
                    <div class="meta-item">
                      <div class="meta-icon">
                        <ion-icon :icon="help"></ion-icon>
                      </div>
                      <span>{{ assessment.question_count || 0 }} {{ locale === 'fa' ? 'سوال' : 'questions' }}</span>
                    </div>
                    <div class="meta-item">
                      <div class="meta-icon">
                        <ion-icon :icon="layers"></ion-icon>
                      </div>
                      <span>{{ countSections(assessment) }} {{ locale === 'fa' ? 'بخش' : 'sections' }}</span>
                    </div>
                  </div>
                </div>
                <div class="assessment-footer">
                  <ion-button expand="block" fill="solid" color="primary" class="start-button">
                    <ion-icon :icon="play" slot="start"></ion-icon>
                    {{ locale === 'fa' ? 'شروع ارزیابی' : 'Start Assessment' }}
                    <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </div>

            <!-- Assessments List View -->
            <div v-else-if="assessments.length > 0 && viewMode === 'list'" class="assessments-rows">
              <div 
                v-for="(assessment, index) in assessments" 
                :key="assessment.id"
                class="assessment-row"
                :class="`assessment-row-${index % 3}`"
                @click="startAssessment(assessment.id)"
              >
                <div class="row-icon">
                  <ion-icon :icon="clipboard"></ion-icon>
                </div>
                <div class="row-content">
                  <h3>{{ assessment.title }}</h3>
                  <p class="row-description">{{ assessment.description }}</p>
                  <div class="row-meta">
                    <span class="meta-badge">
                      <ion-icon :icon="time"></ion-icon>
                      {{ calculateDuration(assessment.question_count) }} {{ locale === 'fa' ? 'دقیقه' : 'min' }}
                    </span>
                    <span class="meta-badge">
                      <ion-icon :icon="help"></ion-icon>
                      {{ assessment.question_count || 0 }} {{ locale === 'fa' ? 'سوال' : 'questions' }}
                    </span>
                    <span class="meta-badge">
                      <ion-icon :icon="layers"></ion-icon>
                      {{ countSections(assessment) }} {{ locale === 'fa' ? 'بخش' : 'sections' }}
                    </span>
                  </div>
                </div>
                <ion-icon :icon="chevronForward" class="row-arrow"></ion-icon>
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
            <div class="info-header">
              <div class="info-icon">
                <ion-icon :icon="informationCircle"></ion-icon>
              </div>
              <h4>{{ locale === 'fa' ? 'نکات مهم' : 'Important Notes' }}</h4>
            </div>
            <div class="info-content">
              <div class="info-item">
                <div class="info-item-icon">
                  <ion-icon :icon="checkmarkCircle"></ion-icon>
                </div>
                <p>{{ locale === 'fa' 
                  ? 'با دقت و صداقت به سوالات پاسخ دهید' 
                  : 'Answer questions carefully and honestly' }}</p>
              </div>
              <div class="info-item">
                <div class="info-item-icon">
                  <ion-icon :icon="lockClosed"></ion-icon>
                </div>
                <p>{{ locale === 'fa' 
                  ? 'نتایج کاملاً محرمانه خواهند ماند' 
                  : 'Results will remain completely confidential' }}</p>
              </div>
              <div class="info-item">
                <div class="info-item-icon">
                  <ion-icon :icon="repeat"></ion-icon>
                </div>
                <p>{{ locale === 'fa' 
                  ? 'می‌توانید ارزیابی را چندین بار تکرار کنید' 
                  : 'You can repeat assessments multiple times' }}</p>
              </div>
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
  star,
  layers,
  arrowForward,
  grid,
  list,
  lockClosed,
  repeat,
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
const viewMode = ref<'grid' | 'list'>('grid')

const fetchAssessments = async () => {
  try {
    loading.value = true
    const response = await apiClient.get('/api/assessments')
    
    // Handle both response formats:
    // 1. Wrapped: {success: true, data: [...]}
    // 2. Direct: [...]
    let data
    if (Array.isArray(response.data)) {
      // Direct array response
      data = response.data
    } else if (response.data.success && response.data.data) {
      // Wrapped response
      data = response.data.data
    } else {
      logger.error('Failed to fetch assessments:', response.data.error || 'Unknown error')
      assessments.value = []
      return
    }
    
    assessments.value = data
    logger.success(`Loaded ${assessments.value.length} assessments`)
  } catch (error) {
    logger.error('Failed to fetch assessments:', error)
    // Show error to user via empty state
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
    
    // Handle both response formats
    let data
    if (Array.isArray(response.data)) {
      data = response.data
    } else if (response.data.success && response.data.data) {
      data = response.data.data
    } else {
      logger.error('Failed to fetch assessment history:', response.data.error || 'Unknown error')
      assessmentHistory.value = []
      return
    }
    
    assessmentHistory.value = data
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

const countSections = (assessment: any) => {
  if (!assessment.questions || !Array.isArray(assessment.questions)) return 0
  const sections = new Set()
  assessment.questions.forEach((q: any) => {
    if (q.section) sections.add(q.section)
  })
  return sections.size || 1
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
  margin: 0 0 1em 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 10px;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.3);
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: var(--surface-1);
  border-radius: 8px;
  padding: 2px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.view-toggle ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 6px;
  --padding-bottom: 6px;
  min-width: 40px;
  min-height: 36px;
  margin: 0;
  font-size: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-toggle ion-button::part(native) {
  border-radius: 6px;
}

.view-toggle ion-button.active {
  --background: var(--ion-color-primary);
  --color: white;
}

.view-toggle ion-button.active ion-icon {
  color: white;
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

/* Assessments List */
.assessments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

/* Premium Assessment Cards */
.assessment-card {
  position: relative;
  background: var(--ion-card-background);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 10px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.1);
}

.assessment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--ion-color-primary) 0%, 
    var(--ion-color-secondary) 50%,
    var(--ion-color-tertiary) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.assessment-card:hover::before,
.assessment-card:active::before {
  opacity: 1;
}

.assessment-card:active {
  transform: translateY(-4px) scale(0.995);
  box-shadow: 
    0 12px 24px rgba(0, 0, 0, 0.12),
    0 20px 40px rgba(0, 0, 0, 0.08);
}

/* Gradient variations */
.assessment-card-0 .assessment-icon-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.assessment-card-1 .assessment-icon-wrapper {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.assessment-card-2 .assessment-icon-wrapper {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Card Shine Effect */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 100%);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
  pointer-events: none;
}

.assessment-card:hover .card-shine {
  left: 200%;
}

/* Header Section */
.assessment-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.assessment-icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 
    0 8px 16px rgba(var(--ion-color-primary-rgb), 0.3),
    0 4px 8px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.assessment-icon-wrapper ion-icon {
  font-size: 40px;
  color: white;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.assessment-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 200, 0, 0.15), rgba(255, 150, 0, 0.15));
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ion-color-warning);
  backdrop-filter: blur(10px);
}

.assessment-badge ion-icon {
  font-size: 14px;
}

/* Content Section */
.assessment-content {
  flex: 1;
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assessment-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--ion-text-color);
  line-height: 1.4;
  text-align: start;
  background: linear-gradient(135deg, 
    var(--ion-text-color) 0%, 
    var(--ion-color-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.assessment-content .description {
  font-size: 0.9375rem;
  color: var(--ion-color-medium);
  margin: 0;
  line-height: 1.6;
  text-align: start;
}

.assessment-content .tagline {
  font-size: 0.875rem;
  font-style: italic;
  color: var(--ion-color-primary);
  margin: 0;
  padding: 0.5rem;
  background: rgba(var(--ion-color-primary-rgb), 0.05);
  border-left: 3px solid var(--ion-color-primary);
  border-radius: 4px;
  text-align: start;
}

[dir="rtl"] .assessment-content .tagline {
  border-left: none;
  border-right: 3px solid var(--ion-color-primary);
}

.assessment-meta {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ion-text-color);
}

.meta-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.assessment-card:hover .meta-icon {
  background: rgba(var(--ion-color-primary-rgb), 0.2);
  transform: scale(1.1);
}

.meta-icon ion-icon {
  font-size: 18px;
  color: var(--ion-color-primary);
}

/* Footer Section */
.assessment-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.start-button {
  --border-radius: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
  height: auto;
  font-weight: 700;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: 0.3px;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.start-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.start-button:active::before {
  width: 300px;
  height: 300px;
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
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.05) 0%, rgba(var(--ion-color-primary-rgb), 0.02) 100%);
  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 16px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
}

.info-icon ion-icon {
  font-size: 22px;
  color: white;
}

.info-header h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-item-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(var(--ion-color-success-rgb), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-item-icon ion-icon {
  font-size: 16px;
  color: var(--ion-color-success);
}

.info-item p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

/* Assessments Rows View */
.assessments-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assessment-row {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.assessment-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: var(--ion-color-primary);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.assessment-row:active {
  transform: scale(0.98);
}

.assessment-row:hover::before {
  opacity: 1;
}

.assessment-row-0 .row-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.assessment-row-1 .row-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.assessment-row-2 .row-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.row-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.row-icon ion-icon {
  font-size: 28px;
  color: white;
}

.row-content {
  flex: 1;
  min-width: 0;
}

.row-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.row-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.row-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 4px 8px;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--ion-color-primary);
  font-weight: 500;
}

.meta-badge ion-icon {
  font-size: 14px;
}

.row-arrow {
  font-size: 24px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.assessment-row:hover .row-arrow {
  transform: translateX(4px);
}
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
