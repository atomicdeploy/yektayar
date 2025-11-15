<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'" default-href="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'اطلاعات شخصی' : 'Personal Information' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'اطلاعات شخصی' : 'Personal Information' }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <OverlayScrollbarsComponent
        class="scrollable-content"
        :options="{
          scrollbars: {
            theme: 'os-theme-yektayar-mobile',
            visibility: 'auto',
            autoHide: 'scroll',
            autoHideDelay: 1300
          }
        }"
        defer
      >
        <div class="content-wrapper">
      <!-- Profile Avatar Section with Beautiful Gradient -->
      <div class="avatar-section">
        <div class="gradient-overlay"></div>
        <div class="avatar-container">
          <div class="avatar-circle">
            <ion-icon v-if="!formData.avatar" :icon="person"></ion-icon>
            <img v-else :src="formData.avatar" alt="Profile" />
            <div class="avatar-ring"></div>
          </div>
          <button class="avatar-edit-button" @click="handleAvatarUpload">
            <ion-icon :icon="camera"></ion-icon>
          </button>
        </div>
        <p class="avatar-hint">{{ locale === 'fa' ? 'برای تغییر تصویر کلیک کنید' : 'Tap to change photo' }}</p>
        <div class="user-badge">
          <ion-icon :icon="shieldCheckmark"></ion-icon>
          <span>{{ locale === 'fa' ? 'حساب تایید شده' : 'Verified Account' }}</span>
        </div>
      </div>

      <!-- Personal Information Form -->
      <div class="form-section">
        <div class="section-header">
          <h2 class="section-title">
            <ion-icon :icon="documentText"></ion-icon>
            {{ locale === 'fa' ? 'اطلاعات حساب کاربری' : 'Account Information' }}
          </h2>
          <p class="section-subtitle">{{ locale === 'fa' ? 'اطلاعات زیر را با دقت وارد کنید' : 'Please enter your information carefully' }}</p>
        </div>

        <ion-list :inset="true" class="info-list">
          <!-- Name Field with Enhanced Design -->
          <ion-item :class="{ 'item-has-focus': focusedField === 'name', 'item-has-error': errors.name }">
            <ion-label position="stacked" color="medium">
              <div class="label-content">
                <ion-icon :icon="personCircle" class="field-icon"></ion-icon>
                <span>{{ locale === 'fa' ? 'نام کامل' : 'Full Name' }}</span>
                <span class="required-mark">*</span>
              </div>
            </ion-label>
            <ion-input
              v-model="formData.name"
              :placeholder="locale === 'fa' ? 'نام و نام خانوادگی خود را وارد کنید' : 'Enter your full name'"
              type="text"
              @ion-focus="focusedField = 'name'"
              @ion-blur="handleBlur('name')"
              :class="{ 'ion-invalid': errors.name }"
            ></ion-input>
            <ion-icon v-if="!errors.name && formData.name.trim()" :icon="checkmarkCircle" slot="end" color="success" class="validation-icon"></ion-icon>
            <ion-note v-if="errors.name" slot="error" class="error-note">
              <ion-icon :icon="alertCircle"></ion-icon>
              {{ errors.name }}
            </ion-note>
          </ion-item>

          <!-- Email Field with Enhanced Design -->
          <ion-item :class="{ 'item-has-focus': focusedField === 'email', 'item-has-error': errors.email }">
            <ion-label position="stacked" color="medium">
              <div class="label-content">
                <ion-icon :icon="mail" class="field-icon"></ion-icon>
                <span>{{ locale === 'fa' ? 'ایمیل' : 'Email' }}</span>
              </div>
            </ion-label>
            <ion-input
              v-model="formData.email"
              :placeholder="locale === 'fa' ? 'آدرس ایمیل خود را وارد کنید' : 'Enter your email address'"
              type="email"
              @ion-focus="focusedField = 'email'"
              @ion-blur="handleBlur('email')"
              :class="{ 'ion-invalid': errors.email }"
            ></ion-input>
            <ion-icon v-if="!errors.email && formData.email && isValidEmail(formData.email)" :icon="checkmarkCircle" slot="end" color="success" class="validation-icon"></ion-icon>
            <ion-note v-if="errors.email" slot="error" class="error-note">
              <ion-icon :icon="alertCircle"></ion-icon>
              {{ errors.email }}
            </ion-note>
          </ion-item>

          <!-- Phone Field with Enhanced Design -->
          <ion-item :class="{ 'item-has-focus': focusedField === 'phone', 'item-has-error': errors.phone }">
            <ion-label position="stacked" color="medium">
              <div class="label-content">
                <ion-icon :icon="call" class="field-icon"></ion-icon>
                <span>{{ locale === 'fa' ? 'شماره تماس' : 'Phone Number' }}</span>
              </div>
            </ion-label>
            <ion-input
              v-model="formData.phone"
              :placeholder="locale === 'fa' ? 'شماره تلفن همراه خود را وارد کنید' : 'Enter your phone number'"
              type="tel"
              @ion-focus="focusedField = 'phone'"
              @ion-blur="handleBlur('phone')"
              :class="{ 'ion-invalid': errors.phone }"
            ></ion-input>
            <ion-icon v-if="!errors.phone && formData.phone && isValidPhone(formData.phone)" :icon="checkmarkCircle" slot="end" color="success" class="validation-icon"></ion-icon>
            <ion-note v-if="errors.phone" slot="error" class="error-note">
              <ion-icon :icon="alertCircle"></ion-icon>
              {{ errors.phone }}
            </ion-note>
          </ion-item>

          <!-- User Type with Badge Style -->
          <ion-item class="type-item">
            <ion-label position="stacked" color="medium">
              <div class="label-content">
                <ion-icon :icon="shield" class="field-icon"></ion-icon>
                <span>{{ locale === 'fa' ? 'نوع کاربر' : 'User Type' }}</span>
              </div>
            </ion-label>
            <div class="user-type-badge">
              <ion-icon :icon="ribbonOutline"></ion-icon>
              <span>{{ getUserTypeLabel(formData.type) }}</span>
            </div>
          </ion-item>
        </ion-list>

        <!-- Security & Privacy Notice -->
        <div class="info-notice">
          <div class="notice-icon-wrapper">
            <ion-icon :icon="lockClosed" color="primary"></ion-icon>
          </div>
          <div class="notice-content">
            <h3 class="notice-title">{{ locale === 'fa' ? 'امنیت و حریم خصوصی' : 'Security & Privacy' }}</h3>
            <p>{{ locale === 'fa' ? 'اطلاعات شما با بالاترین استانداردهای امنیتی رمزگذاری و محافظت می‌شود.' : 'Your information is encrypted and protected with the highest security standards.' }}</p>
          </div>
        </div>

        <!-- Action Buttons with Beautiful Design -->
        <div class="action-buttons">
          <ion-button 
            expand="block" 
            @click="handleSave"
            :disabled="!isFormValid || isSaving"
            class="save-button"
          >
            <ion-icon v-if="!isSaving" slot="start" :icon="saveOutline"></ion-icon>
            <ion-spinner v-if="isSaving" slot="start" name="crescent"></ion-spinner>
            {{ isSaving ? (locale === 'fa' ? 'در حال ذخیره...' : 'Saving...') : (locale === 'fa' ? 'ذخیره تغییرات' : 'Save Changes') }}
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="outline" 
            @click="handleCancel"
            :disabled="isSaving"
            class="cancel-button"
          >
            <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
            {{ locale === 'fa' ? 'انصراف' : 'Cancel' }}
          </ion-button>
        </div>

        <!-- Quick Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <ion-icon :icon="calendarOutline" color="primary"></ion-icon>
            <div class="stat-info">
              <span class="stat-label">{{ locale === 'fa' ? 'عضویت' : 'Member Since' }}</span>
              <span class="stat-value">{{ locale === 'fa' ? '۱۴۰۲' : '2024' }}</span>
            </div>
          </div>
          <div class="stat-card">
            <ion-icon :icon="shieldCheckmark" color="success"></ion-icon>
            <div class="stat-info">
              <span class="stat-label">{{ locale === 'fa' ? 'وضعیت' : 'Status' }}</span>
              <span class="stat-value">{{ locale === 'fa' ? 'فعال' : 'Active' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Spacing -->
      <div style="height: 2rem;"></div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonButton,
  IonIcon,
  IonSpinner,
  alertController,
  toastController,
} from '@ionic/vue'
import {
  person,
  personCircle,
  camera,
  mail,
  call,
  shield,
  shieldCheckmark,
  checkmarkCircle,
  closeCircleOutline,
  lockClosed,
  documentText,
  saveOutline,
  calendarOutline,
  ribbonOutline,
  alertCircle,
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UserType } from '@yektayar/shared'
import { apiClient } from '@/api'

const { locale } = useI18n()
const router = useRouter()

// Form data
interface FormData {
  name: string
  email: string
  phone: string
  type: UserType
  avatar?: string
}

const formData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  type: UserType.PATIENT,
  avatar: undefined,
})

