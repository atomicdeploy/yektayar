<template>
  <div :class="dark ? 'dark bg-neutral-900 text-neutral-100' : 'bg-white text-neutral-900'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const dark = useState('dark', () => false);
</script>