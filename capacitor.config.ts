import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snapvoca.app',
  appName: 'Snap Voca',
  webDir: 'out',
  server: {
    url: 'https://gtec-capstone-6tbh.vercel.app', // ✅ 배포된 Vercel 주소
    cleartext: false, // HTTPS니까 false
  },
};

export default config;
