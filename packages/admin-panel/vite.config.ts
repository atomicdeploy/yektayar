import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@yektayar/shared': fileURLToPath(new URL('../shared/src', import.meta.url))
      }
    },
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || ''),
      'import.meta.env.SOLUTIONS_MD': JSON.stringify(solutionsContent)
    },
    server: {
      port: 5173,
      allowedHosts: ['.yektayar.ir'],
      proxy: {
        '/api': {
          target: process.env.API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
})
