<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ locale === 'fa' ? 'نوبت‌ها' : 'Appointments' }}</ion-title>
        <template #end>
          <ion-buttons>
            <ion-button @click="handleFilterClick">
              <template #icon-only>
                <ion-icon :icon="filter" />
              </template>
            </ion-button>
          </ion-buttons>
        </template>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">
            {{ locale === 'fa' ? 'نوبت‌ها' : 'Appointments' }}
          </ion-title>
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
          <!-- Calendar Summary -->
          <div class="calendar-summary">
            <div class="month-display">
              <ion-button fill="clear" size="small" @click="previousMonth">
                <template #icon-only>
                  <ion-icon :icon="chevronBack" :style="locale === 'fa' ? '' : 'transform: scaleX(-1)'" />
                </template>
              </ion-button>
              <h2>{{ monthDisplay }}</h2>
              <ion-button fill="clear" size="small" @click="nextMonth">
                <template #icon-only>
                  <ion-icon :icon="chevronForward" :style="locale === 'fa' ? '' : 'transform: scaleX(-1)'" />
                </template>
              </ion-button>
            </div>
            <div class="mini-calendar">
              <div 
                v-for="day in calendarDays" 
                :key="day.date.toISOString()"
                class="calendar-day"
                :class="{ active: day.date.toDateString() === selectedDate.toDateString() }"
                @click="selectDay(day.date)"
              >
                <span class="day-label">{{ day.dayLabel }}</span>
                <span class="day-number">{{ day.dayNumber }}</span>
                <div v-if="day.hasAppointment" class="day-indicator" />
              </div>
            </div>
          </div>

          <!-- Upcoming Appointments -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">
                {{ locale === 'fa' ? 'نوبت‌های آینده' : 'Upcoming' }}
              </h3>
              <ion-badge color="secondary">
                {{ upcomingAppointments.length }}
              </ion-badge>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <ion-spinner name="circular" />
              <p>{{ locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...' }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="upcomingAppointments.length === 0" class="empty-state">
              <p>{{ locale === 'fa' ? 'شما نوبت آینده‌ای ندارید' : 'You have no upcoming appointments' }}</p>
            </div>

            <!-- Appointments List -->
            <div v-else class="appointments-list">
              <div 
                v-for="appointment in upcomingAppointments" 
                :key="appointment.id"
                class="appointment-card"
                :class="{ upcoming: appointment.status === 'confirmed' }"
              >
                <div class="appointment-header">
                  <div class="appointment-time">
                    <ion-icon :icon="time" />
                    <span>{{ formatAppointmentTime(appointment.scheduledAt) }}</span>
                  </div>
                  <ion-badge :color="getStatusColor(appointment.status)">
                    {{ getStatusLabel(appointment.status) }}
                  </ion-badge>
                </div>
                <div class="appointment-body">
                  <div class="doctor-info">
                    <div class="doctor-avatar">
                      <ion-icon :icon="person" />
                    </div>
                    <div class="doctor-details">
                      <h4>{{ appointment.psychologist_name || (locale === 'fa' ? 'نام مشاور' : 'Counselor Name') }}</h4>
                      <p>{{ appointment.specialization || (locale === 'fa' ? 'تخصص' : 'Specialization') }}</p>
                    </div>
                  </div>
                  <div class="appointment-type">
                    <ion-icon :icon="getAppointmentTypeIcon(appointment)" />
                    <span>{{ getAppointmentTypeLabel(appointment) }}</span>
                  </div>
                </div>
                <div class="appointment-actions">
                  <ion-button 
                    v-if="getAppointmentType(appointment) === 'video' && appointment.status === 'confirmed'" 
                    expand="block" 
                    color="primary"
                    @click="handleJoinSession(appointment)"
                  >
                    <template #start>
                      <ion-icon :icon="videocam" />
                    </template>
                    {{ locale === 'fa' ? 'پیوستن به جلسه' : 'Join Session' }}
                  </ion-button>
                  <ion-button 
                    v-else
                    expand="block" 
                    fill="outline" 
                    color="medium"
                    @click="handleViewDetails(appointment)"
                  >
                    {{ locale === 'fa' ? 'مشاهده جزئیات' : 'View Details' }}
                  </ion-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Past Appointments -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">
                {{ locale === 'fa' ? 'نوبت‌های گذشته' : 'Past Appointments' }}
              </h3>
              <ion-button fill="clear" size="small" @click="handleViewAllPast">
                {{ locale === 'fa' ? 'مشاهده همه' : 'View All' }}
              </ion-button>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && pastAppointments.length === 0" class="empty-state">
              <p>{{ locale === 'fa' ? 'شما نوبت گذشته‌ای ندارید' : 'You have no past appointments' }}</p>
            </div>

            <!-- Past Appointments List -->
            <div v-else class="past-appointments">
              <ion-item 
                v-for="appointment in pastAppointments.slice(0, 2)" 
                :key="appointment.id"
                class="past-item"
                button
                @click="handleViewDetails(appointment)"
              >
                <template #start>
                  <ion-icon :icon="checkmarkCircle" color="success" />
                </template>
                <ion-label>
                  <h3>{{ appointment.psychologist_name || (locale === 'fa' ? 'مشاور' : 'Counselor') }}</h3>
                  <p>{{ formatPastDate(appointment.scheduledAt) }}</p>
                </ion-label>
                <template #end>
                  <ion-button fill="clear" @click.stop="handleViewDocument(appointment)">
                    <ion-icon :icon="documentText" />
                  </ion-button>
                </template>
              </ion-item>
            </div>
          </div>
        </div>
      </OverlayScrollbarsComponent>

      <!-- Quick Book -->
      <template #fixed>
        <ion-fab vertical="bottom" horizontal="end">
          <ion-fab-button color="primary" @click="handleNewAppointment">
            <ion-icon :icon="add" />
          </ion-fab-button>
        </ion-fab>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  IonSpinner,
  actionSheetController,
  alertController,
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
import { useRouter } from 'vue-router'
import { useAppointments } from '@/composables/useAppointments'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { logger } from '@yektayar/shared'
import type { AppointmentWithDetails } from '@/composables/useAppointments'

const { locale } = useI18n()
const router = useRouter()
const { 
  loading, 
  upcomingAppointments, 
  pastAppointments,
  fetchAppointments,
  cancelAppointment,
} = useAppointments()

// Calendar state
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const calendarDays = ref<Array<{ date: Date; dayLabel: string; dayNumber: number; hasAppointment: boolean }>>([])

// Initialize calendar
const initializeCalendar = () => {
  const days: typeof calendarDays.value = []
  const today = new Date(currentDate.value)
  
  // Get current day of week (0 = Sunday, 6 = Saturday)
  const currentDayOfWeek = today.getDay()
  
  // Calculate start of week (go back to previous Sunday)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - currentDayOfWeek)
  
  // Generate 7 days for the week
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dayLabels = locale.value === 'fa' 
      ? ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'] // Sunday to Saturday in Persian
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    
    days.push({
      date,
      dayLabel: dayLabels[i],
      dayNumber: date.getDate(),
      hasAppointment: hasAppointmentOnDate(date),
    })
  }
  
  calendarDays.value = days
}

// Check if there's an appointment on a specific date
const hasAppointmentOnDate = (date: Date) => {
  return upcomingAppointments.value.some(apt => {
    const aptDate = new Date(apt.scheduledAt)
    return aptDate.toDateString() === date.toDateString()
  })
}

// Month navigation
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  initializeCalendar()
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  initializeCalendar()
}

