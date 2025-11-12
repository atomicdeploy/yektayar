// Environment configuration for YektaYar Admin Panel

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

// Load configuration from environment variables - no defaults allowed
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || '',
  environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) || 'development'
};

export default config;
