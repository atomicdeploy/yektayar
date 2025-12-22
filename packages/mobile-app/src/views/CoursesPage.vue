<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ t('courses.title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showFilterModal = true">
            <ion-icon :icon="funnel" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t('courses.title') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="content-wrapper">
          <!-- Search Bar -->
          <div class="search-section">
            <ion-searchbar
              :placeholder="t('courses.search_courses')"
              v-model="searchQuery"
              @ionInput="handleSearch"
              show-clear-button="focus"
            ></ion-searchbar>
          </div>

          <!-- Category Tabs -->
          <div class="categories-scroll">
            <div class="category-pills">
              <ion-chip
                v-for="category in categories"
                :key="category.id"
                :class="{ active: selectedCategory === category.id }"
                @click="selectCategory(category.id)"
              >
                {{ locale === 'fa' ? category.nameFa : category.nameEn }}
              </ion-chip>
            </div>
          </div>

          <!-- My Courses Section (if enrolled) -->
          <div class="section" v-if="enrolledCourses.length > 0">
            <div class="section-header">
              <h2 class="section-title">{{ t('courses.my_courses') }}</h2>
              <ion-button fill="clear" size="small" router-link="/tabs/my-courses">
                {{ locale === 'fa' ? 'مشاهده همه' : 'View All' }}
                <ion-icon :icon="locale === 'fa' ? chevronBack : chevronForward" slot="end"></ion-icon>
              </ion-button>
            </div>

            <div class="courses-horizontal-scroll">
              <router-link
                v-for="enrollment in enrolledCourses"
                :key="enrollment.course.id"
                :to="`/tabs/courses/${enrollment.course.id}`"
                class="course-card-mini"
              >
                <div class="course-thumbnail">
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
                <div class="course-info-mini">
                  <h4>{{ enrollment.course.title }}</h4>
                  <p class="continue-learning">
                    {{ t('courses.continue_learning') }}
                    <ion-icon :icon="locale === 'fa' ? chevronBack : chevronForward" class="chevron-icon"></ion-icon>
                  </p>
                </div>
              </router-link>
            </div>
          </div>

          <!-- All Courses Section -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">{{ t('courses.all_courses') }}</h2>
              <ion-select
                v-model="sortBy"
                interface="popover"
                :placeholder="t('courses.sort_by')"
                @ionChange="handleSort"
              >
                <ion-select-option value="newest">{{ t('courses.newest') }}</ion-select-option>
                <ion-select-option value="popular">{{ t('courses.popular') }}</ion-select-option>
                <ion-select-option value="rating">{{ t('courses.highest_rated') }}</ion-select-option>
              </ion-select>
            </div>

            <div class="courses-grid">
              <router-link
                v-for="course in courses"
                :key="course.id"
                :to="`/tabs/courses/${course.id}`"
                class="course-card-link"
              >
                <div class="course-card">
                  <div class="course-image">
                    <LazyImage
                      :src="course.thumbnailUrl || '/placeholder-course.jpg'"
                      :alt="course.title"
                      image-class="course-main-image"
                    />
                    <div class="course-badge" v-if="course.isFree">
                      <ion-badge color="success">{{ t('courses.free') }}</ion-badge>
                    </div>
                    <div class="course-difficulty">
                      <ion-badge :color="getDifficultyColor(course.difficulty)">
                        {{ t(`courses.${course.difficulty}`) }}
                      </ion-badge>
                    </div>
                  </div>
                  <div class="course-content">
                    <h3 class="course-title">{{ course.title }}</h3>
                    <p class="course-description">{{ truncate(course.description, 80) }}</p>
                    <div class="course-meta">
                      <div class="meta-item">
                        <ion-icon :icon="time"></ion-icon>
                        <span>{{ course.duration }} {{ t('courses.minutes') }}</span>
                      </div>
                      <div class="meta-item" v-if="course.rating">
                        <ion-icon :icon="star" color="warning"></ion-icon>
                        <span>{{ course.rating.toFixed(1) }}</span>
                      </div>
                      <div class="meta-item" v-if="course.enrollmentCount">
                        <ion-icon :icon="people"></ion-icon>
                        <span>{{ course.enrollmentCount }}</span>
                      </div>
                    </div>
                    <div class="course-footer">
                      <div class="course-category">{{ course.category }}</div>
                      <ion-button size="small" fill="outline" router-link="#">
                        {{ locale === 'fa' ? 'مشاهده' : 'View' }}
                      </ion-button>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="loading" class="loading-skeleton">
              <div v-for="i in 4" :key="i" class="skeleton-card">
                <ion-skeleton-text :animated="true" style="height: 180px; width: 100%"></ion-skeleton-text>
                <div style="padding: 12px">
                  <ion-skeleton-text :animated="true" style="width: 80%; height: 20px"></ion-skeleton-text>
                  <ion-skeleton-text :animated="true" style="width: 100%; height: 15px; margin-top: 8px"></ion-skeleton-text>
                  <ion-skeleton-text :animated="true" style="width: 60%; height: 15px; margin-top: 4px"></ion-skeleton-text>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && courses.length === 0" class="empty-state">
              <ion-icon :icon="schoolOutline" class="empty-icon"></ion-icon>
              <h3>{{ t('courses.no_courses') }}</h3>
              <p>{{ locale === 'fa' ? 'به زودی دوره‌های جدید اضافه می‌شوند' : 'New courses coming soon' }}</p>
            </div>
          </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonChip,
  IonBadge,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonSkeletonText
} from '@ionic/vue'
import LazyImage from '@/components/LazyImage.vue'
import {
  funnel,
  chevronForward,
  chevronBack,
  time,
  star,
  people,
  schoolOutline
} from 'ionicons/icons'

