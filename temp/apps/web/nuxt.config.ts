// Minimal SPA for fast prototyping
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/styles/tailwind.css'],
  runtimeConfig: {
    public: {
      backendUrl: process.env.BACKEND_URL || 'http://localhost:4000'
    }
  },
  app: {
    head: {
      title: 'YektaCare',
      link: [{ rel: 'manifest', href: '/manifest.json' }]
    }
  }
});