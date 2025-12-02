<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="shareSocial" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button>
            <ion-icon :icon="heart" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="content-wrapper">
          <!-- Hero Section -->
          <div class="course-hero">
            <div class="hero-image">
              <LazyImage
                :src="course.thumbnailUrl || '/placeholder-course.jpg'"
                :alt="course.title"
                image-class="hero-course-image"
              />
              <div class="hero-overlay">
                <div class="hero-badges">
                  <ion-badge :color="getDifficultyColor(course.difficulty)">
                    {{ t(`courses.${course.difficulty}`) }}
                  </ion-badge>
                  <ion-badge color="light" v-if="course.isFree">
                    {{ t('courses.free') }}
                  </ion-badge>
                </div>
              </div>
            </div>
            <div class="hero-content">
              <h1 class="course-title">{{ course.title }}</h1>
              <div class="course-stats">
                <div class="stat-item">
                  <ion-icon :icon="star" color="warning"></ion-icon>
                  <span>{{ course.rating }} ({{ course.reviewCount }} {{ t('courses.review_count') }})</span>
                </div>
                <div class="stat-item">
                  <ion-icon :icon="people"></ion-icon>
                  <span>{{ course.enrollmentCount }} {{ t('courses.students') }}</span>
                </div>
                <div class="stat-item">
                  <ion-icon :icon="time"></ion-icon>
                  <span>{{ formatDuration(course.duration) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Enrollment Status or CTA -->
          <div class="enrollment-section" v-if="!isEnrolled">
            <ion-button expand="block" size="large" @click="handleEnroll">
              <ion-icon :icon="addCircle" slot="start"></ion-icon>
              {{ t('courses.enroll') }}
            </ion-button>
          </div>
          <div class="enrollment-section enrolled" v-else>
            <div class="progress-info">
              <div class="progress-header">
                <span>{{ t('courses.progress') }}</span>
                <span class="progress-percentage">{{ enrollment.progress }}%</span>
              </div>
              <ion-progress-bar :value="enrollment.progress / 100"></ion-progress-bar>
            </div>
            <ion-button expand="block" size="large" @click="continueLearning">
              <ion-icon :icon="playCircle" slot="start"></ion-icon>
              {{ t('courses.continue_learning') }}
            </ion-button>
          </div>

          <!-- Tabs -->
          <div class="course-tabs">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'overview' }"
              @click="activeTab = 'overview'"
            >
              {{ t('courses.overview') }}
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'curriculum' }"
              @click="activeTab = 'curriculum'"
            >
              {{ t('courses.curriculum') }}
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'reviews' }"
              @click="activeTab = 'reviews'"
            >
              {{ t('courses.reviews') }}
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Overview Tab -->
            <div v-show="activeTab === 'overview'" class="overview-content">
              <div class="section">
                <h2>{{ t('courses.description') }}</h2>
                <p class="description-text">{{ course.description }}</p>
              </div>

              <div class="section">
                <h2>{{ t('courses.what_you_learn') }}</h2>
                <ul class="learning-points">
                  <li v-for="(point, index) in course.learningPoints" :key="index">
                    <ion-icon :icon="checkmarkCircle" color="success"></ion-icon>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>

              <div class="section" v-if="course.instructor">
                <h2>{{ t('courses.instructor') }}</h2>
                <div class="instructor-card">
                  <LazyImage
                    :src="course.instructor.avatar || '/placeholder-avatar.jpg'"
                    :alt="course.instructor.name"
                    image-class="instructor-avatar"
                  />
                  <div class="instructor-info">
                    <h3>{{ course.instructor.name }}</h3>
                    <p>{{ course.instructor.title }}</p>
                    <p class="instructor-bio">{{ course.instructor.bio }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Curriculum Tab -->
            <div v-show="activeTab === 'curriculum'" class="curriculum-content">
              <div class="curriculum-stats">
                <div class="stat">
                  <strong>{{ modules.length }}</strong> {{ t('courses.module_count') }}
                </div>
                <div class="stat">
                  <strong>{{ totalLessons }}</strong> {{ t('courses.lesson_count') }}
                </div>
                <div class="stat">
                  <strong>{{ formatDuration(course.duration) }}</strong>
                </div>
              </div>

              <div class="modules-list">
                <div v-for="module in modules" :key="module.id" class="module-item">
                  <div class="module-header" @click="toggleModule(module.id)">
                    <div class="module-title">
                      <ion-icon :icon="expandedModules.has(module.id) ? chevronDown : (locale === 'fa' ? chevronBack : chevronForward)"></ion-icon>
                      <h3>{{ module.title }}</h3>
                    </div>
                    <div class="module-meta">
                      <span>{{ module.lessons.length }} {{ t('courses.lesson_count') }}</span>
                    </div>
                  </div>
                  <div v-show="expandedModules.has(module.id)" class="lessons-list">
                    <div
                      v-for="lesson in module.lessons"
                      :key="lesson.id"
                      class="lesson-item"
                      @click="viewLesson(lesson.id)"
                    >
                      <div class="lesson-icon">
                        <ion-icon
                          :icon="getLessonIcon(lesson.contentType)"
                          :color="lessonCompleted(lesson.id) ? 'success' : 'medium'"
                        ></ion-icon>
                      </div>
                      <div class="lesson-info">
                        <h4>{{ lesson.title }}</h4>
                        <p>{{ t(`courses.${lesson.contentType}`) }} • {{ lesson.duration }} {{ t('courses.minutes') }}</p>
                      </div>
                      <div class="lesson-status">
                        <ion-icon
                          v-if="lessonCompleted(lesson.id)"
                          :icon="checkmarkCircle"
                          color="success"
                        ></ion-icon>
                        <ion-icon
                          v-else-if="lesson.isFree"
                          :icon="lockOpen"
                          color="success"
                        ></ion-icon>
                        <ion-icon
                          v-else-if="!isEnrolled"
                          :icon="lockClosed"
                          color="medium"
                        ></ion-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div v-show="activeTab === 'reviews'" class="reviews-content">
              <div class="reviews-summary">
                <div class="rating-overview">
                  <div class="rating-number">{{ course.rating }}</div>
                  <div class="rating-stars">
                    <ion-icon
                      v-for="i in 5"
                      :key="i"
                      :icon="i <= Math.round(course.rating) ? star : starOutline"
                      color="warning"
                    ></ion-icon>
                  </div>
                  <p>{{ course.reviewCount }} {{ t('courses.review_count') }}</p>
                </div>
              </div>

              <div v-if="isEnrolled && !userHasReviewed" class="write-review-section">
                <ion-button expand="block" fill="outline" @click="showReviewModal = true">
                  <ion-icon :icon="createOutline" slot="start"></ion-icon>
                  {{ t('courses.write_review') }}
                </ion-button>
              </div>

              <div class="reviews-list">
                <div v-for="review in reviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <LazyImage
                      :src="review.userAvatar || '/placeholder-avatar.jpg'"
                      :alt="review.userName"
                      image-class="review-avatar"
                    />
                    <div class="review-info">
                      <h4>{{ review.userName }}</h4>
                      <div class="review-rating">
                        <ion-icon
                          v-for="i in 5"
                          :key="i"
                          :icon="i <= review.rating ? star : starOutline"
                          color="warning"
                          size="small"
                        ></ion-icon>
                      </div>
                    </div>
                    <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonProgressBar
} from '@ionic/vue'
import LazyImage from '@/components/LazyImage.vue'
import {
  shareSocial,
  heart,
  star,
  starOutline,
  people,
  time,
  addCircle,
  playCircle,
  checkmarkCircle,
  chevronDown,
  chevronForward,
  lockOpen,
  lockClosed,
  videocam,
  document,
  image,
  listCircle,
  createOutline
} from 'ionicons/icons'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const activeTab = ref('overview')
const expandedModules = ref(new Set<string>())
const showReviewModal = ref(false)
const isEnrolled = ref(false)
const userHasReviewed = ref(false)

