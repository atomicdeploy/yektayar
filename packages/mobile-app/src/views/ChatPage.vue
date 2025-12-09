<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ locale === 'fa' ? 'گفتگو' : 'Chat' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ locale === 'fa' ? 'گفتگو' : 'Chat' }}</ion-title>
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
      <!-- Chat List Header -->
      <div class="chat-header">
        <div class="search-wrapper">
          <ion-searchbar
            :placeholder="locale === 'fa' ? 'جستجوی مکالمات...' : 'Search conversations...'"
            animated
            show-clear-button="focus"
          ></ion-searchbar>
        </div>
      </div>

      <!-- Active Conversations -->
      <div class="section">
        <h2 class="section-title">{{ locale === 'fa' ? 'مکالمات فعال' : 'Active Conversations' }}</h2>
        <div class="conversations-list">
          <div class="conversation-card active">
            <div class="avatar-wrapper">
              <div class="avatar primary">
                <ion-icon :icon="person"></ion-icon>
              </div>
              <div class="status-indicator online"></div>
            </div>
            <div class="conversation-content">
              <div class="conversation-header">
                <h3 class="conversation-name">{{ locale === 'fa' ? 'دکتر احمدی' : 'Dr. Ahmadi' }}</h3>
                <span class="conversation-time">{{ locale === 'fa' ? '۱۰ دقیقه' : '10 min' }}</span>
              </div>
              <div class="conversation-preview">
                <ion-icon :icon="checkmarkDone" class="read-indicator"></ion-icon>
                <p class="last-message">{{ locale === 'fa' ? 'سلام، چطور می‌توانم کمکتان کنم؟' : 'Hello, how can I help you?' }}</p>
              </div>
            </div>
            <div class="unread-badge">3</div>
          </div>

          <div class="conversation-card" @click="navigateToAIChat">
            <div class="avatar-wrapper">
              <div class="avatar success">
                <ion-icon :icon="chatbubbles"></ion-icon>
              </div>
              <div class="status-indicator busy"></div>
            </div>
            <div class="conversation-content">
              <div class="conversation-header">
                <h3 class="conversation-name">{{ locale === 'fa' ? 'مشاور هوشمند' : 'AI Counselor' }}</h3>
                <span class="conversation-time">{{ locale === 'fa' ? '۲ ساعت' : '2 hours' }}</span>
              </div>
              <div class="conversation-preview">
                <p class="last-message">{{ locale === 'fa' ? 'چگونه می‌توانم امروز به شما کمک کنم؟' : 'How can I assist you today?' }}</p>
              </div>
            </div>
          </div>

          <div class="conversation-card">
            <div class="avatar-wrapper">
              <div class="avatar warning">
                <ion-icon :icon="people"></ion-icon>
              </div>
              <div class="status-indicator offline"></div>
            </div>
            <div class="conversation-content">
              <div class="conversation-header">
                <h3 class="conversation-name">{{ locale === 'fa' ? 'گروه پشتیبانی' : 'Support Group' }}</h3>
                <span class="conversation-time">{{ locale === 'fa' ? 'دیروز' : 'Yesterday' }}</span>
              </div>
              <div class="conversation-preview">
                <p class="last-message">{{ locale === 'fa' ? 'جلسه بعدی فردا ساعت ۱۶' : 'Next session tomorrow at 4 PM' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Responses -->
      <div class="section">
        <h2 class="section-title">{{ locale === 'fa' ? 'شروع سریع' : 'Quick Start' }}</h2>
        <div class="quick-responses">
          <ion-chip class="quick-chip">
            <ion-icon :icon="help"></ion-icon>
            <ion-label>{{ locale === 'fa' ? 'احتیاج به کمک دارم' : 'I need help' }}</ion-label>
          </ion-chip>
          <ion-chip class="quick-chip">
            <ion-icon :icon="calendar"></ion-icon>
            <ion-label>{{ locale === 'fa' ? 'رزرو نوبت' : 'Book appointment' }}</ion-label>
          </ion-chip>
          <ion-chip class="quick-chip">
            <ion-icon :icon="document"></ion-icon>
            <ion-label>{{ locale === 'fa' ? 'سوابق من' : 'My records' }}</ion-label>
          </ion-chip>
          <ion-chip class="quick-chip">
            <ion-icon :icon="call"></ion-icon>
            <ion-label>{{ locale === 'fa' ? 'تماس اضطراری' : 'Emergency call' }}</ion-label>
          </ion-chip>
        </div>
      </div>

      <!-- Support Resources -->
      <div class="section">
        <h2 class="section-title">{{ locale === 'fa' ? 'منابع پشتیبانی' : 'Support Resources' }}</h2>
        <ion-card class="resource-card">
          <div class="resource-icon-wrapper">
            <ion-icon :icon="book"></ion-icon>
          </div>
          <ion-card-content>
            <h3>{{ locale === 'fa' ? 'مقالات آموزشی' : 'Educational Articles' }}</h3>
            <p>{{ locale === 'fa' ? 'مطالب مفید برای سلامت روان' : 'Helpful content for mental wellness' }}</p>
          </ion-card-content>
        </ion-card>

        <ion-card class="resource-card">
          <div class="resource-icon-wrapper">
            <ion-icon :icon="videocam"></ion-icon>
          </div>
          <ion-card-content>
            <h3>{{ locale === 'fa' ? 'ویدیوهای آموزشی' : 'Tutorial Videos' }}</h3>
            <p>{{ locale === 'fa' ? 'راهنمای تمرینات آرامش‌بخش' : 'Guide to relaxation exercises' }}</p>
          </ion-card-content>
        </ion-card>
      </div>
        </div>
      </OverlayScrollbarsComponent>

      <!-- New Chat FAB -->
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
  IonSearchbar,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  IonFab,
  IonFabButton,
} from '@ionic/vue'
import { 
  person,
  chatbubbles,
  people,
  checkmarkDone,
  help,
  calendar,
  document,
  call,
  book,
  videocam,
  add,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { locale } = useI18n()
const router = useRouter()

const navigateToAIChat = () => router.push('/tabs/chat/ai')
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

.chat-header {
  padding: 1rem 0.5rem 0.5rem;
  background: var(--ion-toolbar-background);
  border-bottom: 1px solid var(--ion-border-color);
}

.search-wrapper {
  padding: 0 0.5rem;
}

ion-searchbar {
  --background: var(--surface-2);
  --border-radius: 12px;
  --box-shadow: none;
  --color: var(--text-primary);
  --placeholder-color: var(--text-tertiary);
  --icon-color: var(--text-secondary);
}

/* Section */
.section {
  padding: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0.5rem;
  color: var(--text-primary);
}

/* Conversations List */
.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.conversation-card {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.conversation-card:active {
  transform: scale(0.98);
}

.conversation-card.active {
  border: 1px solid var(--ion-color-primary);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.avatar.primary {
  background: var(--accent-gradient);
}

.avatar.success {
  background: linear-gradient(135deg, var(--ion-color-success) 0%, var(--ion-color-success-tint) 100%);
}

.avatar.warning {
  background: linear-gradient(135deg, #ff9500 0%, #ffb038 100%);
}

.status-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: absolute;
  bottom: 2px;
  right: 2px;
  border: 2px solid var(--surface-1);
}

.status-indicator.online {
  background: var(--ion-color-success);
}

.status-indicator.busy {
  background: var(--ion-color-warning);
}

.status-indicator.offline {
  background: var(--ion-color-medium);
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.conversation-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.read-indicator {
  font-size: 16px;
  color: var(--ion-color-primary);
  flex-shrink: 0;
}

.last-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Quick Responses */
.quick-responses {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-chip {
  --background: var(--surface-2);
  --color: var(--text-primary);
  height: 36px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-chip:active {
  transform: scale(0.95);
}

.quick-chip ion-icon {
  color: var(--ion-color-primary);
  margin-right: 0.25rem;
}

/* Resource Cards */
.resource-card {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--surface-1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.resource-card:active {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.resource-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resource-icon-wrapper ion-icon {
  font-size: 24px;
  color: white;
}

.resource-card ion-card-content {
  padding: 0;
  flex: 1;
}

.resource-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.resource-card p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--text-secondary);
}

/* FAB */
ion-fab-button {
  --box-shadow: 0 4px 16px rgba(212, 164, 62, 0.4);
}
</style>
