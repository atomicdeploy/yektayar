/**
 * Example usage of environment configuration and native plugins
 * 
 * This file demonstrates how to use the YektaYar mobile app's
 * configuration system and native Android plugins.
 */

import config from '@/config';
import apiClient from '@/api';
import { registerPlugin } from '@capacitor/core';
import type { DeviceInfoPlugin } from '@/plugins/device-info';
import { logger } from '@yektayar/shared';

const deviceInfo = registerPlugin<DeviceInfoPlugin>('DeviceInfoPlugin');

// ===== Environment Configuration =====

/**
 * Get the API base URL
 */
export function getApiUrl(): string {
  return config.apiBaseUrl;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return config.environment === 'production';
}

/**
 * Make an API request using the unified API client
 * 
 * IMPORTANT: Always use the unified API client from @/api instead of
 * direct fetch() calls. The API client handles authentication,
 * error handling, and provides a consistent interface.
 */
export async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await apiClient.get<T>(endpoint);
  if (!response.success) {
    throw new Error(response.error || 'API request failed');
  }
  return response.data!;
}

// ===== Native Plugin Usage =====

/**
 * Get device information using the native plugin
 */
export async function getDeviceInfo() {
  try {
    const info = await deviceInfo.getDeviceInfo();
    logger.info('Device Info:', info);
    return info;
  } catch (error) {
    logger.error('Failed to get device info:', error);
    return null;
  }
}

/**
 * Log device information to console
 */
export async function logDeviceInfo() {
  const info = await getDeviceInfo();
  if (info) {
    logger.info('===== Device Information =====');
    logger.info(`App Version: ${info.appVersion}`);
    logger.info(`Device: ${info.deviceManufacturer} ${info.deviceModel}`);
    logger.info(`Android: ${info.androidVersion} (SDK ${info.androidSDK})`);
    logger.info('==============================');
  }
}

// ===== Combined Usage Example =====

/**
 * Initialize app with environment and device info
 */
export async function initializeApp() {
  logger.info('Initializing YektaYar Mobile App...');
  logger.info(`Environment: ${config.environment}`);
  logger.info(`API Base URL: ${config.apiBaseUrl}`);
  
  await logDeviceInfo();
  
  logger.info('App initialized successfully!');
}

// Example: Usage in a Vue component
/*
<script setup lang="ts">
import { onMounted } from 'vue';
import { getApiUrl, getDeviceInfo, initializeApp } from '@/examples/usage';

onMounted(async () => {
  // Initialize app
  await initializeApp();
  
  // Use API URL
  const apiUrl = getApiUrl();
  logger.info('Using API:', apiUrl);
  
  // Get device info
  const deviceInfo = await getDeviceInfo();
  if (deviceInfo) {
    logger.info('Running on:', deviceInfo.deviceModel);
  }
});
</script>
*/
