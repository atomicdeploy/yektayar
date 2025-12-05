<template>
  <main class="main-view">
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('nav.courses') }}</h1>
        <p class="subtitle">مدیریت دوره‌های آموزشی</p>
      </div>
      <div class="header-actions">
        <ViewModeToggle v-model="viewMode" />
        <button
          v-if="permissionsStore.hasPermission('edit_users')"
          class="btn btn-primary"
          @click="showCreateModal = true"
        >
          <PlusIcon class="w-5 h-5" />
          افزودن دوره جدید
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="جستجوی دوره..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="filterCategory" class="filter-select">
          <option value="">همه دسته‌بندی‌ها</option>
          <option value="mental-health">سلامت روان</option>
          <option value="stress-management">مدیریت استرس</option>
          <option value="relationships">روابط</option>
          <option value="mindfulness">ذهن‌آگاهی</option>
          <option value="sleep">خواب</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filterDifficulty" class="filter-select">
          <option value="">همه سطوح</option>
          <option value="beginner">مبتدی</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">پیشرفته</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
      </div>
    </div>

    <!-- Courses List -->
    <div v-if="loading" class="loading-state">
      <LoadingSpinner size="48px" class="text-primary-500 mx-auto" />
      <p>در حال بارگذاری دوره‌ها...</p>
    </div>

    <div v-else-if="viewMode === 'card'" class="courses-grid">
      <div v-for="course in filteredCourses" :key="course.id" class="course-card" @click="editCourseInModal(course)">
        <div class="course-image">
          <img :src="course.thumbnailUrl || '/placeholder-course.jpg'" :alt="course.title" />
          <div class="course-overlay" @click.stop>
            <button class="btn-icon" @click="editCourseInModal(course)">
              <PencilIcon class="w-5 h-5" />
            </button>
            <button class="btn-icon" @click="editCourseInPage(course)">
              <ArrowTopRightOnSquareIcon class="w-5 h-5" />
            </button>
            <button class="btn-icon" @click="manageLessons(course)">
              <ListBulletIcon class="w-5 h-5" />
            </button>
            <button class="btn-icon btn-danger" @click="deleteCourse(course)">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="course-content">
          <div class="course-header">
            <h3>{{ course.title }}</h3>
            <span
              class="status-badge"
              :class="{ published: course.isPublished, draft: !course.isPublished }"
            >
              {{ course.isPublished ? 'منتشر شده' : 'پیش‌نویس' }}
            </span>
          </div>
          <p class="course-description">{{ truncate(course.description, 100) }}</p>
          <div class="course-meta">
            <div class="meta-item">
              <i class="icon-category"></i>
              <span>{{ course.category }}</span>
            </div>
            <div class="meta-item">
              <i class="icon-level"></i>
              <span>{{ getDifficultyLabel(course.difficulty) }}</span>
            </div>
            <div class="meta-item">
              <i class="icon-time"></i>
              <span>{{ course.duration }} دقیقه</span>
            </div>
          </div>
          <div class="course-stats">
            <div class="stat">
              <strong>{{ course.enrollmentCount || 0 }}</strong>
              <span>دانشجو</span>
            </div>
            <div class="stat">
              <strong>{{ course.moduleCount || 0 }}</strong>
              <span>بخش</span>
            </div>
            <div class="stat">
              <strong>{{ course.rating || 0 }}</strong>
              <span>امتیاز</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="courses-table">
      <table>
        <thead>
          <tr>
            <th>عنوان</th>
            <th>دسته‌بندی</th>
            <th>سطح</th>
            <th>مدت زمان</th>
            <th>دانشجویان</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in filteredCourses" :key="course.id">
            <td>
              <div class="course-title-cell">
                <strong>{{ course.title }}</strong>
                <span class="course-desc-preview">{{ truncate(course.description, 50) }}</span>
              </div>
            </td>
            <td>{{ course.category }}</td>
            <td>{{ getDifficultyLabel(course.difficulty) }}</td>
            <td>{{ course.duration }} دقیقه</td>
            <td>{{ course.enrollmentCount || 0 }}</td>
            <td>
              <span
                class="status-badge"
                :class="{ published: course.isPublished, draft: !course.isPublished }"
              >
                {{ course.isPublished ? 'منتشر شده' : 'پیش‌نویس' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="editCourseInModal(course)" title="ویرایش سریع">
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon" @click="editCourseInPage(course)" title="ویرایش کامل">
                  <ArrowTopRightOnSquareIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon" @click="manageLessons(course)" title="مدیریت درس‌ها">
                  <ListBulletIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon btn-danger" @click="deleteCourse(course)" title="حذف">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredCourses.length === 0" class="empty-state">
      <i class="icon-courses-empty"></i>
      <h3>هیچ دوره‌ای یافت نشد</h3>
      <p>برای شروع، اولین دوره خود را ایجاد کنید</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <PlusIcon class="w-5 h-5" />
        افزودن دوره جدید
      </button>
    </div>

    <!-- Create/Edit Course Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingCourse ? 'ویرایش دوره' : 'افزودن دوره جدید' }}</h2>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCourse">
            <div class="form-group">
              <label>عنوان دوره *</label>
              <input
                type="text"
                v-model="courseForm.title"
                required
                placeholder="مثال: مدیریت اضطراب"
              />
            </div>
            <div class="form-group">
              <label>توضیحات *</label>
              <textarea
                v-model="courseForm.description"
                required
                rows="4"
                placeholder="توضیحات کامل درباره دوره..."
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>دسته‌بندی *</label>
                <select v-model="courseForm.category" required>
                  <option value="">انتخاب کنید</option>
                  <option value="mental-health">سلامت روان</option>
                  <option value="stress-management">مدیریت استرس</option>
                  <option value="relationships">روابط</option>
                  <option value="mindfulness">ذهن‌آگاهی</option>
                  <option value="sleep">خواب</option>
                </select>
              </div>
              <div class="form-group">
                <label>سطح *</label>
                <select v-model="courseForm.difficulty" required>
                  <option value="">انتخاب کنید</option>
                  <option value="beginner">مبتدی</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">پیشرفته</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>مدت زمان (دقیقه) *</label>
                <input
                  type="number"
                  v-model.number="courseForm.duration"
                  required
                  min="1"
                  placeholder="120"
                />
              </div>
              <div class="form-group">
                <label>تصویر شاخص</label>
                <input
                  type="url"
                  v-model="courseForm.thumbnailUrl"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="courseForm.isPublished" />
                <span>منتشر شده</span>
              </label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                <span>انصراف</span>
                <!-- <kbd class="kbd">Esc</kbd> -->
              </button>
              <button type="submit" class="btn btn-info">
                <span>{{ editingCourse ? 'ذخیره تغییرات' : 'ایجاد دوره' }}</span>
                <!-- <kbd class="kbd">Ctrl+⏎</kbd> -->
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ListBulletIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'
import { useViewMode } from '@/composables/useViewMode'
import { usePermissionsStore } from '@/stores/permissions'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const { t } = useI18n()
const router = useRouter()
const permissionsStore = usePermissionsStore()
const { viewMode } = useViewMode('main-view-mode')

