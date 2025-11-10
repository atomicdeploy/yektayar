<template>
  <div>
    <header class="px-4 py-3 flex items-center justify-between border-b">
      <div class="font-bold text-brand">YektaCare</div>
      <nav class="flex gap-3">
        <NuxtLink to="/">App</NuxtLink>
        <NuxtLink to="/admin">Admin</NuxtLink>
      </nav>
    </header>
    <main class="p-4">
      <slot />
    </main>
  </div>
</template>