// Select a day
const selectDay = (date: Date) => {
  selectedDate.value = date
  logger.info('Selected date:', date.toDateString())
}

// Format month display
const monthDisplay = computed(() => {
  if (locale.value === 'fa') {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
    return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
  } else {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
})

// Format appointment time
const formatAppointmentTime = (scheduledAt: Date | string) => {
  const date = new Date(scheduledAt)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (locale.value === 'fa') {
    const timeStr = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    if (date.toDateString() === today.toDateString()) {
      return `امروز، ${timeStr}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `فردا، ${timeStr}`
    } else {
      return date.toLocaleDateString('fa-IR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
    }
  } else {
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }
}

// Format past appointment date
const formatPastDate = (scheduledAt: Date | string) => {
  const date = new Date(scheduledAt)
  const today = new Date()
  const diffTime = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (locale.value === 'fa') {
    if (diffDays === 0) return 'امروز'
    if (diffDays === 1) return 'دیروز'
    if (diffDays < 7) return `${diffDays} روز پیش`
    if (diffDays < 14) return 'هفته گذشته'
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`
    return date.toLocaleDateString('fa-IR')
  } else {
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return 'Last week'
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US')
  }
}

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'medium'
    case 'cancelled':
      return 'danger'
    default:
      return 'medium'
  }
}

