<template>
  <main class="course-form-view">
    <div class="form-header">
      <div class="header-content">
        <button class="btn-back" @click="goBack">
          <i class="icon-arrow-left"></i>
          بازگشت
        </button>
        <h1>{{ isEditMode ? 'ویرایش دوره' : 'افزودن دوره جدید' }}</h1>
        <p class="subtitle">
          {{ isEditMode ? 'ویرایش اطلاعات دوره آموزشی' : 'ایجاد دوره آموزشی جدید' }}
        </p>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="saveCourse" class="course-form">
        <div class="form-section">
          <h2 class="section-title">اطلاعات اصلی</h2>
          
          <div class="form-group">
            <label>عنوان دوره *</label>
            <input
              type="text"
              v-model="courseForm.title"
              required
              placeholder="مثال: مدیریت اضطراب"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>توضیحات *</label>
            <textarea
              v-model="courseForm.description"
              required
              rows="6"
              placeholder="توضیحات کامل درباره دوره..."
              class="form-control"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>دسته‌بندی *</label>
              <select v-model="courseForm.category" required class="form-control">
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
              <select v-model="courseForm.difficulty" required class="form-control">
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
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>تصویر شاخص</label>
              <input
                type="url"
                v-model="courseForm.thumbnailUrl"
                placeholder="https://example.com/image.jpg"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="courseForm.isPublished" />
              <span>منتشر شده</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">
            انصراف
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'در حال ذخیره...' : (isEditMode ? 'ذخیره تغییرات' : 'ایجاد دوره') }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logger } from '@yektayar/shared'

const router = useRouter()
const route = useRoute()

const saving = ref(false)
const isEditMode = ref(false)

const courseForm = ref({
  title: '',
  description: '',
  category: '',
  difficulty: 'beginner',
  duration: 0,
  thumbnailUrl: '',
  isPublished: false
})

const goBack = () => {
  router.push('/courses')
}

const saveCourse = async () => {
  try {
    saving.value = true
    
    // TODO: API call to create/update course
    logger.info('Saving course:', courseForm.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    goBack()
  } catch (error) {
    logger.error('Error saving course:', error)
    alert('خطا در ذخیره دوره')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const courseId = route.params.id
  
  if (courseId) {
    isEditMode.value = true
    // TODO: Fetch course data
    logger.info('Fetching course:', courseId)
  }
})
</script>

<style scoped lang="scss">
.course-form-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 32px;

  .header-content {
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      margin-bottom: 16px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-secondary);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }

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

.form-container {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.course-form {
  .form-section {
    margin-bottom: 32px;

    .section-title {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border-color);
    }
  }

  .form-group {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }

    .form-control {
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
      font-family: inherit;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      input[type='checkbox'] {
        width: auto;
        cursor: pointer;
      }

      span {
        font-weight: 500;
      }
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }
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

    &:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
