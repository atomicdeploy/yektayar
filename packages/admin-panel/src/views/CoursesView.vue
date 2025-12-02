<template>
  <div class="courses-view">
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('nav.courses') }}</h1>
        <p class="subtitle">مدیریت دوره‌های آموزشی</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="icon-plus"></i>
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
    <div class="courses-grid">
      <div v-for="course in filteredCourses" :key="course.id" class="course-card">
        <div class="course-image">
          <img :src="course.thumbnailUrl || '/placeholder-course.jpg'" :alt="course.title" />
          <div class="course-overlay">
            <button class="btn-icon" @click="editCourse(course)">
              <i class="icon-edit"></i>
            </button>
            <button class="btn-icon" @click="manageLessons(course)">
              <i class="icon-list"></i>
            </button>
            <button class="btn-icon btn-danger" @click="deleteCourse(course)">
              <i class="icon-trash"></i>
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

    <!-- Empty State -->
    <div v-if="filteredCourses.length === 0" class="empty-state">
      <i class="icon-courses-empty"></i>
      <h3>هیچ دوره‌ای یافت نشد</h3>
      <p>برای شروع، اولین دوره خود را ایجاد کنید</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
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
                انصراف
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingCourse ? 'ذخیره تغییرات' : 'ایجاد دوره' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const searchQuery = ref('')
const filterCategory = ref('')
const filterDifficulty = ref('')
const filterStatus = ref('')
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

const editCourse = (course: any) => {
  editingCourse.value = course
  courseForm.value = { ...course }
  showCreateModal.value = true
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

onMounted(() => {
  // TODO: Fetch courses from API
})
</script>

<style scoped lang="scss">
.courses-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

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
        background: white;
        color: var(--primary-color);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }

        &.btn-danger {
          background: #ef4444;
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

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;

        &.published {
          background: #10b981;
          color: white;
        }

        &.draft {
          background: #6b7280;
          color: white;
        }
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    font-size: 32px;
    line-height: 1;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: var(--text-primary);
    }
  }
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-primary);
  }

  input,
  textarea,
  select {
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

  textarea {
    resize: vertical;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    input[type='checkbox'] {
      width: auto;
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.btn-primary {
    background: var(--primary-gradient);
    color: white;

    &:hover {
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
      transform: translateY(-2px);
    }
  }

  &.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);

    &:hover {
      background: var(--bg-tertiary);
    }
  }
}
</style>
