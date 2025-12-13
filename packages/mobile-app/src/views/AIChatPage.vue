<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="locale === 'fa' ? 'بازگشت' : 'Back'"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ locale === 'fa' ? 'مشاور هوشمند' : 'AI Counselor' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearChat">
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" :scroll-y="false" ref="contentRef">
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
      <!-- Chat Header Info -->
      <div class="chat-info-banner">
        <div class="ai-avatar">
          <ion-icon :icon="sparkles"></ion-icon>
        </div>
        <div class="ai-info">
          <h3>{{ locale === 'fa' ? 'مشاور هوشمند' : 'AI Counselor' }}</h3>
          <p>{{ locale === 'fa' ? 'همیشه آماده کمک به شما' : 'Always ready to help you' }}</p>
        </div>
        <div :class="['status-badge', isConnected ? 'online' : 'offline']">
          {{ isConnected ? (locale === 'fa' ? 'آنلاین' : 'Online') : (locale === 'fa' ? 'آفلاین' : 'Offline') }}
        </div>
      </div>

      <!-- Messages List -->
      <div class="messages-container" ref="messagesContainer">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">
            <ion-icon :icon="chatbubbles"></ion-icon>
          </div>
          <h2>{{ locale === 'fa' ? 'سلام! چطور می‌توانم کمکتان کنم؟' : 'Hello! How can I help you?' }}</h2>
          <p>{{ locale === 'fa' 
            ? 'می‌توانید هر سوالی در مورد سلامت روان خود بپرسید. من اینجا هستم تا به شما کمک کنم.' 
            : 'You can ask me any question about your mental health. I\'m here to help you.' }}</p>
          
          <!-- Quick Suggestions -->
          <div class="quick-suggestions">
            <ion-chip 
              v-for="suggestion in quickSuggestions" 
              :key="suggestion.id"
              @click="sendMessage(suggestion.text)"
              class="suggestion-chip"
            >
              <ion-icon :icon="suggestion.icon"></ion-icon>
              <ion-label>{{ locale === 'fa' ? suggestion.fa : suggestion.en }}</ion-label>
            </ion-chip>
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-for="message in messages" :key="message.id" :class="['message-wrapper', message.role]">
          <div class="message-bubble">
            <div class="message-header" v-if="message.role === 'assistant'">
              <div class="assistant-avatar">
                <ion-icon :icon="sparkles"></ion-icon>
              </div>
              <span class="assistant-name">{{ locale === 'fa' ? 'مشاور هوشمند' : 'AI Counselor' }}</span>
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-footer">
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <ion-icon 
                v-if="message.role === 'user'" 
                :icon="message.sent ? checkmarkDone : checkmark" 
                :class="['message-status', message.sent ? 'sent' : 'sending']"
              ></ion-icon>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message-wrapper assistant">
          <div class="message-bubble typing">
            <div class="message-header">
              <div class="assistant-avatar">
                <ion-icon :icon="sparkles"></ion-icon>
              </div>
              <span class="assistant-name">{{ locale === 'fa' ? 'مشاور هوشمند' : 'AI Counselor' }}</span>
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
        </div>
      </OverlayScrollbarsComponent>
    </ion-content>

    <!-- Message Input Footer -->
    <ion-footer>
      <div class="message-input-container">
        <ion-button
          @click="toggleVoiceInput"
          :disabled="!isVoiceSupported"
          class="voice-button"
          fill="clear"
          :class="{ 'recording': isListening }"
        >
          <ion-icon slot="icon-only" :icon="isListening ? micOff : mic"></ion-icon>
        </ion-button>
        <ion-textarea
          v-model="messageText"
          :placeholder="locale === 'fa' ? 'پیام خود را بنویسید...' : 'Type your message...'"
          :auto-grow="true"
          :rows="1"
          :maxlength="1000"
          @keydown.enter.exact.prevent="sendMessage()"
          class="message-input"
        ></ion-textarea>
        <ion-button 
          @click="sendMessage()" 
          :disabled="!messageText.trim() || isSending"
          class="send-button"
          fill="clear"
        >
          <ion-icon slot="icon-only" :icon="send"></ion-icon>
        </ion-button>
      </div>
      <div v-if="isListening" class="voice-indicator">
        <div class="pulse"></div>
        <span>{{ locale === 'fa' ? 'در حال گوش دادن...' : 'Listening...' }}</span>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
  IonFooter,
  IonTextarea,
  IonChip,
  IonLabel,
  alertController,
} from '@ionic/vue'
import { 
  sparkles,
  chatbubbles,
  send,
  trash,
  checkmark,
  checkmarkDone,
  help,
  happy,
  sad,
  heart,
  mic,
  micOff,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useAIChat } from '@/composables/useAIChat'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'

