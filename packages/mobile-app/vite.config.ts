import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine if we're behind a reverse proxy
  // When VITE_PROXY_DOMAIN is set, configure HMR for reverse proxy
  const proxyDomain = env.VITE_PROXY_DOMAIN
  
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
  
  // Configure HMR for reverse proxy when VITE_PROXY_DOMAIN is set
  // This fixes the issue where Vite tries to connect to wss://localhost:8100
  // instead of the configured domain when behind a reverse proxy
  if (proxyDomain) {
    serverConfig.hmr = {
      // Use the proxy domain for HMR WebSocket connections
      host: proxyDomain,
      // Use the standard HTTPS port since proxy handles SSL
      clientPort: 443,
      // Use secure WebSocket (wss) when behind HTTPS proxy
      protocol: 'wss'
    }
  }
  
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
