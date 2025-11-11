/**
 * Example usage of environment configuration and native plugins
 * 
 * This file demonstrates how to use the YektaYar mobile app's
 * configuration system and native Android plugins.
 */

import config from '@/config';
import { Plugins } from '@capacitor/core';
import type { DeviceInfoPlugin } from '@/plugins/device-info';

const { DeviceInfoPlugin: deviceInfo } = Plugins as { DeviceInfoPlugin: DeviceInfoPlugin };

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
 * Make an API request with the configured base URL
 */
export async function apiRequest(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  return fetch(url, options);
}

// ===== Native Plugin Usage =====

/**
 * Get device information using the native plugin
 */
export async function getDeviceInfo() {
  try {
    const info = await deviceInfo.getDeviceInfo();
    console.log('Device Info:', info);
    return info;
  } catch (error) {
    console.error('Failed to get device info:', error);
    return null;
  }
}

/**
 * Log device information to console
 */
export async function logDeviceInfo() {
  const info = await getDeviceInfo();
  if (info) {
    console.log('===== Device Information =====');
    console.log(`App Version: ${info.appVersion}`);
    console.log(`Device: ${info.deviceManufacturer} ${info.deviceModel}`);
    console.log(`Android: ${info.androidVersion} (SDK ${info.androidSDK})`);
    console.log('==============================');
  }
}

// ===== Combined Usage Example =====

/**
 * Initialize app with environment and device info
 */
export async function initializeApp() {
  console.log('Initializing YektaYar Mobile App...');
  console.log(`Environment: ${config.environment}`);
  console.log(`API Base URL: ${config.apiBaseUrl}`);
  
  await logDeviceInfo();
  
  console.log('App initialized successfully!');
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
  console.log('Using API:', apiUrl);
  
  // Get device info
  const deviceInfo = await getDeviceInfo();
  if (deviceInfo) {
    console.log('Running on:', deviceInfo.deviceModel);
  }
});
</script>
*/
