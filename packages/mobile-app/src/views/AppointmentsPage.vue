<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ locale === 'fa' ? 'نوبت‌ها' : 'Appointments' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="filter" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'نوبت‌ها' : 'Appointments' }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Calendar Summary -->
      <div class="calendar-summary">
        <div class="month-display">
          <ion-button fill="clear" size="small">
            <ion-icon :icon="chevronBack" slot="icon-only"></ion-icon>
          </ion-button>
          <h2>{{ locale === 'fa' ? 'آبان ۱۴۰۳' : 'November 2024' }}</h2>
          <ion-button fill="clear" size="small">
            <ion-icon :icon="chevronForward" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
        <div class="mini-calendar">
          <div class="calendar-day">
            <span class="day-label">{{ locale === 'fa' ? 'ش' : 'S' }}</span>
            <span class="day-number">10</span>
          </div>
          <div class="calendar-day">
            <span class="day-label">{{ locale === 'fa' ? 'ی' : 'M' }}</span>
            <span class="day-number">11</span>
          </div>
          <div class="calendar-day active">
            <span class="day-label">{{ locale === 'fa' ? 'د' : 'T' }}</span>
            <span class="day-number">12</span>
            <div class="day-indicator"></div>
          </div>
          <div class="calendar-day">
            <span class="day-label">{{ locale === 'fa' ? 'س' : 'W' }}</span>
            <span class="day-number">13</span>
          </div>
          <div class="calendar-day">
            <span class="day-label">{{ locale === 'fa' ? 'چ' : 'T' }}</span>
            <span class="day-number">14</span>
            <div class="day-indicator"></div>
          </div>
          <div class="calendar-day">
            <span class="day-label">{{ locale === 'fa' ? 'پ' : 'F' }}</span>
            <span class="day-number">15</span>
          </div>
          <div class="calendar-day">
            <span class="day-label">{{ locale === 'fa' ? 'ج' : 'S' }}</span>
            <span class="day-number">16</span>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">{{ locale === 'fa' ? 'نوبت‌های آینده' : 'Upcoming' }}</h3>
          <ion-badge color="primary">3</ion-badge>
        </div>

        <div class="appointments-list">
          <div class="appointment-card upcoming">
            <div class="appointment-header">
              <div class="appointment-time">
                <ion-icon :icon="time"></ion-icon>
                <span>{{ locale === 'fa' ? 'امروز، ۱۶:۰۰' : 'Today, 4:00 PM' }}</span>
              </div>
              <ion-badge color="success">{{ locale === 'fa' ? 'تایید شده' : 'Confirmed' }}</ion-badge>
            </div>
            <div class="appointment-body">
              <div class="doctor-info">
                <div class="doctor-avatar">
                  <ion-icon :icon="person"></ion-icon>
                </div>
                <div class="doctor-details">
                  <h4>{{ locale === 'fa' ? 'دکتر سارا احمدی' : 'Dr. Sara Ahmadi' }}</h4>
                  <p>{{ locale === 'fa' ? 'روانشناس بالینی' : 'Clinical Psychologist' }}</p>
                </div>
              </div>
              <div class="appointment-type">
                <ion-icon :icon="videocam"></ion-icon>
                <span>{{ locale === 'fa' ? 'جلسه آنلاین' : 'Video Session' }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <ion-button expand="block" color="primary">
                <ion-icon :icon="videocam" slot="start"></ion-icon>
                {{ locale === 'fa' ? 'پیوستن به جلسه' : 'Join Session' }}
              </ion-button>
            </div>
          </div>

          <div class="appointment-card">
            <div class="appointment-header">
              <div class="appointment-time">
                <ion-icon :icon="time"></ion-icon>
                <span>{{ locale === 'fa' ? 'فردا، ۱۰:۳۰' : 'Tomorrow, 10:30 AM' }}</span>
              </div>
              <ion-badge color="warning">{{ locale === 'fa' ? 'در انتظار' : 'Pending' }}</ion-badge>
            </div>
            <div class="appointment-body">
              <div class="doctor-info">
                <div class="doctor-avatar">
                  <ion-icon :icon="person"></ion-icon>
                </div>
                <div class="doctor-details">
                  <h4>{{ locale === 'fa' ? 'دکتر محمد رضایی' : 'Dr. Mohammad Rezaei' }}</h4>
                  <p>{{ locale === 'fa' ? 'مشاور خانواده' : 'Family Counselor' }}</p>
                </div>
              </div>
              <div class="appointment-type">
                <ion-icon :icon="location"></ion-icon>
                <span>{{ locale === 'fa' ? 'حضوری' : 'In-Person' }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <ion-button expand="block" fill="outline" color="medium">
                {{ locale === 'fa' ? 'مشاهده جزئیات' : 'View Details' }}
              </ion-button>
            </div>
          </div>

          <div class="appointment-card">
            <div class="appointment-header">
              <div class="appointment-time">
                <ion-icon :icon="time"></ion-icon>
                <span>{{ locale === 'fa' ? 'پنجشنبه، ۱۴:۰۰' : 'Thursday, 2:00 PM' }}</span>
              </div>
              <ion-badge color="success">{{ locale === 'fa' ? 'تایید شده' : 'Confirmed' }}</ion-badge>
            </div>
            <div class="appointment-body">
              <div class="doctor-info">
                <div class="doctor-avatar">
                  <ion-icon :icon="people"></ion-icon>
                </div>
                <div class="doctor-details">
                  <h4>{{ locale === 'fa' ? 'گروه‌درمانی' : 'Group Therapy' }}</h4>
                  <p>{{ locale === 'fa' ? 'مدیریت استرس' : 'Stress Management' }}</p>
                </div>
              </div>
              <div class="appointment-type">
                <ion-icon :icon="people"></ion-icon>
                <span>{{ locale === 'fa' ? 'گروهی' : 'Group' }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <ion-button expand="block" fill="outline" color="medium">
                {{ locale === 'fa' ? 'مشاهده جزئیات' : 'View Details' }}
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Appointments -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">{{ locale === 'fa' ? 'نوبت‌های گذشته' : 'Past Appointments' }}</h3>
          <ion-button fill="clear" size="small">
            {{ locale === 'fa' ? 'مشاهده همه' : 'View All' }}
          </ion-button>
        </div>

        <div class="past-appointments">
          <ion-item class="past-item">
            <ion-icon :icon="checkmarkCircle" slot="start" color="success"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'دکتر احمدی' : 'Dr. Ahmadi' }}</h3>
              <p>{{ locale === 'fa' ? 'هفته گذشته' : 'Last week' }}</p>
            </ion-label>
            <ion-button fill="clear" slot="end">
              <ion-icon :icon="documentText"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-item class="past-item">
            <ion-icon :icon="checkmarkCircle" slot="start" color="success"></ion-icon>
            <ion-label>
              <h3>{{ locale === 'fa' ? 'گروه‌درمانی' : 'Group Therapy' }}</h3>
              <p>{{ locale === 'fa' ? 'دو هفته پیش' : 'Two weeks ago' }}</p>
            </ion-label>
            <ion-button fill="clear" slot="end">
              <ion-icon :icon="documentText"></ion-icon>
            </ion-button>
          </ion-item>
        </div>
      </div>

      <!-- Quick Book -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
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
  IonBadge,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
} from '@ionic/vue'
import { 
  filter,
  chevronBack,
  chevronForward,
  time,
  person,
  people,
  videocam,
  location,
  checkmarkCircle,
  documentText,
  add,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
</script>

<style scoped>
/* Calendar Summary */
.calendar-summary {
  background: var(--surface-1);
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--ion-border-color);
}