const searchQuery = ref('')
const filterCategory = ref('')
const filterDifficulty = ref('')
const filterStatus = ref('')
const loading = ref(false)
const showCreateModal = ref(false)
const editingCourse = ref<any>(null)

const courseForm = ref({
  title: '',
  description: '',
  category: '',
  difficulty: 'beginner',
  duration: 0,
  thumbnailUrl: '',
  isPublished: false
})

// Mock data - replace with API calls
const courses = ref([
  {
    id: '1',
    title: 'مدیریت اضطراب',
    description: 'یادگیری تکنیک‌های عملی برای کاهش اضطراب و استرس روزانه',
    category: 'سلامت روان',
    difficulty: 'beginner',
    duration: 120,
    thumbnailUrl: '',
    isPublished: true,
    enrollmentCount: 1250,
    moduleCount: 5,
    rating: 4.8
  },
  {
    id: '2',
    title: 'خواب بهتر',
    description: 'بهبود کیفیت خواب با استفاده از روش‌های علمی',
    category: 'خواب',
    difficulty: 'beginner',
    duration: 90,
    thumbnailUrl: '',
    isPublished: true,
    enrollmentCount: 890,
    moduleCount: 4,
    rating: 4.6
  },
  {
    id: '3',
    title: 'ذهن‌آگاهی پیشرفته',
    description: 'تکنیک‌های پیشرفته مدیتیشن و ذهن‌آگاهی',
    category: 'ذهن‌آگاهی',
    difficulty: 'advanced',
    duration: 180,
    thumbnailUrl: '',
    isPublished: false,
    enrollmentCount: 650,
    moduleCount: 8,
    rating: 4.9
  }
])

const filteredCourses = computed(() => {
  return courses.value.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !filterCategory.value || course.category === filterCategory.value
    const matchesDifficulty = !filterDifficulty.value || course.difficulty === filterDifficulty.value
    const matchesStatus =
      !filterStatus.value ||
      (filterStatus.value === 'published' && course.isPublished) ||
      (filterStatus.value === 'draft' && !course.isPublished)
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
  })
})

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    beginner: 'مبتدی',
    intermediate: 'متوسط',
    advanced: 'پیشرفته'
  }
  return labels[difficulty] || difficulty
}