const { t, locale } = useI18n()

const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('newest')
const loading = ref(false)
const showFilterModal = ref(false)

const categories = ref([
  { id: 'all', nameFa: 'همه', nameEn: 'All' },
  { id: 'mental-health', nameFa: 'سلامت روان', nameEn: 'Mental Health' },
  { id: 'stress-management', nameFa: 'مدیریت استرس', nameEn: 'Stress Management' },
  { id: 'relationships', nameFa: 'روابط', nameEn: 'Relationships' },
  { id: 'mindfulness', nameFa: 'ذهن‌آگاهی', nameEn: 'Mindfulness' },
  { id: 'sleep', nameFa: 'خواب', nameEn: 'Sleep' }
])

// Mock data - replace with API calls
const enrolledCourses = ref([
  {
    course: {
      id: '1',
      title: locale.value === 'fa' ? 'مدیریت اضطراب' : 'Managing Anxiety',
      thumbnailUrl: '',
      description: locale.value === 'fa' ? 'یادگیری تکنیک‌های عملی برای کاهش اضطراب' : 'Learn practical techniques to reduce anxiety',
      category: 'mental-health',
      difficulty: 'beginner',
      duration: 120
    },
    progress: 45,
    enrolledAt: new Date()
  }
])

const courses = ref([
  {
    id: '1',
    title: locale.value === 'fa' ? 'مدیریت اضطراب' : 'Managing Anxiety',
    description: locale.value === 'fa' ? 'یادگیری تکنیک‌های عملی برای کاهش اضطراب و استرس روزانه' : 'Learn practical techniques to reduce anxiety and daily stress',
    category: locale.value === 'fa' ? 'سلامت روان' : 'Mental Health',
    duration: 120,
    difficulty: 'beginner',
    thumbnailUrl: '',
    rating: 4.8,
    enrollmentCount: 1250,
    isFree: true
  },
  {
    id: '2',
    title: locale.value === 'fa' ? 'خواب بهتر' : 'Better Sleep',
    description: locale.value === 'fa' ? 'بهبود کیفیت خواب با استفاده از روش‌های علمی' : 'Improve sleep quality using scientific methods',
    category: locale.value === 'fa' ? 'خواب' : 'Sleep',
    duration: 90,
    difficulty: 'beginner',
    thumbnailUrl: '',
    rating: 4.6,
    enrollmentCount: 890,
    isFree: false
  },
  {
    id: '3',
    title: locale.value === 'fa' ? 'ذهن‌آگاهی پیشرفته' : 'Advanced Mindfulness',
    description: locale.value === 'fa' ? 'تکنیک‌های پیشرفته مدیتیشن و ذهن‌آگاهی' : 'Advanced meditation and mindfulness techniques',
    category: locale.value === 'fa' ? 'ذهن‌آگاهی' : 'Mindfulness',
    duration: 180,
    difficulty: 'advanced',
    thumbnailUrl: '',
    rating: 4.9,
    enrollmentCount: 650,
    isFree: false
  }
])

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
  // TODO: Filter courses by category
}

