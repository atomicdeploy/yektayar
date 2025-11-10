<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('admin.dashboard') }}</h1>
    <p class="opacity-70">{{ t('admin.liveMonitor') }}</p>
    <ul class="mt-3 list-disc pl-6">
      <li>New users, chat messages and course events appear here (wire later)</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>