// Get status label
const getStatusLabel = (status: string) => {
  if (locale.value === 'fa') {
    switch (status) {
      case 'confirmed': return 'تایید شده'
      case 'pending': return 'در انتظار'
      case 'completed': return 'تکمیل شده'
      case 'cancelled': return 'لغو شده'
      default: return status
    }
  } else {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

// Determine appointment type from data
const getAppointmentType = (appointment: AppointmentWithDetails) => {
  // Try to determine type from notes or other fields
  const notes = appointment.notes?.toLowerCase() || ''
  if (notes.includes('video') || notes.includes('online')) {
    return 'video'
  } else if (notes.includes('group')) {
    return 'group'
  }
  return 'in-person'
}

// Get appointment type icon
const getAppointmentTypeIcon = (appointment: AppointmentWithDetails) => {
  const type = getAppointmentType(appointment)
  return type === 'video' ? videocam : type === 'group' ? people : location
}

// Get appointment type label
const getAppointmentTypeLabel = (appointment: AppointmentWithDetails) => {
  const type = getAppointmentType(appointment)
  if (locale.value === 'fa') {
    return type === 'video' ? 'جلسه آنلاین' : type === 'group' ? 'گروهی' : 'حضوری'
  } else {
    return type === 'video' ? 'Video Session' : type === 'group' ? 'Group' : 'In-Person'
  }
}

// Handle filter button click
const handleFilterClick = async () => {
  const actionSheet = await actionSheetController.create({
    header: locale.value === 'fa' ? 'فیلتر نوبت‌ها' : 'Filter Appointments',
    buttons: [
      {
        text: locale.value === 'fa' ? 'همه' : 'All',
        handler: () => {
          fetchAppointments({ userId: 1 }) // TODO: Use actual user ID from session
        }
      },
      {
        text: locale.value === 'fa' ? 'تایید شده' : 'Confirmed',
        handler: () => {
          fetchAppointments({ userId: 1, status: 'confirmed' })
        }
      },
      {
        text: locale.value === 'fa' ? 'در انتظار' : 'Pending',
        handler: () => {
          fetchAppointments({ userId: 1, status: 'pending' })
        }
      },
      {
        text: locale.value === 'fa' ? 'لغو' : 'Cancel',
        role: 'cancel'
      }
    ]
  })
  await actionSheet.present()
}

// Handle join session click
const handleJoinSession = (appointment: AppointmentWithDetails) => {
  logger.info('Joining session for appointment:', appointment.id)
  // TODO: Implement video session joining logic
  alert(locale.value === 'fa' ? 'ویژگی جلسه ویدیویی به زودی اضافه می‌شود' : 'Video session feature coming soon')
}

// Handle view details click
const handleViewDetails = (appointment: AppointmentWithDetails) => {
  logger.info('Viewing details for appointment:', appointment.id)
  // TODO: Navigate to appointment details page when created
  router.push(`/tabs/appointments/${appointment.id}`)
}

// Handle view all past appointments
const handleViewAllPast = () => {
  logger.info('Viewing all past appointments')
  // TODO: Navigate to past appointments page when created
  router.push('/tabs/appointments/history')
}

// Handle view document/report
const handleViewDocument = (appointment: AppointmentWithDetails) => {
  logger.info('Viewing document for appointment:', appointment.id)
  // TODO: Implement document viewing
  alert(locale.value === 'fa' ? 'ویژگی مشاهده گزارش به زودی اضافه می‌شود' : 'Document viewing feature coming soon')
}

// Handle new appointment booking
const handleNewAppointment = () => {
  logger.info('Creating new appointment')
  // TODO: Navigate to appointment booking page when created
  router.push('/tabs/appointments/book')
}

// Handle appointment cancellation (for future use)
const _handleCancelAppointment = async (appointment: AppointmentWithDetails) => {
  const alert = await alertController.create({
    header: locale.value === 'fa' ? 'لغو نوبت' : 'Cancel Appointment',
    message: locale.value === 'fa' 
      ? 'آیا مطمئن هستید که می‌خواهید این نوبت را لغو کنید؟' 
      : 'Are you sure you want to cancel this appointment?',
    buttons: [
      {
        text: locale.value === 'fa' ? 'خیر' : 'No',
        role: 'cancel'
      },
      {
        text: locale.value === 'fa' ? 'بله، لغو کن' : 'Yes, Cancel',
        role: 'destructive',
        handler: async () => {
          const success = await cancelAppointment(appointment.id)
          if (success) {
            // Refresh appointments list
            await fetchAppointments({ userId: 1 })
          }
        }
      }
    ]
  })
  await alert.present()
}

// Load appointments on mount
onMounted(async () => {
  initializeCalendar()
  // TODO: Get userId from session store once authentication is fully implemented
  await fetchAppointments({ userId: 1 })
})
</script>

<style scoped lang="scss">
/* OverlayScrollbars container */
.scrollable-content {
  height: 100%;
  width: 100%;
}

.content-wrapper {
  min-height: 100%;
}

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
  color: var(--secondary-accent);
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;

  ion-spinner {
    width: 48px;
    height: 48px;
    color: var(--ion-color-primary);
  }

  p {
    color: var(--ion-color-medium);
    margin: 0;
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;

  p {
    color: var(--ion-color-medium);
    margin: 0;
  }
}
</style>