const { locale } = useI18n()

// Refs
const contentRef = ref()
// const messagesContainer = ref() // Unused for now - reserved for future scroll functionality
const messageText = ref('')

// AI Chat composable
const { 
  messages, 
  isTyping, 
  isSending, 
  isConnected,
  sendMessage: sendAIMessage, 
  clearMessages,
  connect,
  disconnect 
} = useAIChat()

// Speech Recognition composable
const {
  isSupported: isVoiceSupported,
  isListening,
  fullTranscript,
  start: startVoice,
  stop: stopVoice,
  reset: resetVoice,
} = useSpeechRecognition({
  lang: locale.value === 'fa' ? 'fa-IR' : 'en-US',
  continuous: false,
  interimResults: true,
  autoRestart: false,
})

// Watch for voice transcript changes
watch(fullTranscript, (newTranscript) => {
  if (newTranscript) {
    messageText.value = newTranscript
  }
})

// Toggle voice input
const toggleVoiceInput = () => {
  if (isListening.value) {
    stopVoice()
  } else {
    resetVoice()
    startVoice()
  }
}

// Quick suggestions for first-time users
const quickSuggestions = [
  { 
    id: 1, 
    icon: help, 
    fa: 'چگونه می‌توانم استرس را مدیریت کنم؟', 
    en: 'How can I manage stress?',
    text: 'How can I manage stress?'
  },
  { 
    id: 2, 
    icon: happy, 
    fa: 'نکاتی برای بهبود خلق و خو', 
    en: 'Tips for improving mood',
    text: 'Can you give me tips for improving my mood?'
  },
  { 
    id: 3, 
    icon: sad, 
    fa: 'احساس اضطراب می‌کنم', 
    en: 'I feel anxious',
    text: 'I have been feeling anxious lately. What should I do?'
  },
  { 
    id: 4, 
    icon: heart, 
    fa: 'تکنیک‌های آرامش', 
    en: 'Relaxation techniques',
    text: 'What are some relaxation techniques I can try?'
  },
]

// Send message function
const sendMessage = async (customText?: string) => {
  const text = customText || messageText.value.trim()
  if (!text) return

  messageText.value = ''
  await sendAIMessage(text)
  
  // Scroll to bottom after sending
  await nextTick()
  scrollToBottom()
}

// Clear chat with confirmation
const clearChat = async () => {
  const alert = await alertController.create({
    header: locale.value === 'fa' ? 'پاک کردن چت' : 'Clear Chat',
    message: locale.value === 'fa' 
      ? 'آیا مطمئن هستید که می‌خواهید تمام پیام‌ها را پاک کنید؟' 
      : 'Are you sure you want to clear all messages?',
    buttons: [
      {
        text: locale.value === 'fa' ? 'لغو' : 'Cancel',
        role: 'cancel',
      },
      {
        text: locale.value === 'fa' ? 'پاک کردن' : 'Clear',
        role: 'destructive',
        handler: () => {
          clearMessages()
        },
      },
    ],
  })
  await alert.present()
}

