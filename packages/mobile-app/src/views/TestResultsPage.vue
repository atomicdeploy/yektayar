<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'نتیجه آزمون' : 'Test Results' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="shareResults">
            <ion-icon slot="icon-only" :icon="shareSocial"></ion-icon>
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
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <ion-spinner name="circular"></ion-spinner>
            <p>{{ locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...' }}</p>
          </div>

          <!-- Results Content -->
          <div v-else-if="result" class="results-container">
            <!-- Success Banner -->
            <div class="success-banner">
              <div class="success-animation">
                <div class="success-icon">
                  <ion-icon :icon="checkmarkCircle"></ion-icon>
                </div>
              </div>
              <h2>{{ locale === 'fa' ? 'آزمون با موفقیت تکمیل شد!' : 'Test Completed Successfully!' }}</h2>
              <p>{{ formatDate(result.completed_at) }}</p>
            </div>

            <!-- Test Info Card -->
            <div class="info-card">
              <h3>{{ result.title }}</h3>
              <p>{{ result.description }}</p>
            </div>

            <!-- Score Card -->
            <div class="score-card">
              <div class="score-header">
                <h3>{{ locale === 'fa' ? 'امتیاز کلی' : 'Overall Score' }}</h3>
              </div>
              <div class="score-circle">
                <svg viewBox="0 0 200 200" class="score-svg">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="var(--ion-border-color)"
                    stroke-width="12"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="scoreCircumference"
                    :stroke-dashoffset="scoreOffset"
                    transform="rotate(-90 100 100)"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:var(--ion-color-primary);stop-opacity:1" />
                      <stop offset="100%" style="stop-color:var(--ion-color-primary-tint);stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="score-number">
                  <span class="score-value">{{ result.score }}</span>
                  <span class="score-label">{{ locale === 'fa' ? 'امتیاز' : 'Score' }}</span>
                </div>
              </div>
              <div class="score-percentage">
                {{ scorePercentage }}%
              </div>
            </div>

            <!-- Personality Type Card -->
            <div class="personality-card">
              <div class="personality-icon">
                <ion-icon :icon="ribbon"></ion-icon>
              </div>
              <div class="personality-content">
                <h3>{{ locale === 'fa' ? 'نوع شخصیت' : 'Personality Type' }}</h3>
                <div :class="['personality-badge', result.personality_type]">
                  {{ getPersonalityLabel(result.personality_type) }}
                </div>
                <p>{{ getPersonalityDescription(result.personality_type) }}</p>
              </div>
            </div>

            <!-- Demographic Info -->
            <div class="demographic-card">
              <h3>{{ locale === 'fa' ? 'اطلاعات جمعیت‌شناختی' : 'Demographic Information' }}</h3>
              <div class="demographic-grid" v-if="result.answers?.demographicInfo">
                <div class="demographic-item">
                  <div class="demographic-icon">
                    <ion-icon :icon="person"></ion-icon>
                  </div>
                  <div class="demographic-content">
                    <span class="demographic-label">{{ locale === 'fa' ? 'سن' : 'Age' }}</span>
                    <span class="demographic-value">{{ result.answers.demographicInfo.age }} {{ locale === 'fa' ? 'سال' : 'years' }}</span>
                  </div>
                </div>
                <div class="demographic-item">
                  <div class="demographic-icon">
                    <ion-icon :icon="heart"></ion-icon>
                  </div>
                  <div class="demographic-content">
                    <span class="demographic-label">{{ locale === 'fa' ? 'مدت ازدواج' : 'Marriage Duration' }}</span>
                    <span class="demographic-value">{{ result.answers.demographicInfo.marriageDuration }} {{ locale === 'fa' ? 'سال' : 'years' }}</span>
                  </div>
                </div>
                <div class="demographic-item">
                  <div class="demographic-icon">
                    <ion-icon :icon="school"></ion-icon>
                  </div>
                  <div class="demographic-content">
                    <span class="demographic-label">{{ locale === 'fa' ? 'تحصیلات' : 'Education' }}</span>
                    <span class="demographic-value">{{ result.answers.demographicInfo.education }}</span>
                  </div>
                </div>
                <div class="demographic-item">
                  <div class="demographic-icon">
                    <ion-icon :icon="people"></ion-icon>
                  </div>
                  <div class="demographic-content">
                    <span class="demographic-label">{{ locale === 'fa' ? 'فرزندان' : 'Children' }}</span>
                    <span class="demographic-value">{{ result.answers.demographicInfo.childrenCount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Scores (for comprehensive tests) -->
            <div v-if="result.answers?.sectionScores" class="sections-card">
              <h3>{{ locale === 'fa' ? 'نمرات بخش‌ها' : 'Section Scores' }}</h3>
              <p class="sections-subtitle">{{ locale === 'fa' 
                ? 'نمره هر بخش از رابطه شما را نشان می‌دهد' 
                : 'Shows your score in each relationship area' }}</p>
              
              <div class="sections-list">
                <div 
                  v-for="(section, key) in result.answers.sectionScores" 
                  :key="key"
                  class="section-item"
                >
                  <div class="section-header">
                    <div class="section-title-wrapper">
                      <span class="section-number">{{ key }}</span>
                      <span class="section-title">{{ locale === 'fa' ? section.title : section.titleEn }}</span>
                    </div>
                    <span class="section-score">{{ section.score }}/{{ section.maxScore }}</span>
                  </div>
                  <div class="section-progress">
                    <div 
                      class="section-progress-bar"
                      :class="getSectionScoreClass(section.score, section.maxScore)"
                      :style="{ width: `${(section.score / section.maxScore) * 100}%` }"
                    ></div>
                  </div>
                  <div class="section-interpretation">
                    <span :class="['section-badge', getSectionScoreClass(section.score, section.maxScore)]">
                      {{ getSectionInterpretation(section.score, section.maxScore) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="recommendations-card">
              <div class="recommendations-header">
                <ion-icon :icon="bulb"></ion-icon>
                <h3>{{ locale === 'fa' ? 'توصیه‌ها' : 'Recommendations' }}</h3>
              </div>
              <ul class="recommendations-list">
                <li v-for="(recommendation, index) in getRecommendations()" :key="index">
                  {{ recommendation }}
                </li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <ion-button expand="block" @click="retakeTest">
                <ion-icon :icon="refresh" slot="start"></ion-icon>
                {{ locale === 'fa' ? 'انجام مجدد آزمون' : 'Retake Test' }}
              </ion-button>
              <ion-button expand="block" fill="outline" @click="viewAllTests">
                <ion-icon :icon="documentText" slot="start"></ion-icon>
                {{ locale === 'fa' ? 'مشاهده سایر آزمون‌ها' : 'View Other Tests' }}
              </ion-button>
            </div>
          </div>

          <!-- Error State -->
          <div v-else class="error-state">
            <ion-icon :icon="alertCircle"></ion-icon>
            <h3>{{ locale === 'fa' ? 'خطا در بارگذاری نتایج' : 'Error Loading Results' }}</h3>
            <p>{{ locale === 'fa' ? 'لطفاً دوباره تلاش کنید' : 'Please try again' }}</p>
            <ion-button @click="fetchResult">
              {{ locale === 'fa' ? 'تلاش مجدد' : 'Retry' }}
            </ion-button>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonSpinner,
} from '@ionic/vue'
import { 
  checkmarkCircle,
  shareSocial,
  ribbon,
  person,
  heart,
  school,
  people,
  bulb,
  refresh,
  documentText,
  alertCircle,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { apiClient } from '@/api'
import { logger } from '@yektayar/shared'

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

const result = ref<any>(null)
const loading = ref(true)

const scoreCircumference = 534 // 2 * PI * 85
const scoreOffset = computed(() => {
  if (!result.value) return scoreCircumference
  // Calculate max possible score (assuming 5-point scale)
  const maxScore = result.value.answers?.answers?.length * 5 || 100
  const percentage = (result.value.score / maxScore) * 100
  return scoreCircumference - (scoreCircumference * percentage) / 100
})

const scorePercentage = computed(() => {
  if (!result.value) return 0
  const maxScore = result.value.answers?.answers?.length * 5 || 100
  return Math.round((result.value.score / maxScore) * 100)
})

const fetchResult = async () => {
  try {
    loading.value = true
    const resultId = route.params.resultId
    // TODO: Get userId from session store once authentication is fully implemented
    const userId = 1 // Placeholder for development
    const response = await apiClient.get(`/tests/results/${resultId}?userId=${userId}`)
    if (response.data.success) {
      result.value = response.data.data
      logger.success('Loaded test result')
    }
  } catch (error) {
    logger.error('Failed to fetch test result:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getPersonalityLabel = (type: string) => {
  if (locale.value === 'fa') {
    const labels: { [key: string]: string } = {
      low: 'پایین',
      medium: 'متوسط',
      high: 'بالا',
    }
    return labels[type] || type
  } else {
    const labels: { [key: string]: string } = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    }
    return labels[type] || type
  }
}

const getPersonalityDescription = (type: string) => {
  if (locale.value === 'fa') {
    const descriptions: { [key: string]: string } = {
      low: 'نتایج شما نشان می‌دهد که در برخی حوزه‌ها نیاز به بهبود دارید.',
      medium: 'نتایج شما در حد متوسط است و می‌توانید با تلاش بیشتر پیشرفت کنید.',
      high: 'نتایج عالی! شما در این حوزه‌ها عملکرد بسیار خوبی دارید.',
    }
    return descriptions[type] || ''
  } else {
    const descriptions: { [key: string]: string } = {
      low: 'Your results indicate that some areas need improvement.',
      medium: 'Your results are average and you can improve with more effort.',
      high: 'Excellent results! You have very good performance in these areas.',
    }
    return descriptions[type] || ''
  }
}

const getRecommendations = () => {
  if (!result.value) return []
  
  const type = result.value.personality_type
  
  if (locale.value === 'fa') {
    const recommendations: { [key: string]: string[] } = {
      low: [
        'با یک مشاور روانشناسی مشورت کنید',
        'زمان بیشتری را با همسر خود بگذرانید',
        'در مورد احساسات خود صادقانه صحبت کنید',
        'فعالیت‌های مشترک انجام دهید',
      ],
      medium: [
        'به برقراری ارتباط موثر ادامه دهید',
        'حوزه‌های قابل بهبود را شناسایی کنید',
        'به یکدیگر زمان بدهید',
        'از دوره‌های آموزشی استفاده کنید',
      ],
      high: [
        'رابطه خود را حفظ کنید',
        'الگوی خوبی برای دیگران باشید',
        'به همسر خود کمک کنید',
        'به بهبود مستمر ادامه دهید',
      ],
    }
    return recommendations[type] || []
  } else {
    const recommendations: { [key: string]: string[] } = {
      low: [
        'Consult with a psychologist',
        'Spend more quality time with your spouse',
        'Communicate honestly about your feelings',
        'Engage in shared activities',
      ],
      medium: [
        'Continue effective communication',
        'Identify areas for improvement',
        'Give each other time',
        'Use educational courses',
      ],
      high: [
        'Maintain your relationship',
        'Be a good role model for others',
        'Help your spouse',
        'Continue continuous improvement',
      ],
    }
    return recommendations[type] || []
  }
}

const shareResults = () => {
  // TODO: Implement sharing functionality
  logger.info('Share results')
}

const getSectionScoreClass = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 62) return 'strong' // 28-45 range mapped to percentage
  if (percentage >= 47) return 'moderate' // 21-27 range
  return 'needs-attention' // 9-20 range
}

const getSectionInterpretation = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100
  
  if (locale.value === 'fa') {
    if (percentage >= 62) return 'قوی' // Strong
    if (percentage >= 47) return 'متوسط' // Moderate
    return 'نیاز به توجه' // Needs attention
  } else {
    if (percentage >= 62) return 'Strong'
    if (percentage >= 47) return 'Moderate'
    return 'Needs Attention'
  }
}

const retakeTest = () => {
  if (result.value) {
    router.push(`/tabs/tests/${result.value.assessment_id}`)
  }
}

const viewAllTests = () => {
  router.push('/tabs/tests')
}

onMounted(() => {
  fetchResult()
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
  padding: 1rem 1rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Loading & Error States */
.loading-container,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
  text-align: center;
}

.error-state ion-icon {
  font-size: 64px;
  color: var(--ion-color-danger);
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.error-state p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Success Banner */
.success-banner {
  text-align: center;
  padding: 2rem 1rem;
  background: var(--surface-1);
  border-radius: 20px;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.success-animation {
  margin-bottom: 1.5rem;
}

.success-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: successPulse 2s ease-in-out infinite;
}

.success-icon ion-icon {
  font-size: 50px;
  color: white;
}

.success-banner h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0 0 0.5rem 0;
}

.success-banner p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Info Card */
.info-card {
  background: var(--glass-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.info-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0 0 0.5rem 0;
}

.info-card p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Score Card */
.score-card {
  background: var(--surface-1);
  padding: 2rem 1.5rem;
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
  text-align: center;
}

.score-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.score-circle {
  width: 200px;
  height: 200px;
  margin: 0 auto 1rem;
  position: relative;
}

.score-svg {
  width: 100%;
  height: 100%;
}

.score-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  line-height: 1;
}

.score-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.score-percentage {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Personality Card */
.personality-card {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
}

.personality-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.personality-icon ion-icon {
  font-size: 28px;
  color: white;
}

.personality-content {
  flex: 1;
}

.personality-content h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.personality-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.personality-badge.low {
  background: rgba(235, 68, 90, 0.1);
  color: var(--ion-color-danger);
}

.personality-badge.medium {
  background: rgba(255, 196, 9, 0.1);
  color: var(--ion-color-warning);
}

.personality-badge.high {
  background: rgba(45, 211, 111, 0.1);
  color: var(--ion-color-success);
}

.personality-content p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Demographic Card */
.demographic-card {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}

.demographic-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.demographic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.demographic-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-2);
  border-radius: 12px;
}

.demographic-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.demographic-icon ion-icon {
  font-size: 20px;
  color: white;
}

.demographic-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demographic-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demographic-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Section Scores Card */
.sections-card {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}

.sections-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.sections-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-item {
  padding: 1rem;
  background: var(--surface-2);
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.section-number {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-score {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
  margin-left: 0.75rem;
}

.section-progress {
  height: 8px;
  background: var(--ion-border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.section-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.section-progress-bar.strong {
  background: linear-gradient(90deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
}

.section-progress-bar.moderate {
  background: linear-gradient(90deg, var(--ion-color-warning) 0%, var(--ion-color-warning-tint) 100%);
}

.section-progress-bar.needs-attention {
  background: linear-gradient(90deg, var(--ion-color-danger) 0%, var(--ion-color-danger-tint) 100%);
}

.section-interpretation {
  text-align: center;
}

.section-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.section-badge.strong {
  background: rgba(45, 211, 111, 0.1);
  color: var(--ion-color-success);
}

.section-badge.moderate {
  background: rgba(255, 196, 9, 0.1);
  color: var(--ion-color-warning);
}

.section-badge.needs-attention {
  background: rgba(235, 68, 90, 0.1);
  color: var(--ion-color-danger);
}

/* Recommendations Card */
.recommendations-card {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}

.recommendations-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.recommendations-header ion-icon {
  font-size: 24px;
  color: var(--ion-color-warning);
}

.recommendations-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.recommendations-list {
  margin: 0;
  padding: 0 0 0 1.25rem;
  list-style-type: none;
}

.recommendations-list li {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 0.75rem;
  position: relative;
}

.recommendations-list li:last-child {
  margin-bottom: 0;
}

.recommendations-list li::before {
  content: '✓';
  position: absolute;
  right: -1.25rem;
  color: var(--ion-color-success);
  font-weight: 700;
}

[dir="ltr"] .recommendations-list li::before {
  left: -1.25rem;
  right: auto;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Animations */
@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(45, 211, 111, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(45, 211, 111, 0);
  }
}
</style>
