<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ t('courses.my_courses') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t('courses.my_courses') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="content-wrapper">
        <!-- Enrolled Courses Grid -->
        <div class="enrolled-courses-section">
          <div class="courses-grid">
            <router-link
              v-for="enrollment in enrolledCourses"
              :key="enrollment.course.id"
              :to="`/tabs/courses/${enrollment.course.id}`"
              class="course-card-link"
            >
              <div class="course-card">
                <div class="course-image">
                  <LazyImage
                    :src="enrollment.course.thumbnailUrl || '/placeholder-course.jpg'"
                    :alt="enrollment.course.title"
                    image-class="course-thumbnail-image"
                  />
                  <div class="progress-overlay">
                    <div class="progress-content">
                      <ion-progress-bar :value="enrollment.progress / 100"></ion-progress-bar>
                      <span class="progress-text">{{ enrollment.progress }}%</span>
                    </div>
                  </div>
                </div>
                <div class="course-content">
                  <h3 class="course-title">{{ enrollment.course.title }}</h3>
                  <p class="course-description">{{ enrollment.course.description }}</p>
                  <div class="course-meta">
                    <div class="meta-item">
                      <ion-icon :icon="time"></ion-icon>
                      <span>{{ enrollment.course.duration }} {{ t('courses.minutes') }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="star" color="warning"></ion-icon>
                      <span>{{ enrollment.course.rating.toFixed(1) }}</span>
                    </div>
                  </div>
                  <ion-button expand="block" size="small">
                    <ion-icon :icon="playCircle" slot="start"></ion-icon>
                    {{ t('courses.continue_learning') }}
                  </ion-button>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Empty State -->
          <div v-if="enrolledCourses.length === 0" class="empty-state">
            <ion-icon :icon="schoolOutline" class="empty-icon"></ion-icon>
            <h3>{{ t('courses.no_enrolled_courses') }}</h3>
            <p>{{ locale === 'fa' ? 'هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید' : 'You haven\'t enrolled in any courses yet' }}</p>
            <ion-button @click="browseCourses">
              {{ t('courses.browse_courses') }}
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  IonProgressBar
} from '@ionic/vue'
import LazyImage from '@/components/LazyImage.vue'
import {
  time,
  star,
  playCircle,
  schoolOutline
} from 'ionicons/icons'

const { t, locale } = useI18n()
const router = useRouter()

// Mock data - replace with API calls
const enrolledCourses = ref([
  {
    course: {
      id: '1',
      title: locale.value === 'fa' ? 'مدیریت اضطراب' : 'Managing Anxiety',
      description: locale.value === 'fa' ? 'یادگیری تکنیک‌های عملی برای کاهش اضطراب' : 'Learn practical techniques to reduce anxiety',
      thumbnailUrl: '',
      category: 'mental-health',
      difficulty: 'beginner',
      duration: 120,
      rating: 4.8
    },
    progress: 45,
    enrolledAt: new Date()
  },
  {
    course: {
      id: '2',
      title: locale.value === 'fa' ? 'خواب بهتر' : 'Better Sleep',
      description: locale.value === 'fa' ? 'بهبود کیفیت خواب با استفاده از روش‌های علمی' : 'Improve sleep quality using scientific methods',
      thumbnailUrl: '',
      category: 'sleep',
      difficulty: 'beginner',
      duration: 90,
      rating: 4.6
    },
    progress: 20,
    enrolledAt: new Date()
  }
])

const browseCourses = () => {
  router.push('/tabs/courses')
}

onMounted(() => {
  // TODO: Fetch enrolled courses from API
})
</script>

<style scoped lang="scss">
.content-wrapper {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.enrolled-courses-section {
  min-height: calc(100vh - 100px);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.course-card-link {
  text-decoration: none;
  display: block;
}

.course-card {
  background: var(--ion-card-background);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .course-image {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;

    :deep(.lazy-image-wrapper) {
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-error {
        background: linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-secondary-tint));
      }
    }

    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--ion-background-color);
      opacity: 0.95;
      border-top: 1px solid var(--ion-border-color);
      padding: 8px 12px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      .progress-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      ion-progress-bar {
        --background: var(--ion-color-light);
        --progress-background: var(--ion-color-success);
        --border-radius: 8px;
        height: 6px;
        border-radius: 8px;
        flex: 1;
      }

      .progress-text {
        color: var(--text-primary);
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
        min-width: 35px;
        text-align: left;
      }
    }
  }

  .course-content {
    padding: 16px;

    .course-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--ion-text-color);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .course-description {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: var(--ion-color-step-600, var(--ion-color-medium));
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .course-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--ion-color-step-600, var(--ion-color-medium));

        ion-icon {
          font-size: 16px;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .empty-icon {
    font-size: 80px;
    color: var(--ion-color-medium);
    margin-bottom: 20px;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--ion-text-color);
  }

  p {
    margin: 0 0 24px 0;
    font-size: 14px;
    color: var(--ion-color-step-600, var(--ion-color-medium));
    max-width: 400px;
  }
}
</style>
