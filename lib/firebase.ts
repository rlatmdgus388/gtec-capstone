import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ‼️ 아래 설정값들을 본인의 Firebase 프로젝트 키로 반드시 교체해주세요!
const firebaseConfig = {
    apiKey: "AIzaSyAohVZDDr9nAOm0YFtBjpZuzzeDibbeBis",
    authDomain: "snap-voka.firebaseapp.com",
    projectId: "snap-voka",
    storageBucket: "snap-voka.firebasestorage.app",
    messagingSenderId: "498985170172",
    appId: "1:498985170172:web:a6f5eb517a8a7137871379",
    measurementId: "G-6G876SD6Y1"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);