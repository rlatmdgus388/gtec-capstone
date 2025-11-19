/// <reference types="@capacitor/status-bar" />
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snapvoca.app',   // 네 값 그대로
  appName: 'SnapVoca',
  webDir: 'out',
  plugins: {
    StatusBar: {
      overlaysWebView: false,   // 그대로 유지
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
  android: {
    // ✅ system bar 영역만큼 WebView 마진 자동 조정 (Android 15 edge-to-edge 대응)
    adjustMarginsForEdgeToEdge: 'auto', // 안 되면 'force'로 바꿔봐도 됨
  },
};

export default config;
