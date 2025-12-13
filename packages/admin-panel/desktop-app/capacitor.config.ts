import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yektayar.desktop',
  appName: 'YektaYar Admin',
  webDir: '../admin-panel/dist',
  bundledWebRuntime: false,
  electron: {
    trayIconAndMenuEnabled: false
  }
};

export default config;
