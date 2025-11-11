import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yektayar.app',
  appName: 'YektaYar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
