<template>
  <main class="main-view">
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('nav.assessments') }}</h1>
        <p class="subtitle">مدیریت ارزیابی‌های روانشناختی</p>
      </div>
      <div class="header-actions">
        <ViewModeToggle v-model="viewMode" />
        <button
          v-if="permissionsStore.hasPermission('edit_users')"
          class="btn btn-primary"
          @click="showCreateModal = true"
        >
          <PlusIcon class="w-5 h-5" />
          افزودن ارزیابی جدید
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="جستجوی ارزیابی..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
      </div>
    </div>

    <!-- Assessments List -->
    <div v-if="viewMode === 'card'" class="assessments-grid">
      <div v-for="assessment in filteredAssessments" :key="assessment.id" class="assessment-card" @click="editAssessmentInModal(assessment)">
        <div class="assessment-header">
          <div class="assessment-icon">
            <i class="icon-assessment"></i>
          </div>
          <div class="assessment-title-section">
            <h3>{{ assessment.title }}</h3>
            <span
              class="status-badge"
              :class="{ published: assessment.is_published, draft: !assessment.is_published }"
            >
              {{ assessment.is_published ? 'منتشر شده' : 'پیش‌نویس' }}
            </span>
          </div>
        </div>
        <div class="assessment-content">
          <p class="assessment-description">{{ truncate(assessment.description, 150) }}</p>
          <div class="assessment-meta">
            <div class="meta-item">
              <i class="icon-questions"></i>
              <span>{{ assessment.question_count || 0 }} سوال</span>
            </div>
            <div class="meta-item">
              <i class="icon-sections"></i>
              <span>{{ assessment.section_count || 0 }} بخش</span>
            </div>
            <div class="meta-item">
              <i class="icon-time"></i>
              <span>{{ formatDate(assessment.created_at) }}</span>
            </div>
          </div>
          <div class="assessment-stats">
            <div class="stat">
              <strong>{{ assessment.submission_count || 0 }}</strong>
              <span>ارزیابی انجام شده</span>
            </div>
            <div class="stat">
              <strong>{{ assessment.avg_score || 0 }}%</strong>
              <span>میانگین امتیاز</span>
            </div>
          </div>
        </div>
        <div class="assessment-actions" @click.stop>
          <button class="btn-action" @click="viewAssessment(assessment)" title="مشاهده جزئیات">
            <EyeIcon class="w-5 h-5" />
          </button>
          <button class="btn-action" @click="editAssessmentInModal(assessment)" title="ویرایش سریع">
            <PencilIcon class="w-5 h-5" />
          </button>
          <button class="btn-action" @click="editAssessmentInPage(assessment)" title="ویرایش کامل">
            <ArrowTopRightOnSquareIcon class="w-5 h-5" />
          </button>
          <button class="btn-action" @click="manageQuestions(assessment)" title="مدیریت سوالات">
            <ListBulletIcon class="w-5 h-5" />
          </button>
          <button class="btn-action" @click="viewResults(assessment)" title="مشاهده نتایج">
            <ChartBarIcon class="w-5 h-5" />
          </button>
          <button class="btn-action btn-danger" @click="deleteAssessment(assessment)" title="حذف">
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="assessments-table">
      <table>
        <thead>
          <tr>
            <th>عنوان</th>
            <th>تعداد سوالات</th>
            <th>تعداد بخش‌ها</th>
            <th>ارزیابی‌های انجام شده</th>
            <th>میانگین امتیاز</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in filteredAssessments" :key="assessment.id">
            <td>
              <div class="assessment-title-cell">
                <strong>{{ assessment.title }}</strong>
                <span class="assessment-desc-preview">{{ truncate(assessment.description, 50) }}</span>
              </div>
            </td>
            <td>{{ assessment.question_count || 0 }}</td>
            <td>{{ assessment.section_count || 0 }}</td>
            <td>{{ assessment.submission_count || 0 }}</td>
            <td>{{ assessment.avg_score || 0 }}%</td>
            <td>
              <span
                class="status-badge"
                :class="{ published: assessment.is_published, draft: !assessment.is_published }"
              >
                {{ assessment.is_published ? 'منتشر شده' : 'پیش‌نویس' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="viewAssessment(assessment)" title="مشاهده جزئیات">
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon" @click="editAssessmentInModal(assessment)" title="ویرایش سریع">
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon" @click="editAssessmentInPage(assessment)" title="ویرایش کامل">
                  <ArrowTopRightOnSquareIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon" @click="manageQuestions(assessment)" title="مدیریت سوالات">
                  <ListBulletIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon" @click="viewResults(assessment)" title="مشاهده نتایج">
                  <ChartBarIcon class="w-5 h-5" />
                </button>
                <button class="btn-icon btn-danger" @click="deleteAssessment(assessment)" title="حذف">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredAssessments.length === 0 && !loading" class="empty-state">
      <i class="icon-empty"></i>
      <h3>ارزیابیی یافت نشد</h3>
      <p>هنوز ارزیابیی ایجاد نشده است یا با فیلترهای انتخابی نتیجه‌ای یافت نشد.</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <PlusIcon class="w-5 h-5" />
        افزودن اولین ارزیابی
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>در حال بارگذاری ارزیابی‌ها...</p>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ showEditModal ? 'ویرایش ارزیابی' : 'افزودن ارزیابی جدید' }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAssessment">
            <div class="form-group">
              <label>عنوان ارزیابی (فارسی)</label>
              <input
                type="text"
                v-model="formData.title"
                required
                placeholder="مثال: رهیار - ارزیابی جامع ارزیابی مولفههای رابطه"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>عنوان ارزیابی (انگلیسی)</label>
              <input
                type="text"
                v-model="formData.title_en"
                placeholder="Example: Rahyar - Comprehensive Relationship Assessment"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>توضیحات (فارسی)</label>
              <textarea
                v-model="formData.description"
                required
                rows="4"
                placeholder="توضیحات کامل درباره ارزیابی..."
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label>توضیحات (انگلیسی)</label>
              <textarea
                v-model="formData.description_en"
                rows="4"
                placeholder="Detailed description about the assessment..."
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label>شعار/تگ‌لاین</label>
              <input
                type="text"
                v-model="formData.tagline"
                placeholder="مثال: رابطه رو بسنج، آسیبها رو بفهم، راهحلها بگیر"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" v-model="formData.is_published" />
                منتشر شود
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                <span>انصراف</span>
                <kbd class="kbd">Esc</kbd>
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span>{{ saving ? 'در حال ذخیره...' : 'ذخیره' }}</span>
                <kbd class="kbd" v-if="!saving">Ctrl+Enter</kbd>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Questions Management Modal -->
    <div v-if="showQuestionsModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>مدیریت سوالات: {{ selectedAssessment?.title }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="questions-header">
            <button class="btn btn-primary btn-sm" @click="addSection">
              <i class="icon-plus"></i>
              افزودن بخش جدید
            </button>
          </div>

          <div class="sections-list">
            <div
              v-for="(section, sectionIndex) in questionsData.sections"
              :key="sectionIndex"
              class="section-card"
            >
              <div class="section-header">
                <input
                  v-model="section.title"
                  placeholder="عنوان بخش (فارسی)"
                  class="form-control"
                />
                <input
                  v-model="section.title_en"
                  placeholder="Section title (English)"
                  class="form-control"
                />
                <button
                  class="btn-icon btn-danger"
                  @click="removeSection(sectionIndex)"
                  title="حذف بخش"
                >
                  <i class="icon-trash"></i>
                </button>
              </div>

              <div class="section-questions">
                <button class="btn btn-secondary btn-sm" @click="addQuestion(sectionIndex)">
                  <i class="icon-plus"></i>
                  افزودن سوال
                </button>

                <div
                  v-for="(question, questionIndex) in section.questions"
                  :key="questionIndex"
                  class="question-card"
                >
                  <div class="question-number">{{ questionIndex + 1 }}</div>
                  <div class="question-content">
                    <input
                      v-model="question.text"
                      placeholder="متن سوال (فارسی)"
                      class="form-control"
                    />
                    <input
                      v-model="question.text_en"
                      placeholder="Question text (English)"
                      class="form-control"
                    />
                  </div>
                  <button
                    class="btn-icon btn-danger"
                    @click="removeQuestion(sectionIndex, questionIndex)"
                    title="حذف سوال"
                  >
                    <i class="icon-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">
              انصراف
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveQuestions"
              :disabled="saving"
            >
              {{ saving ? 'در حال ذخیره...' : 'ذخیره سوالات' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Modal -->
    <div v-if="showResultsModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>نتایج ارزیابی: {{ selectedAssessment?.title }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="results-stats">
            <div class="stat-card">
              <div class="stat-value">{{ results.length }}</div>
              <div class="stat-label">کل ارزیابی‌های انجام شده</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ calculateAverageScore() }}%</div>
              <div class="stat-label">میانگین امتیاز</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ calculateHighScoreCount() }}</div>
              <div class="stat-label">امتیازهای بالا</div>
            </div>
          </div>

          <div class="results-table">
            <table>
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>امتیاز</th>
                  <th>درصد</th>
                  <th>تاریخ</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in results" :key="result.id">
                  <td>کاربر {{ result.user_id }}</td>
                  <td>{{ result.score }} / {{ result.max_score || 315 }}</td>
                  <td>{{ result.percentage || 0 }}%</td>
                  <td>{{ formatDateTime(result.completed_at) }}</td>
                  <td>
                    <button class="btn-sm" @click="viewResultDetail(result)">
                      مشاهده جزئیات
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
  EyeIcon,
  ListBulletIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'