.month-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.month-display h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.month-display ion-button {
  --color: var(--text-secondary);
}

.mini-calendar {
  display: flex;
  justify-content: space-around;
  gap: 0.5rem;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-width: 44px;
}

.calendar-day:hover {
  background: var(--surface-2);
}

.calendar-day.active {
  background: var(--accent-gradient);
  box-shadow: var(--card-shadow);
}

.calendar-day.active .day-label,
.calendar-day.active .day-number {
  color: white;
}

.day-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.day-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  position: absolute;
  bottom: 4px;
}

/* Section */
.section {
  padding: 1.5rem 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

/* Appointments List */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-card {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--ion-border-color);
  transition: all 0.2s ease;
}

.appointment-card.upcoming {
  border-color: var(--ion-color-primary);
  background: linear-gradient(135deg, var(--surface-1) 0%, var(--accent-light) 100%);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ion-border-color);
}

.appointment-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.appointment-time ion-icon {
  font-size: 18px;
}

.appointment-body {
  margin-bottom: 1rem;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.doctor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doctor-avatar ion-icon {
  font-size: 24px;
  color: white;
}

.doctor-details {
  flex: 1;
}

.doctor-details h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.doctor-details p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--text-secondary);
}

.appointment-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-2);
  border-radius: 8px;
  width: fit-content;
}

.appointment-type ion-icon {
  font-size: 16px;
  color: var(--ion-color-primary);
}

.appointment-type span {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
}

/* Past Appointments */
.past-appointments {
  background: var(--surface-1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.past-item {
  --background: transparent;
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 8px;
}

.past-item ion-icon {
  font-size: 24px;
}

.past-item h3 {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.past-item p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* FAB */
ion-fab-button {
  --box-shadow: 0 4px 16px rgba(212, 164, 62, 0.4);
}
</style>
