<template>
  <main class="tests-view">
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('nav.assessments') }}</h1>
        <p class="subtitle">مدیریت آزمون‌ها و ارزیابی‌های روانشناختی</p>
      </div>
      <div class="header-actions">
        <ViewModeToggle v-model="viewMode" />
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="icon-plus"></i>
          افزودن آزمون جدید
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="جستجوی آزمون..."
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

    <!-- Tests List -->
    <div v-if="viewMode === 'card'" class="tests-grid">
      <div v-for="test in filteredTests" :key="test.id" class="test-card">
        <div class="test-header">
          <div class="test-icon">
            <i class="icon-test"></i>
          </div>
          <div class="test-title-section">
            <h3>{{ test.title }}</h3>
            <span
              class="status-badge"
              :class="{ published: test.is_published, draft: !test.is_published }"
            >
              {{ test.is_published ? 'منتشر شده' : 'پیش‌نویس' }}
            </span>
          </div>
        </div>
        <div class="test-content">
          <p class="test-description">{{ truncate(test.description, 150) }}</p>
          <div class="test-meta">
            <div class="meta-item">
              <i class="icon-questions"></i>
              <span>{{ test.question_count || 0 }} سوال</span>
            </div>
            <div class="meta-item">
              <i class="icon-sections"></i>
              <span>{{ test.section_count || 0 }} بخش</span>
            </div>
            <div class="meta-item">
              <i class="icon-time"></i>
              <span>{{ formatDate(test.created_at) }}</span>
            </div>
          </div>
          <div class="test-stats">
            <div class="stat">
              <strong>{{ test.submission_count || 0 }}</strong>
              <span>آزمون انجام شده</span>
            </div>
            <div class="stat">
              <strong>{{ test.avg_score || 0 }}%</strong>
              <span>میانگین امتیاز</span>
            </div>
          </div>
        </div>
        <div class="test-actions">
          <button class="btn-action" @click="viewTest(test)" title="مشاهده جزئیات">
            <i class="icon-eye"></i>
          </button>
          <button class="btn-action" @click="editTestInModal(test)" title="ویرایش سریع">
            <i class="icon-edit"></i>
          </button>
          <button class="btn-action" @click="editTestInPage(test)" title="ویرایش کامل">
            <i class="icon-external-link"></i>
          </button>
          <button class="btn-action" @click="manageQuestions(test)" title="مدیریت سوالات">
            <i class="icon-list"></i>
          </button>
          <button class="btn-action" @click="viewResults(test)" title="مشاهده نتایج">
            <i class="icon-chart"></i>
          </button>
          <button class="btn-action btn-danger" @click="deleteTest(test)" title="حذف">
            <i class="icon-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="tests-table">
      <table>
        <thead>
          <tr>
            <th>عنوان</th>
            <th>تعداد سوالات</th>
            <th>تعداد بخش‌ها</th>
            <th>آزمون‌های انجام شده</th>
            <th>میانگین امتیاز</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="test in filteredTests" :key="test.id">
            <td>
              <div class="test-title-cell">
                <strong>{{ test.title }}</strong>
                <span class="test-desc-preview">{{ truncate(test.description, 50) }}</span>
              </div>
            </td>
            <td>{{ test.question_count || 0 }}</td>
            <td>{{ test.section_count || 0 }}</td>
            <td>{{ test.submission_count || 0 }}</td>
            <td>{{ test.avg_score || 0 }}%</td>
            <td>
              <span
                class="status-badge"
                :class="{ published: test.is_published, draft: !test.is_published }"
              >
                {{ test.is_published ? 'منتشر شده' : 'پیش‌نویس' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="viewTest(test)" title="مشاهده جزئیات">
                  <i class="icon-eye"></i>
                </button>
                <button class="btn-icon" @click="editTestInModal(test)" title="ویرایش سریع">
                  <i class="icon-edit"></i>
                </button>
                <button class="btn-icon" @click="editTestInPage(test)" title="ویرایش کامل">
                  <i class="icon-external-link"></i>
                </button>
                <button class="btn-icon" @click="manageQuestions(test)" title="مدیریت سوالات">
                  <i class="icon-list"></i>
                </button>
                <button class="btn-icon" @click="viewResults(test)" title="مشاهده نتایج">
                  <i class="icon-chart"></i>
                </button>
                <button class="btn-icon btn-danger" @click="deleteTest(test)" title="حذف">
                  <i class="icon-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTests.length === 0 && !loading" class="empty-state">
      <i class="icon-empty"></i>
      <h3>آزمونی یافت نشد</h3>
      <p>هنوز آزمونی ایجاد نشده است یا با فیلترهای انتخابی نتیجه‌ای یافت نشد.</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        افزودن اولین آزمون
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>در حال بارگذاری آزمون‌ها...</p>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ showEditModal ? 'ویرایش آزمون' : 'افزودن آزمون جدید' }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveTest">
            <div class="form-group">
              <label>عنوان آزمون (فارسی)</label>
              <input
                type="text"
                v-model="formData.title"
                required
                placeholder="مثال: رهیار - آزمون جامع ارزیابی مولفههای رابطه"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>عنوان آزمون (انگلیسی)</label>
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
                placeholder="توضیحات کامل درباره آزمون..."
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label>توضیحات (انگلیسی)</label>
              <textarea
                v-model="formData.description_en"
                rows="4"
                placeholder="Detailed description about the test..."
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
                انصراف
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'در حال ذخیره...' : 'ذخیره' }}
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
          <h2>مدیریت سوالات: {{ selectedTest?.title }}</h2>
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
          <h2>نتایج آزمون: {{ selectedTest?.title }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="results-stats">
            <div class="stat-card">
              <div class="stat-value">{{ results.length }}</div>
              <div class="stat-label">کل آزمون‌های انجام شده</div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useViewMode } from '@/composables/useViewMode'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