const originalData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  type: UserType.PATIENT,
  avatar: undefined,
})

const errors = ref<Record<string, string>>({})
const isSaving = ref(false)
const focusedField = ref<string | null>(null)
const currentUserId = ref<string | null>(null)

// Load user data
onMounted(() => {
  loadUserData()
})

async function loadUserData() {
  try {
    // Get session to find current user
    const sessionResponse = await apiClient.get('/api/auth/session')
    
    if (sessionResponse.success && sessionResponse.data?.userId) {
      currentUserId.value = sessionResponse.data.userId
      
      // Fetch user profile
      const userResponse = await apiClient.get(`/api/users/${currentUserId.value}/profile`)
      
      if (userResponse.success && userResponse.data) {
        const user = userResponse.data
        const userData: FormData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          type: mapTypeToUserType(user.type),
          avatar: user.avatar,
        }
        
        formData.value = { ...userData }
        originalData.value = { ...userData }
      }
    } else {
      // Not logged in, use default values
      const userData: FormData = {
        name: locale.value === 'fa' ? 'کاربر یکتایار' : 'YektaYar User',
        email: '',
        phone: '',
        type: UserType.PATIENT,
        avatar: undefined,
      }
      
      formData.value = { ...userData }
      originalData.value = { ...userData }
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    // Use default values on error
    const userData: FormData = {
      name: locale.value === 'fa' ? 'کاربر یکتایار' : 'YektaYar User',
      email: '',
      phone: '',
      type: UserType.PATIENT,
      avatar: undefined,
    }
    
    formData.value = { ...userData }
    originalData.value = { ...userData }
  }
}

