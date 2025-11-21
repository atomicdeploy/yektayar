import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Extract HMR client port from base URL
 * @param baseUrl - The base URL (e.g., https://panel.yektayar.ir)
 * @returns Port number or undefined
 */
function getHmrPortFromBaseUrl(baseUrl?: string): number | undefined {
  if (!baseUrl) return undefined;
  
  try {
    const url = new URL(baseUrl);
    // If port is explicitly specified in URL, use it
    if (url.port) return parseInt(url.port);
    // Otherwise, use default based on protocol
    return url.protocol === 'https:' ? 443 : 80;
  } catch {
    return undefined;
  }
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
  
  // Get base URL for this app (for reverse proxy deployments)
  const baseUrl = process.env.ADMIN_PANEL_BASE_URL;
  
  // Determine HMR client port:
  // 1. Use VITE_HMR_CLIENT_PORT if explicitly set
  // 2. Otherwise, auto-detect from ADMIN_PANEL_BASE_URL
  // 3. If neither set, use undefined (local dev mode)
  const hmrPort = process.env.VITE_HMR_CLIENT_PORT 
    ? parseInt(process.env.VITE_HMR_CLIENT_PORT)
    : getHmrPortFromBaseUrl(baseUrl);
  
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
      'import.meta.env.SOLUTIONS_MD': JSON.stringify(solutionsContent),
      'import.meta.env.EXPECTED_BASE_URL': JSON.stringify(baseUrl || '')
    },
    server: {
      port: 5173,
      allowedHosts: ['.yektayar.ir'],
      proxy: {
        '/api': {
          target: process.env.API_BASE_URL,
          changeOrigin: true
        }
      },
      hmr: {
        // HMR WebSocket port for reverse proxy
        // Auto-detected from ADMIN_PANEL_BASE_URL or VITE_HMR_CLIENT_PORT
        // Leave undefined for local development
        clientPort: hmrPort
      }
    }
  }
})
