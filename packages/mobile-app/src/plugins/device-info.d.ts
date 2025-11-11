/**
 * Type definitions for custom native plugins
 */

export interface DeviceInfoResponse {
  appVersion: string;
  deviceModel: string;
  deviceManufacturer: string;
  androidVersion: string;
  androidSDK: number;
  deviceInfoString: string;
}

export interface DeviceInfoPlugin {
  getDeviceInfo(): Promise<DeviceInfoResponse>;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    DeviceInfoPlugin: DeviceInfoPlugin;
  }
}
