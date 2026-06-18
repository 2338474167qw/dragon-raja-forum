import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cassell.nightwatch',
  appName: '卡塞尔守夜人论坛',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true  // 允许 HTTP 请求
  },
  android: {
    allowMixedContent: true
  }
};

export default config;