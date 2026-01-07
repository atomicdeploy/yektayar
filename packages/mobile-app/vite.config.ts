import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import packageJson from './package.json'

// Cache duration constants (in seconds)
const CACHE_DURATIONS = {
  API: 60 * 60,              // 1 hour
  IMAGES: 60 * 60 * 24 * 30, // 30 days
  FONTS: 60 * 60 * 24 * 365  // 1 year
}

const CACHE_LIMITS = {
  API_MAX_ENTRIES: 100,
  IMAGES_MAX_ENTRIES: 200,
  FONTS_MAX_ENTRIES: 30
}

const CACHE_TIMEOUT = {
  NETWORK: 10 // seconds
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'
  
  // Load solutions.md in development mode
  let solutionsContent = ''
  if (isDevelopment) {
    try {
      const solutionsPath = resolve(__dirname, '../../docs/solutions.md')
      solutionsContent = readFileSync(solutionsPath, 'utf-8')
    } catch (error) {
      console.warn('Could not load solutions.md:', error)
    }
  }
  
  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
          runtimeCaching: [
            {
              // Cache API responses
              urlPattern: /^https?:\/\/.*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: CACHE_LIMITS.API_MAX_ENTRIES,
                  maxAgeSeconds: CACHE_DURATIONS.API
                },
                networkTimeoutSeconds: CACHE_TIMEOUT.NETWORK,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache images with CacheFirst strategy
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: CACHE_LIMITS.IMAGES_MAX_ENTRIES,
                  maxAgeSeconds: CACHE_DURATIONS.IMAGES
                }
              }
            },
            {
              // Cache fonts
              urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: CACHE_LIMITS.FONTS_MAX_ENTRIES,
                  maxAgeSeconds: CACHE_DURATIONS.FONTS
                }
              }
            }
          ],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true
        },
        manifest: {
          name: 'یکتایار - پلتفرم مراقبت سلامت روان',
          short_name: 'یکتایار',
          description: 'پلتفرم مراقبت سلامت روان یکتایار',
          theme_color: '#d4a43e',
          background_color: '#01183a',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@yektayar/shared': fileURLToPath(new URL('../shared/src', import.meta.url))
      }
    },
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000'),
      'import.meta.env.SOLUTIONS_MD': JSON.stringify(solutionsContent),
      'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
    },
    server: {
      port: 8100,
      allowedHosts: ['.yektayar.ir'],
      proxy: {
        '/api': {
          target: process.env.API_BASE_URL,
          changeOrigin: true
        }
      }
    }
  }
})