// Map backend user type to frontend UserType enum
function mapTypeToUserType(type: string): UserType {
  const mapping: Record<string, UserType> = {
    'admin': UserType.ADMIN,
    'psychologist': UserType.PSYCHOLOGIST,
    'patient': UserType.PATIENT,
  }
  return mapping[type] || UserType.PATIENT
}

// Handle blur event
function handleBlur(field: keyof FormData) {
  focusedField.value = null
  validateField(field)
}

// Validation
function validateField(field: keyof FormData) {
  errors.value[field] = ''
  
  switch (field) {
    case 'name':
      if (!formData.value.name.trim()) {
        errors.value.name = locale.value === 'fa' ? 'نام الزامی است' : 'Name is required'
      } else if (formData.value.name.trim().length < 2) {
        errors.value.name = locale.value === 'fa' ? 'نام باید حداقل ۲ حرف باشد' : 'Name must be at least 2 characters'
      }
      break
      
    case 'email':
      if (formData.value.email && !isValidEmail(formData.value.email)) {
        errors.value.email = locale.value === 'fa' ? 'ایمیل معتبر نیست' : 'Invalid email address'
      }
      break
      
    case 'phone':
      if (formData.value.phone && !isValidPhone(formData.value.phone)) {
        errors.value.phone = locale.value === 'fa' ? 'شماره تلفن معتبر نیست' : 'Invalid phone number'
      }
      break
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  // Accept Persian and English digits, with optional + and spaces
  const cleanPhone = phone.replace(/[\s\u200C\u200B+()-]/g, '')
  const phoneRegex = /^[\u06F0-\u06F90-9]{10,15}$/
  return phoneRegex.test(cleanPhone)
}

const isFormValid = computed(() => {
  if (!formData.value.name.trim()) return false
  if (formData.value.email && !isValidEmail(formData.value.email)) return false
  if (formData.value.phone && !isValidPhone(formData.value.phone)) return false
  
  // Check if any data has changed
  const hasChanges = 
    formData.value.name !== originalData.value.name ||
    formData.value.email !== originalData.value.email ||
    formData.value.phone !== originalData.value.phone ||
    formData.value.avatar !== originalData.value.avatar
  
  return hasChanges && Object.keys(errors.value).every(key => !errors.value[key])
})

// User type label
function getUserTypeLabel(type: UserType): string {
  const labels = {
    [UserType.PATIENT]: locale.value === 'fa' ? 'بیمار' : 'Patient',
    [UserType.PSYCHOLOGIST]: locale.value === 'fa' ? 'روانشناس' : 'Psychologist',
    [UserType.ADMIN]: locale.value === 'fa' ? 'مدیر' : 'Admin',
  }
  return labels[type] || type
}

// Avatar upload
async function handleAvatarUpload() {
  const alert = await alertController.create({
    header: locale.value === 'fa' ? 'تغییر تصویر پروفایل' : 'Change Profile Photo',
    message: locale.value === 'fa' ? 'این قابلیت به زودی فعال می‌شود' : 'This feature is coming soon',
    buttons: [locale.value === 'fa' ? 'باشه' : 'OK'],
  })
  await alert.present()
}

// Save changes
async function handleSave() {
  // Validate all fields
  validateField('name')
  validateField('email')
  validateField('phone')
  
  if (!isFormValid.value) {
    return
  }
  
  isSaving.value = true
  
  try {
    if (currentUserId.value) {
      // Update existing user
      const response = await apiClient.put(`/api/users/${currentUserId.value}`, {
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
      })
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update user')
      }
      
      // Update original data to reflect saved state
      originalData.value = { ...formData.value }
      
      const toast = await toastController.create({
        message: locale.value === 'fa' ? 'تغییرات با موفقیت ذخیره شد' : 'Changes saved successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success',
        icon: checkmarkCircle,
      })
      await toast.present()
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back()
      }, 500)
    } else {
      throw new Error('User not logged in')
    }
  } catch (error: any) {
    console.error('Error saving user data:', error)
    const toast = await toastController.create({
      message: error.message || (locale.value === 'fa' ? 'خطا در ذخیره تغییرات' : 'Error saving changes'),
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    })
    await toast.present()
  } finally {
    isSaving.value = false
  }
}

