<template>
  <div class="tests-view">
    <div class="view-header">
      <div class="header-content">
        <h1>{{ t('nav.tests') }}</h1>
        <p class="subtitle">مدیریت آزمون‌ها و ارزیابی‌های روانشناختی</p>
      </div>
      <div class="header-actions">
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
    <div class="tests-grid">
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
          <button class="btn-action" @click="editTest(test)" title="ویرایش">
            <i class="icon-edit"></i>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

const { t } = useI18n()

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
    const response = await apiClient.get<any[]>('/api/assessments')
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

const editTest = (test: any) => {
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

const manageQuestions = async (test: any) => {
  selectedTest.value = test
  
  try {
    const response = await apiClient.get<any>(`/api/assessments/${test.id}`)
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
    const response = await apiClient.get<any[]>(`/api/assessments/${test.id}/results`)
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
    await apiClient.delete(`/api/assessments/${test.id}`)
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
      const response = await apiClient.put<any>(`/api/assessments/${selectedTest.value.id}`, formData.value)
      if (response.success && response.data) {
        const index = tests.value.findIndex((t) => t.id === selectedTest.value.id)
        if (index !== -1) {
          tests.value[index] = { ...tests.value[index], ...formData.value }
        }
      }
    } else {
      const response = await apiClient.post<any>('/api/assessments', {
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

    const response = await apiClient.put(`/api/assessments/${selectedTest.value.id}`, {
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
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
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
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.95rem;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.test-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
}

.test-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.test-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-action {
  flex: 1;
  padding: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
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
  color: #6b7280;
}

.empty-state i,
.loading-state .spinner {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #d1d5db;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
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
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

.btn-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.95rem;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
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
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

/* Questions Management */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.section-card {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.question-number {
  width: 32px;
  height: 32px;
  background: #667eea;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border-bottom: 1px solid #e5e7eb;
}

.results-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.results-table tr:hover {
  background: #f9fafb;
}
</style>
