/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly API_BASE_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