// Cancel changes
async function handleCancel() {
  if (!isFormValid.value) {
    // No changes, just go back
    router.back()
    return
  }
  
  const alert = await alertController.create({
    header: locale.value === 'fa' ? 'انصراف از تغییرات' : 'Discard Changes',
    message: locale.value === 'fa' ? 'آیا مطمئن هستید که می‌خواهید تغییرات را لغو کنید؟' : 'Are you sure you want to discard your changes?',
    buttons: [
      {
        text: locale.value === 'fa' ? 'ادامه ویرایش' : 'Continue Editing',
        role: 'cancel',
      },
      {
        text: locale.value === 'fa' ? 'لغو تغییرات' : 'Discard',
        role: 'destructive',
        handler: () => {
          formData.value = { ...originalData.value }
          router.back()
        },
      },
    ],
  })
  await alert.present()
}
</script>

<style scoped>
/* OverlayScrollbars container */
.scrollable-content {
  height: 100%;
  width: 100%;
}

.content-wrapper {
  min-height: 100%;
}

/* Avatar Section - Enhanced with Beautiful Gradient */
.avatar-section {
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  background: var(--accent-gradient);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(212, 164, 62, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.avatar-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
    linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-10%) translateY(-10%); }
  50% { transform: translateX(10%) translateY(10%); }
}