import { useViewMode } from '@/composables/useViewMode'
import { usePermissionsStore } from '@/stores/permissions'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

const { t } = useI18n()
const router = useRouter()
const permissionsStore = usePermissionsStore()
const { viewMode } = useViewMode('assessments-view-mode')

// State
const assessments = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showQuestionsModal = ref(false)
const showResultsModal = ref(false)
const selectedAssessment = ref<any>(null)
const results = ref<any[]>([])

// Form data
const formData = ref({
  title: '',
  title_en: '',
  description: '',
  description_en: '',
  tagline: '',
  is_published: false,
})

const questionsData = ref({
  sections: [] as Array<{
    title: string
    title_en: string
    questions: Array<{
      text: string
      text_en: string
    }>
  }>,
})

// Computed
const filteredAssessments = computed(() => {
  let filtered = assessments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (assessment) =>
        assessment.title?.toLowerCase().includes(query) ||
        assessment.description?.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value === 'published') {
    filtered = filtered.filter((assessment) => assessment.is_published)
  } else if (filterStatus.value === 'draft') {
    filtered = filtered.filter((assessment) => !assessment.is_published)
  }

  return filtered
})

// Methods
const fetchAssessments = async () => {
  try {
    loading.value = true
    const response = await apiClient.get<any[]>('/assessments')
    if (response.success && response.data) {
      assessments.value = response.data
    }
  } catch (error) {
    logger.error('Error fetching assessments:', error)
  } finally {
    loading.value = false
  }
}