// Format timestamp
const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Scroll to bottom of messages
const scrollToBottom = () => {
  if (contentRef.value?.$el) {
    contentRef.value.$el.scrollToBottom(300)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await connect()
  scrollToBottom()
})

onUnmounted(() => {
  disconnect()
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
  display: flex;
  flex-direction: column;
}

/* Chat Info Banner */
.chat-info-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-1);
  border-bottom: 1px solid var(--ion-border-color);
}

.ai-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar ion-icon {
  font-size: 24px;
  color: white;
}

.ai-info {
  flex: 1;
  min-width: 0;
}

.ai-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.ai-info p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.online {
  background: rgba(45, 211, 111, 0.1);
  color: var(--ion-color-success);
}

.status-badge.offline {
  background: rgba(146, 148, 156, 0.1);
  color: var(--ion-color-medium);
}

/* Messages Container */
.messages-container {
  padding: 1rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* Welcome Message */
.welcome-message {
  text-align: center;
  padding: 2rem 1rem;
  max-width: 500px;
  margin: auto;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.welcome-icon ion-icon {
  font-size: 40px;
  color: white;
}

.welcome-message h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.welcome-message p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

/* Quick Suggestions */
.quick-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.suggestion-chip {
  --background: var(--surface-2);
  --color: var(--text-primary);
  height: auto;
  min-height: 44px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: normal;
  text-align: start;
}

.suggestion-chip:active {
  transform: scale(0.98);
}

.suggestion-chip ion-icon {
  color: var(--ion-color-primary);
  margin-inline-end: 0.5rem;
  font-size: 20px;
}

.suggestion-chip ion-label {
  white-space: normal;
  line-height: 1.4;
}

/* Message Wrappers */
.message-wrapper {
  display: flex;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

/* Message Bubbles */
.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

.message-wrapper.user .message-bubble {
  background: var(--accent-gradient);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-wrapper.assistant .message-bubble {
  background: var(--surface-1);
  border-bottom-left-radius: 4px;
}

/* Message Header (for assistant) */
.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.assistant-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assistant-avatar ion-icon {
  font-size: 12px;
  color: white;
}

.assistant-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}

/* Message Content */
.message-content {
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-wrapper.user .message-content {
  color: white;
}

.message-wrapper.assistant .message-content {
  color: var(--text-primary);
}

/* Message Footer */
.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.message-time {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.message-wrapper.user .message-time {
  color: white;
}

.message-wrapper.assistant .message-time {
  color: var(--text-secondary);
}

.message-status {
  font-size: 14px;
}

.message-status.sending {
  color: rgba(255, 255, 255, 0.7);
}

.message-status.sent {
  color: white;
}

/* Typing Indicator */
.message-bubble.typing {
  background: var(--surface-1);
  padding: 0.75rem 1rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ion-color-medium);
  animation: typing 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

/* Message Input Container */
.message-input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface-1);
  border-top: 1px solid var(--ion-border-color);
}

.message-input {
  flex: 1;
  --background: var(--surface-2);
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-top: 0.75rem;
  --padding-bottom: 0.75rem;
  border-radius: 20px;
  font-size: 0.9375rem;
  max-height: 120px;
}

.send-button {
  --padding-start: 0.75rem;
  --padding-end: 0.75rem;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.send-button ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.send-button:disabled ion-icon {
  color: var(--ion-color-medium);
}

/* Voice Button */
.voice-button {
  --padding-start: 0.75rem;
  --padding-end: 0.75rem;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.voice-button ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.voice-button:disabled ion-icon {
  color: var(--ion-color-medium);
}

.voice-button.recording ion-icon {
  color: var(--ion-color-danger);
  animation: pulse 1.5s ease-in-out infinite;
}

/* Voice Indicator */
.voice-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-1);
  border-top: 1px solid var(--ion-border-color);
  font-size: 0.875rem;
  color: var(--ion-color-primary);
}

.voice-indicator .pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ion-color-danger);
  animation: pulse 1.5s ease-in-out infinite;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