// Mock data - replace with API calls
const course = ref({
  id: route.params.id as string,
  title: locale.value === 'fa' ? 'مدیریت اضطراب' : 'Managing Anxiety',
  description: locale.value === 'fa' 
    ? 'در این دوره جامع، با تکنیک‌های علمی و عملی برای شناسایی، مدیریت و کاهش اضطراب آشنا خواهید شد. این دوره برای افرادی طراحی شده که می‌خواهند کنترل بهتری بر احساسات خود داشته باشند و کیفیت زندگی خود را بهبود بخشند.'
    : 'In this comprehensive course, you will learn scientific and practical techniques to identify, manage, and reduce anxiety. This course is designed for individuals who want better control over their emotions and to improve their quality of life.',
  thumbnailUrl: '',
  category: 'mental-health',
  difficulty: 'beginner',
  duration: 180,
  rating: 4.8,
  reviewCount: 156,
  enrollmentCount: 1250,
  isFree: true,
  learningPoints: locale.value === 'fa' 
    ? [
        'تکنیک‌های تنفس عمیق و آرامش',
        'شناسایی علائم و محرک‌های اضطراب',
        'استراتژی‌های مقابله با استرس',
        'تمرین‌های ذهن‌آگاهی روزانه',
        'بهبود الگوهای خواب'
      ]
    : [
        'Deep breathing and relaxation techniques',
        'Identifying anxiety symptoms and triggers',
        'Stress management strategies',
        'Daily mindfulness exercises',
        'Improving sleep patterns'
      ],
  instructor: {
    name: locale.value === 'fa' ? 'دکتر سارا احمدی' : 'Dr. Sara Ahmadi',
    title: locale.value === 'fa' ? 'روانشناس بالینی' : 'Clinical Psychologist',
    avatar: '',
    bio: locale.value === 'fa'
      ? 'روانشناس بالینی با بیش از 10 سال تجربه در درمان اختلالات اضطرابی'
      : 'Clinical psychologist with over 10 years of experience treating anxiety disorders'
  }
})

