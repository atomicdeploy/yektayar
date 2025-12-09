<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ assessment?.title || (locale === 'fa' ? 'ارزیابی' : 'Assessment') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showExitConfirm">
            <ion-icon slot="icon-only" :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
      <!-- Progress Bar -->
      <div class="progress-container">
        <ion-progress-bar :value="progress"></ion-progress-bar>
        <div class="progress-text">
          {{ locale === 'fa' ? 'مرحله' : 'Step' }} {{ currentStep + 1 }} {{ locale === 'fa' ? 'از' : 'of' }} {{ totalSteps }}
        </div>
      </div>
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
          <!-- Introduction Step -->
          <div v-if="currentStep === 0" class="step-container">
            <div class="intro-section">
              <div class="intro-icon">
                <ion-icon :icon="informationCircle"></ion-icon>
              </div>
              <h2>{{ locale === 'fa' ? 'مقدمه' : 'Introduction' }}</h2>
              <div class="intro-content">
                <p>{{ locale === 'fa' 
                  ? 'این پرسشنامه با هدف کمک به شما و همسرتان برای درک بهتر نقاط قوت و حوزه‌های قابل بهبود در رابطه طراحی شده است.' 
                  : 'This questionnaire is designed to help you and your spouse better understand strengths and areas for improvement in your relationship.' }}</p>
                <p>{{ locale === 'fa'
                  ? 'لطفاً هر سوال را با دقت خوانده و بر اساس احساس و تجربه خود در شش ماه گذشته، صادقانه پاسخ دهید.'
                  : 'Please read each question carefully and answer honestly based on your feelings and experiences in the past six months.' }}</p>
                <p>{{ locale === 'fa'
                  ? 'پاسخ‌ها کاملاً محرمانه خواهد ماند و بهتر است هر یک از شما به طور جداگانه آن را تکمیل کرده و سپس در صورت لزوم در مورد نتایج با یکدیگر گفتگو کنید.'
                  : 'Responses will remain completely confidential. It is best if each of you completes it separately and then discusses the results together if needed.' }}</p>
                
                <div class="scale-info">
                  <h3>{{ locale === 'fa' ? 'مقیاس پاسخگویی' : 'Response Scale' }}</h3>
                  <p>{{ locale === 'fa'
                    ? 'لطفاً عددی را که بهترین توصیف‌کننده وضعیت رابطه شماست، انتخاب کنید:'
                    : 'Please select the number that best describes your relationship status:' }}</p>
                  <div class="scale-items">
                    <div class="scale-item">
                      <span class="scale-number">1</span>
                      <span class="scale-label">{{ locale === 'fa' ? 'هرگز / بسیار کم' : 'Never / Very Low' }}</span>
                    </div>
                    <div class="scale-item">
                      <span class="scale-number">2</span>
                      <span class="scale-label">{{ locale === 'fa' ? 'به ندرت / کم' : 'Rarely / Low' }}</span>
                    </div>
                    <div class="scale-item">
                      <span class="scale-number">3</span>
                      <span class="scale-label">{{ locale === 'fa' ? 'گاهی اوقات / متوسط' : 'Sometimes / Medium' }}</span>
                    </div>
                    <div class="scale-item">
                      <span class="scale-number">4</span>
                      <span class="scale-label">{{ locale === 'fa' ? 'غالباً / زیاد' : 'Often / High' }}</span>
                    </div>
                    <div class="scale-item">
                      <span class="scale-number">5</span>
                      <span class="scale-label">{{ locale === 'fa' ? 'همیشه / بسیار زیاد' : 'Always / Very High' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Start Button for Introduction -->
              <ion-button 
                expand="block" 
                size="large"
                class="intro-start-button"
                @click="nextStep"
              >
                {{ locale === 'fa' ? 'شروع ارزیابی' : 'Start Assessment' }}
                <ion-icon :icon="arrowForward" slot="end" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Demographic Info Step -->
          <div v-else-if="currentStep === 1" class="step-container">
            <form class="form-section" @submit.prevent="handleDemographicSubmit">
              <div class="form-header">
                <div class="form-icon">
                  <ion-icon :icon="person"></ion-icon>
                </div>
                <h2>{{ locale === 'fa' ? 'بخش اول: اطلاعات جمعیت‌شناختی' : 'Section One: Demographic Information' }}</h2>
              </div>
              
              <div class="form-fields">
                <div class="form-field">
                  <ion-label>{{ locale === 'fa' ? 'سن' : 'Age' }}</ion-label>
                  <ion-input
                    v-model="demographicInfo.age"
                    type="number"
                    :placeholder="locale === 'fa' ? 'سن خود را وارد کنید' : 'Enter your age'"
                    inputmode="numeric"
                    @keyup.enter="handleDemographicSubmit"
                  ></ion-input>
                  <span class="field-unit">{{ locale === 'fa' ? 'سال' : 'years' }}</span>
                </div>

                <div class="form-field">
                  <ion-label>{{ locale === 'fa' ? 'مدت ازدواج' : 'Marriage Duration' }}</ion-label>
                  <ion-input
                    v-model="demographicInfo.marriageDuration"
                    type="number"
                    :placeholder="locale === 'fa' ? 'مدت ازدواج را وارد کنید' : 'Enter marriage duration'"
                    inputmode="numeric"
                    @keyup.enter="handleDemographicSubmit"
                  ></ion-input>
                  <span class="field-unit">{{ locale === 'fa' ? 'سال' : 'years' }}</span>
                </div>

                <div class="form-field">
                  <ion-label>{{ locale === 'fa' ? 'سطح تحصیلات' : 'Education Level' }}</ion-label>
                  <ion-select
                    v-model="demographicInfo.education"
                    interface="action-sheet"
                    :placeholder="locale === 'fa' ? 'انتخاب کنید' : 'Select'"
                  >
                    <ion-select-option value="diploma">{{ locale === 'fa' ? 'دیپلم' : 'High School' }}</ion-select-option>
                    <ion-select-option value="associate">{{ locale === 'fa' ? 'کاردانی' : 'Associate' }}</ion-select-option>
                    <ion-select-option value="bachelor">{{ locale === 'fa' ? 'کارشناسی' : 'Bachelor' }}</ion-select-option>
                    <ion-select-option value="master">{{ locale === 'fa' ? 'کارشناسی ارشد' : 'Master' }}</ion-select-option>
                    <ion-select-option value="phd">{{ locale === 'fa' ? 'دکتری' : 'PhD' }}</ion-select-option>
                  </ion-select>
                </div>

                <div class="form-field">
                  <ion-label>{{ locale === 'fa' ? 'تعداد فرزندان' : 'Number of Children' }}</ion-label>
                  <ion-input
                    v-model="demographicInfo.childrenCount"
                    type="number"
                    :placeholder="locale === 'fa' ? 'تعداد فرزندان را وارد کنید' : 'Enter number of children'"
                    inputmode="numeric"
                    @keyup.enter="handleDemographicSubmit"
                  ></ion-input>
                  <span class="field-unit">{{ locale === 'fa' ? 'فرزند' : 'children' }}</span>
                </div>
              </div>
              
              <!-- Next Button for Demographic Form -->
              <ion-button 
                expand="block" 
                size="large"
                class="form-next-button"
                type="submit"
                :disabled="!canProceed"
              >
                {{ locale === 'fa' ? 'ادامه' : 'Continue' }}
                <ion-icon :icon="arrowForward" slot="end" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
              </ion-button>
            </form>
          </div>

          <!-- Question Steps -->
          <div v-else-if="currentStep > 1 && currentStep <= totalSteps - 1" class="step-container">
            <div class="question-section">
              <div class="question-number">
                {{ locale === 'fa' ? 'سوال' : 'Question' }} {{ currentQuestionIndex + 1 }} {{ locale === 'fa' ? 'از' : 'of' }} {{ assessment?.questions?.length || 0 }}
              </div>
              
              <div class="question-card">
                <h3 class="question-text">{{ currentQuestion?.text }}</h3>
                
                <!-- Rating Scale -->
                <div class="rating-scale">
                  <div 
                    v-for="value in 5" 
                    :key="value"
                    :class="['rating-option', { selected: answers[currentQuestionIndex] === value }]"
                    @click="selectAnswer(value)"
                  >
                    <div class="rating-circle">
                      <span>{{ value }}</span>
                    </div>
                    <span class="rating-label">{{ getRatingLabel(value) }}</span>
                  </div>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="question-navigation">
                <ion-button 
                  v-if="currentQuestionIndex > 0"
                  fill="outline" 
                  @click="previousQuestion"
                >
                  <ion-icon :icon="chevronBack" slot="start" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
                  {{ locale === 'fa' ? 'قبلی' : 'Previous' }}
                </ion-button>
                <div class="spacer"></div>
                <ion-button 
                  :disabled="!answers[currentQuestionIndex]"
                  @click="nextQuestion"
                >
                  {{ currentQuestionIndex < (assessment?.questions?.length || 0) - 1 
                    ? (locale === 'fa' ? 'بعدی' : 'Next')
                    : (locale === 'fa' ? 'اتمام' : 'Finish') }}
                  <ion-icon :icon="chevronForward" slot="end" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
                </ion-button>
              </div>
            </div>
          </div>

          <!-- Review & Submit Step -->
          <div v-else-if="currentStep === totalSteps" class="step-container">
            <div class="review-section">
              <div class="review-icon">
                <ion-icon :icon="checkmarkCircle"></ion-icon>
              </div>
              <h2>{{ locale === 'fa' ? 'بررسی نهایی' : 'Final Review' }}</h2>
              <p>{{ locale === 'fa'
                ? 'لطفاً اطلاعات خود را بررسی کنید. در صورت صحت، آزمون را ارسال کنید.'
                : 'Please review your information. If correct, submit the test.' }}</p>
              
              <div class="review-card">
                <h3>{{ locale === 'fa' ? 'اطلاعات جمعیت‌شناختی' : 'Demographic Information' }}</h3>
                <div class="review-item">
                  <span class="review-label">{{ locale === 'fa' ? 'سن:' : 'Age:' }}</span>
                  <span class="review-value">{{ demographicInfo.age }} {{ locale === 'fa' ? 'سال' : 'years' }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">{{ locale === 'fa' ? 'مدت ازدواج:' : 'Marriage Duration:' }}</span>
                  <span class="review-value">{{ demographicInfo.marriageDuration }} {{ locale === 'fa' ? 'سال' : 'years' }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">{{ locale === 'fa' ? 'تحصیلات:' : 'Education:' }}</span>
                  <span class="review-value">{{ demographicInfo.education }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">{{ locale === 'fa' ? 'تعداد فرزندان:' : 'Children:' }}</span>
                  <span class="review-value">{{ demographicInfo.childrenCount }}</span>
                </div>
              </div>

              <div class="review-card">
                <h3>{{ locale === 'fa' ? 'تعداد پاسخ‌ها' : 'Number of Answers' }}</h3>
                <div class="review-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ answeredCount }}</div>
                    <div class="stat-label">{{ locale === 'fa' ? 'پاسخ داده شده' : 'Answered' }}</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-number">{{ assessment?.questions?.length || 0 }}</div>
                    <div class="stat-label">{{ locale === 'fa' ? 'کل سوالات' : 'Total Questions' }}</div>
                  </div>
                </div>
              </div>

              <ion-button 
                expand="block" 
                size="large"
                @click="submitAssessment"
                :disabled="submitting"
              >
                <ion-icon v-if="!submitting" :icon="send" slot="start"></ion-icon>
                <ion-spinner v-else name="circular" slot="start"></ion-spinner>
                {{ submitting 
                  ? (locale === 'fa' ? 'در حال ارسال...' : 'Submitting...') 
                  : (locale === 'fa' ? 'ارسال آزمون' : 'Submit Test') }}
              </ion-button>
            </div>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>

    <!-- Footer Navigation -->
    <ion-footer v-if="currentStep > 0 && currentStep < totalSteps">
      <div class="footer-navigation">
        <ion-button 
          fill="clear"
          @click="previousStep"
          :disabled="currentStep === 0"
          class="nav-button"
        >
          <ion-icon :icon="chevronBack" slot="icon-only" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
        </ion-button>
        <div class="step-indicators-wrapper">
          <div class="step-indicators" ref="stepIndicatorsRef">
            <div 
              v-for="step in totalSteps + 1" 
              :key="step"
              :ref="el => { if (step - 1 === currentStep) activeStepRef = el as HTMLElement | null }"
              :class="['step-indicator', { active: step - 1 === currentStep, completed: step - 1 < currentStep }]"
            ></div>
          </div>
        </div>
        <ion-button 
          fill="clear"
          @click="nextStep"
          :disabled="!canProceed"
          class="nav-button"
        >
          <ion-icon :icon="chevronForward" slot="icon-only" :style="locale === 'fa' ? 'transform: scaleX(-1)' : ''"></ion-icon>
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
  IonProgressBar,
  IonFooter,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  alertController,
} from '@ionic/vue'
import { 
  close,
  informationCircle,
  person,
  chevronBack,
  chevronForward,
  arrowForward,
  checkmarkCircle,
  send,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { apiClient } from '@/api'
import { logger } from '@yektayar/shared'

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

const assessment = ref<any>(null)
const currentStep = ref(0) // 0: intro, 1: demographic, 2+: questions, last: review
const demographicInfo = ref({
  age: '',
  marriageDuration: '',
  education: '',
  childrenCount: '',
})
const answers = ref<{ [key: number]: number }>({})
const submitting = ref(false)
const stepIndicatorsRef = ref<HTMLElement | null>(null)
const activeStepRef = ref<HTMLElement | null>(null)

const totalSteps = computed(() => {
  if (!assessment.value?.questions) return 2
  return 2 + assessment.value.questions.length // intro + demographic + questions + review
})

const progress = computed(() => {
  return currentStep.value / totalSteps.value
})

const currentQuestionIndex = computed(() => {
  return currentStep.value - 2 // Subtract intro and demographic steps
})

const currentQuestion = computed(() => {
  if (!assessment.value?.questions || currentQuestionIndex.value < 0) return null
  return assessment.value.questions[currentQuestionIndex.value]
})

const answeredCount = computed(() => {
  return Object.keys(answers.value).length
})

const canProceed = computed(() => {
  if (currentStep.value === 0) return true
  if (currentStep.value === 1) {
    return demographicInfo.value.age && 
           demographicInfo.value.marriageDuration &&
           demographicInfo.value.education &&
           demographicInfo.value.childrenCount
  }
  if (currentStep.value > 1 && currentStep.value <= totalSteps.value - 1) {
    return answers.value[currentQuestionIndex.value] !== undefined
  }
  return true
})

const fetchAssessment = async () => {
  try {
    const assessmentId = route.params.id
    const response = await apiClient.get(`/assessments/${assessmentId}`)
    
    // Handle both wrapped and direct response formats
    let data
    if (response && typeof response === 'object') {
      // Check if response has success/data wrapper
      if ('success' in response && 'data' in response) {
        if (response.success && response.data) {
          data = response.data
        } else {
          logger.error('Failed to fetch assessment:', response.error || 'Unknown error')
          router.back()
          return
        }
      } else {
        // Direct response format
        data = response
      }
    } else {
      logger.error('Invalid assessment response format')
      router.back()
      return
    }
    
    assessment.value = data
    logger.success(`Loaded assessment: ${assessment.value.title}`)
  } catch (error) {
    logger.error('Failed to fetch assessment:', error)
    router.back()
  }
}

const getRatingLabel = (value: number) => {
  if (locale.value === 'fa') {
    const labels = ['', 'هرگز', 'به ندرت', 'گاهی', 'غالباً', 'همیشه']
    return labels[value]
  } else {
    const labels = ['', 'Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    return labels[value]
  }
}

const selectAnswer = (value: number) => {
  answers.value[currentQuestionIndex.value] = value
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Watch for step changes and scroll active indicator into view
watch(currentStep, async () => {
  await nextTick()
  if (activeStepRef.value && stepIndicatorsRef.value) {
    activeStepRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }
})

const handleDemographicSubmit = () => {
  if (canProceed.value) {
    nextStep()
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < (assessment.value?.questions?.length || 0) - 1) {
    currentStep.value++
  } else {
    // Move to review step
    currentStep.value = totalSteps.value
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentStep.value--
  }
}

const showExitConfirm = async () => {
  const alert = await alertController.create({
    header: locale.value === 'fa' ? 'خروج از آزمون' : 'Exit Test',
    message: locale.value === 'fa' 
      ? 'آیا مطمئن هستید که می‌خواهید خارج شوید؟ پیشرفت شما ذخیره نخواهد شد.'
      : 'Are you sure you want to exit? Your progress will not be saved.',
    buttons: [
      {
        text: locale.value === 'fa' ? 'انصراف' : 'Cancel',
        role: 'cancel',
      },
      {
        text: locale.value === 'fa' ? 'خروج' : 'Exit',
        role: 'destructive',
        handler: () => {
          router.back()
        },
      },
    ],
  })
  await alert.present()
}

const submitAssessment = async () => {
  try {
    submitting.value = true
    const assessmentId = route.params.id
    
    // Convert answers object to array
    const answersArray = assessment.value.questions.map((_: any, index: number) => answers.value[index] || 0)
    
    // TODO: Get userId from session store once authentication is fully implemented
    const response = await apiClient.post(`/assessments/${assessmentId}/submit`, {
      answers: answersArray,
      demographicInfo: demographicInfo.value,
      userId: 1, // Placeholder for development
    })
    
    // Handle both wrapped and direct response formats
    let data
    if (response && typeof response === 'object') {
      if ('success' in response && 'data' in response) {
        if (response.success && response.data) {
          data = response.data
        } else {
          throw new Error(response.error || 'Unknown error')
        }
      } else {
        data = response
      }
    } else {
      throw new Error('Invalid response format')
    }
    
    logger.success('Assessment submitted successfully')
    router.push(`/tabs/assessments/results/${data.id}`)
  } catch (error) {
    logger.error('Failed to submit assessment:', error)
    const alert = await alertController.create({
      header: locale.value === 'fa' ? 'خطا' : 'Error',
      message: locale.value === 'fa' 
        ? 'خطایی در ارسال ارزیابی رخ داد. لطفاً دوباره تلاش کنید.'
        : 'An error occurred while submitting the assessment. Please try again.',
      buttons: ['OK'],
    })
    await alert.present()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAssessment()
})
</script>

<style scoped lang="scss">
/* Progress Container */
.progress-container {
  padding: 0.5rem 1rem;
  background: var(--ion-toolbar-background);
  border-bottom: 1px solid var(--ion-border-color);
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

/* OverlayScrollbars container */
.scrollable-content {
  height: 100%;
  width: 100%;
}

.content-wrapper {
  min-height: 100%;
  padding: 1rem;
}

.step-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Introduction Section */
.intro-section {
  text-align: center;
}

.intro-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-icon ion-icon {
  font-size: 40px;
  color: white;
}

.intro-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0 0 1.5rem 0;
}

.intro-content {
  text-align: start;
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

.intro-content p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.scale-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ion-border-color);
}

.scale-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0 0 1rem 0;
}

.scale-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.scale-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--surface-2);
  border-radius: 12px;
}

.scale-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.scale-label {
  flex: 1;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.intro-start-button {
  margin-top: 2rem;
  --background: var(--accent-gradient);
  --box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
  font-weight: 600;
  font-size: 1.0625rem;
}

/* Form Section */
.form-section {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: var(--secondary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-icon ion-icon {
  font-size: 32px;
  color: white;
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  position: relative;
}

.form-field ion-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-field ion-input,
.form-field ion-select {
  --background: var(--surface-2);
  --padding-start: 1rem;
  --padding-end: 1rem;
  border-radius: 12px;
  font-size: 1rem;
}

.field-unit {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  color: var(--text-tertiary);
  pointer-events: none;
}

[dir="rtl"] .field-unit {
  left: auto;
  right: 1rem;
}

.form-next-button {
  margin-top: 2rem;
  --background: var(--accent-gradient);
  --box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
  font-weight: 600;
  font-size: 1.0625rem;
}

/* Question Section */
.question-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-number {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-card {
  background: var(--surface-1);
  padding: 2rem 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

.question-text {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 2rem 0;
  text-align: center;
}

.rating-scale {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.rating-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rating-option:active {
  transform: scale(0.95);
}

.rating-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid var(--ion-border-color);
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.rating-circle span {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.rating-option.selected .rating-circle {
  background: var(--accent-gradient);
  border-color: var(--ion-color-primary);
  box-shadow: 0 4px 16px rgba(212, 164, 62, 0.3);
}

.rating-option.selected .rating-circle span {
  color: white;
}

.rating-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.3;
}

.rating-option.selected .rating-label {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.question-navigation {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.spacer {
  flex: 1;
}

/* Review Section */
.review-section {
  text-align: center;
}

.review-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-icon ion-icon {
  font-size: 40px;
  color: white;
}

.review-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0 0 0.5rem 0;
}

.review-section > p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.review-card {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1rem;
  text-align: right;
}

.review-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--secondary-accent);
  margin: 0 0 1rem 0;
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.review-item:last-child {
  border-bottom: none;
}

.review-label {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.review-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.review-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 1rem 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--ion-border-color);
}

/* Footer Navigation */
.footer-navigation {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 1rem;
  background: var(--ion-toolbar-background);
  border-top: 1px solid var(--ion-border-color);
}

.nav-button {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  align-self: center;
}

.step-indicators-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  
  /* Gradient masks on sides for fading effect */
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20px;
    z-index: 1;
    pointer-events: none;
  }
  
  &::before {
    left: 0;
    background: linear-gradient(to right, var(--ion-toolbar-background) 0%, transparent 100%);
  }
  
  &::after {
    right: 0;
    background: linear-gradient(to left, var(--ion-toolbar-background) 0%, transparent 100%);
  }
}

.step-indicators {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  width: 100%;
  height: 100%;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.step-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ion-border-color);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-indicator.active {
  width: 24px;
  border-radius: 4px;
  background: var(--ion-color-primary);
}

.step-indicator.completed {
  background: var(--ion-color-success);
}
</style>
