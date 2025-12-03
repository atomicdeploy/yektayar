<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'پشتیبانی' : 'Support' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showNewTicketModal = true">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'پشتیبانی' : 'Support' }}</ion-title>
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
      <!-- Hero Section -->
      <div class="support-hero">
        <div class="hero-icon">
          <ion-icon :icon="helpCircle"></ion-icon>
        </div>
        <h2>{{ locale === 'fa' ? 'چطور می‌توانیم کمکتان کنیم؟' : 'How can we help you?' }}</h2>
        <p>{{ locale === 'fa' ? 'تیم پشتیبانی ما آماده پاسخگویی به سوالات شماست' : 'Our support team is ready to answer your questions' }}</p>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'دسترسی سریع' : 'Quick Actions' }}</h3>
        <div class="action-grid">
          <ion-card button @click="showNewTicketModal = true" class="action-card">
            <div class="action-icon primary">
              <ion-icon :icon="chatbubbles"></ion-icon>
            </div>
            <h4>{{ locale === 'fa' ? 'تیکت جدید' : 'New Ticket' }}</h4>
          </ion-card>

          <ion-card button @click="loadTickets" class="action-card">
            <div class="action-icon success">
              <ion-icon :icon="refresh"></ion-icon>
            </div>
            <h4>{{ locale === 'fa' ? 'بروزرسانی' : 'Refresh' }}</h4>
          </ion-card>
        </div>
      </div>

      <!-- Tickets List -->
      <div class="section">
        <h3 class="section-title">{{ locale === 'fa' ? 'تیکت‌های شما' : 'Your Tickets' }}</h3>
        
        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <!-- Empty State -->
        <div v-else-if="tickets.length === 0" class="empty-state">
          <ion-icon :icon="documentText" class="empty-icon"></ion-icon>
          <h4>{{ locale === 'fa' ? 'هیچ تیکتی وجود ندارد' : 'No Tickets Yet' }}</h4>
          <p>{{ locale === 'fa' ? 'برای شروع، یک تیکت جدید ایجاد کنید' : 'Create a new ticket to get started' }}</p>
          <ion-button @click="showNewTicketModal = true" color="primary">
            <ion-icon :icon="add" slot="start"></ion-icon>
            {{ locale === 'fa' ? 'ایجاد تیکت' : 'Create Ticket' }}
          </ion-button>
        </div>

        <!-- Tickets -->
        <ion-list v-else :inset="true">
          <ion-item 
            v-for="ticket in tickets" 
            :key="ticket.id" 
            button 
            detail
            @click="openTicket(ticket)"
          >
            <ion-icon 
              :icon="getStatusIcon(ticket.status)" 
              :color="getStatusColor(ticket.status)" 
              slot="start"
            ></ion-icon>
            <ion-label>
              <h3>{{ ticket.subject }}</h3>
              <p>{{ ticket.message.substring(0, 60) }}{{ ticket.message.length > 60 ? '...' : '' }}</p>
              <p class="ticket-meta">
                <ion-badge :color="getPriorityColor(ticket.priority)">
                  {{ locale === 'fa' ? getPriorityLabelFa(ticket.priority) : ticket.priority }}
                </ion-badge>
                <span class="ticket-date">{{ formatDate(ticket.created_at) }}</span>
              </p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Bottom Spacing -->
      <div style="height: 2rem;"></div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>

    <!-- New Ticket Modal -->
    <ion-modal :is-open="showNewTicketModal" @did-dismiss="showNewTicketModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ locale === 'fa' ? 'تیکت جدید' : 'New Ticket' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showNewTicketModal = false">
              {{ locale === 'fa' ? 'بستن' : 'Close' }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="stacked">{{ locale === 'fa' ? 'موضوع' : 'Subject' }}</ion-label>
          <ion-input 
            v-model="newTicket.subject" 
            :placeholder="locale === 'fa' ? 'موضوع تیکت را وارد کنید' : 'Enter ticket subject'"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">{{ locale === 'fa' ? 'اولویت' : 'Priority' }}</ion-label>
          <ion-select v-model="newTicket.priority">
            <ion-select-option value="low">{{ locale === 'fa' ? 'کم' : 'Low' }}</ion-select-option>
            <ion-select-option value="normal">{{ locale === 'fa' ? 'متوسط' : 'Normal' }}</ion-select-option>
            <ion-select-option value="high">{{ locale === 'fa' ? 'بالا' : 'High' }}</ion-select-option>
            <ion-select-option value="urgent">{{ locale === 'fa' ? 'فوری' : 'Urgent' }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">{{ locale === 'fa' ? 'پیام' : 'Message' }}</ion-label>
          <ion-textarea 
            v-model="newTicket.message" 
            :placeholder="locale === 'fa' ? 'توضیحات تیکت را وارد کنید' : 'Enter ticket description'"
            :rows="6"
            :auto-grow="true"
          ></ion-textarea>
        </ion-item>

        <ion-button 
          expand="block" 
          @click="submitTicket" 
          :disabled="!newTicket.subject || !newTicket.message || submitting"
          style="margin-top: 1rem;"
        >
          <ion-icon :icon="send" slot="start"></ion-icon>
          {{ submitting ? (locale === 'fa' ? 'در حال ارسال...' : 'Sending...') : (locale === 'fa' ? 'ارسال تیکت' : 'Submit Ticket') }}
        </ion-button>
      </ion-content>
    </ion-modal>

    <!-- Ticket Details Modal -->
    <ion-modal :is-open="showTicketModal" @did-dismiss="showTicketModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ selectedTicket?.subject }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showTicketModal = false">
              {{ locale === 'fa' ? 'بستن' : 'Close' }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content v-if="selectedTicket" class="ion-padding">
        <!-- Ticket Info -->
        <div class="ticket-info">
          <div class="info-row">
            <ion-badge :color="getStatusColor(selectedTicket.status)">
              {{ locale === 'fa' ? getStatusLabelFa(selectedTicket.status) : selectedTicket.status }}
            </ion-badge>
            <ion-badge :color="getPriorityColor(selectedTicket.priority)">
              {{ locale === 'fa' ? getPriorityLabelFa(selectedTicket.priority) : selectedTicket.priority }}
            </ion-badge>
          </div>
          <p class="ticket-date">{{ formatDate(selectedTicket.created_at) }}</p>
        </div>

        <!-- Messages -->
        <div class="messages-container">
          <div 
            v-for="message in selectedTicket.messages" 
            :key="message.id"
            :class="['message', message.sender_type]"
          >
            <div class="message-header">
              <span class="sender">{{ message.sender_type === 'user' ? (locale === 'fa' ? 'شما' : 'You') : (locale === 'fa' ? 'پشتیبانی' : 'Support') }}</span>
              <span class="time">{{ formatTime(message.created_at) }}</span>
            </div>
            <div class="message-body">{{ message.message }}</div>
          </div>
        </div>

        <!-- Reply Form -->
        <div class="reply-form">
          <ion-item>
            <ion-textarea 
              v-model="replyMessage" 
              :placeholder="locale === 'fa' ? 'پاسخ خود را بنویسید...' : 'Type your reply...'"
              :rows="3"
            ></ion-textarea>
          </ion-item>
          <ion-button 
            expand="block" 
            @click="sendReply" 
            :disabled="!replyMessage || sendingReply"
          >
            <ion-icon :icon="send" slot="start"></ion-icon>
            {{ sendingReply ? (locale === 'fa' ? 'در حال ارسال...' : 'Sending...') : (locale === 'fa' ? 'ارسال پاسخ' : 'Send Reply') }}
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonSpinner,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonBadge,
} from '@ionic/vue'
import { 
  helpCircle, 
  add, 
  chatbubbles, 
  refresh, 
  documentText, 
  send,
  checkmarkCircle,
  timeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api'
import { logger } from '@yektayar/shared'

const { locale } = useI18n()

const loading = ref(false)
const tickets = ref<any[]>([])
const showNewTicketModal = ref(false)
const showTicketModal = ref(false)
const selectedTicket = ref<any>(null)
const submitting = ref(false)
const sendingReply = ref(false)
const replyMessage = ref('')

const newTicket = ref({
  subject: '',
  message: '',
  priority: 'normal'
})

async function loadTickets() {
  loading.value = true
  try {
    // For now, load all tickets. In production, filter by user_id
    const response = await apiClient.get('/api/support/tickets', { skipAuth: true })
    if (response.success) {
      tickets.value = response.data || []
    }
  } catch (error) {
    logger.error('Error loading tickets:', error)
  } finally {
    loading.value = false
  }
}

async function submitTicket() {
  if (!newTicket.value.subject || !newTicket.value.message) return
  
  submitting.value = true
  try {
    const response = await apiClient.post('/api/support/tickets', newTicket.value, { skipAuth: true })
    if (response.success) {
      showNewTicketModal.value = false
      newTicket.value = { subject: '', message: '', priority: 'normal' }
      await loadTickets()
    }
  } catch (error) {
    logger.error('Error submitting ticket:', error)
  } finally {
    submitting.value = false
  }
}

async function openTicket(ticket: any) {
  try {
    const response = await apiClient.get(`/api/support/tickets/${ticket.id}`, { skipAuth: true })
    if (response.success) {
      selectedTicket.value = response.data
      showTicketModal.value = true
    }
  } catch (error) {
    logger.error('Error loading ticket details:', error)
  }
}

async function sendReply() {
  if (!replyMessage.value || !selectedTicket.value) return
  
  sendingReply.value = true
  try {
    const response = await apiClient.post(
      `/api/support/tickets/${selectedTicket.value.id}/messages`,
      {
        message: replyMessage.value,
        sender_type: 'user'
      },
      { skipAuth: true }
    )
    
    if (response.success) {
      replyMessage.value = ''
      // Reload ticket details
      await openTicket(selectedTicket.value)
    }
  } catch (error) {
    logger.error('Error sending reply:', error)
  } finally {
    sendingReply.value = false
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'open': return timeOutline
    case 'closed': return checkmarkCircle
    default: return timeOutline
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'warning'
    case 'closed': return 'success'
    default: return 'medium'
  }
}

function getStatusLabelFa(status: string) {
  switch (status) {
    case 'open': return 'باز'
    case 'closed': return 'بسته'
    default: return status
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'low': return 'success'
    case 'normal': return 'primary'
    case 'high': return 'warning'
    case 'urgent': return 'danger'
    default: return 'medium'
  }
}

function getPriorityLabelFa(priority: string) {
  switch (priority) {
    case 'low': return 'کم'
    case 'normal': return 'متوسط'
    case 'high': return 'بالا'
    case 'urgent': return 'فوری'
    default: return priority
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US')
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadTickets()
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

/* Hero Section */
.support-hero {
  background: var(--accent-gradient);
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: white;
}

.hero-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.hero-icon ion-icon {
  font-size: 2.5rem;
}

.support-hero h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.support-hero p {
  margin: 0;
  opacity: 0.9;
}

/* Section */
.section {
  padding: 1.5rem;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

/* Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-card {
  margin: 0;
  text-align: center;
  padding: 1.5rem 1rem;
}

.action-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon ion-icon {
  font-size: 1.5rem;
  color: white;
}

.action-icon.primary {
  background: var(--ion-color-primary);
}

.action-icon.success {
  background: var(--ion-color-success);
}

.action-card h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Loading & Empty */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem;
  color: var(--ion-text-color);
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 1.5rem;
}

/* Ticket Meta */
.ticket-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem !important;
}

.ticket-date {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}

/* Ticket Details */
.ticket-info {
  background: var(--ion-color-light);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Messages */
.messages-container {
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.message {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 12px;
  max-width: 85%;
}

.message.user {
  background: var(--ion-color-primary);
  color: white;
  margin-left: auto;
  margin-right: 0;
}

.message.support {
  background: var(--ion-color-light);
  color: var(--ion-text-color);
  margin-right: auto;
  margin-left: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

.sender {
  font-weight: 600;
}

.message-body {
  line-height: 1.5;
}

/* Reply Form */
.reply-form {
  margin-top: 1rem;
}
</style>