const enrollment = ref({
  progress: 45,
  enrolledAt: new Date()
})

const modules = ref([
  {
    id: '1',
    title: locale.value === 'fa' ? 'مقدمه‌ای بر اضطراب' : 'Introduction to Anxiety',
    lessons: [
      {
        id: '1-1',
        title: locale.value === 'fa' ? 'اضطراب چیست؟' : 'What is Anxiety?',
        contentType: 'video',
        duration: 15,
        isFree: true
      },
      {
        id: '1-2',
        title: locale.value === 'fa' ? 'انواع اختلالات اضطرابی' : 'Types of Anxiety Disorders',
        contentType: 'text',
        duration: 10,
        isFree: true
      }
    ]
  },
  {
    id: '2',
    title: locale.value === 'fa' ? 'تکنیک‌های مدیریت اضطراب' : 'Anxiety Management Techniques',
    lessons: [
      {
        id: '2-1',
        title: locale.value === 'fa' ? 'تنفس عمیق' : 'Deep Breathing',
        contentType: 'video',
        duration: 12,
        isFree: false
      },
      {
        id: '2-2',
        title: locale.value === 'fa' ? 'آرامش عضلانی پیشرونده' : 'Progressive Muscle Relaxation',
        contentType: 'video',
        duration: 18,
        isFree: false
      }
    ]
  }
])

const reviews = ref([
  {
    id: '1',
    userId: '1',
    userName: locale.value === 'fa' ? 'احمد رضایی' : 'Ahmad Rezaei',
    userAvatar: '',
    rating: 5,
    comment: locale.value === 'fa' 
      ? 'دوره بسیار عالی و کاربردی. تکنیک‌ها واقعا به من کمک کردند.'
      : 'Excellent and practical course. The techniques really helped me.',
    createdAt: new Date('2024-01-15')
  }
])

const totalLessons = computed(() => {
  return modules.value.reduce((total, module) => total + module.lessons.length, 0)
})