const handleSearch = () => {
  // TODO: Implement search
}

const handleSort = () => {
  // TODO: Implement sorting
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

const truncate = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

onMounted(() => {
  // TODO: Fetch courses from API
})
</script>

<style scoped lang="scss">
.content-wrapper {
  padding-bottom: env(safe-area-inset-bottom);
}

.search-section {
  padding: 16px;
  background: var(--ion-toolbar-background);
  border-bottom: 1px solid var(--ion-border-color);

  ion-searchbar {
    --background: var(--surface-2);
    --border-radius: 12px;
    --box-shadow: none;
    --color: var(--text-primary);
    --placeholder-color: var(--text-tertiary);
    --icon-color: var(--text-secondary);
    padding: 0;
  }
}

.categories-scroll {
  padding: 12px 16px;
  background: var(--ion-toolbar-background);
  border-bottom: 1px solid var(--ion-border-color);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.category-pills {
  display: flex;
  gap: 8px;
  min-width: min-content;
  padding: 4px 0;
}

ion-chip {
  --background: var(--surface-2);
  --color: var(--text-primary);
  height: 36px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    --background: var(--ion-color-primary);
    --color: var(--ion-color-primary-contrast);
    transform: scale(1.0);
  }
}

.section {
  padding: 24px 16px;
  background: var(--ion-background-color);
}

.section-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  ion-select {
    max-width: fit-content;
    min-width: 120px;
    margin-inline-end: auto;
  }

  ion-button {
    margin-inline-start: auto;
  }
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.courses-horizontal-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  direction: ltr;

  &::-webkit-scrollbar {
    display: none;
  }
}

.course-card-mini {
  flex: 0 0 280px;
  background: var(--surface-1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  text-decoration: none;
  display: block;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover);
  }

  &:active {
    transform: scale(0.98);
  }

  .course-thumbnail {
    position: relative;
    width: 100%;
    height: 140px;
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
        background: var(--surface-2);
      }
    }

    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(var(--ion-background-color-rgb), 0.95);
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
        text-align: start;
      }
    }
  }

  .course-info-mini {
    padding: 12px;

    h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--ion-color-primary);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.continue-learning {
        display: flex;
        align-items: center;
        gap: 4px;

        .chevron-icon {
          font-size: 1rem;
        }
      }
    }
  }
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
  background: var(--surface-1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover);
  }

  &:active {
    transform: scale(0.98);
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
        background: var(--surface-2);
      }
    }

    .course-badge {
      position: absolute;
      top: 12px;
      left: 12px;
    }

    .course-difficulty {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .course-content {
    padding: 16px;
  }

  .course-title {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .course-description {
    margin: 0 0 12px 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .course-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8125rem;
      color: var(--text-secondary);

      ion-icon {
        font-size: 16px;
      }
    }
  }

  .course-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--ion-border-color);

    .course-category {
      font-size: 0.75rem;
      color: var(--ion-color-primary);
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .skeleton-card {
    background: var(--surface-1);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 80px;
    color: var(--ion-color-medium);
    opacity: 0.5;
  }

  h3 {
    margin: 20px 0 10px;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
}

// RTL Support
[dir='rtl'] {
  .courses-horizontal-scroll {
    direction: rtl;
  }

  .course-card-mini {
    direction: rtl;

    .course-info-mini {
      p.continue-learning {
        flex-direction: row-reverse;
      }
    }
  }
}
</style>
