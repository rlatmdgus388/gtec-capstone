import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snapvoca.app',
  appName: 'Snap Voca',
  webDir: 'out',
  server: {
    url: 'https://gtec-capstone-6tbh.vercel.app', // ✅ 배포된 Vercel 주소
    cleartext: true, // HTTPS니까 false
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,   // 그대로 유지
    },
  },
  android: {
    // ✅ system bar 영역만큼 WebView 마진 자동 조정 (Android 15 edge-to-edge 대응)
    adjustMarginsForEdgeToEdge: 'auto', // 안 되면 'force'로 바꿔봐도 됨
  },
};

export default config;
