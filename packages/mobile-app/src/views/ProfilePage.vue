<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ locale === 'fa' ? 'پروفایل' : 'Profile' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="settings" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'پروفایل' : 'Profile' }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <ion-icon :icon="person"></ion-icon>
          <div class="avatar-badge">
            <ion-icon :icon="camera"></ion-icon>
          </div>
        </div>
        <h2 class="profile-name">{{ locale === 'fa' ? 'کاربر یکتایار' : 'YektaYar User' }}</h2>
        <p class="profile-email">user@yektayar.com</p>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-value">12</div>
            <div class="stat-label">{{ locale === 'fa' ? 'جلسات' : 'Sessions' }}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">45</div>
            <div class="stat-label">{{ locale === 'fa' ? 'روز' : 'Days' }}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">8</div>
            <div class="stat-label">{{ locale === 'fa' ? 'پیام' : 'Messages' }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'دسترسی سریع' : 'Quick Actions' }}</h3>
        <div class="action-grid">
          <div class="grid-action">
            <div class="grid-action-icon primary">
              <ion-icon :icon="document"></ion-icon>
            </div>
            <span>{{ locale === 'fa' ? 'سوابق' : 'Records' }}</span>
          </div>
          <div class="grid-action">
            <div class="grid-action-icon success">
              <ion-icon :icon="statsChart"></ion-icon>
            </div>
            <span>{{ locale === 'fa' ? 'پیشرفت' : 'Progress' }}</span>
          </div>
          <div class="grid-action">
            <div class="grid-action-icon warning">
              <ion-icon :icon="heart"></ion-icon>
            </div>
            <span>{{ locale === 'fa' ? 'سلامت' : 'Wellness' }}</span>
          </div>
          <div class="grid-action">
            <div class="grid-action-icon danger">
              <ion-icon :icon="notifications"></ion-icon>
            </div>
            <span>{{ locale === 'fa' ? 'اعلان‌ها' : 'Alerts' }}</span>
          </div>
        </div>
      </div>

      <!-- Settings List -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'تنظیمات حساب' : 'Account Settings' }}</h3>
        <ion-list class="settings-list" :inset="true">
          <ion-item button detail @click="navigateToPersonalInfo">
            <ion-icon :icon="personCircle" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'اطلاعات شخصی' : 'Personal Information' }}</h3>
              <p>{{ locale === 'fa' ? 'ویرایش نام، شماره تماس و ...' : 'Edit name, phone, etc.' }}</p>
            </ion-label>
          </ion-item>

          <ion-item button detail>
            <ion-icon :icon="shield" slot="start" color="success"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'حریم خصوصی و امنیت' : 'Privacy & Security' }}</h3>
              <p>{{ locale === 'fa' ? 'تنظیمات امنیتی حساب' : 'Account security settings' }}</p>
            </ion-label>
          </ion-item>

          <ion-item button detail>
            <ion-icon :icon="notifications" slot="start" color="warning"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'اعلان‌ها' : 'Notifications' }}</h3>
              <p>{{ locale === 'fa' ? 'مدیریت اعلان‌ها' : 'Manage notifications' }}</p>
            </ion-label>
          </ion-item>

          <ion-item button detail>
            <ion-icon :icon="card" slot="start" color="tertiary"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'اطلاعات پرداخت' : 'Payment Information' }}</h3>
              <p>{{ locale === 'fa' ? 'کارت‌ها و روش‌های پرداخت' : 'Cards and payment methods' }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Preferences -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'تنظیمات برنامه' : 'App Preferences' }}</h3>
        <ion-list class="settings-list" :inset="true">
          <ion-item>
            <ion-icon :icon="moon" slot="start" :color="isDark ? 'primary' : 'medium'"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'حالت تاریک' : 'Dark Mode' }}</h3>
            </ion-label>
            <ion-toggle 
              :checked="isDark" 
              @ion-change="toggleTheme"
              slot="end"
            ></ion-toggle>
          </ion-item>

          <ion-item button detail>
            <ion-icon :icon="language" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'زبان' : 'Language' }}</h3>
              <p>{{ locale === 'fa' ? 'فارسی' : 'English' }}</p>
            </ion-label>
          </ion-item>

          <ion-item button detail>
            <ion-icon :icon="volumeMedium" slot="start" color="success"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'صدا و لرزش' : 'Sound & Haptics' }}</h3>
              <p>{{ locale === 'fa' ? 'تنظیمات صدا' : 'Sound settings' }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Support -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'پشتیبانی' : 'Support' }}</h3>
        <ion-list class="settings-list" :inset="true">
          <ion-item button detail>
            <ion-icon :icon="help" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'راهنما و پشتیبانی' : 'Help & Support' }}</h3>
            </ion-label>
          </ion-item>

          <ion-item button detail>
            <ion-icon :icon="informationCircle" slot="start" color="tertiary"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'درباره برنامه' : 'About App' }}</h3>
              <p>{{ locale === 'fa' ? 'نسخه ۰.۱.۰' : 'Version 0.1.0' }}</p>
            </ion-label>
          </ion-item>

          <ion-item button>
            <ion-icon :icon="logOut" slot="start" color="danger"></ion-icon>
            <ion-label color="danger">
              <h3>{{ locale === 'fa' ? 'خروج از حساب' : 'Sign Out' }}</h3>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Bottom Spacing -->
      <div style="height: 2rem;"></div>
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
  IonIcon,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/vue'
import { 
  person,
  camera,
  settings,
  document,
  statsChart,
  heart,
  notifications,
  personCircle,
  shield,
  card,
  moon,
  language,
  volumeMedium,
  help,
  informationCircle,
  logOut,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'

const { locale } = useI18n()
const { isDark, toggleTheme } = useTheme()

// Import router for navigation
import { useRouter } from 'vue-router'
const router = useRouter()

function navigateToPersonalInfo() {
  router.push('/tabs/profile/personal-info')
}
</script>

<style scoped>
/* Profile Header */
.profile-header {
  background: var(--accent-gradient);
  padding: 2rem 1.5rem 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.profile-avatar ion-icon {
  font-size: 48px;
  color: white;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--ion-color-primary);
  cursor: pointer;
}

.avatar-badge ion-icon {
  font-size: 16px;
  color: var(--ion-color-primary);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-email {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1.5rem 0;
}

/* Profile Stats */
.profile-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 16px;
  max-width: 300px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* Section */
.section {
  padding: 1.5rem 1rem 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0.5rem;
  color: var(--text-tertiary);
}

/* Quick Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0 0.5rem;
}

.grid-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.grid-action:active {
  transform: scale(0.95);
}

.grid-action-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow);
}

.grid-action-icon.primary {
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-tint) 100%);
}

.grid-action-icon.success {
  background: linear-gradient(135deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
}

.grid-action-icon.warning {
  background: linear-gradient(135deg, #ff9500 0%, #ffb038 100%);
}

.grid-action-icon.danger {
  background: linear-gradient(135deg, var(--ion-color-danger) 0%, var(--ion-color-danger-tint) 100%);
}

.grid-action-icon ion-icon {
  font-size: 28px;
  color: white;
}

.grid-action span {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Settings List */
.settings-list {
  background: transparent;
  margin: 0;
}

ion-item {
  --background: var(--surface-1);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 8px;
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

ion-item ion-icon {
  font-size: 24px;
  margin-right: 12px;
}

ion-label h3 {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

ion-label p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

ion-toggle {
  --handle-width: 24px;
  --handle-height: 24px;
  --handle-spacing: 2px;
}
</style>