const truncate = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const editCourseInModal = (course: any) => {
  editingCourse.value = course
  courseForm.value = { ...course }
  showCreateModal.value = true
}

const editCourseInPage = (course: any) => {
  router.push(`/courses/${course.id}/edit`)
}

const manageLessons = (course: any) => {
  // Navigate to lessons management page
  router.push(`/courses/${course.id}/lessons`)
}

const deleteCourse = (course: any) => {
  if (confirm(`آیا مطمئن هستید که می‌خواهید دوره "${course.title}" را حذف کنید؟`)) {
    // TODO: API call to delete course
    const index = courses.value.findIndex((c) => c.id === course.id)
    if (index !== -1) {
      courses.value.splice(index, 1)
    }
  }
}

const saveCourse = () => {
  if (editingCourse.value) {
    // Update existing course
    const index = courses.value.findIndex((c) => c.id === editingCourse.value.id)
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...courseForm.value }
    }
  } else {
    // Create new course
    const newCourse = {
      id: String(Date.now()),
      ...courseForm.value,
      enrollmentCount: 0,
      moduleCount: 0,
      rating: 0
    }
    courses.value.unshift(newCourse)
  }
  closeModal()
}

const closeModal = () => {
  showCreateModal.value = false
  editingCourse.value = null
  courseForm.value = {
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 0,
    thumbnailUrl: '',
    isPublished: false
  }
}

// Handle keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (showCreateModal.value && event.key === 'Escape') {
    closeModal()
  }
  if (showCreateModal.value && event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    saveCourse()
  }
}

onMounted(() => {
  // TODO: Fetch courses from API
  loading.value = false
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.view-header {
  .header-content {
    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .subtitle {
      margin: 0;
      font-size: 16px;
      color: var(--text-secondary);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.filters-section {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .search-input,
  .filter-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    }
  }
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  
  p {
    margin-top: 16px;
    color: var(--text-secondary);
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.course-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    .course-overlay {
      opacity: 1;
    }
  }

  .course-image {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .course-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;

      .btn-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.95);
        color: var(--primary-color);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }

        &.btn-danger {
          background: rgba(239, 68, 68, 0.95);
          color: white;
        }
      }
    }
  }

  .course-content {
    padding: 20px;

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
        flex: 1;
      }
    }

    .course-description {
      margin: 0 0 16px 0;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .course-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--text-secondary);
      }
    }

    .course-stats {
      display: flex;
      justify-content: space-around;

      .stat {
        text-align: center;

        strong {
          display: block;
          font-size: 20px;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }
}

.courses-table {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background: rgb(249 250 251);
      border-bottom: 1px solid rgb(229 231 235);

      @media (prefers-color-scheme: dark) {
        background: rgb(55 65 81);
        border-bottom-color: rgb(75 85 99);
      }

      th {
        padding: 12px 24px;
        text-align: right;
        font-weight: 500;
        font-size: 12px;
        color: rgb(107 114 128);
        text-transform: uppercase;
        letter-spacing: 0.05em;

        @media (prefers-color-scheme: dark) {
          color: rgb(156 163 175);
        }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid rgb(229 231 235);
        transition: background-color 0.15s ease;

        @media (prefers-color-scheme: dark) {
          border-bottom-color: rgb(75 85 99);
        }

        &:hover {
          background: rgb(249 250 251);

          @media (prefers-color-scheme: dark) {
            background: rgba(55, 65, 81, 0.5);
          }
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 16px 24px;
        color: var(--text-primary);
        font-size: 14px;
        white-space: nowrap;

        .course-title-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;

          strong {
            font-weight: 600;
          }

          .course-desc-preview {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgb(59 130 246);
          display: inline-flex;
          align-items: center;
          justify-content: center;

          @media (prefers-color-scheme: dark) {
            color: rgb(96 165 250);
          }

          &:hover {
            color: rgb(37 99 235);

            @media (prefers-color-scheme: dark) {
              color: rgb(147 197 253);
            }
          }

          &.btn-danger {
            color: rgb(239 68 68);

            @media (prefers-color-scheme: dark) {
              color: rgb(248 113 113);
            }

            &:hover {
              color: rgb(220 38 38);

              @media (prefers-color-scheme: dark) {
                color: rgb(252 165 165);
              }
            }
          }
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  i {
    font-size: 80px;
    color: var(--text-tertiary);
    margin-bottom: 24px;
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0 0 32px 0;
    font-size: 16px;
    color: var(--text-secondary);
  }
}
</style>