const viewAssessment = (assessment: any) => {
  selectedAssessment.value = assessment
  // Open a view modal or navigate to details page
  alert('View assessment details - to be implemented')
}

const editAssessmentInModal = (assessment: any) => {
  selectedAssessment.value = assessment
  formData.value = {
    title: assessment.title || '',
    title_en: assessment.title_en || '',
    description: assessment.description || '',
    description_en: assessment.description_en || '',
    tagline: assessment.tagline || '',
    is_published: assessment.is_published || false,
  }
  showEditModal.value = true
}

const editAssessmentInPage = (assessment: any) => {
  router.push(`/assessments/${assessment.id}/edit`)
}

const manageQuestions = async (assessment: any) => {
  selectedAssessment.value = assessment
  
  try {
    const response = await apiClient.get<any>(`/assessments/${assessment.id}`)
    if (response.success && response.data) {
      const assessmentData = response.data
      
      if (assessmentData.questions && Array.isArray(assessmentData.questions)) {
        questionsData.value.sections = assessmentData.questions.map((section: any) => ({
          title: section.title || '',
          title_en: section.titleEn || '',
          questions: section.questions?.map((q: any) => ({
            text: q.text || '',
            text_en: q.textEn || '',
          })) || [],
        }))
      }
    }
  } catch (error) {
    logger.error('Error fetching assessment questions:', error)
  }
  
  showQuestionsModal.value = true
}

const viewResults = async (assessment: any) => {
  selectedAssessment.value = assessment
  
  try {
    const response = await apiClient.get<any[]>(`/assessments/${assessment.id}/results`)
    if (response.success && response.data) {
      results.value = response.data
    }
  } catch (error) {
    logger.error('Error fetching results:', error)
  }
  
  showResultsModal.value = true
}

const deleteAssessment = async (assessment: any) => {
  if (!confirm(`آیا از حذف ارزیابی "${assessment.title}" اطمینان دارید؟`)) {
    return
  }

  try {
    await apiClient.delete(`/assessments/${assessment.id}`)
    assessments.value = assessments.value.filter((t) => t.id !== assessment.id)
  } catch (error) {
    logger.error('Error deleting assessment:', error)
    alert('خطا در حذف ارزیابی')
  }
}

