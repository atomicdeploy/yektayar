<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">{{ t('app.welcome') }}</h1>
    <div class="flex gap-2">
      <button class="px-4 py-2 rounded bg-brand text-white" @click="initSession">Init Session</button>
      <button class="px-4 py-2 rounded border" @click="loginPassword">Login (password)</button>
      <button class="px-4 py-2 rounded border" @click="openThread">New Thread</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="border rounded p-3">
        <h2 class="font-semibold mb-2">{{ t('app.courses') }}</h2>
        <ul class="space-y-1">
          <li v-for="c in courses" :key="c.id" class="p-2 border rounded">{{ c.title }}</li>
        </ul>
      </div>
      <div class="border rounded p-3">
        <h2 class="font-semibold mb-2">{{ t('app.chat') }}</h2>
        <div class="space-y-2 max-h-72 overflow-auto">
          <div v-for="m in messages" :key="m.id" class="p-2 rounded bg-gray-50">
            <div class="text-xs opacity-60">{{ formatDate(m.created_at) }}</div>
            <div>{{ m.body }}</div>
          </div>
        </div>
        <div class="mt-2 flex gap-2">
          <input v-model="msg" class="border rounded px-2 py-1 flex-1" :placeholder="t('app.typeMessage')" />
          <button class="px-3 py-1 rounded bg-brand text-white" @click="send">{{ t('app.send') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
dayjs.extend(jalaliday);

const { t } = useI18n();
const config = useRuntimeConfig();
const token = useState<string | null>('token', () => null);
const threadId = useState<number | null>('thread', () => null);
const courses = ref<any[]>([]);
const messages = ref<any[]>([]);
const msg = ref('');

const socket = ref<any>(null);

function formatDate(d?: string) {
  return dayjs(d).calendar('jalali').locale('fa').format('YYYY/MM/DD HH:mm');
}

async function initSession() {
  const res = await $fetch(`${config.public.backendUrl}/session/init`, { method: 'GET' });
  token.value = (res as any).token;
  connectSocket();
  await loadCourses();
}

function connectSocket() {
  if (!token.value) return;
  socket.value = io(config.public.backendUrl, { auth: { token: token.value } });
  socket.value.on('chat:message', (p: any) => {
    if (p.thread_id === threadId.value) messages.value.push(p.message);
  });
}

async function loginPassword() {
  if (!token.value) await initSession();
  const identifier = prompt('identifier (email/phone)?') || 'user@example.com';
  const password = prompt('password?') || 'password123';
  try {
    await $fetch(`${config.public.backendUrl}/auth/login`, { method: 'POST', body: { identifier, password }, headers: { 'Authorization': `Bearer ${token.value}` } });
    alert('Logged in');
  } catch (e) {
    alert('Login failed');
  }
}

async function openThread() {
  if (!token.value) await initSession();
  const res:any = await $fetch(`${config.public.backendUrl}/chat/threads`, { method: 'POST', headers: { 'Authorization': `Bearer ${token.value}` } });
  threadId.value = res.thread.id;
  await loadMessages();
}

async function loadCourses() {
  const res:any = await $fetch(`${config.public.backendUrl}/courses`);
  courses.value = res.items || [];
}

async function loadMessages() {
  if (!threadId.value) return;
  const res:any = await $fetch(`${config.public.backendUrl}/chat/threads/${threadId.value}/messages`);
  messages.value = res.items || [];
}

onMounted(() => initSession());
</script>