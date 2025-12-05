import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yektayar.app',
  appName: 'YektaYar',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow cleartext traffic for development
    cleartext: true,
    // Allow navigation to yektayar.ir domains
    allowNavigation: [
      '*.yektayar.ir',
      'yektayar.ir',
      'https://*.yektayar.ir',
      'https://yektayar.ir'
    ]
  },
  plugins: {
    // Capacitor plugins configuration
  }
};

export default config;
