import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mochan.billing',
  appName: 'Mochan Billing',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
