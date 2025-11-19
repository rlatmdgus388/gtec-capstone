import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snapvoca.app',
  appName: 'Snap Voca',
  webDir: 'out',
  server: {
    url: 'https://gtec-capstone-6tbh.vercel.app', // ✅ 배포된 Vercel 주소
    cleartext: false, // HTTPS니까 false
  },
  plugins: {
    StatusBar: {
      // ✅ 상태바가 WebView 위에 겹치지 않게
      overlaysWebView: false,
      // 선택: 상태바 글자 색 / 배경색 (원하는 대로)
      style: 'DARK',
      backgroundColor: '#000000',
    }
  }
};

export default config;
