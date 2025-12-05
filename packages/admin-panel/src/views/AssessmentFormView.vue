<template>
  <main class="form-view">
    <div class="form-header">
      <div class="header-content">
        <button class="btn-back" @click="goBack">
          <ArrowLeftIcon class="w-5 h-5" />
          بازگشت
        </button>
        <h1>{{ isEditMode ? 'ویرایش آزمون' : 'افزودن آزمون جدید' }}</h1>
        <p class="subtitle">
          {{ isEditMode ? 'ویرایش اطلاعات آزمون' : 'ایجاد آزمون روانشناختی جدید' }}
        </p>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="saveAssessment" class="assessment-form">
        <div class="form-section">
          <h2 class="section-title">اطلاعات اصلی</h2>
          
          <div class="form-group">
            <label>عنوان آزمون (فارسی) *</label>
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
            <label>توضیحات (فارسی) *</label>
            <textarea
              v-model="formData.description"
              required
              rows="6"
              placeholder="توضیحات کامل درباره آزمون..."
              class="form-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label>توضیحات (انگلیسی)</label>
            <textarea
              v-model="formData.description_en"
              rows="6"
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
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.is_published" />
              <span>منتشر شود</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">
            انصراف
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'در حال ذخیره...' : (isEditMode ? 'ذخیره تغییرات' : 'ایجاد آزمون') }}
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
import apiClient from '@/api'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const saving = ref(false)
const isEditMode = ref(false)

const formData = ref({
  title: '',
  title_en: '',
  description: '',
  description_en: '',
  tagline: '',
  is_published: false,
})

const goBack = () => {
  router.push('/assessments')
}

const saveAssessment = async () => {
  try {
    saving.value = true
    
    const assessmentId = route.params.id
    
    if (isEditMode.value && assessmentId) {
      // Update existing assessment
      const response = await apiClient.put(`/assessments/${assessmentId}`, formData.value)
      if (response.success) {
        logger.info('Assessment updated successfully')
      }
    } else {
      // Create new assessment
      const response = await apiClient.post('/assessments', {
        ...formData.value,
        questions: [],
      })
      if (response.success) {
        logger.info('Assessment created successfully')
      }
    }
    
    goBack()
  } catch (error) {
    logger.error('Error saving assessment:', error)
    alert('خطا در ذخیره آزمون')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const assessmentId = route.params.id
  
  if (assessmentId) {
    isEditMode.value = true
    
    try {
      const response = await apiClient.get(`/assessments/${assessmentId}`)
      if (response.success && response.data) {
        formData.value = {
          title: response.data.title || '',
          title_en: response.data.title_en || '',
          description: response.data.description || '',
          description_en: response.data.description_en || '',
          tagline: response.data.tagline || '',
          is_published: response.data.is_published || false,
        }
      }
    } catch (error) {
      logger.error('Error fetching assessment:', error)
    }
  }
})
</script>

<style scoped lang="scss">
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

.assessment-form {
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
