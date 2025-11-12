import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files in order:
  // 1. Root .env (unified config)
  // 2. Package-specific .env (overrides root)
  const rootEnv = loadEnv(mode, process.cwd(), '')
  const packageEnv = loadEnv(mode, resolve(__dirname), '')
  
  // Merge with package-specific env taking precedence
  const env = { ...rootEnv, ...packageEnv }
  
  // Base server config
  const serverConfig: any = {
    port: 8100,
    allowedHosts: ['.yektayar.ir', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
  
  // Auto-detect proxy domain from browser's Host header for HMR
  // This allows HMR to work behind any reverse proxy without hardcoding domains
  // When VITE_PROXY_DOMAIN is explicitly set, use that instead (for override)
  if (env.VITE_PROXY_DOMAIN) {
    // Explicit override - use the configured domain
    serverConfig.hmr = {
      host: env.VITE_PROXY_DOMAIN,
      clientPort: 443,
      protocol: 'wss'
    }
  }
  // else: Don't set HMR config - let Vite auto-detect from Host header
  // When accessed via localhost:8100 -> uses ws://localhost:8100
  // When accessed via app.yektayar.ir -> uses wss://app.yektayar.ir:443
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '')
    },
    server: serverConfig
  }
})
