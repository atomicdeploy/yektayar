// Environment configuration for YektaYar Mobile App

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

// Load configuration from environment variables - no defaults allowed
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) || 'development'
};

export default config;