const saveAssessment = async () => {
  try {
    saving.value = true

    if (showEditModal.value && selectedAssessment.value) {
      const response = await apiClient.put<any>(`/assessments/${selectedAssessment.value.id}`, formData.value)
      if (response.success && response.data) {
        const index = assessments.value.findIndex((t) => t.id === selectedAssessment.value.id)
        if (index !== -1) {
          assessments.value[index] = { ...assessments.value[index], ...formData.value }
        }
      }
    } else {
      const response = await apiClient.post<any>('/assessments', {
        ...formData.value,
        questions: [],
      })
      if (response.success && response.data) {
        assessments.value.push(response.data)
      }
    }

    closeModals()
  } catch (error) {
    logger.error('Error saving assessment:', error)
    alert('خطا در ذخیره ارزیابی')
  } finally {
    saving.value = false
  }
}

const saveQuestions = async () => {
  if (!selectedAssessment.value) return

  try {
    saving.value = true

    const questions = questionsData.value.sections.map((section) => ({
      title: section.title,
      titleEn: section.title_en,
      questions: section.questions.map((q) => ({
        text: q.text,
        textEn: q.text_en,
      })),
    }))

    const response = await apiClient.put(`/assessments/${selectedAssessment.value.id}`, {
      questions,
    })

    if (response.success) {
      alert('سوالات با موفقیت ذخیره شد')
      closeModals()
      fetchAssessments()
    }
  } catch (error) {
    logger.error('Error saving questions:', error)
    alert('خطا در ذخیره سوالات')
  } finally {
    saving.value = false
  }
}

const addSection = () => {
  questionsData.value.sections.push({
    title: '',
    title_en: '',
    questions: [],
  })
}

const removeSection = (index: number) => {
  if (confirm('آیا از حذف این بخش اطمینان دارید؟')) {
    questionsData.value.sections.splice(index, 1)
  }
}

const addQuestion = (sectionIndex: number) => {
  questionsData.value.sections[sectionIndex].questions.push({
    text: '',
    text_en: '',
  })
}

const removeQuestion = (sectionIndex: number, questionIndex: number) => {
  questionsData.value.sections[sectionIndex].questions.splice(questionIndex, 1)
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showQuestionsModal.value = false
  showResultsModal.value = false
  selectedAssessment.value = null
  formData.value = {
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    tagline: '',
    is_published: false,
  }
  questionsData.value = { sections: [] }
}

const truncate = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (daassessmentring: string) => {
  if (!daassessmentring) return ''
  return new Date(daassessmentring).toLocaleDaassessmentring('fa-IR')
}

const formatDateTime = (daassessmentring: string) => {
  if (!daassessmentring) return ''
  return new Date(daassessmentring).toLocaleString('fa-IR')
}

const calculateAverageScore = () => {
  if (results.value.length === 0) return 0
  const total = results.value.reduce((sum, r) => sum + (r.percentage || 0), 0)
  return Math.round(total / results.value.length)
}

const calculateHighScoreCount = () => {
  return results.value.filter((r) => (r.percentage || 0) >= 70).length
}

const viewResultDetail = (_result: any) => {
  alert('View result detail - to be implemented')
}

// Handle keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if ((showCreateModal.value || showEditModal.value) && event.key === 'Escape') {
    closeModals()
  }
  if ((showCreateModal.value || showEditModal.value) && event.ctrlKey && event.key === 'Enter' && !saving.value) {
    event.preventDefault()
    saveAssessment()
  }
}

// Lifecycle
onMounted(() => {
  fetchAssessments()
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 0;
  border-bottom: none;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.assessments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.assessments-table {
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

        .assessment-title-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;

          strong {
            font-weight: 600;
          }

          .assessment-desc-preview {
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

.assessment-card {
  background: var(--card-bg);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.assessment-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.assessment-header {
  padding: 1.25rem;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.assessment-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.assessment-title-section {
  flex: 1;
}

.assessment-title-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.assessment-content {
  padding: 1.25rem;
}

.assessment-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.6;
  min-height: 60px;
}

.assessment-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.85rem;
}

.assessment-stats {
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.stat {
  text-align: center;
}

.stat strong {
  display: block;
  font-size: 1.25rem;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat span {
  font-size: 0.75rem;
  color: #6b7280;
}

.assessment-actions {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn-action {
  flex: 1;
  padding: 8px;
  background: var(--bg-primary);
  border: none;
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

.empty-state,
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state i,
.loading-state .spinner {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Questions Management */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.section-card {
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.section-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-questions {
  margin-top: 1rem;
}

.question-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.question-number {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Results */
.results-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--primary-gradient);
  color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.results-table {
  overflow-x: auto;
}

.results-table table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 0.75rem 1rem;
  text-align: right;
  border-bottom: 1px solid var(--border-color);
}

.results-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.results-table tr:hover {
  background: var(--bg-secondary);
}
</style>