.avatar-container {
  position: relative;
  display: inline-block;
  z-index: 1;
}

.avatar-circle {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(212, 164, 62, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.avatar-circle:active {
  transform: scale(0.98);
}

.avatar-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent 50%, rgba(212, 164, 62, 0.3));
  opacity: 0;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.avatar-circle ion-icon {
  font-size: 60px;
  color: white;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-button {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 4px solid var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(212, 164, 62, 0.4);
  z-index: 2;
}

.avatar-edit-button:active {
  transform: scale(0.92);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(212, 164, 62, 0.4);
}

.avatar-edit-button ion-icon {
  font-size: 22px;
  color: var(--ion-color-primary);
  transition: transform 0.2s ease;
}

.avatar-edit-button:active ion-icon {
  transform: rotate(15deg);
}

.avatar-hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1;
  position: relative;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 20px;
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
}

.user-badge ion-icon {
  font-size: 16px;
  color: white;
}

.user-badge span {
  font-size: 0.8rem;
  color: white;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Form Section */
.form-section {
  padding: 1.5rem 1rem;
  animation: slideInUp 0.6s ease-out 0.2s both;
}

.section-header {
  padding: 0 0.5rem 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.section-title ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.info-list {
  background: transparent;
  margin: 0 0 1.5rem 0;
}

ion-item {
  --background: var(--surface-1);
  --border-radius: 16px;
  --padding-start: 18px;
  --padding-end: 18px;
  --inner-padding-end: 12px;
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

ion-item.item-has-focus {
  --background: var(--surface-2);
  border-color: var(--ion-color-primary);
  box-shadow: 
    var(--card-shadow-hover),
    0 0 0 4px rgba(212, 164, 62, 0.1);
  transform: translateY(-2px);
}

ion-item.item-has-error {
  border-color: var(--ion-color-danger);
  box-shadow: 
    var(--card-shadow),
    0 0 0 4px rgba(235, 68, 90, 0.08);
}

ion-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 10px;
}

.label-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
}

.required-mark {
  color: var(--ion-color-danger);
  margin-left: 4px;
  font-weight: 700;
}

ion-input {
  --padding-top: 10px;
  --padding-bottom: 10px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

ion-input.ion-invalid {
  --highlight-color-focused: var(--ion-color-danger);
}

.validation-icon {
  font-size: 22px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.error-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding-top: 6px;
  animation: slideInUp 0.3s ease-out;
}

.error-note ion-icon {
  font-size: 16px;
}

.type-item {
  --min-height: 70px;
}

.user-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
  color: white;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(212, 164, 62, 0.3);
  margin-top: 8px;
}

.user-type-badge ion-icon {
  font-size: 20px;
}

/* Security Notice - Enhanced */
.info-notice {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out 0.4s both;
}

.info-notice::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-gradient);
}

.notice-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(212, 164, 62, 0.15) 0%, rgba(212, 164, 62, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notice-icon-wrapper ion-icon {
  font-size: 24px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.notice-content p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Action Buttons - Premium Design */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.save-button {
  --background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
  --background-activated: var(--ion-color-primary-shade);
  --box-shadow: 0 6px 20px rgba(212, 164, 62, 0.35);
  font-weight: 700;
  height: 54px;
  border-radius: 16px;
  text-transform: none;
  letter-spacing: 0.3px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.save-button:not([disabled]):active {
  transform: translateY(2px);
  --box-shadow: 0 3px 12px rgba(212, 164, 62, 0.3);
}

.cancel-button {
  --border-color: var(--ion-border-color);
  --border-width: 2px;
  --color: var(--text-secondary);
  font-weight: 600;
  height: 54px;
  border-radius: 16px;
  text-transform: none;
  letter-spacing: 0.3px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cancel-button:not([disabled]):active {
  transform: translateY(2px);
}

ion-button ion-icon {
  font-size: 22px;
}

ion-spinner {
  width: 22px;
  height: 22px;
}

/* Stats Row - Beautiful Cards */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  animation: fadeIn 0.6s ease-out 0.6s both;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-1);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
}

.stat-card:active {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.stat-card ion-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 700;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
