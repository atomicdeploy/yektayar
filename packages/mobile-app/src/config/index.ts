// Environment configuration for YektaYar Mobile App

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

// Default configuration
const defaultConfig: AppConfig = {
  apiBaseUrl: 'http://localhost:3000',
  environment: 'development'
};

// Load configuration from environment variables or use defaults
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultConfig.apiBaseUrl,
  environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) || defaultConfig.environment
};

export default config;