const toggleModule = (moduleId: string) => {
  if (expandedModules.value.has(moduleId)) {
    expandedModules.value.delete(moduleId)
  } else {
    expandedModules.value.add(moduleId)
  }
}

const getLessonIcon = (contentType: string) => {
  switch (contentType) {
    case 'video':
      return videocam
    case 'text':
      return document
    case 'image':
      return image
    case 'quiz':
      return listCircle
    default:
      return document
  }
}

const lessonCompleted = (lessonId: string) => {
  // TODO: Check from actual progress data
  // This will be populated from enrollment progress API
  return lessonId === '1-1' // Mock: mark first lesson as completed for demo
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'success'
    case 'intermediate':
      return 'warning'
    case 'advanced':
      return 'danger'
    default:
      return 'medium'
  }
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} ${t('courses.minutes')}`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 
    ? `${hours} ${t('courses.hours')} ${mins} ${t('courses.minutes')}`
    : `${hours} ${t('courses.hours')}`
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const handleEnroll = () => {
  // TODO: API call to enroll
  isEnrolled.value = true
  console.log('Enrolling in course...')
}

const continueLearning = () => {
  // TODO: Navigate to last viewed lesson
  router.push(`/tabs/courses/${course.value.id}/lessons/1-1`)
}

const viewLesson = (lessonId: string) => {
  const lesson = modules.value.flatMap(m => m.lessons).find(l => l.id === lessonId)
  if (!lesson) return
  
  if (!isEnrolled.value && !lesson.isFree) {
    // Show enrollment prompt
    return
  }
  router.push(`/tabs/courses/${course.value.id}/lessons/${lessonId}`)
}

onMounted(() => {
  // TODO: Fetch course details from API
  // Expand first module by default
  if (modules.value.length > 0) {
    expandedModules.value.add(modules.value[0].id)
  }
})
</script>

<style scoped lang="scss">
.content-wrapper {
  padding-bottom: env(safe-area-inset-bottom);
}

.course-hero {
  .hero-image {
    position: relative;
    width: 100%;
    height: 250px;

    :deep(.lazy-image-wrapper) {
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .image-error {
        background: linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-secondary-tint));
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .hero-badges {
        display: flex;
        gap: 8px;
        align-self: flex-end;
      }
    }
  }

  .hero-content {
    padding: 20px;
    background: var(--ion-background-color);

    .course-title {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-text-color);
    }

    .course-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: var(--ion-color-medium);

        ion-icon {
          font-size: 18px;
        }
      }
    }
  }
}

.enrollment-section {
  padding: 16px;
  background: var(--ion-background-color);
  border-bottom: 1px solid var(--ion-border-color);

  &.enrolled {
    .progress-info {
      margin-bottom: 16px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;

        .progress-percentage {
          color: var(--ion-color-primary);
        }
      }

      ion-progress-bar {
        --background: var(--ion-color-step-150, var(--ion-color-light));
        --progress-background: var(--ion-color-success);
        height: 8px;
        border-radius: 4px;
      }
    }
  }
}

.course-tabs {
  display: flex;
  background: var(--ion-background-color);
  border-bottom: 2px solid var(--ion-border-color);
  position: sticky;
  top: 0;
  z-index: 10;

  .tab-item {
    flex: 1;
    padding: 16px;
    text-align: center;
    font-weight: 600;
    color: var(--ion-color-medium);
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;

    &.active {
      color: var(--ion-color-primary);
      border-bottom-color: var(--ion-color-primary);
    }
  }
}

.tab-content {
  .section {
    padding: 24px 20px;
    border-bottom: 1px solid var(--ion-border-color);

    h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--ion-text-color);
    }

    .description-text {
      margin: 0;
      line-height: 1.6;
      color: var(--ion-color-step-600);
    }

    .learning-points {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        ion-icon {
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 20px;
        }

        span {
          flex: 1;
          line-height: 1.5;
        }
      }
    }

    .instructor-card {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      padding: 16px;
      background: var(--ion-color-step-50, var(--ion-color-light));
      border-radius: 12px;

      :deep(.lazy-image-wrapper) {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-error {
          background: linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-tertiary-tint));
          display: flex;
          align-items: center;
          justify-content: center;

          .error-text {
            display: none;
          }
        }
      }

      .instructor-info {
        flex: 1;

        h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
        }

        p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--ion-color-medium);

          &.instructor-bio {
            line-height: 1.5;
          }
        }
      }
    }
  }
}

.curriculum-content {
  .curriculum-stats {
    display: flex;
    justify-content: space-around;
    padding: 20px;
    background: var(--ion-color-step-50, var(--ion-color-light));

    .stat {
      text-align: center;

      strong {
        display: block;
        font-size: 24px;
        color: var(--ion-color-primary);
        margin-bottom: 4px;
      }
    }
  }

  .modules-list {
    .module-item {
      border-bottom: 1px solid var(--ion-border-color);

      .module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        cursor: pointer;
        transition: background 0.3s ease;

        &:hover {
          background: var(--ion-color-step-50, var(--ion-color-light));
        }

        .module-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          ion-icon {
            font-size: 20px;
            color: var(--ion-color-medium);
          }

          h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }
        }

        .module-meta {
          font-size: 13px;
          color: var(--ion-color-medium);
        }
      }

      .lessons-list {
        background: var(--ion-color-step-50, var(--ion-color-light));

        .lesson-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px 16px 52px;
          cursor: pointer;
          transition: background 0.2s ease;

          &:hover {
            background: var(--ion-color-step-100, var(--ion-color-light-shade));
          }

          .lesson-icon {
            ion-icon {
              font-size: 24px;
            }
          }

          .lesson-info {
            flex: 1;

            h4 {
              margin: 0 0 4px 0;
              font-size: 14px;
              font-weight: 600;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: var(--ion-color-medium);
            }
          }

          .lesson-status {
            ion-icon {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
}

.reviews-content {
  .reviews-summary {
    padding: 24px 20px;
    text-align: center;
    border-bottom: 1px solid var(--ion-border-color);

    .rating-overview {
      .rating-number {
        font-size: 48px;
        font-weight: 700;
        color: var(--ion-color-primary);
        margin-bottom: 8px;
      }

      .rating-stars {
        margin-bottom: 8px;

        ion-icon {
          font-size: 24px;
          margin: 0 2px;
        }
      }

      p {
        margin: 0;
        color: var(--ion-color-medium);
      }
    }
  }

  .write-review-section {
    padding: 16px 20px;
    background: var(--ion-color-step-50, var(--ion-color-light));
  }

  .reviews-list {
    .review-item {
      padding: 20px;
      border-bottom: 1px solid var(--ion-border-color);

      .review-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        :deep(.lazy-image-wrapper) {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          
          .review-avatar {
            border-radius: 50%;
            object-fit: cover;
            display: block;
          }

          .image-error {
            border-radius: 50%;
            background: linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-tertiary-tint));
            
            .error-text {
              display: none;
            }
          }
        }

        .review-info {
          flex: 1;

          h4 {
            margin: 0 0 4px 0;
            font-size: 15px;
            font-weight: 600;
          }

          .review-rating {
            ion-icon {
              font-size: 14px;
            }
          }
        }

        .review-date {
          font-size: 12px;
          color: var(--ion-color-medium);
        }
      }

      .review-comment {
        margin: 0;
        line-height: 1.6;
        color: var(--ion-color-step-600);
      }
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .curriculum-content {
    .curriculum-stats {
      background: var(--ion-color-step-100);
    }

    .module-header {
      &:hover {
        background: var(--ion-color-step-100);
      }
    }

    .lessons-list {
      background: var(--ion-color-step-100);

      .lesson-item {
        &:hover {
          background: var(--ion-color-step-50);
        }
      }
    }
  }

  .overview-content {
    .instructor-card {
      background: var(--ion-color-step-100);
    }
  }

  .reviews-content {
    .write-review-section {
      background: var(--ion-color-step-100);
    }
  }

  .enrollment-section {
    ion-progress-bar {
      --background: var(--ion-color-step-150);
    }
  }
}
</style>