const { t } = useI18n()
const router = useRouter()
const { viewMode } = useViewMode('assessments-view-mode')

// State
const tests = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showQuestionsModal = ref(false)
const showResultsModal = ref(false)
const selectedTest = ref<any>(null)
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
const filteredTests = computed(() => {
  let filtered = tests.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (test) =>
        test.title?.toLowerCase().includes(query) ||
        test.description?.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value === 'published') {
    filtered = filtered.filter((test) => test.is_published)
  } else if (filterStatus.value === 'draft') {
    filtered = filtered.filter((test) => !test.is_published)
  }

  return filtered
})

// Methods
const fetchTests = async () => {
  try {
    loading.value = true
    const response = await apiClient.get<any[]>('/assessments')
    if (response.success && response.data) {
      tests.value = response.data
    }
  } catch (error) {
    logger.error('Error fetching tests:', error)
  } finally {
    loading.value = false
  }
}

const viewTest = (test: any) => {
  selectedTest.value = test
  // Open a view modal or navigate to details page
  alert('View test details - to be implemented')
}

const editTestInModal = (test: any) => {
  selectedTest.value = test
  formData.value = {
    title: test.title || '',
    title_en: test.title_en || '',
    description: test.description || '',
    description_en: test.description_en || '',
    tagline: test.tagline || '',
    is_published: test.is_published || false,
  }
  showEditModal.value = true
}

const editTestInPage = (test: any) => {
  router.push(`/assessments/${test.id}/edit`)
}

const manageQuestions = async (test: any) => {
  selectedTest.value = test
  
  try {
    const response = await apiClient.get<any>(`/assessments/${test.id}`)
    if (response.success && response.data) {
      const testData = response.data
      
      if (testData.questions && Array.isArray(testData.questions)) {
        questionsData.value.sections = testData.questions.map((section: any) => ({
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
    logger.error('Error fetching test questions:', error)
  }
  
  showQuestionsModal.value = true
}

const viewResults = async (test: any) => {
  selectedTest.value = test
  
  try {
    const response = await apiClient.get<any[]>(`/assessments/${test.id}/results`)
    if (response.success && response.data) {
      results.value = response.data
    }
  } catch (error) {
    logger.error('Error fetching results:', error)
  }
  
  showResultsModal.value = true
}

const deleteTest = async (test: any) => {
  if (!confirm(`آیا از حذف آزمون "${test.title}" اطمینان دارید؟`)) {
    return
  }

  try {
    await apiClient.delete(`/assessments/${test.id}`)
    tests.value = tests.value.filter((t) => t.id !== test.id)
  } catch (error) {
    logger.error('Error deleting test:', error)
    alert('خطا در حذف آزمون')
  }
}

const saveTest = async () => {
  try {
    saving.value = true

    if (showEditModal.value && selectedTest.value) {
      const response = await apiClient.put<any>(`/assessments/${selectedTest.value.id}`, formData.value)
      if (response.success && response.data) {
        const index = tests.value.findIndex((t) => t.id === selectedTest.value.id)
        if (index !== -1) {
          tests.value[index] = { ...tests.value[index], ...formData.value }
        }
      }
    } else {
      const response = await apiClient.post<any>('/assessments', {
        ...formData.value,
        questions: [],
      })
      if (response.success && response.data) {
        tests.value.push(response.data)
      }
    }

    closeModals()
  } catch (error) {
    logger.error('Error saving test:', error)
    alert('خطا در ذخیره آزمون')
  } finally {
    saving.value = false
  }
}

const saveQuestions = async () => {
  if (!selectedTest.value) return

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

    const response = await apiClient.put(`/assessments/${selectedTest.value.id}`, {
      questions,
    })

    if (response.success) {
      alert('سوالات با موفقیت ذخیره شد')
      closeModals()
      fetchTests()
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
  selectedTest.value = null
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

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fa-IR')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('fa-IR')
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

// Lifecycle
onMounted(() => {
  fetchTests()
})
</script>

<style scoped>
.tests-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

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

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.tests-table {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background: var(--bg-secondary);
      border-bottom: 2px solid var(--border-color);

      th {
        padding: 16px;
        text-align: right;
        font-weight: 600;
        font-size: 14px;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--bg-secondary);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 16px;
        color: var(--text-primary);
        font-size: 14px;

        .test-title-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;

          strong {
            font-weight: 600;
          }

          .test-desc-preview {
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
          border: 1px solid var(--border-color);
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);

          &:hover {
            background: var(--bg-tertiary);
            border-color: var(--primary-color);
            color: var(--primary-color);
          }

          &.btn-danger:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
            color: #ef4444;
          }
        }
      }
    }
  }
}

.test-card {
  background: var(--card-bg);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.2s;
}

.test-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.test-header {
  padding: 1.25rem;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.test-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.test-title-section {
  flex: 1;
}

.test-title-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.published {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-badge.draft {
  background: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
}

.test-content {
  padding: 1.25rem;
}

.test-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.6;
  min-height: 60px;
}

.test-meta {
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

.test-stats {
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

.test-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn-action {
  flex: 1;
  padding: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}

.btn-action.btn-danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
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

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.modal-large {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-secondary);
  line-height: 1;
}

.btn-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--text-primary);
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
