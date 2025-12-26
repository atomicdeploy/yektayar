/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
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

// Allow importing SVG files as raw strings
declare module '*.svg?raw' {
  const content: string
  export default content
}
