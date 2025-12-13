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
  screenWidth: number;
  screenHeight: number;
  screenDensityDpi: number;
  screenDensity: number;
  deviceId: string;
  hardwareName: string;
  boardName: string;
  brand: string;
  product: string;
}

export interface DeviceInfoPlugin {
  getDeviceInfo(): Promise<DeviceInfoResponse>;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    DeviceInfoPlugin: DeviceInfoPlugin;
  }
}
